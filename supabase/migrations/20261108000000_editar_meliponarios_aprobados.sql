-- =====================================================================
-- EDITAR MELIPONARIOS APROBADOS  (PROPUESTA PARA EL EQUIPO DE BACKEND)
--
-- Reglas acordadas con el equipo de la app (2026-11-08):
--   * El CLIENTE (responsable principal) puede editar sus meliponarios
--     aprobados; el cambio se aplica directo, sin nueva revisión.
--   * El TRABAJADOR DE CAMPO (rol 4) puede editar los meliponarios cuya
--     solicitud él mismo aprobó; también se aplica directo.
--   * Cada edición queda en historial_ediciones_meliponario (quién,
--     cuándo, datos anteriores y nuevos), porque no pasa por revisión.
--
-- p_datos usa el MISMO formato que guardar_formulario_meliponario
-- (construirFormularioBackend en la app): localidad_id, nombre,
-- descripcion, referencia_ubicacion, especies[], ubicacion{},
-- ofrece_venta_miel, ofrece_visitas.
--
-- PUNTOS A REVISAR POR BACKEND antes de aplicar:
--   1. Tipo y esquema de ubicaciones_meliponarios.punto (aquí se asume
--      PostGIS en el esquema «extensions»). Si ya existe una función
--      privada que guarda la ubicación o las especies
--      (p. ej. private.guardar_datos_declarados_meliponario), conviene
--      reutilizarla en lugar de este SQL.
--   2. Que reservar_imagen_meliponario permita agregar fotos a un
--      meliponario aprobado y hasta 5 fotos (la app ahora pide de 2 a 5).
--   3. Que la regla de cobertura territorial al cambiar de localidad sea
--      la misma que usa el registro («Localidad fuera de cobertura»).
--
-- No se ejecuta desde la app.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. HISTORIAL DE EDICIONES
-- ---------------------------------------------------------------------

create table if not exists public.historial_ediciones_meliponario (
  id                uuid primary key default gen_random_uuid(),
  meliponario_id    uuid not null references public.meliponarios(id) on delete cascade,
  editado_por       uuid not null references public.perfiles(id),
  rol_id            integer,
  fecha_edicion     timestamptz not null default now(),
  datos_anteriores  jsonb not null,
  datos_nuevos      jsonb not null
);

create index if not exists historial_ediciones_meliponario_idx
  on public.historial_ediciones_meliponario (meliponario_id, fecha_edicion desc);

alter table public.historial_ediciones_meliponario enable row level security;
revoke all on table public.historial_ediciones_meliponario from anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. ¿PUEDE EL USUARIO ACTUAL EDITAR ESTE MELIPONARIO APROBADO?
--    Regresa 'cliente', 'trabajador' o NULL.
-- ---------------------------------------------------------------------

create or replace function private.rol_edicion_aprobado(p_meliponario_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  with ultima as (
    select s.estado, s.trabajador_revisor_id
    from solicitudes_meliponario s
    where s.meliponario_id = p_meliponario_id
    order by s.numero_intento desc
    limit 1
  )
  select case
    when m.responsable_principal_id = auth.uid() then 'cliente'
    when p.rol_id = 4 and u.trabajador_revisor_id = auth.uid() then 'trabajador'
  end
  from meliponarios m
  join ultima u   on u.estado = 'aprobada'
  join perfiles p on p.id = auth.uid() and p.activo
  where m.id = p_meliponario_id
    and coalesce(m.estado_operativo, '') <> 'desactivado';
$$;

revoke all on function private.rol_edicion_aprobado(uuid) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. MELIPONARIOS QUE APROBÓ EL TRABAJADOR (lista para editarlos)
-- ---------------------------------------------------------------------

create or replace function public.mis_meliponarios_aprobados_trabajador()
returns table (
  meliponario_id     uuid,
  nombre_meliponario text,
  localidad_nombre   text,
  fecha_aprobacion   timestamptz,
  fecha_actualizacion timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select m.id, m.nombre, l.nombre, u.fecha_resolucion, m.fecha_actualizacion
  from (
    select distinct on (s.meliponario_id)
      s.meliponario_id, s.estado, s.trabajador_revisor_id, s.fecha_resolucion
    from solicitudes_meliponario s
    order by s.meliponario_id, s.numero_intento desc
  ) u
  join meliponarios m on m.id = u.meliponario_id
  left join localidades l on l.id = m.localidad_id
  where u.estado = 'aprobada'
    and u.trabajador_revisor_id = auth.uid()
    and exists (select 1 from perfiles p where p.id = auth.uid() and p.rol_id = 4 and p.activo)
  order by u.fecha_resolucion desc nulls last;
$$;


-- ---------------------------------------------------------------------
-- 4. LEER UN MELIPONARIO APROBADO PARA EDITARLO
--    (el trabajador no puede leer la tabla meliponarios directamente)
-- ---------------------------------------------------------------------

create or replace function public.obtener_meliponario_para_edicion(p_meliponario_id uuid)
returns jsonb
language sql
security definer
set search_path = public, extensions
stable
as $$
  select jsonb_build_object(
    'id', m.id,
    'nombre', m.nombre,
    'descripcion', m.descripcion,
    'referencia_ubicacion', m.referencia_ubicacion,
    'localidad_id', m.localidad_id,
    'localidad', l.nombre,
    'municipio_id', l.municipio_id,
    'municipio', mu.nombre,
    'ofrece_venta_miel', m.ofrece_venta_miel,
    'ofrece_visitas', m.ofrece_visitas,
    'latitud',  st_y(um.punto::geometry),
    'longitud', st_x(um.punto::geometry),
    'metodo_captura', um.metodo_captura,
    'precision_metros', um.precision_metros,
    'responsable', jsonb_build_object('nombre', rp.nombre, 'apellidos', rp.apellidos),
    'especies', coalesce((
      select jsonb_agg(jsonb_build_object(
        'especie_id', d.especie_id,
        'cantidad_cajas', d.cantidad_cajas,
        'cantidad_jobones', d.cantidad_jobones))
      from meliponarios_especies_declaradas d
      where d.meliponario_id = m.id
    ), '[]'::jsonb)
  )
  from meliponarios m
  left join localidades l  on l.id = m.localidad_id
  left join municipios mu  on mu.id = l.municipio_id
  left join ubicaciones_meliponarios um on um.meliponario_id = m.id
  left join perfiles rp    on rp.id = m.responsable_principal_id
  where m.id = p_meliponario_id
    and private.rol_edicion_aprobado(p_meliponario_id) is not null;
$$;


-- ---------------------------------------------------------------------
-- 5. GUARDAR LA EDICIÓN (se aplica directo)
-- ---------------------------------------------------------------------

create or replace function public.editar_meliponario_aprobado(
  p_meliponario_id uuid,
  p_datos          jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_rol       text;
  v_rol_id    integer;
  v_antes     jsonb;
  v_localidad uuid := nullif(p_datos->>'localidad_id', '')::uuid;
  v_nombre    text := btrim(coalesce(p_datos->>'nombre', ''));
  v_miel      boolean := coalesce((p_datos->>'ofrece_venta_miel')::boolean, false);
  v_visitas   boolean := coalesce((p_datos->>'ofrece_visitas')::boolean, false);
  v_lat       double precision := (p_datos->'ubicacion'->>'latitud')::double precision;
  v_lon       double precision := (p_datos->'ubicacion'->>'longitud')::double precision;
  v_esp       jsonb;
begin
  v_rol := private.rol_edicion_aprobado(p_meliponario_id);

  if v_rol is null then
    raise exception 'No puedes editar este meliponario: debe estar aprobado y ser tuyo o aprobado por ti'
      using errcode = '42501';
  end if;

  if char_length(v_nombre) not between 3 and 160 then
    raise exception 'El nombre debe tener entre 3 y 160 caracteres' using errcode = '22023';
  end if;

  if v_localidad is null or not exists (select 1 from localidades where id = v_localidad) then
    raise exception 'Localidad no válida' using errcode = '22023';
  end if;

  -- La localidad debe estar cubierta por una zona activa.
  if not exists (
    select 1 from zonas_localidades zl
    join zonas z on z.id = zl.zona_id and z.activo
    where zl.localidad_id = v_localidad
  ) then
    raise exception 'Localidad fuera de cobertura territorial activa' using errcode = '22023';
  end if;

  if v_lat is null or v_lon is null or abs(v_lat) > 90 or abs(v_lon) > 180 then
    raise exception 'Ubicación no válida' using errcode = '22023';
  end if;

  if jsonb_typeof(p_datos->'especies') <> 'array'
     or jsonb_array_length(p_datos->'especies') not between 1 and 50 then
    raise exception 'Declara entre 1 y 50 especies' using errcode = '22023';
  end if;

  -- Datos anteriores para el historial.
  v_antes := public.obtener_meliponario_para_edicion(p_meliponario_id);

  update meliponarios set
    nombre               = v_nombre,
    descripcion          = nullif(btrim(coalesce(p_datos->>'descripcion', '')), ''),
    referencia_ubicacion = nullif(btrim(coalesce(p_datos->>'referencia_ubicacion', '')), ''),
    localidad_id         = v_localidad,
    ofrece_venta_miel    = v_miel,
    ofrece_visitas       = v_visitas,
    categoria_marcador   = case
                             when v_miel and v_visitas then 'ambos'
                             when v_miel then 'miel'
                             when v_visitas then 'visitas'
                             else 'neutro'
                           end,
    fecha_actualizacion  = now()
  where id = p_meliponario_id;

  insert into ubicaciones_meliponarios (meliponario_id, punto, metodo_captura, precision_metros, fecha_captura, fecha_actualizacion)
  values (
    p_meliponario_id,
    st_setsrid(st_makepoint(v_lon, v_lat), 4326),
    coalesce(p_datos->'ubicacion'->>'metodo_captura', 'mapa'),
    nullif(p_datos->'ubicacion'->>'precision_metros', '')::numeric,
    now(),
    now()
  )
  on conflict (meliponario_id) do update set
    punto            = excluded.punto,
    metodo_captura   = excluded.metodo_captura,
    precision_metros = excluded.precision_metros,
    fecha_actualizacion = now();

  delete from meliponarios_especies_declaradas where meliponario_id = p_meliponario_id;

  for v_esp in select * from jsonb_array_elements(p_datos->'especies') loop
    insert into meliponarios_especies_declaradas (meliponario_id, especie_id, cantidad_cajas, cantidad_jobones)
    values (
      p_meliponario_id,
      (v_esp->>'especie_id')::uuid,
      greatest(coalesce((v_esp->>'cantidad_cajas')::integer, 0), 0),
      greatest(coalesce((v_esp->>'cantidad_jobones')::integer, 0), 0)
    );
  end loop;

  select rol_id into v_rol_id from perfiles where id = auth.uid();

  insert into historial_ediciones_meliponario (meliponario_id, editado_por, rol_id, datos_anteriores, datos_nuevos)
  values (p_meliponario_id, auth.uid(), v_rol_id, coalesce(v_antes, '{}'::jsonb), p_datos);

  return p_meliponario_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 6. PERMISOS
-- ---------------------------------------------------------------------

revoke all on function public.mis_meliponarios_aprobados_trabajador()     from public, anon;
revoke all on function public.obtener_meliponario_para_edicion(uuid)      from public, anon;
revoke all on function public.editar_meliponario_aprobado(uuid, jsonb)    from public, anon;

grant execute on function public.mis_meliponarios_aprobados_trabajador()  to authenticated;
grant execute on function public.obtener_meliponario_para_edicion(uuid)   to authenticated;
grant execute on function public.editar_meliponario_aprobado(uuid, jsonb) to authenticated;

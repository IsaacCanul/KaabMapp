-- =====================================================================
-- FICHA TÉCNICA DE INSPECCIÓN PRESENCIAL  (PROPUESTA PARA EL EQUIPO DE BACKEND)
--
-- Flujo:
--   1. El trabajador de campo (rol 4) aprueba solicitudes básicas de su zona
--      (bandeja_solicitudes_territoriales / resolver_solicitud_territorial).
--   2. El coordinador de campo (rol 3) asigna el meliponario aprobado a un
--      trabajador (coord_asignar_visita_tecnica → asignaciones_visita_tecnica).
--   3. El trabajador ve sus visitas asignadas (mis_visitas_tecnicas_asignadas),
--      elige una y captura esta ficha técnica en la visita presencial.
--
-- Delimitación territorial: la ficha solo se puede capturar si la visita
-- está asignada al trabajador, sigue vigente y el meliponario está en una
-- zona activa que el administrador general asignó a ese trabajador.
--
-- Cada opción marcada se guarda como un renglón (pregunta + opción) para
-- sacar porcentajes por pregunta. «Otro» cuenta como «otro» en la
-- estadística y su texto se lista aparte para analizarlo.
--
-- No se ejecuta desde la app: lo revisa y aplica el equipo de backend.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. CATÁLOGO DE PREGUNTAS Y OPCIONES
--    Fuente única para validar lo que manda la app.
-- ---------------------------------------------------------------------

create table if not exists public.ficha_tecnica_catalogo (
  pregunta     text not null,
  opcion       text not null,
  etiqueta     text not null,
  permite_texto boolean not null default false,
  orden        smallint not null default 0,
  primary key (pregunta, opcion)
);

insert into public.ficha_tecnica_catalogo (pregunta, opcion, etiqueta, permite_texto, orden) values
  ('techo', 'lamina_aluminio',  'Lámina de aluminio', false, 1),
  ('techo', 'lamina_carton',    'Lámina de cartón', false, 2),
  ('techo', 'lamina_plastico',  'Lámina de plástico', false, 3),
  ('techo', 'concreto',         'Concreto', false, 4),
  ('techo', 'asbesto',          'Asbesto', false, 5),
  ('techo', 'maderas',          'Maderas', false, 6),
  ('techo', 'palma_guano_zacate','Palma de guano o zacate', false, 7),
  ('techo', 'otro',             'Otro', true, 99),

  ('piso', 'tierra',   'Tierra', false, 1),
  ('piso', 'firme',    'Firme (tierra o grava compactada y nivelada)', false, 2),
  ('piso', 'concreto', 'Concreto', false, 3),
  ('piso', 'otro',     'Otro', true, 99),

  ('sella_tapa', 'si', 'Sí', false, 1),
  ('sella_tapa', 'no', 'No', false, 2),

  ('material_sellado', 'propoleo',       'Nada, ellas cierran con su propóleo', false, 1),
  ('material_sellado', 'plastilina',     'Plastilina', false, 2),
  ('material_sellado', 'cinta_adhesiva', 'Cinta adhesiva', false, 3),
  ('material_sellado', 'otro',           'Otro', true, 99),

  ('cubierta_bajo_tapa', 'si',   'Sí', false, 1),
  ('cubierta_bajo_tapa', 'no',   'No', false, 2),
  ('cubierta_bajo_tapa', 'otro', 'Otro', true, 99),

  ('alimenta', 'si', 'Sí', false, 1),
  ('alimenta', 'no', 'No', false, 2),

  ('alimento_energetico', 'jarabe_azucar', 'Jarabe de azúcar', false, 1),
  ('alimento_energetico', 'fructosa',      'Fructosa', false, 2),
  ('alimento_energetico', 'miel_apis',     'Miel de Apis', false, 3),
  ('alimento_energetico', 'miel_melipona', 'Miel de Melipona', false, 4),
  ('alimento_energetico', 'ninguna',       'Ninguna', false, 5),
  ('alimento_energetico', 'otro',          'Otro', true, 99),

  ('alimento_proteico', 'soya',           'Soya', false, 1),
  ('alimento_proteico', 'suero_leche',    'Suero de leche', false, 2),
  ('alimento_proteico', 'torta_proteica', 'Torta proteica', false, 3),
  ('alimento_proteico', 'polen_apis',     'Polen de Apis', false, 4),
  ('alimento_proteico', 'ninguna',        'Ninguna', false, 5),
  ('alimento_proteico', 'otro',           'Otro', true, 99),

  ('cosecha', 'jeringa',        'Jeringa', false, 1),
  ('cosecha', 'manguera_bomba', 'Manguera y bomba de vacío', false, 2),
  ('cosecha', 'escurrimiento',  'Agujereando hobones/cajas y por escurrimiento hacia un recipiente', false, 3),
  ('cosecha', 'otro',           'Otro', true, 99)
on conflict (pregunta, opcion) do update
  set etiqueta = excluded.etiqueta,
      permite_texto = excluded.permite_texto,
      orden = excluded.orden;


-- ---------------------------------------------------------------------
-- 2. FICHAS Y RESPUESTAS (una ficha por visita asignada)
-- ---------------------------------------------------------------------

create table if not exists public.fichas_tecnicas (
  id                  uuid primary key default gen_random_uuid(),
  asignacion_id       uuid not null unique
                        references public.asignaciones_visita_tecnica(id) on delete cascade,
  meliponario_id      uuid not null references public.meliponarios(id) on delete cascade,
  trabajador_id       uuid not null references public.perfiles(id),
  observaciones       text check (observaciones is null or char_length(observaciones) <= 2000),
  fecha_inspeccion    timestamptz not null default now(),
  fecha_creacion      timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now()
);

create table if not exists public.fichas_tecnicas_respuestas (
  ficha_id    uuid not null references public.fichas_tecnicas(id) on delete cascade,
  pregunta    text not null,
  opcion      text not null,
  texto_otro  text check (texto_otro is null or char_length(texto_otro) between 1 and 300),
  primary key (ficha_id, pregunta, opcion),
  foreign key (pregunta, opcion) references public.ficha_tecnica_catalogo (pregunta, opcion)
);

create index if not exists fichas_tecnicas_respuestas_pregunta_idx
  on public.fichas_tecnicas_respuestas (pregunta, opcion);

-- Sin acceso directo: todo pasa por las funciones de abajo.
alter table public.ficha_tecnica_catalogo     enable row level security;
alter table public.fichas_tecnicas            enable row level security;
alter table public.fichas_tecnicas_respuestas enable row level security;

drop policy if exists "catalogo visible para usuarios" on public.ficha_tecnica_catalogo;
create policy "catalogo visible para usuarios"
  on public.ficha_tecnica_catalogo for select
  to authenticated using (true);


-- ---------------------------------------------------------------------
-- 3. VALIDACIÓN: visita asignada al trabajador y dentro de su zona
--    Regresa el meliponario de la visita, o NULL si no está autorizada.
-- ---------------------------------------------------------------------

create or replace function private.ficha_visita_autorizada(p_asignacion_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select a.meliponario_id
  from asignaciones_visita_tecnica a
  join meliponarios m on m.id = a.meliponario_id
  join perfiles p     on p.id = a.trabajador_id
  where a.id = p_asignacion_id
    and a.trabajador_id = auth.uid()
    and a.estado = 'asignada'
    and p.rol_id = 4
    and p.activo
    and exists (
      select 1
      from asignaciones_zona az
      join zonas z              on z.id = az.zona_id and z.activo
      join zonas_localidades zl on zl.zona_id = az.zona_id
      where az.usuario_id = auth.uid()
        and zl.localidad_id = m.localidad_id
        and az.fecha_inicio <= now()
        and (az.fecha_fin is null or az.fecha_fin > now())
    );
$$;

revoke all on function private.ficha_visita_autorizada(uuid) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. FICHAS DEL TRABAJADOR (para marcar en la app cuáles ya envió)
-- ---------------------------------------------------------------------

create or replace function public.mis_fichas_tecnicas()
returns table (
  asignacion_id    uuid,
  ficha_id         uuid,
  fecha_inspeccion timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select f.asignacion_id, f.id, f.fecha_inspeccion
  from fichas_tecnicas f
  where f.trabajador_id = auth.uid();
$$;


-- ---------------------------------------------------------------------
-- 5. CONSULTAR UNA FICHA (para continuar o corregir)
-- ---------------------------------------------------------------------

create or replace function public.obtener_ficha_tecnica(p_asignacion_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id', f.id,
    'observaciones', f.observaciones,
    'fecha_inspeccion', f.fecha_inspeccion,
    'respuestas', coalesce((
      select jsonb_agg(jsonb_build_object(
        'pregunta', r.pregunta,
        'opcion', r.opcion,
        'texto_otro', r.texto_otro))
      from fichas_tecnicas_respuestas r
      where r.ficha_id = f.id
    ), '[]'::jsonb)
  )
  from fichas_tecnicas f
  where f.asignacion_id = p_asignacion_id
    and (
      private.ficha_visita_autorizada(p_asignacion_id) is not null
      or exists (
        select 1 from perfiles p
        where p.id = auth.uid() and p.rol_id in (1, 2, 3) and p.activo
      )
    );
$$;


-- ---------------------------------------------------------------------
-- 6. GUARDAR LA FICHA
--    p_respuestas: [{ "pregunta": "techo", "opcion": "otro", "texto_otro": "..." }, ...]
--    Reemplaza las respuestas anteriores de esa visita.
-- ---------------------------------------------------------------------

create or replace function public.guardar_ficha_tecnica(
  p_asignacion_id uuid,
  p_respuestas    jsonb,
  p_observaciones text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meliponario uuid;
  v_ficha uuid;
  v_item  jsonb;
  v_preg  text;
  v_opc   text;
  v_texto text;
begin
  v_meliponario := private.ficha_visita_autorizada(p_asignacion_id);

  if v_meliponario is null then
    raise exception 'La visita no está asignada a tu cuenta o el meliponario está fuera de tu zona'
      using errcode = '42501';
  end if;

  if jsonb_typeof(p_respuestas) <> 'array' or jsonb_array_length(p_respuestas) = 0 then
    raise exception 'La ficha no tiene respuestas' using errcode = '22023';
  end if;

  if p_observaciones is not null and char_length(p_observaciones) > 2000 then
    raise exception 'Observaciones: máximo 2000 caracteres' using errcode = '22023';
  end if;

  insert into fichas_tecnicas (asignacion_id, meliponario_id, trabajador_id, observaciones)
  values (p_asignacion_id, v_meliponario, auth.uid(), nullif(btrim(p_observaciones), ''))
  on conflict (asignacion_id) do update
    set observaciones = excluded.observaciones,
        fecha_inspeccion = now(),
        fecha_actualizacion = now()
  returning id into v_ficha;

  delete from fichas_tecnicas_respuestas where ficha_id = v_ficha;

  for v_item in select * from jsonb_array_elements(p_respuestas) loop
    v_preg  := v_item->>'pregunta';
    v_opc   := v_item->>'opcion';
    v_texto := nullif(btrim(coalesce(v_item->>'texto_otro', '')), '');

    if not exists (
      select 1 from ficha_tecnica_catalogo c
      where c.pregunta = v_preg and c.opcion = v_opc
    ) then
      raise exception 'Respuesta no permitida: % / %', v_preg, v_opc using errcode = '22023';
    end if;

    if v_opc = 'otro' and v_texto is null then
      raise exception 'Escribe la respuesta de «Otro» en %', v_preg using errcode = '22023';
    end if;

    insert into fichas_tecnicas_respuestas (ficha_id, pregunta, opcion, texto_otro)
    values (v_ficha, v_preg, v_opc, case when v_opc = 'otro' then v_texto end)
    on conflict do nothing;
  end loop;

  return v_ficha;
end;
$$;


-- ---------------------------------------------------------------------
-- 7. ESTADÍSTICAS (administración, investigación y coordinación: roles 1, 2 y 3)
-- ---------------------------------------------------------------------

-- Porcentaje de fichas que marcaron cada opción («otro» incluido).
create or replace function public.estadisticas_ficha_tecnica()
returns table (
  pregunta   text,
  opcion     text,
  etiqueta   text,
  fichas     bigint,
  porcentaje numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.pregunta,
    c.opcion,
    c.etiqueta,
    count(r.ficha_id),
    round(
      100.0 * count(r.ficha_id)
      / nullif((
        select count(distinct r2.ficha_id)
        from fichas_tecnicas_respuestas r2
        where r2.pregunta = c.pregunta
      ), 0),
      1
    )
  from ficha_tecnica_catalogo c
  left join fichas_tecnicas_respuestas r
    on r.pregunta = c.pregunta and r.opcion = c.opcion
  where exists (select 1 from perfiles p where p.id = auth.uid() and p.rol_id in (1, 2, 3) and p.activo)
  group by c.pregunta, c.opcion, c.etiqueta, c.orden
  order by c.pregunta, c.orden;
$$;

-- Lista aparte de lo que escribieron en «Otro», para analizarlo.
create or replace function public.respuestas_otro_ficha_tecnica()
returns table (
  pregunta         text,
  texto_otro       text,
  meliponario_id   uuid,
  fecha_inspeccion timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select r.pregunta, r.texto_otro, f.meliponario_id, f.fecha_inspeccion
  from fichas_tecnicas_respuestas r
  join fichas_tecnicas f on f.id = r.ficha_id
  where r.opcion = 'otro'
    and exists (select 1 from perfiles p where p.id = auth.uid() and p.rol_id in (1, 2, 3) and p.activo)
  order by r.pregunta, f.fecha_inspeccion desc;
$$;


-- ---------------------------------------------------------------------
-- 8. PERMISOS
-- ---------------------------------------------------------------------

revoke all on function public.mis_fichas_tecnicas()                    from public, anon;
revoke all on function public.obtener_ficha_tecnica(uuid)              from public, anon;
revoke all on function public.guardar_ficha_tecnica(uuid, jsonb, text) from public, anon;
revoke all on function public.estadisticas_ficha_tecnica()             from public, anon;
revoke all on function public.respuestas_otro_ficha_tecnica()          from public, anon;

grant execute on function public.mis_fichas_tecnicas()                    to authenticated;
grant execute on function public.obtener_ficha_tecnica(uuid)              to authenticated;
grant execute on function public.guardar_ficha_tecnica(uuid, jsonb, text) to authenticated;
grant execute on function public.estadisticas_ficha_tecnica()             to authenticated;
grant execute on function public.respuestas_otro_ficha_tecnica()          to authenticated;

grant select on public.ficha_tecnica_catalogo to authenticated;

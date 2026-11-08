-- =====================================================================
-- FICHA TÉCNICA DE INSPECCIÓN PRESENCIAL
--
-- Después de aprobar una solicitud, el trabajador de campo (rol 4) visita
-- el meliponario y captura la ficha técnica desde la app.
--
-- Cada opción marcada se guarda como un renglón (pregunta + opción) para
-- poder sacar porcentajes por pregunta. Cuando se elige «otro», la
-- respuesta escrita queda en texto_otro: en la estadística cuenta como
-- «otro» y además se puede listar aparte para analizarla.
--
-- Ejecutar una sola vez en Supabase → SQL Editor.
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
-- 2. FICHAS Y RESPUESTAS
-- ---------------------------------------------------------------------

create table if not exists public.fichas_tecnicas (
  id               uuid primary key default gen_random_uuid(),
  meliponario_id   uuid not null references public.meliponarios(id) on delete cascade,
  trabajador_id    uuid not null references auth.users(id),
  observaciones    text check (observaciones is null or char_length(observaciones) <= 2000),
  fecha_inspeccion timestamptz not null default now(),
  fecha_creacion   timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  unique (meliponario_id)
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
-- 3. INSPECCIONES PENDIENTES DEL TRABAJADOR
--    Meliponarios cuya última solicitud aprobó el trabajador actual.
-- ---------------------------------------------------------------------

create or replace function public.mis_inspecciones_por_realizar()
returns table (
  meliponario_id    uuid,
  nombre_meliponario text,
  localidad_nombre  text,
  fecha_aprobacion  timestamptz,
  ficha_id          uuid,
  fecha_inspeccion  timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  with ultima as (
    select distinct on (s.meliponario_id)
      s.meliponario_id, s.estado, s.trabajador_revisor_id, s.fecha_resolucion
    from solicitudes_meliponario s
    order by s.meliponario_id, s.numero_intento desc
  )
  select
    m.id,
    m.nombre,
    l.nombre,
    u.fecha_resolucion,
    f.id,
    f.fecha_inspeccion
  from ultima u
  join meliponarios m on m.id = u.meliponario_id
  left join localidades l on l.id = m.localidad_id
  left join fichas_tecnicas f on f.meliponario_id = m.id
  where u.estado = 'aprobada'
    and u.trabajador_revisor_id = auth.uid()
    and exists (
      select 1 from perfiles p
      where p.id = auth.uid() and p.rol_id = 4
    )
  order by (f.id is not null), u.fecha_resolucion desc nulls last;
$$;


-- ---------------------------------------------------------------------
-- 4. CONSULTAR UNA FICHA (para editarla)
-- ---------------------------------------------------------------------

create or replace function public.obtener_ficha_tecnica(p_meliponario_id uuid)
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
  where f.meliponario_id = p_meliponario_id
    and (
      f.trabajador_id = auth.uid()
      or exists (select 1 from perfiles p where p.id = auth.uid() and p.rol_id in (1, 2, 3))
    );
$$;


-- ---------------------------------------------------------------------
-- 5. GUARDAR LA FICHA
--    p_respuestas: [{ "pregunta": "techo", "opcion": "otro", "texto_otro": "..." }, ...]
--    Reemplaza las respuestas anteriores de ese meliponario.
-- ---------------------------------------------------------------------

create or replace function public.guardar_ficha_tecnica(
  p_meliponario_id uuid,
  p_respuestas     jsonb,
  p_observaciones  text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ficha uuid;
  v_item  jsonb;
  v_preg  text;
  v_opc   text;
  v_texto text;
begin
  if not exists (select 1 from perfiles where id = auth.uid() and rol_id = 4) then
    raise exception 'Solo un trabajador de campo puede capturar la ficha técnica'
      using errcode = '42501';
  end if;

  -- Debe ser el trabajador que aprobó la última solicitud.
  if not exists (
    select 1
    from (
      select distinct on (s.meliponario_id) s.estado, s.trabajador_revisor_id
      from solicitudes_meliponario s
      where s.meliponario_id = p_meliponario_id
      order by s.meliponario_id, s.numero_intento desc
    ) u
    where u.estado = 'aprobada' and u.trabajador_revisor_id = auth.uid()
  ) then
    raise exception 'El meliponario no está aprobado por tu cuenta'
      using errcode = '42501';
  end if;

  if jsonb_typeof(p_respuestas) <> 'array' or jsonb_array_length(p_respuestas) = 0 then
    raise exception 'La ficha no tiene respuestas' using errcode = '22023';
  end if;

  if p_observaciones is not null and char_length(p_observaciones) > 2000 then
    raise exception 'Observaciones: máximo 2000 caracteres' using errcode = '22023';
  end if;

  insert into fichas_tecnicas (meliponario_id, trabajador_id, observaciones)
  values (p_meliponario_id, auth.uid(), nullif(btrim(p_observaciones), ''))
  on conflict (meliponario_id) do update
    set trabajador_id = excluded.trabajador_id,
        observaciones = excluded.observaciones,
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
-- 6. ESTADÍSTICAS (coordinación y administración: roles 1, 2 y 3)
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
  where exists (select 1 from perfiles p where p.id = auth.uid() and p.rol_id in (1, 2, 3))
  group by c.pregunta, c.opcion, c.etiqueta, c.orden
  order by c.pregunta, c.orden;
$$;

-- Lista aparte de lo que escribieron en «Otro», para analizarlo.
create or replace function public.respuestas_otro_ficha_tecnica()
returns table (
  pregunta       text,
  texto_otro     text,
  meliponario_id uuid,
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
    and exists (select 1 from perfiles p where p.id = auth.uid() and p.rol_id in (1, 2, 3))
  order by r.pregunta, f.fecha_inspeccion desc;
$$;


-- ---------------------------------------------------------------------
-- 7. PERMISOS
-- ---------------------------------------------------------------------

revoke all on function public.mis_inspecciones_por_realizar()              from public, anon;
revoke all on function public.obtener_ficha_tecnica(uuid)                  from public, anon;
revoke all on function public.guardar_ficha_tecnica(uuid, jsonb, text)     from public, anon;
revoke all on function public.estadisticas_ficha_tecnica()                 from public, anon;
revoke all on function public.respuestas_otro_ficha_tecnica()              from public, anon;

grant execute on function public.mis_inspecciones_por_realizar()          to authenticated;
grant execute on function public.obtener_ficha_tecnica(uuid)              to authenticated;
grant execute on function public.guardar_ficha_tecnica(uuid, jsonb, text) to authenticated;
grant execute on function public.estadisticas_ficha_tecnica()             to authenticated;
grant execute on function public.respuestas_otro_ficha_tecnica()          to authenticated;

grant select on public.ficha_tecnica_catalogo to authenticated;

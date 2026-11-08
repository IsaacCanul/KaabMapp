import {
  supabase,
} from "../lib/supabase";


/* =====================================================
   PAGINACIÓN
===================================================== */

async function allPages(
  createQuery,
  pageSize = 500
) {
  const all = [];

  for (
    let from = 0;
    ;
    from += pageSize
  ) {
    const { data, error } =
      await createQuery().range(
        from,
        from + pageSize - 1
      );

    if (error) {
      throw error;
    }

    const batch =
      data ?? [];

    all.push(...batch);

    if (
      batch.length < pageSize
    ) {
      break;
    }
  }

  return all;
}


/* =====================================================
   MUNICIPIOS ACTIVOS
===================================================== */

export function getMunicipiosRequest() {
  return allPages(
    () =>
      supabase
        .from("municipios")
        .select(
          "id,nombre,activo"
        )
        .eq(
          "activo",
          true
        )
        .order("nombre")
        .order("id")
  );
}


/* =====================================================
   LOCALIDADES POR MUNICIPIO
===================================================== */

export function getLocalidadesByMunicipioRequest(
  municipioId
) {
  if (!municipioId) {
    return Promise.resolve([]);
  }

  return allPages(
    () =>
      supabase
        .from("localidades")
        .select(
          "id,nombre,municipio_id,activo"
        )
        .eq(
          "municipio_id",
          municipioId
        )
        .eq(
          "activo",
          true
        )
        .order("nombre")
        .order("id")
  );
}


/* =====================================================
   LOCALIDADES POR IDENTIFICADOR
===================================================== */

export async function getLocalidadesByIdsRequest(
  ids = []
) {
  const safe = [
    ...new Set(
      ids.filter(Boolean)
    ),
  ];

  if (!safe.length) {
    return [];
  }

  const all = [];

  for (
    let i = 0;
    i < safe.length;
    i += 100
  ) {
    const { data, error } =
      await supabase
        .from("localidades")
        .select(
          "id,nombre,municipio_id,activo"
        )
        .in(
          "id",
          safe.slice(
            i,
            i + 100
          )
        );

    if (error) {
      throw error;
    }

    all.push(
      ...(data ?? [])
    );
  }

  return all;
}
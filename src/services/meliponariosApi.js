import {
  supabase,
} from "../lib/supabase";

import {
  getLocalidadesByIdsRequest,
  getMunicipiosRequest,
} from "./ubicacionesApi";


/* =====================================================
   USUARIO AUTENTICADO
===================================================== */

async function requireUser() {
  const { data, error } =
    await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data?.user) {
    throw new Error(
      "Debes iniciar sesión para consultar tus meliponarios."
    );
  }

  return data.user;
}


/* =====================================================
   PAGINACIÓN
===================================================== */

async function allPages(
  makeQuery,
  pageSize = 300
) {
  const all = [];

  for (
    let from = 0;
    ;
    from += pageSize
  ) {
    const { data, error } =
      await makeQuery().range(
        from,
        from + pageSize - 1
      );

    if (error) {
      throw error;
    }

    const batch = data ?? [];

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
   ÚLTIMA SOLICITUD POR MELIPONARIO
===================================================== */

async function latestSolicitudes(ids) {
  const latest = new Map();

  for (
    let i = 0;
    i < ids.length;
    i += 100
  ) {
    const { data, error } =
      await supabase
        .from(
          "solicitudes_meliponario"
        )
        .select(
          "id,meliponario_id,estado,numero_intento,observaciones_cliente,fecha_envio,fecha_resolucion"
        )
        .in(
          "meliponario_id",
          ids.slice(i, i + 100)
        )
        .order(
          "numero_intento",
          {
            ascending: false,
          }
        );

    if (error) {
      throw error;
    }

    for (
      const solicitud of data ?? []
    ) {
      const key = String(
        solicitud.meliponario_id
      );

      if (!latest.has(key)) {
        latest.set(
          key,
          solicitud
        );
      }
    }
  }

  return latest;
}


/* =====================================================
   AGREGAR LOCALIDAD Y MUNICIPIO
===================================================== */

async function enrichLocalidades(
  records
) {
  if (!records.length) {
    return records;
  }

  const localidades =
    await getLocalidadesByIdsRequest(
      records.map(
        (item) => item.localidad_id
      )
    );

  const municipios =
    await getMunicipiosRequest();

  const byLocalidad = new Map(
    localidades.map(
      (item) => [
        String(item.id),
        item,
      ]
    )
  );

  const byMunicipio = new Map(
    municipios.map(
      (item) => [
        String(item.id),
        item,
      ]
    )
  );

  return records.map((item) => {
    const localidad =
      byLocalidad.get(
        String(item.localidad_id)
      );

    const municipio = localidad
      ? byMunicipio.get(
          String(
            localidad.municipio_id
          )
        )
      : null;

    return {
      ...item,

      localidad:
        localidad?.nombre ?? "",

      municipio:
        municipio?.nombre ?? "",

      municipio_id:
        localidad?.municipio_id ??
        null,
    };
  });
}


/* =====================================================
   MIS MELIPONARIOS
===================================================== */

export async function getMisMeliponariosRequest() {
  const user = await requireUser();

  const records = await allPages(
    () =>
      supabase
        .from("meliponarios")
        .select("*")
        .eq(
          "responsable_principal_id",
          user.id
        )
        .order(
          "fecha_creacion",
          {
            ascending: false,
          }
        )
        .order("id")
  );

  if (!records.length) {
    return [];
  }

  const status =
    await latestSolicitudes(
      records.map(
        (item) => item.id
      )
    );

  const enriched =
    records.map((item) => ({
      ...item,

      solicitud:
        status.get(
          String(item.id)
        ) ?? null,

      solicitud_estado:
        status.get(
          String(item.id)
        )?.estado ?? null,
    }));

  return enrichLocalidades(
    enriched
  );
}


/* =====================================================
   COMPATIBILIDAD CON INICIO
===================================================== */

export async function getMeliponariosRequest() {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  // Visitante sin iniciar sesión.
  // No intentar consultar datos privados.
  if (!data?.session?.user) {
    return [];
  }

  // Temporal: mientras el backend
  // habilita la consulta pública.
  return getMisMeliponariosRequest();
}


/* =====================================================
   MARCADORES PRIVADOS DEL USUARIO
===================================================== */

export async function getMisMeliponariosMapaRequest() {
  await requireUser();

  const { data, error } =
    await supabase.rpc(
      "mis_meliponarios_mapa_privado"
    );

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (item) => ({
      ...item,

      latitude:
        Number(item.latitud),

      longitude:
        Number(item.longitud),

      categoria_marcador:
        item.categoria_marcador ??
        "neutro",
    })
  );
}


/* =====================================================
   DETALLE DEL MELIPONARIO
===================================================== */

export async function getMeliponarioByIdRequest(
  id
) {
  if (!id) {
    throw new Error(
      "Se necesita el identificador del meliponario."
    );
  }

  const user =
    await requireUser();

  /* MELIPONARIO */

  const {
    data: record,
    error,
  } = await supabase
    .from("meliponarios")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!record) {
    return null;
  }

  /* SOLICITUD Y ESPECIES */

  const [
    solicitudResult,
    especiesResult,
  ] = await Promise.all([
    supabase
      .from(
        "solicitudes_meliponario"
      )
      .select(
        "id,estado,numero_intento,observaciones_cliente,fecha_envio,fecha_resolucion"
      )
      .eq(
        "meliponario_id",
        id
      )
      .order(
        "numero_intento",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle(),

    supabase
      .from(
        "meliponarios_especies_declaradas"
      )
      .select(
        "especie_id,cantidad_cajas,cantidad_jobones"
      )
      .eq(
        "meliponario_id",
        id
      ),
  ]);

  if (solicitudResult.error) {
    throw solicitudResult.error;
  }

  if (especiesResult.error) {
    throw especiesResult.error;
  }

  const declaradas =
    especiesResult.data ?? [];

  const especieIds = [
    ...new Set(
      declaradas.map(
        (item) => item.especie_id
      )
    ),
  ];

  /* CATÁLOGO DE ESPECIES */

  let catalogo = [];

  if (especieIds.length) {
    const {
      data,
      error: catalogError,
    } = await supabase
      .from("especies")
      .select(
        "id,nombre_comun,nombre_cientifico"
      )
      .in(
        "id",
        especieIds
      );

    if (catalogError) {
      throw catalogError;
    }

    catalogo = data ?? [];
  }

  const byEspecie = new Map(
    catalogo.map(
      (item) => [
        String(item.id),
        item,
      ]
    )
  );

  const especies =
    declaradas.map((item) => {
      const info =
        byEspecie.get(
          String(
            item.especie_id
          )
        );

      return {
        id:
          item.especie_id,

        especieId:
          item.especie_id,

        nombre:
          info?.nombre_comun ||
          info?.nombre_cientifico ||
          "Especie",

        nombreCientifico:
          info?.nombre_cientifico ??
          "",

        cajasTecnificadas:
          Number(
            item.cantidad_cajas ?? 0
          ),

        jobones:
          Number(
            item.cantidad_jobones ?? 0
          ),
      };
    });

  /* MUNICIPIO Y LOCALIDAD */

  const [withPlace] =
    await enrichLocalidades([
      record,
    ]);

  /* UBICACIÓN PRIVADA */

  let coords = null;

  if (
    record.responsable_principal_id ===
    user.id
  ) {
    const markers =
      await getMisMeliponariosMapaRequest();

    coords =
      markers.find(
        (item) =>
          String(item.id) ===
          String(id)
      ) ?? null;
  }

  /* RESPONSABLE */

  let responsable = null;

  if (
    record.responsable_principal_id ===
    user.id
  ) {
    const {
      data: perfil,
      error: perfilError,
    } = await supabase
      .from("perfiles")
      .select(
        "id,nombre,apellidos,telefono"
      )
      .eq(
        "id",
        user.id
      )
      .maybeSingle();

    if (perfilError) {
      throw perfilError;
    }

    responsable =
      perfil;
  }

  /* RESULTADO */

  return {
    ...withPlace,

    solicitud:
      solicitudResult.data ??
      null,

    solicitud_estado:
      solicitudResult.data
        ?.estado ?? null,

    especies,

    responsable,

    latitude:
      coords?.latitude ??
      null,

    longitude:
      coords?.longitude ??
      null,
  };
}


/* =====================================================
   CATÁLOGO PÚBLICO

   El backend entregado todavía no
   implementa una consulta pública
   autorizada.
===================================================== */

export async function getMeliponariosPublicosRequest() {
  return [];
}
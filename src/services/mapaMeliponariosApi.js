import { supabase } from "../lib/supabase";
import { getMeliponariosPublicosRequest } from "./meliponariosPublicosApi";
import {
  getMisMeliponariosMapaRequest,
  getMisMeliponariosRequest,
} from "./meliponariosApi";

function numero(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizar(item, esMio = false) {
  if (!item) return null;

  const id = item.id ?? item.meliponario_id;
  const latitude = numero(item.latitude ?? item.latitud);
  const longitude = numero(item.longitude ?? item.longitud);

  if (!id || latitude === null || longitude === null) return null;

  return {
    ...item,
    id,
    latitude,
    longitude,
    latitud: latitude,
    longitud: longitude,
    es_mio: esMio,
    categoria_marcador: item.categoria_marcador ?? "neutro",
    vende_miel:
      item.vende_miel ??
      item.ofrece_venta_miel ??
      item.vendeMiel ??
      false,
    acepta_visitas:
      item.acepta_visitas ??
      item.ofrece_visitas ??
      item.visitable ??
      false,
  };
}

/**
 * Público: RPC de publicación.
 * Privado: solo la cuenta propietaria.
 *
 * Nunca consulta directamente las coordenadas
 * privadas de otros usuarios.
 */
export async function getMeliponariosMapaRequest() {
  const {
    data: sesion,
    error: errorSesion,
  } = await supabase.auth.getSession();

  if (errorSesion) {
    console.warn(
      "MAPA SESIÓN:",
      errorSesion.message
    );
  }

  const autenticado = Boolean(
    sesion?.session?.user?.id
  );

  const [
    publicosRes,
    privadosRes,
    propiosRes,
  ] = await Promise.allSettled([
    getMeliponariosPublicosRequest(),

    autenticado
      ? getMisMeliponariosMapaRequest()
      : Promise.resolve([]),

    autenticado
      ? getMisMeliponariosRequest()
      : Promise.resolve([]),
  ]);

  const publico =
    publicosRes.status === "fulfilled" &&
    Array.isArray(publicosRes.value)
      ? publicosRes.value
      : [];

  const privados =
    privadosRes.status === "fulfilled" &&
    Array.isArray(privadosRes.value)
      ? privadosRes.value
      : [];

  const propios =
    propiosRes.status === "fulfilled" &&
    Array.isArray(propiosRes.value)
      ? propiosRes.value
      : [];

  if (publicosRes.status === "rejected") {
    console.warn(
      "MAPA PÚBLICO:",
      publicosRes.reason?.message
    );
  }

  if (privadosRes.status === "rejected") {
    console.warn(
      "MAPA PRIVADO:",
      privadosRes.reason?.message
    );
  }

  if (propiosRes.status === "rejected") {
    console.warn(
      "MAPA DATOS PROPIOS:",
      propiosRes.reason?.message
    );
  }

  // No ocultar un fallo de permisos
  // como si fuera una lista vacía legítima.
  if (
    publicosRes.status === "rejected" &&
    (
      !autenticado ||
      privadosRes.status === "rejected"
    )
  ) {
    throw new Error(
      "No se pudieron consultar los marcadores. " +
      "Revisa los permisos de las RPC de Supabase."
    );
  }

  const porId = new Map();

  // 1. Meliponarios publicados.
  for (const p of publico) {
    const item = normalizar(p);

    if (item) {
      porId.set(
        String(item.id),
        item
      );
    }
  }

  // 2. Datos descriptivos de mis registros.
  const propiosPorId = new Map(
    propios.map((p) => [
      String(p.id),
      p,
    ])
  );

  // 3. Ubicaciones privadas autorizadas
  // únicamente para el propietario.
  for (const p of privados) {
    const id =
      p.id ??
      p.meliponario_id;

    if (!id) continue;

    const extra =
      propiosPorId.get(String(id)) ?? {};

    const publicoPrevio =
      porId.get(String(id)) ?? {};

    const item = normalizar(
      {
        ...publicoPrevio,
        ...extra,
        ...p,

        id,

        nombre:
          p.nombre ??
          extra.nombre ??
          publicoPrevio.nombre ??
          "Meliponario",

        descripcion:
          extra.descripcion ??
          publicoPrevio.descripcion ??
          "",

        municipio:
          extra.municipio ??
          p.municipio ??
          publicoPrevio.municipio ??
          "",

        localidad:
          extra.localidad ??
          p.localidad ??
          publicoPrevio.localidad ??
          "",
      },
      true
    );

    if (item) {
      porId.set(
        String(id),
        item
      );
    }
  }

  console.log(
    "MAPA: públicos",
    publico.length
  );

  console.log(
    "MAPA: privados propios",
    privados.length
  );

  console.log(
    "MAPA: marcadores válidos",
    porId.size
  );

  return [...porId.values()];
}
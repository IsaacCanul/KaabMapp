import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "../lib/supabase";
import { getMisMeliponariosRequest } from "./meliponariosApi";
import { getBandejaSolicitudesTerritorialesRequest } from "./territorialApi";
import { getMisInspeccionesPorRealizarRequest } from "./fichaTecnicaApi";


/* =====================================================
   NOTIFICACIONES DENTRO DE LA APP

   Se generan con los datos que ya existen en Supabase (estado de
   cada solicitud, bandeja del trabajador, inspecciones pendientes).
   Lo que el usuario ya leyó se guarda en el teléfono.

   Cada notificación tiene un id estable que incluye el estado y el
   intento: si la solicitud cambia de estado, aparece una nueva.

   Forma: {
     id, tipo, titulo, mensaje, fecha,
     destino: { tab, screen, params }  // a dónde lleva al tocarla
   }
===================================================== */

const FIELD_WORKER_ROLE_ID = 4;

const nombre = (m) => m?.nombre || m?.nombre_meliponario || "tu meliponario";


/* PARA QUIEN REGISTRA MELIPONARIOS */

function notificacionesDeRegistros(registros) {
  const lista = [];
  const destino = { tab: "Mis registros", screen: "MyMeliponarios" };

  for (const m of registros) {
    const s = m.solicitud ?? null;
    const estado = s?.estado ?? m.solicitud_estado ?? null;
    const intento = s?.numero_intento ?? 0;
    const base = `${m.id}:${intento}`;

    if (estado === null || estado === "borrador") {
      lista.push({
        id: `borrador:${m.id}`,
        tipo: "borrador",
        titulo: "Borrador sin enviar",
        mensaje: `«${nombre(m)}» está guardado como borrador. Envíalo a revisión cuando esté completo.`,
        fecha: m.fecha_actualizacion ?? m.fecha_creacion,
        destino,
      });
      continue;
    }

    if (estado === "enviada" || estado === "en_revision") {
      lista.push({
        id: `enviada:${base}`,
        tipo: "enviada",
        titulo: "Registro enviado",
        mensaje: `Recibimos «${nombre(m)}». Un trabajador de campo de tu zona lo revisará.`,
        fecha: s?.fecha_envio,
        destino,
      });
    }

    if (estado === "en_revision") {
      lista.push({
        id: `en_revision:${base}`,
        tipo: "revision",
        titulo: "Registro en revisión",
        mensaje: `Un trabajador de campo ya está revisando «${nombre(m)}».`,
        fecha: s?.fecha_envio,
        destino,
      });
    }

    if (estado === "aprobada") {
      lista.push({
        id: `aprobada:${base}`,
        tipo: "aprobada",
        titulo: "Registro aprobado",
        mensaje:
          m.visibilidad === "publico"
            ? `«${nombre(m)}» fue aprobado.`
            : `«${nombre(m)}» fue aprobado. Toca «Publicar» en Mis registros para que todos lo vean en el mapa.`,
        fecha: s?.fecha_resolucion,
        destino,
      });
    }

    if (estado === "correccion") {
      lista.push({
        id: `correccion:${base}`,
        tipo: "correccion",
        titulo: "Te pidieron correcciones",
        mensaje: `Revisa y corrige los datos de «${nombre(m)}», y vuelve a enviarlo.`,
        fecha: s?.fecha_resolucion,
        destino,
      });
    }

    if (estado === "rechazada") {
      lista.push({
        id: `rechazada:${base}`,
        tipo: "rechazada",
        titulo: "Registro rechazado",
        mensaje: `La solicitud de «${nombre(m)}» no fue aprobada.`,
        fecha: s?.fecha_resolucion,
        destino,
      });
    }

    if (m.visibilidad === "publico") {
      lista.push({
        id: `publico:${m.id}`,
        tipo: "publico",
        titulo: "Tu meliponario ya es público",
        mensaje: `«${nombre(m)}» aparece en el inicio y en el mapa para todas las personas.`,
        fecha: m.fecha_autorizacion_publicacion ?? s?.fecha_resolucion,
        destino,
      });
    }
  }

  return lista;
}


/* PARA EL TRABAJADOR DE CAMPO */

function notificacionesDeTrabajador(bandeja, inspecciones, userId) {
  const lista = [];
  const destino = { tab: "Mis inspecciones", screen: "InspectionsMain" };

  for (const s of bandeja) {
    const mia = String(s.trabajador_revisor_id ?? "") === String(userId);

    if (!s.trabajador_revisor_id) {
      lista.push({
        id: `nueva:${s.solicitud_id}`,
        tipo: "nueva",
        titulo: "Nueva solicitud en tu zona",
        mensaje: `«${nombre(s)}» (${s.localidad_nombre || "sin localidad"}) espera revisión.`,
        fecha: s.fecha_envio,
        destino,
      });
    } else if (mia && s.estado === "en_revision") {
      lista.push({
        id: `mia:${s.solicitud_id}`,
        tipo: "revision",
        titulo: "Tienes una revisión abierta",
        mensaje: `Termina la revisión de «${nombre(s)}»: aprueba, pide correcciones o rechaza.`,
        fecha: s.fecha_envio,
        destino,
      });
    }
  }

  for (const i of inspecciones) {
    if (i.ficha_id) continue;

    lista.push({
      id: `inspeccion:${i.meliponario_id}`,
      tipo: "inspeccion",
      titulo: "Inspección pendiente",
      mensaje: `Visita «${nombre(i)}» y llena su ficha técnica.`,
      fecha: i.fecha_aprobacion,
      destino,
    });
  }

  return lista;
}


/* =====================================================
   CONSULTA
===================================================== */

async function usuarioActual() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ?? null;
}

async function rolActual(userId) {
  const { data } = await supabase
    .from("perfiles")
    .select("rol_id")
    .eq("id", userId)
    .maybeSingle();

  return Number(data?.rol_id ?? 0);
}

/**
 * Regresa { autenticado, notificaciones } ordenadas de la más nueva
 * a la más vieja, cada una con su campo «leida».
 */
export async function getNotificacionesRequest() {
  const user = await usuarioActual();

  if (!user) {
    return { autenticado: false, notificaciones: [] };
  }

  let lista;

  if ((await rolActual(user.id)) === FIELD_WORKER_ROLE_ID) {
    const [bandeja, inspecciones] = await Promise.allSettled([
      getBandejaSolicitudesTerritorialesRequest(),
      getMisInspeccionesPorRealizarRequest(),
    ]);

    lista = notificacionesDeTrabajador(
      bandeja.status === "fulfilled" && Array.isArray(bandeja.value) ? bandeja.value : [],
      inspecciones.status === "fulfilled" ? inspecciones.value : [],
      user.id
    );
  } else {
    lista = notificacionesDeRegistros(await getMisMeliponariosRequest());
  }

  const leidas = await leerLeidas(user.id);

  const notificaciones = lista
    .map((n) => ({ ...n, leida: leidas.has(n.id) }))
    .sort((a, b) => tiempo(b.fecha) - tiempo(a.fecha));

  return { autenticado: true, notificaciones };
}

export async function contarNoLeidasRequest() {
  try {
    const { notificaciones } = await getNotificacionesRequest();
    return notificaciones.filter((n) => !n.leida).length;
  } catch {
    return 0;
  }
}

function tiempo(fecha) {
  const t = fecha ? new Date(fecha).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}


/* =====================================================
   LEÍDAS (en el teléfono, por usuario)
===================================================== */

const clave = (userId) => `kaabmap:notificaciones-leidas:${userId}`;

async function leerLeidas(userId) {
  try {
    const valor = await AsyncStorage.getItem(clave(userId));
    return new Set(valor ? JSON.parse(valor) : []);
  } catch {
    return new Set();
  }
}

async function escribirLeidas(userId, set) {
  try {
    // Límite para que la lista no crezca sin fin.
    await AsyncStorage.setItem(clave(userId), JSON.stringify([...set].slice(-500)));
  } catch {
    // Sin almacenamiento: la notificación seguirá como no leída.
  }
}

export async function marcarLeidasRequest(ids) {
  const user = await usuarioActual();
  if (!user || !ids?.length) return;

  const leidas = await leerLeidas(user.id);
  ids.forEach((id) => leidas.add(id));
  await escribirLeidas(user.id, leidas);
}


/* =====================================================
   TIEMPO RELATIVO
===================================================== */

export function tiempoRelativo(fecha) {
  const t = tiempo(fecha);
  if (!t) return "";

  const min = Math.round((Date.now() - t) / 60000);

  if (min < 1) return "Justo ahora";
  if (min < 60) return `Hace ${min} min`;

  const horas = Math.round(min / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.round(horas / 24);
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;

  return new Date(t).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

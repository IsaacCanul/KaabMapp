import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "../lib/supabase";


/* =====================================================
   PREGUNTAS DE LA FICHA TÉCNICA
   Deben coincidir con public.ficha_tecnica_catalogo
   (supabase/migrations/20261106000000_ficha_tecnica.sql).

   tipo «multiple»: se pueden marcar varias casillas.
   tipo «unica»: solo una opción.
   otro: la opción pide escribir la respuesta.
   exclusiva: al marcarla se desmarcan las demás.
   visibleSi: la pregunta solo aparece con esa condición.
===================================================== */

export const PREGUNTAS = [
  {
    id: "techo",
    titulo: "¿De qué está hecho el techo del meliponario?",
    tipo: "multiple",
    opciones: [
      { value: "lamina_aluminio", label: "Lámina de aluminio" },
      { value: "lamina_carton", label: "Lámina de cartón" },
      { value: "lamina_plastico", label: "Lámina de plástico" },
      { value: "concreto", label: "Concreto" },
      { value: "asbesto", label: "Asbesto" },
      { value: "maderas", label: "Maderas" },
      { value: "palma_guano_zacate", label: "Palma de guano o zacate" },
      { value: "otro", label: "Otro", otro: true },
    ],
  },
  {
    id: "piso",
    titulo: "¿De qué está hecho el piso del meliponario?",
    tipo: "multiple",
    opciones: [
      { value: "tierra", label: "Tierra" },
      { value: "firme", label: "Firme (tierra o grava compactada y nivelada)" },
      { value: "concreto", label: "Concreto" },
      { value: "otro", label: "Otro", otro: true },
    ],
  },
  {
    id: "sella_tapa",
    titulo: "¿Sella la orilla de la tapa de las cajas?",
    tipo: "unica",
    opciones: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "material_sellado",
    titulo: "¿Con qué sella la orilla de las cajas?",
    tipo: "multiple",
    visibleSi: (r) => tiene(r, "sella_tapa", "si"),
    opciones: [
      { value: "propoleo", label: "Nada, ellas cierran con su propóleo", exclusiva: true },
      { value: "plastilina", label: "Plastilina" },
      { value: "cinta_adhesiva", label: "Cinta adhesiva" },
      { value: "otro", label: "Otro", otro: true },
    ],
  },
  {
    id: "cubierta_bajo_tapa",
    titulo:
      "¿Utiliza acetato transparente o cartón debajo de la tapa para cubrir a las abejas?",
    tipo: "unica",
    opciones: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
      { value: "otro", label: "Otro", otro: true },
    ],
  },
  {
    id: "alimenta",
    titulo:
      "¿Alimentan a las abejas en temporada de lluvias/nortes o cuando están débiles?",
    tipo: "unica",
    opciones: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "alimento_energetico",
    titulo: "¿Con qué alimentan a las abejas? (alimentación energética)",
    tipo: "multiple",
    visibleSi: (r) => tiene(r, "alimenta", "si"),
    opciones: [
      { value: "jarabe_azucar", label: "Jarabe de azúcar" },
      { value: "fructosa", label: "Fructosa" },
      { value: "miel_apis", label: "Miel de Apis" },
      { value: "miel_melipona", label: "Miel de Melipona" },
      { value: "otro", label: "Otro", otro: true },
      { value: "ninguna", label: "Ninguna", exclusiva: true },
    ],
  },
  {
    id: "alimento_proteico",
    titulo: "¿Con qué alimentan a las abejas? (alimentación proteica)",
    tipo: "multiple",
    visibleSi: (r) => tiene(r, "alimenta", "si"),
    opciones: [
      { value: "soya", label: "Soya" },
      { value: "suero_leche", label: "Suero de leche" },
      { value: "torta_proteica", label: "Torta proteica" },
      { value: "polen_apis", label: "Polen de Apis" },
      { value: "otro", label: "Otro", otro: true },
      { value: "ninguna", label: "Ninguna", exclusiva: true },
    ],
  },
  {
    id: "cosecha",
    titulo: "¿Con qué cosecha la miel?",
    tipo: "multiple",
    opciones: [
      { value: "jeringa", label: "Jeringa" },
      { value: "manguera_bomba", label: "Manguera y bomba de vacío" },
      {
        value: "escurrimiento",
        label:
          "Agujereando hobones/cajas y por escurrimiento hacia un recipiente",
      },
      { value: "otro", label: "Otro", otro: true },
    ],
  },
];

function tiene(respuestas, pregunta, opcion) {
  return Boolean(respuestas?.[pregunta]?.seleccion?.includes(opcion));
}

export function preguntasVisibles(respuestas) {
  return PREGUNTAS.filter((p) => !p.visibleSi || p.visibleSi(respuestas));
}


/* =====================================================
   VALIDAR Y ARMAR LO QUE SE ENVÍA
   respuestas = { [pregunta]: { seleccion: [opciones], otro: "texto" } }
===================================================== */

export function validarFicha(respuestas) {
  for (const p of preguntasVisibles(respuestas)) {
    const r = respuestas?.[p.id];

    if (!r?.seleccion?.length) {
      return `Falta responder: ${p.titulo}`;
    }

    if (r.seleccion.includes("otro")) {
      const texto = String(r.otro ?? "").trim();

      if (!texto) return `Escribe la respuesta de «Otro» en: ${p.titulo}`;
      if (texto.length > 300) return `«Otro» admite máximo 300 caracteres en: ${p.titulo}`;
    }
  }

  return null;
}

function construirRespuestas(respuestas) {
  return preguntasVisibles(respuestas).flatMap((p) =>
    (respuestas[p.id]?.seleccion ?? []).map((opcion) => ({
      pregunta: p.id,
      opcion,
      texto_otro:
        opcion === "otro" ? String(respuestas[p.id].otro ?? "").trim() : null,
    }))
  );
}

function desdeServidor(lista = []) {
  const respuestas = {};

  for (const r of lista) {
    const actual = respuestas[r.pregunta] ?? { seleccion: [], otro: "" };
    actual.seleccion.push(r.opcion);
    if (r.opcion === "otro") actual.otro = r.texto_otro ?? "";
    respuestas[r.pregunta] = actual;
  }

  return respuestas;
}


/* =====================================================
   SUPABASE
===================================================== */

const esFaltaBackend = (error) =>
  error?.code === "PGRST202" || error?.code === "42883";

function mensajeFaltaBackend(error) {
  if (esFaltaBackend(error)) {
    return new Error(
      "El envío de la ficha técnica todavía no está instalado en Supabase. " +
      "Tus respuestas quedan guardadas en este teléfono."
    );
  }

  return error;
}

/**
 * Visitas que el coordinador de campo asignó al trabajador actual,
 * cada una con su ficha técnica si ya se envió.
 * La lista viene de mis_visitas_tecnicas_asignadas (ya existe en el
 * backend); el estado de la ficha, de mis_fichas_tecnicas (propuesta).
 */
export async function getMisVisitasAsignadasRequest() {
  const [visitasRes, fichasRes] = await Promise.all([
    supabase.rpc("mis_visitas_tecnicas_asignadas", {}),
    supabase.rpc("mis_fichas_tecnicas"),
  ]);

  if (visitasRes.error) throw visitasRes.error;

  const fichas = new Map(
    (fichasRes.error ? [] : fichasRes.data ?? []).map((f) => [
      String(f.asignacion_id),
      f,
    ])
  );

  const visitas = (Array.isArray(visitasRes.data) ? visitasRes.data : []).map(
    (v) => {
      const ficha = fichas.get(String(v.asignacion_id));
      return {
        ...v,
        ficha_id: ficha?.ficha_id ?? null,
        fecha_inspeccion: ficha?.fecha_inspeccion ?? null,
      };
    }
  );

  return {
    visitas,
    // false = el backend aún no tiene la ficha técnica instalada.
    fichaDisponible: !fichasRes.error || !esFaltaBackend(fichasRes.error),
  };
}

export async function obtenerFichaTecnicaRequest(asignacionId) {
  const { data, error } = await supabase.rpc("obtener_ficha_tecnica", {
    p_asignacion_id: asignacionId,
  });

  if (error) throw mensajeFaltaBackend(error);
  if (!data) return null;

  return {
    observaciones: data.observaciones ?? "",
    fechaInspeccion: data.fecha_inspeccion ?? null,
    respuestas: desdeServidor(data.respuestas),
  };
}

export async function guardarFichaTecnicaRequest(
  asignacionId,
  respuestas,
  observaciones
) {
  const problema = validarFicha(respuestas);
  if (problema) throw new Error(problema);

  const { data, error } = await supabase.rpc("guardar_ficha_tecnica", {
    p_asignacion_id: asignacionId,
    p_respuestas: construirRespuestas(respuestas),
    p_observaciones: String(observaciones ?? "").trim() || null,
  });

  if (error) throw mensajeFaltaBackend(error);

  await borrarBorradorFicha(asignacionId);

  return data;
}


/* =====================================================
   BORRADOR LOCAL
   En campo puede no haber señal: lo capturado se guarda
   en el teléfono hasta que se envía.
===================================================== */

// Un borrador por visita asignada.
const clave = (id) => `kaabmap:ficha-tecnica:visita:${id}`;

export async function leerBorradorFicha(asignacionId) {
  try {
    const valor = await AsyncStorage.getItem(clave(asignacionId));
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
}

export async function guardarBorradorFicha(asignacionId, borrador) {
  try {
    await AsyncStorage.setItem(
      clave(asignacionId),
      JSON.stringify({ ...borrador, guardado: new Date().toISOString() })
    );
  } catch {
    // Sin almacenamiento disponible: el formulario sigue funcionando.
  }
}

export async function borrarBorradorFicha(asignacionId) {
  try {
    await AsyncStorage.removeItem(clave(asignacionId));
  } catch {
    // Nada que hacer.
  }
}

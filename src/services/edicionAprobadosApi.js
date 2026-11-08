import { supabase } from "../lib/supabase";

import { construirFormularioBackend } from "./backend/formularioApi";
import { getMeliponarioByIdRequest } from "./meliponariosApi";
import { getEspeciesRequest } from "./especiesApi";
import {
  obtenerImagenesRemotas,
  subirFotosSeleccionadas,
} from "./meliponarioRemotePhotos";
import { MAX_FOTOS } from "../config/fotos";


/* =====================================================
   EDITAR MELIPONARIOS APROBADOS

   Reglas:
   - El cliente edita sus meliponarios aprobados.
   - El trabajador de campo edita los que él aprobó.
   - El cambio se aplica directo (sin nueva revisión).

   Usa funciones propuestas al backend en
   supabase/migrations/20261108000000_editar_meliponarios_aprobados.sql.
   Mientras no estén instaladas, la app avisa en lugar de fallar.
===================================================== */

const esFaltaBackend = (error) =>
  error?.code === "PGRST202" || error?.code === "42883";

function mensaje(error, accion) {
  if (esFaltaBackend(error)) {
    return new Error(
      `${accion} todavía no está disponible: el equipo de backend debe ` +
      "instalar la función de edición de meliponarios aprobados."
    );
  }

  return error instanceof Error ? error : new Error(error?.message ?? String(error));
}

const numero = (v) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};


/* =====================================================
   CONVERTIR UN MELIPONARIO EN FORMULARIO
   Misma forma que usa el registro (MeliponarioDraftContext).
===================================================== */

export function draftDesdeDetalle(detalle, imagenes = [], extra = {}) {
  return {
    meliponarioId: detalle.id,
    localJobId: null,

    nombre: detalle.nombre ?? "",
    descripcion: detalle.descripcion ?? "",

    responsableNombre: [
      detalle.responsable?.nombre,
      detalle.responsable?.apellidos,
    ]
      .filter(Boolean)
      .join(" "),

    municipioId: detalle.municipio_id ?? null,
    municipio: detalle.municipio ?? "",
    localidadId: detalle.localidad_id ?? null,
    localidad: detalle.localidad ?? "",

    latitude: numero(detalle.latitude ?? detalle.latitud),
    longitude: numero(detalle.longitude ?? detalle.longitud),
    locationSource: detalle.metodo_captura === "gps" ? "gps" : "manual",
    locationAccuracy: numero(detalle.precision_metros),

    referenciaUbicacion: detalle.referencia_ubicacion ?? "",
    observacionesCliente: detalle.observaciones_cliente ?? "",

    autorizacionUbicacionExacta: Boolean(detalle.autorizacion_ubicacion_exacta),
    autorizacionPublicacion: Boolean(
      detalle.autorizacion_ubicacion_exacta && detalle.autorizacion_contacto_publico
    ),

    ofreceVentaMiel: Boolean(detalle.ofrece_venta_miel),
    ofreceVisitas: Boolean(detalle.ofrece_visitas),

    especies: (Array.isArray(detalle.especies) ? detalle.especies : []).map((s) => {
      const id = s.especieId ?? s.especie_id ?? s.id;
      return {
        id,
        especieId: id,
        nombre: s.nombre ?? s.nombre_comun ?? "",
        cientifico: s.nombreCientifico ?? s.nombre_cientifico ?? s.cientifico ?? "",
        maya: s.maya ?? "",
        cajasTecnificadas: Number(s.cajasTecnificadas ?? s.cantidad_cajas ?? 0),
        jobones: Number(s.jobones ?? s.cantidad_jobones ?? 0),
      };
    }),

    imagenes: imagenes.slice(0, MAX_FOTOS),

    ...extra,
  };
}


/* =====================================================
   ABRIR PARA EDITAR
===================================================== */

// Cliente: su propio meliponario (lectura que ya permite el backend).
export async function abrirAprobadoComoClienteRequest(meliponarioId) {
  const [detalle, imagenes] = await Promise.all([
    getMeliponarioByIdRequest(meliponarioId),
    obtenerImagenesRemotas(meliponarioId),
  ]);

  if (!detalle) throw new Error("No se encontró el meliponario.");

  return draftDesdeDetalle(detalle, imagenes, {
    modoEdicion: "aprobado",
    volverA: "MyMeliponarios",
  });
}

// Trabajador: un meliponario que él aprobó (función propuesta al backend).
export async function abrirAprobadoComoTrabajadorRequest(meliponarioId) {
  const [res, imagenes, catalogo] = await Promise.all([
    supabase.rpc("obtener_meliponario_para_edicion", {
      p_meliponario_id: meliponarioId,
    }),
    obtenerImagenesRemotas(meliponarioId).catch(() => []),
    getEspeciesRequest().catch(() => ({ data: [] })),
  ]);

  if (res.error) throw mensaje(res.error, "Abrir el meliponario para editarlo");
  if (!res.data) throw new Error("No tienes permiso para editar este meliponario.");

  // Completar los nombres de las especies con el catálogo.
  const porId = new Map((catalogo?.data ?? []).map((e) => [String(e.id), e]));
  const detalle = {
    ...res.data,
    especies: (res.data.especies ?? []).map((s) => ({
      ...s,
      nombre_comun: porId.get(String(s.especie_id))?.nombre_comun ?? "",
      nombre_cientifico: porId.get(String(s.especie_id))?.nombre_cientifico ?? "",
    })),
  };

  return draftDesdeDetalle(detalle, imagenes, {
    modoEdicion: "aprobado",
    volverA: "InspectionsMain",
  });
}


/* =====================================================
   LISTA DEL TRABAJADOR: MELIPONARIOS QUE APROBÓ
===================================================== */

export async function getMisAprobadosTrabajadorRequest() {
  const { data, error } = await supabase.rpc("mis_meliponarios_aprobados_trabajador");

  if (error) throw mensaje(error, "La lista de meliponarios que aprobaste");

  return Array.isArray(data) ? data : [];
}


/* =====================================================
   GUARDAR LA EDICIÓN (se aplica directo)
===================================================== */

export async function guardarEdicionAprobadoRequest(draft, { onPhotosProgress } = {}) {
  const { error } = await supabase.rpc("editar_meliponario_aprobado", {
    p_meliponario_id: draft.meliponarioId,
    p_datos: construirFormularioBackend(draft),
  });

  if (error) throw mensaje(error, "Guardar los cambios");

  // Fotos nuevas (las ya subidas se conservan).
  const imagenes = await subirFotosSeleccionadas(
    draft.meliponarioId,
    draft.imagenes ?? [],
    onPhotosProgress
  );

  return { id: draft.meliponarioId, imagenes };
}

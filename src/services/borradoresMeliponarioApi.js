import { supabase }
  from "../lib/supabase";

import {
  enviarRegistroBasicoRequest,
  reenviarRegistroCorregidoRequest,
  obtenerSolicitudMasRecienteRequest,
} from "./backend/formularioApi";

export function esBorradorEditable(item) {
  if (!item) {
    return false;
  }

  const estado =
    item.solicitud_estado ??
    item.solicitud?.estado ??
    null;

  return (
    estado === null ||
    estado === "borrador" ||
    estado === "correccion"
  );
}

export async function enviarBorradorARevisionRequest(
  meliponarioId
) {
  if (!meliponarioId) {
    throw new Error(
      "Primero guarda el borrador."
    );
  }

  const {
    data: auth,
    error: authError,
  } = await supabase.auth.getUser();

  if (
    authError ||
    !auth?.user
  ) {
    throw new Error(
      "Debes iniciar sesión."
    );
  }

  const solicitud =
    await obtenerSolicitudMasRecienteRequest(
      meliponarioId
    );

  const estado =
    solicitud?.estado ??
    null;

  if (estado === "correccion") {
    return reenviarRegistroCorregidoRequest(
      meliponarioId
    );
  }

  if (
    estado !== null &&
    estado !== "borrador"
  ) {
    throw new Error(
      `El registro no puede enviarse. Estado actual: ${estado}.`
    );
  }

  return enviarRegistroBasicoRequest(
    meliponarioId
  );
}
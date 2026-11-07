import NetInfo
  from "@react-native-community/netinfo";

import { supabase }
  from "../lib/supabase";

import {
  guardarFormularioRequest,
} from "./backend/formularioApi";

import {
  subirFotosSeleccionadas,
} from "./meliponarioRemotePhotos";


export async function guardarBorradorRemoto(
  draft,
  {
    onSavedId,
    onPhotosProgress,
  } = {}
) {
  /* ====================================
     VERIFICAR CONEXIÓN
  ==================================== */

  const estado =
    await NetInfo.fetch();

  if (
    estado.isConnected !== true ||
    estado.isInternetReachable === false
  ) {
    throw new Error(
      "Conéctate a Internet para guardar " +
      "el borrador y subir las fotografías."
    );
  }

  /* ====================================
     VERIFICAR AUTENTICACIÓN
  ==================================== */

  const {
    data: auth,
    error: authError,
  } = await supabase.auth.getUser();

  if (
    authError ||
    !auth?.user
  ) {
    throw new Error(
      "Inicia sesión para guardar el borrador."
    );
  }

  /* ====================================
     GUARDAR FORMULARIO EN SUPABASE
  ==================================== */

  const meliponarioId =
    await guardarFormularioRequest(
      draft,
      draft.meliponarioId ?? null
    );

  if (
    typeof meliponarioId !== "string" ||
    !meliponarioId
  ) {
    throw new Error(
      "El backend no devolvió el ID del borrador. " +
      "Revisa Mis registros antes de intentar crearlo otra vez."
    );
  }

  // Conservar el ID si alguna foto falla.
  onSavedId?.(
    meliponarioId
  );

  /* ====================================
     SUBIR LAS FOTOGRAFÍAS
  ==================================== */

  const imagenes =
    await subirFotosSeleccionadas(
      meliponarioId,
      draft.imagenes ?? [],
      onPhotosProgress
    );

  return {
    id: meliponarioId,
    imagenes,
  };
}
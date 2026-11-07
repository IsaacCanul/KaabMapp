import {
  getMeliponarioPhotos,
} from "./meliponarioPhotos";

import {
  listarImagenesRemotas,
  subirFotosSeleccionadas,
} from "./meliponarioRemotePhotos";

/* =========================================
   MIGRAR FOTOGRAFÍAS ANTIGUAS A SUPABASE
========================================= */

export async function migrarFotosAnteriores(
  meliponarioId
) {
  if (!meliponarioId) {
    throw new Error(
      "No se recibió el ID del meliponario."
    );
  }

  // 1. Revisar fotografías existentes en Supabase.
  const remotas =
    await listarImagenesRemotas(meliponarioId);

  if (remotas.length > 0) {
    throw new Error(
      "Este meliponario ya tiene fotografías en Supabase. " +
      "No se realizará una migración automática para evitar duplicados."
    );
  }

  // 2. Leer fotografías antiguas del dispositivo.
  const locales =
    await getMeliponarioPhotos(meliponarioId);

  if (
    !Array.isArray(locales) ||
    locales.length === 0
  ) {
    throw new Error(
      "No se encontraron fotografías antiguas en este dispositivo."
    );
  }

  // 3. Preparar hasta tres fotografías.
  const fotos = locales
    .slice(0, 3)
    .map((foto, index) => {
      const uri =
        typeof foto === "string"
          ? foto
          : foto?.uri;

      if (!uri) {
        throw new Error(
          `La fotografía ${index + 1} no tiene una URI válida.`
        );
      }

      const nombre = String(uri).toLowerCase();

      const mimeType =
        foto?.mimeType ??
        (nombre.includes("image/png") ||
        nombre.endsWith(".png")
          ? "image/png"
          : nombre.includes("image/webp") ||
            nombre.endsWith(".webp")
            ? "image/webp"
            : "image/jpeg");

      return {
        id: `migracion-${index + 1}`,
        uri,
        mimeType,
        descripcion:
          foto?.descripcion ?? null,
      };
    });

  // 4. Subirlas al bucket remoto de Supabase.
  const resultado =
    await subirFotosSeleccionadas(
      meliponarioId,
      fotos
    );

  // 5. Devolver las fotografías sincronizadas.
  return resultado;
}
import { supabase } from "../lib/supabase";

/* =========================================
   CONSULTAR IMÁGENES REMOTAS
========================================= */

export async function listarImagenesMeliponarioRequest(
  meliponarioId
) {
  if (!meliponarioId) {
    return [];
  }

  const { data, error } = await supabase.rpc(
    "listar_imagenes_meliponario",
    {
      p_meliponario_id: meliponarioId,
    }
  );

  if (error) {
    console.error(
      "ERROR OBTENIENDO FOTOGRAFÍAS:",
      error
    );

    throw error;
  }

  return (data ?? [])
    .filter((foto) => Boolean(foto.ruta_storage))
    .sort(
      (a, b) =>
        Number(a.posicion ?? 0) -
        Number(b.posicion ?? 0)
    );
}

/* =========================================
   CREAR URL DE LECTURA

   Para buckets PRIVADOS, siempre que
   las políticas de Storage permitan
   crear URLs firmadas.
========================================= */

export async function obtenerUrlImagenRequest({
  bucket,
  rutaStorage,
}) {
  if (!bucket || !rutaStorage) {
    throw new Error(
      "Falta el bucket o la ruta de la fotografía."
    );
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(
      rutaStorage,
      3600
    );

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
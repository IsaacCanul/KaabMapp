import { Platform } from "react-native";

import * as FileSystem
  from "expo-file-system/legacy";

import { decode }
  from "base64-arraybuffer";

import { supabase }
  from "../lib/supabase";


const BUCKET = "kaabmap-meliponarios";
const MAX_FOTOS = 3;


/* =========================================
   VALIDAR MELIPONARIO
========================================= */

function requiereId(meliponarioId) {
  if (!meliponarioId) {
    throw new Error(
      "Primero guarda el meliponario para obtener su identificador."
    );
  }
}


/* =========================================
   LISTAR IMÁGENES REGISTRADAS
========================================= */

export async function listarImagenesRemotas(
  meliponarioId
) {
  requiereId(meliponarioId);

  const { data, error } = await supabase.rpc(
    "listar_imagenes_meliponario",
    {
      p_meliponario_id: meliponarioId,
    }
  );

  if (error) {
    console.error(
      "ERROR LISTANDO FOTOGRAFÍAS:",
      error
    );
    throw error;
  }

  return (Array.isArray(data) ? data : [])
    .sort(
      (a, b) =>
        Number(a.posicion ?? 0) -
        Number(b.posicion ?? 0)
    );
}


/* =========================================
   RECUPERAR URLS DESDE STORAGE
========================================= */

export async function obtenerImagenesRemotas(
  meliponarioId
) {
  const records =
    await listarImagenesRemotas(meliponarioId);

  const photos = await Promise.all(
    records.map(async (foto) => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(
          foto.ruta_storage,
          3600
        );

      if (error) {
        throw error;
      }

      return {
        id: foto.id,
        remoteId: foto.id,
        ruta_storage: foto.ruta_storage,
        posicion: foto.posicion,
        descripcion: foto.descripcion,
        uri: data.signedUrl,
        mimeType: "image/jpeg",
      };
    })
  );

  return photos;
}


/* =========================================
   OBTENER BYTES DE LA FOTOGRAFÍA
========================================= */

async function obtenerArrayBuffer(foto) {
  if (!foto?.uri && !foto?.base64) {
    throw new Error(
      "La fotografía seleccionada no tiene URI ni datos binarios."
    );
  }

  if (foto.base64) {
    const base64 = foto.base64.replace(
      /^data:[^,]*,/,
      ""
    );

    return decode(base64);
  }

  if (Platform.OS === "web") {
    const response = await fetch(foto.uri);

    if (!response.ok) {
      throw new Error(
        "No se pudo leer la fotografía en el navegador."
      );
    }

    return response.arrayBuffer();
  }

  const base64 = await FileSystem.readAsStringAsync(
    foto.uri,
    {
      encoding:
        FileSystem.EncodingType.Base64,
    }
  );

  return decode(base64);
}


/* =========================================
   LEER RUTA DEVUELTA POR EL BACKEND
========================================= */

function rutaDeReserva(reserva) {
  const obj =
    typeof reserva === "string"
      ? JSON.parse(reserva)
      : reserva;

  const content =
    obj?.data &&
    typeof obj.data === "object"
      ? obj.data
      : obj;

  const ruta =
    content?.ruta_storage ??
    content?.storage_path ??
    content?.ruta ??
    content?.path ??
    null;

  if (
    typeof ruta !== "string" ||
    !ruta.trim() ||
    ruta.startsWith("http")
  ) {
    const keys =
      content && typeof content === "object"
        ? Object.keys(content).join(", ")
        : "respuesta vacía";

    throw new Error(
      "La función de reserva no devolvió " +
      "una ruta reconocible. Campos recibidos: " +
      keys
    );
  }

  const bucket =
    content?.bucket_id ??
    content?.bucket ??
    BUCKET;

  if (bucket !== BUCKET) {
    throw new Error(
      `El backend indicó un bucket distinto: ${bucket}`
    );
  }

  return ruta;
}


/* =========================================
   RESERVAR Y SUBIR UNA IMAGEN
========================================= */

export async function subirImagenRemota(
  meliponarioId,
  foto
) {
  requiereId(meliponarioId);

  // No duplicar una fotografía
  // que ya está en Supabase.
  if (
    foto?.remoteId &&
    foto?.ruta_storage
  ) {
    return foto;
  }

  const mimeType =
    foto?.mimeType ??
    "image/jpeg";

  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
    ].includes(mimeType)
  ) {
    throw new Error(
      "Solo se permiten imágenes JPG, PNG o WebP."
    );
  }

  // Primero obtener los bytes.
  const bytes =
    await obtenerArrayBuffer(foto);

  // Reservar la fotografía en el backend.
  const {
    data: reserva,
    error: reservaError,
  } = await supabase.rpc(
    "reservar_imagen_meliponario",
    {
      p_meliponario_id:
        meliponarioId,

      p_tipo_mime:
        mimeType,

      p_descripcion:
        foto.descripcion ?? null,
    }
  );

  if (reservaError) {
    console.error(
      "ERROR RESERVANDO IMAGEN:",
      reservaError
    );

    throw reservaError;
  }

  const ruta =
    rutaDeReserva(reserva);

  // Subir realmente a Supabase Storage.
  const {
    error: uploadError,
  } = await supabase.storage
    .from(BUCKET)
    .upload(
      ruta,
      bytes,
      {
        contentType: mimeType,
        upsert: false,
      }
    );

  if (uploadError) {
    throw new Error(
      "Se reservó la fotografía, pero " +
      "falló la subida a Storage: " +
      uploadError.message +
      ". Comprueba la reserva antes de reintentar."
    );
  }

  // Verificar asociación con meliponario.
  const registradas =
    await listarImagenesRemotas(
      meliponarioId
    );

  const registro =
    registradas.find(
      (item) =>
        item.ruta_storage === ruta
    );

  if (!registro) {
    throw new Error(
      "La imagen llegó a Storage, pero " +
      "no se pudo confirmar su asociación " +
      "al meliponario."
    );
  }

  // Obtener URL para visualizarla.
  const {
    data: signed,
    error: readError,
  } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(
      ruta,
      3600
    );

  if (readError) {
    throw readError;
  }

  return {
    ...foto,
    id: registro.id,
    remoteId: registro.id,
    ruta_storage: ruta,
    uri: signed.signedUrl,
  };
}


/* =========================================
   SUBIR HASTA 3 FOTOGRAFÍAS
========================================= */

export async function subirFotosSeleccionadas(
  meliponarioId,
  fotos = [],
  onProgress
) {
  const seleccionadas =
    Array.isArray(fotos)
      ? fotos
      : [];

  if (
    seleccionadas.length > MAX_FOTOS
  ) {
    throw new Error(
      "Solo puedes registrar hasta tres fotografías."
    );
  }

  const existentes =
    await listarImagenesRemotas(
      meliponarioId
    );

  const nuevas = seleccionadas.filter(
    (foto) => !foto?.remoteId
  );

  if (
    existentes.length + nuevas.length >
    MAX_FOTOS
  ) {
    throw new Error(
      `Ya tienes ${existentes.length} fotografías en Supabase. ` +
      `Solo puedes agregar ${Math.max(
        0,
        MAX_FOTOS - existentes.length
      )} más.`
    );
  }

  const resultado = [
    ...seleccionadas,
  ];

  for (
    let i = 0;
    i < resultado.length;
    i++
  ) {
    if (resultado[i]?.remoteId) {
      continue;
    }

    resultado[i] =
      await subirImagenRemota(
        meliponarioId,
        resultado[i]
      );

    // Actualizar el formulario después
    // de subir cada fotografía.
    onProgress?.([
      ...resultado,
    ]);
  }

  return resultado;
}
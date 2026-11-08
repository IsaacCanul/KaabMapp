import { MAX_FOTOS } from "../config/fotos";
import AsyncStorage from "@react-native-async-storage/async-storage";
import localforage from "localforage";

const pendingKey = (id) =>
  `@kaabmap:photos:pending:${id}`;

const recordKey = (id) =>
  `@kaabmap:photos:record:${id}`;

const legacyKey = (id) =>
  `@kaabmap:meliponario-photos:${id}`;


/* =====================================================
   CONVERTIR A DATA URI
===================================================== */

async function asDataUri(rawImage) {
  /*
   * Admitimos imágenes guardadas como:
   *
   * "blob:..."
   *
   * o:
   *
   * { uri: "blob:..." }
   *
   * o:
   *
   * { base64: "...", mimeType: "image/jpeg" }
   */

  const image =
    typeof rawImage === "string"
      ? { uri: rawImage }
      : rawImage?.asset
        ? {
            ...rawImage.asset,
            ...rawImage,
            uri:
              rawImage.uri ??
              rawImage.asset.uri,
          }
        : rawImage;

  if (
    image?.base64 &&
    typeof image.base64 === "string"
  ) {
    return `data:${
      image.mimeType || "image/jpeg"
    };base64,${image.base64}`;
  }

  const uri = image?.uri;

  if (!uri) {
    console.error(
      "FOTO SIN URI:",
      {
        tipo: typeof rawImage,
        campos:
          rawImage &&
          typeof rawImage === "object"
            ? Object.keys(rawImage)
            : [],
      }
    );

    throw new Error(
      "La fotografía no contiene una URI válida. Vuelve al Paso 1 y selecciónala nuevamente."
    );
  }

  if (uri.startsWith("data:")) {
    return uri;
  }

  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error(
      "No se pudo leer la fotografía seleccionada."
    );
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error(
          "No se pudo convertir la fotografía."
        )
      );
    };

    reader.readAsDataURL(blob);
  });
}


/* =====================================================
   GUARDAR FOTOS ANTES DE SINCRONIZAR
===================================================== */

export async function persistPendingPhotos(
  jobId,
  images = []
) {
  const list = Array.isArray(images)
    ? images.slice(0, MAX_FOTOS)
    : [];

  if (!list.length) {
    return [];
  }

  const photos = [];

  for (const image of list) {
    photos.push(
      await asDataUri(image)
    );
  }

  await localforage.setItem(
    pendingKey(jobId),
    photos
  );

  return photos.map((_, i) => ({
    id: `foto-${i + 1}`,
    // Se conserva la descripción opcional escrita en el registro.
    descripcion: list[i]?.descripcion ?? null,
  }));
}


/* =====================================================
   VINCULAR FOTOS AL MELIPONARIO
===================================================== */

export async function attachPendingPhotos(
  jobId,
  meliponarioId
) {
  const photos = await localforage.getItem(
    pendingKey(jobId)
  );

  if (!photos) {
    return getMeliponarioPhotos(meliponarioId);
  }

  await localforage.setItem(
    recordKey(meliponarioId),
    photos
  );

  await localforage.removeItem(
    pendingKey(jobId)
  );

  return photos;
}


/* =====================================================
   OBTENER FOTOGRAFÍAS
===================================================== */

export async function getMeliponarioPhotos(
  meliponarioId
) {
  if (!meliponarioId) {
    return [];
  }

  const photos = await localforage.getItem(
    recordKey(meliponarioId)
  );

  if (Array.isArray(photos)) {
    return photos;
  }

  // Compatibilidad con almacenamiento anterior.
  const legacy = await AsyncStorage.getItem(
    legacyKey(meliponarioId)
  );

  if (!legacy) {
    return [];
  }

  try {
    const list = JSON.parse(legacy);

    return Array.isArray(list)
      ? list
      : [];
  } catch {
    return [];
  }
}


/* =====================================================
   DESCARTAR FOTOS PENDIENTES
===================================================== */

export async function discardPendingPhotos(jobId) {
  if (jobId) {
    await localforage.removeItem(
      pendingKey(jobId)
    );
  }
}
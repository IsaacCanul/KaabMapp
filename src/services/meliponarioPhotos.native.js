import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const pendingKey = (id) =>
  `@kaabmap:photos:pending:${id}`;

const recordKey = (id) =>
  `@kaabmap:photos:record:${id}`;

const legacyKey = (id) =>
  `@kaabmap:meliponario-photos:${id}`;

const pendingDir = (id) =>
  `${FileSystem.documentDirectory}kaabmap-photos/pending/${id}/`;

const recordDir = (id) =>
  `${FileSystem.documentDirectory}kaabmap-photos/records/${id}/`;


/* =====================================================
   GUARDAR FOTOS ANTES DE SINCRONIZAR
===================================================== */

export async function persistPendingPhotos(
  jobId,
  images = []
) {
  const list = Array.isArray(images)
    ? images.slice(0, 3)
    : [];

  if (!list.length) {
    return [];
  }

  await FileSystem.makeDirectoryAsync(
    pendingDir(jobId),
    {
      intermediates: true,
    }
  );

  const paths = [];

  for (let i = 0; i < list.length; i += 1) {
    const image = list[i];

    if (!image?.uri) {
      throw new Error(
        `No se encontró la foto ${i + 1}.`
      );
    }

    const extension =
      image.mimeType === "image/png"
        ? "png"
        : "jpg";

    const path =
      `${pendingDir(jobId)}foto-${i + 1}.${extension}`;

    await FileSystem.copyAsync({
      from: image.uri,
      to: path,
    });

    paths.push(path);
  }

  await AsyncStorage.setItem(
    pendingKey(jobId),
    JSON.stringify(paths)
  );

  return paths.map((_, i) => ({
    id: `foto-${i + 1}`,
  }));
}


/* =====================================================
   ASOCIAR FOTOS AL ID REAL DEL MELIPONARIO
===================================================== */

export async function attachPendingPhotos(
  jobId,
  meliponarioId
) {
  const raw = await AsyncStorage.getItem(
    pendingKey(jobId)
  );

  if (!raw) {
    return getMeliponarioPhotos(meliponarioId);
  }

  const paths = JSON.parse(raw);

  await FileSystem.makeDirectoryAsync(
    recordDir(meliponarioId),
    {
      intermediates: true,
    }
  );

  const finalPaths = [];

  for (let i = 0; i < paths.length; i += 1) {
    const extension = paths[i].endsWith(".png")
      ? "png"
      : "jpg";

    const target =
      `${recordDir(meliponarioId)}foto-${i + 1}.${extension}`;

    const info =
      await FileSystem.getInfoAsync(target);

    if (!info.exists) {
      await FileSystem.copyAsync({
        from: paths[i],
        to: target,
      });
    }

    finalPaths.push(target);
  }

  // Confirmar persistencia antes de borrar temporales.
  await AsyncStorage.setItem(
    recordKey(meliponarioId),
    JSON.stringify(finalPaths)
  );

  await AsyncStorage.removeItem(
    pendingKey(jobId)
  );

  await FileSystem.deleteAsync(
    pendingDir(jobId),
    {
      idempotent: true,
    }
  );

  return finalPaths;
}


/* =====================================================
   LEER FOTOGRAFÍAS DE UN MELIPONARIO
===================================================== */

export async function getMeliponarioPhotos(
  meliponarioId
) {
  if (!meliponarioId) {
    return [];
  }

  const raw = await AsyncStorage.getItem(
    recordKey(meliponarioId)
  );

  if (raw) {
    const paths = JSON.parse(raw);

    const available = [];

    for (const uri of paths) {
      const info =
        await FileSystem.getInfoAsync(uri);

      if (info.exists) {
        available.push(uri);
      }
    }

    return available;
  }

  // Compatibilidad con una versión local anterior.
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
   ELIMINAR FOTOS DE UNA TAREA DESCARTADA
===================================================== */

export async function discardPendingPhotos(jobId) {
  if (!jobId) {
    return;
  }

  await AsyncStorage.removeItem(
    pendingKey(jobId)
  );

  await FileSystem.deleteAsync(
    pendingDir(jobId),
    {
      idempotent: true,
    }
  );
}
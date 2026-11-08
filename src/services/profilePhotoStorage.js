import {
  Platform,
} from "react-native";

import AsyncStorage
  from "@react-native-async-storage/async-storage";

import * as FileSystem from "expo-file-system";

const STORAGE_PREFIX =
  "@kaabmap:profile-photo:";


function getStorageKey(
  userId
) {
  return (
    `${STORAGE_PREFIX}${userId}`
  );
}


/* =====================================================
   OBTENER FOTO
===================================================== */

export async function getStoredProfilePhoto(
  userId
) {
  if (!userId) {
    return null;
  }


  try {
    return await AsyncStorage.getItem(
      getStorageKey(
        userId
      )
    );
  } catch (error) {
    console.warn(
      "ERROR LEYENDO FOTO DE PERFIL:",
      error
    );

    return null;
  }
}


/* =====================================================
   GUARDAR FOTO
===================================================== */

export async function saveProfilePhoto(
  userId,
  image
) {
  if (!userId) {
    throw new Error(
      "No existe usuario para guardar la fotografía."
    );
  }


  if (!image?.uri) {
    throw new Error(
      "No existe una imagen válida."
    );
  }


  /*
   * WEB
   *
   * Guardamos data:image/...;base64
   * porque un blob: URI deja de ser
   * válido cuando recargas el navegador.
   */
  if (
    Platform.OS ===
    "web"
  ) {
    if (!image.base64) {
      throw new Error(
        "No fue posible preparar la imagen para guardarla."
      );
    }


    const mimeType =
      image.mimeType ??
      "image/jpeg";


    const persistentUri =
      `data:${mimeType};base64,${image.base64}`;


    await AsyncStorage.setItem(
      getStorageKey(
        userId
      ),
      persistentUri
    );


    return persistentUri;
  }


  /* ===================================================
     ANDROID / IOS
  =================================================== */

  const baseDir =
    `${
      FileSystem.documentDirectory
    }kaabmap-profile/`;


  const filePath =
    `${baseDir}${userId}.jpg`;


  await FileSystem.makeDirectoryAsync(
    baseDir,
    {
      intermediates:
        true,
    }
  );


  /*
   * Borrar la versión anterior.
   */
  await FileSystem.deleteAsync(
    filePath,
    {
      idempotent:
        true,
    }
  );


  /*
   * Copiamos fuera del caché de
   * ImagePicker para que sobreviva
   * reinicios de la aplicación.
   */
  await FileSystem.copyAsync({
    from:
      image.uri,

    to:
      filePath,
  });


  await AsyncStorage.setItem(
    getStorageKey(
      userId
    ),
    filePath
  );


  return filePath;
}


/* =====================================================
   ELIMINAR FOTO
===================================================== */

export async function removeStoredProfilePhoto(
  userId
) {
  if (!userId) {
    return;
  }


  const key =
    getStorageKey(
      userId
    );


  const current =
    await AsyncStorage.getItem(
      key
    );


  if (
    current &&
    Platform.OS !==
      "web"
  ) {
    try {
      await FileSystem.deleteAsync(
        current,
        {
          idempotent:
            true,
        }
      );
    } catch {
      // No bloquear.
    }
  }


  await AsyncStorage.removeItem(
    key
  );
}
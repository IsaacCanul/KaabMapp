import AsyncStorage
  from "@react-native-async-storage/async-storage";

import {
  supabase,
} from "../lib/supabase";


const CACHE_KEY =
  "@kaabmap:especies-catalog:v1";


/* =====================================================
   GUARDAR CACHE
===================================================== */

async function saveCache(
  data
) {
  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify(
        data ?? []
      )
    );
  } catch (error) {
    console.warn(
      "No se pudo guardar cache de especies:",
      error
    );
  }
}


/* =====================================================
   LEER CACHE
===================================================== */

async function readCache() {
  try {
    const raw =
      await AsyncStorage.getItem(
        CACHE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.warn(
      "No se pudo leer cache de especies:",
      error
    );

    return [];
  }
}


/* =====================================================
   OBTENER ESPECIES
===================================================== */

export async function getEspeciesRequest() {
  try {
    const {
      data,
      error,
    } = await supabase
      .from("especies")
      .select("*");


    if (error) {
      throw error;
    }


    const finalData =
      data ?? [];


    await saveCache(
      finalData
    );


    console.log(
      "ESPECIES SUPABASE:",
      finalData
    );


    return {
      data:
        finalData,

      source:
        "server",
    };
  } catch (error) {
    console.warn(
      "No se pudo cargar especies desde Supabase:",
      error
    );


    const cached =
      await readCache();


    if (
      cached.length
    ) {
      console.log(
        "ESPECIES DESDE CACHE:",
        cached
      );

      return {
        data:
          cached,

        source:
          "cache",
      };
    }


    throw new Error(
      "No se pudo cargar el catálogo de especies y todavía no existe una copia guardada en este dispositivo."
    );
  }
}
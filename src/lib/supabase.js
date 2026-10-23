import "react-native-url-polyfill/auto";

import AsyncStorage
  from "@react-native-async-storage/async-storage";

import {
  AppState,
  Platform,
} from "react-native";

import {
  createClient,
} from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Falta EXPO_PUBLIC_SUPABASE_URL en .env"
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Falta EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env"
  );
}

/*
 * Diagnóstico temporal.
 * No imprime la clave completa.
 */
console.log(
  "CONFIG SUPABASE:",
  {
    url: supabaseUrl,

    inicio:
      supabasePublishableKey.slice(
        0,
        15
      ),

    final:
      supabasePublishableKey.slice(
        -6
      ),

    longitud:
      supabasePublishableKey.length,
  }
);

export const supabase =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        storage:
          AsyncStorage,

        autoRefreshToken:
          true,

        persistSession:
          true,

        detectSessionInUrl:
          false,
      },
    }
  );

if (
  Platform.OS !== "web"
) {
  AppState.addEventListener(
    "change",
    (state) => {
      if (
        state === "active"
      ) {
        supabase.auth
          .startAutoRefresh();
      } else {
        supabase.auth
          .stopAutoRefresh();
      }
    }
  );
}
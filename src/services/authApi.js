import * as Linking
  from "expo-linking";

import {
  supabase,
} from "../lib/supabase";


const EMAIL_CONFIRM_REDIRECT =
  Linking.createURL(
    "email-confirmed"
  );


console.log(
  "REDIRECT CONFIRMACION:",
  EMAIL_CONFIRM_REDIRECT
);


/*
 * =====================================================
 * REGISTRO
 * =====================================================
 */
export async function registerRequest({
  nombre,
  nombres,
  apellidos,
  email,
  telefono,
  institucion,
  password,
}) {
  const finalNombre =
    String(
      nombre ??
      nombres ??
      ""
    ).trim();

  const finalApellidos =
    String(
      apellidos ?? ""
    ).trim();

  const normalizedEmail =
    String(email ?? "")
      .trim()
      .toLowerCase();

  const finalTelefono =
    String(
      telefono ?? ""
    ).trim();

  const finalInstitucion =
    String(
      institucion ?? ""
    ).trim();

  const {
    data,
    error,
  } =
    await supabase.auth.signUp({
      email:
        normalizedEmail,

      password,

      options: {
        emailRedirectTo:
          EMAIL_CONFIRM_REDIRECT,

        /*
         * Estos datos quedan en
         * user_metadata.
         *
         * Si el backend tiene un trigger,
         * puede utilizarlos para crear
         * public.perfiles.
         */
        data: {
          nombre:
            finalNombre,

          apellidos:
            finalApellidos,

          telefono:
            finalTelefono ||
            null,

          institucion:
            finalInstitucion ||
            null,
        },
      },
    });

  if (error) {
    throw error;
  }

  return {
    user:
      data?.user ??
      null,

    session:
      data?.session ??
      null,

    requiresVerification:
      Boolean(data?.user) &&
      !data?.session,
  };
}


/*
 * =====================================================
 * REENVIAR CONFIRMACIÓN
 * =====================================================
 */
export async function resendVerificationRequest(
  email
) {
  const normalizedEmail =
    String(email ?? "")
      .trim()
      .toLowerCase();

  const {
    data,
    error,
  } =
    await supabase.auth.resend({
      type:
        "signup",

      email:
        normalizedEmail,

      options: {
        emailRedirectTo:
          EMAIL_CONFIRM_REDIRECT,
      },
    });

  if (error) {
    throw error;
  }

  return data;
}


/*
 * =====================================================
 * LOGIN
 * =====================================================
 */
export async function loginRequest({
  email,
  password,
}) {
  const normalizedEmail =
    String(email ?? "")
      .trim()
      .toLowerCase();

  const {
    data,
    error,
  } =
    await supabase.auth
      .signInWithPassword({
        email:
          normalizedEmail,

        password,
      });

  if (error) {
    throw error;
  }

  if (!data?.user) {
    throw new Error(
      "Supabase no devolvió un usuario."
    );
  }

  /*
   * El código que te proporcionó
   * tu compañero consulta esta tabla.
   */
  const {
    data: perfil,
    error: perfilError,
  } =
    await supabase
      .from("perfiles")
      .select(
        "id, nombre, apellidos, rol_id, activo"
      )
      .eq(
        "id",
        data.user.id
      )
      .single();

  if (perfilError) {
    console.error(
      "Error obteniendo perfil:",
      perfilError
    );

    await supabase.auth.signOut();

    throw new Error(
      "Se inició sesión, pero no se pudo obtener el perfil."
    );
  }

  if (
    perfil?.activo === false
  ) {
    await supabase.auth.signOut();

    throw new Error(
      "Esta cuenta se encuentra desactivada."
    );
  }

  return {
    user:
      data.user,

    session:
      data.session,

    perfil,
  };
}


/*
 * =====================================================
 * CONSULTAR PERFIL
 * =====================================================
 */
export async function getProfileRequest(
  userId
) {
  if (!userId) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("perfiles")
      .select(
        "id, nombre, apellidos, rol_id, activo"
      )
      .eq(
        "id",
        userId
      )
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/*
 * =====================================================
 * SESIÓN
 * =====================================================
 */
export async function getSessionRequest() {
  const {
    data,
    error,
  } =
    await supabase.auth
      .getSession();

  if (error) {
    throw error;
  }

  return (
    data?.session ??
    null
  );
}


/*
 * =====================================================
 * USUARIO ACTUAL
 * =====================================================
 */
export async function getCurrentUserRequest() {
  const {
    data,
    error,
  } =
    await supabase.auth
      .getUser();

  if (error) {
    throw error;
  }

  return (
    data?.user ??
    null
  );
}


/*
 * =====================================================
 * LOGOUT
 * =====================================================
 */
export async function logoutRequest() {
  const {
    error,
  } =
    await supabase.auth
      .signOut();

  if (error) {
    throw error;
  }
}
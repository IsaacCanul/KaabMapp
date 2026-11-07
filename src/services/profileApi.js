import {
  supabase,
} from "../lib/supabase";


/* =====================================================
   OBTENER MI PERFIL
===================================================== */

export async function getMyProfileRequest() {
  const {
    data: userData,
    error: userError,
  } =
    await supabase.auth.getUser();


  if (userError) {
    throw userError;
  }


  const user =
    userData?.user;


  if (!user) {
    throw new Error(
      "No existe una sesión activa."
    );
  }


  const {
    data: perfil,
    error: perfilError,
  } = await supabase
    .from(
      "perfiles"
    )
    .select(`
      id,
      nombre,
      apellidos,
      telefono,
      activo,
      rol_id
    `)
    .eq(
      "id",
      user.id
    )
    .single();


  if (perfilError) {
    console.error(
      "ERROR OBTENIENDO PERFIL:",
      perfilError
    );

    throw perfilError;
  }


  return {
    id:
      perfil.id,

    nombre:
      perfil.nombre ??
      "",

    apellidos:
      perfil.apellidos ??
      "",

    telefono:
      perfil.telefono ??
      "",

    correo:
      user.email ??
      "",

    /*
     * El backend todavía no tiene
     * columna ubicación en perfiles.
     *
     * La guardaremos en metadata
     * del usuario autenticado.
     */
    ubicacion:
      user.user_metadata
        ?.ubicacion ??
      "",

    rolId:
      perfil.rol_id,

    activo:
      perfil.activo,
  };
}


/* =====================================================
   ACTUALIZAR MI PERFIL
===================================================== */

export async function updateMyProfileRequest({
  nombre,
  apellidos,
  telefono,
  correo,
  ubicacion,
}) {
  const {
    data: userData,
    error: userError,
  } =
    await supabase.auth.getUser();


  if (userError) {
    throw userError;
  }


  const user =
    userData?.user;


  if (!user) {
    throw new Error(
      "No existe una sesión activa."
    );
  }


  const nombreFinal =
    String(
      nombre ??
      ""
    ).trim();


  const apellidosFinal =
    String(
      apellidos ??
      ""
    ).trim();


  const telefonoFinal =
    String(
      telefono ??
      ""
    ).trim();


  const correoFinal =
    String(
      correo ??
      ""
    )
      .trim()
      .toLowerCase();


  const ubicacionFinal =
    String(
      ubicacion ??
      ""
    ).trim();


  if (!nombreFinal) {
    throw new Error(
      "El nombre es obligatorio."
    );
  }


  if (!apellidosFinal) {
    throw new Error(
      "Los apellidos son obligatorios."
    );
  }


  if (!correoFinal) {
    throw new Error(
      "El correo es obligatorio."
    );
  }


  /* ===================================================
     ACTUALIZAR TABLA PERFILES
  =================================================== */

  const {
    data: perfilActualizado,
    error: perfilError,
  } = await supabase
    .from(
      "perfiles"
    )
    .update({
      nombre:
        nombreFinal,

      apellidos:
        apellidosFinal,

      telefono:
        telefonoFinal ||
        null,
    })
    .eq(
      "id",
      user.id
    )
    .select(`
      id,
      nombre,
      apellidos,
      telefono,
      activo,
      rol_id
    `)
    .single();


  if (perfilError) {
    console.error(
      "ERROR ACTUALIZANDO PERFIL:",
      perfilError
    );

    throw perfilError;
  }


  /* ===================================================
     ACTUALIZAR AUTH
  =================================================== */

  const authChanges = {
    data: {
      ...(
        user.user_metadata ??
        {}
      ),

      ubicacion:
        ubicacionFinal,
    },
  };


  /*
   * Solamente solicitar cambio de correo
   * si realmente cambió.
   */
  const emailChanged =
    correoFinal !==
    String(
      user.email ??
      ""
    ).toLowerCase();


  if (emailChanged) {
    authChanges.email =
      correoFinal;
  }


  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.updateUser(
      authChanges
    );


  if (authError) {
    console.error(
      "ERROR ACTUALIZANDO AUTH:",
      authError
    );

    throw authError;
  }


  return {
    id:
      perfilActualizado.id,

    nombre:
      perfilActualizado.nombre,

    apellidos:
      perfilActualizado.apellidos,

    telefono:
      perfilActualizado.telefono ??
      "",

    /*
     * Si Supabase requiere confirmación
     * del nuevo correo, user.email puede
     * seguir siendo temporalmente el viejo.
     */
    correo:
      correoFinal,

    ubicacion:
      ubicacionFinal,

    emailChanged,

    authUser:
      authData?.user ??
      null,
  };
}
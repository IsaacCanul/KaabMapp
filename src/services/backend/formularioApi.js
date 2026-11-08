import {
  supabase,
} from "../../lib/supabase";


const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


/* =====================================================
   VALIDACIONES
===================================================== */

function textoONull(valor) {
  const texto = String(valor ?? "").trim();

  return texto || null;
}


function enteroNoNegativo(valor, campo) {
  const numero = Number(valor ?? 0);

  if (
    !Number.isInteger(numero) ||
    numero < 0 ||
    numero > 100000
  ) {
    throw new Error(
      `${campo} debe ser un entero entre 0 y 100000.`
    );
  }

  return numero;
}


/* =====================================================
   CONSTRUIR FORMULARIO PARA BACKEND
===================================================== */

export function construirFormularioBackend(
  draft = {}
) {
  /* LOCALIDAD */

  const localidad_id =
    draft.localidadId ??
    draft.localidad_id;

  if (!UUID.test(String(localidad_id ?? ""))) {
    throw new Error(
      "Selecciona una localidad válida en el Paso 2."
    );
  }

  /* NOMBRE */

  const nombre = String(
    draft.nombre ||
      (
        draft.responsableNombre
          ? `Meliponario de ${draft.responsableNombre}`
          : ""
      )
  ).trim();

  if (
    nombre.length < 3 ||
    nombre.length > 160
  ) {
    throw new Error(
      "El nombre debe contener entre 3 y 160 caracteres."
    );
  }

  /* DESCRIPCIÓN */

  const descripcion =
    textoONull(draft.descripcion);

  const referencia_ubicacion =
    textoONull(
      draft.referenciaUbicacion ??
      draft.referencia_ubicacion
    );

  const observaciones_cliente =
    textoONull(
      draft.observacionesCliente ??
      draft.observaciones_cliente
    );

  if (
    descripcion &&
    descripcion.length > 2000
  ) {
    throw new Error(
      "Descripción: máximo 2000 caracteres."
    );
  }

  if (
    referencia_ubicacion &&
    referencia_ubicacion.length > 500
  ) {
    throw new Error(
      "Referencia: máximo 500 caracteres."
    );
  }

  if (
    observaciones_cliente &&
    observaciones_cliente.length > 2000
  ) {
    throw new Error(
      "Observaciones: máximo 2000 caracteres."
    );
  }

  /* ===================================================
     ESPECIES
  =================================================== */

  const declaradas =
    Array.isArray(draft.especies)
      ? draft.especies
      : [];

  if (
    declaradas.length < 1 ||
    declaradas.length > 50
  ) {
    throw new Error(
      "Selecciona entre 1 y 50 especies antes de enviar."
    );
  }

  const ids = new Set();

  const especies = declaradas.map((item) => {
    const especie_id =
      item.especieId ??
      item.especie_id ??
      item.id;

    if (
      !UUID.test(
        String(especie_id ?? "")
      )
    ) {
      throw new Error(
        "Hay una especie sin ID válido del catálogo."
      );
    }

    if (ids.has(especie_id)) {
      throw new Error(
        "No repitas especies."
      );
    }

    ids.add(especie_id);

    const cantidad_cajas =
      enteroNoNegativo(
        item.cajasTecnificadas ??
          item.cantidad_cajas ??
          item.cajas,
        "Cajas"
      );

    const cantidad_jobones =
      enteroNoNegativo(
        item.jobones ??
          item.cantidad_jobones,
        "Jobones"
      );

    if (
      cantidad_cajas +
        cantidad_jobones === 0
    ) {
      throw new Error(
        "Cada especie necesita al menos una caja o un jobón."
      );
    }

    return {
      especie_id,
      cantidad_cajas,
      cantidad_jobones,
    };
  });

  /* ===================================================
     COORDENADAS
  =================================================== */

  const latitudeRaw =
    draft.latitude ??
    draft.latitud;

  const longitudeRaw =
    draft.longitude ??
    draft.longitud;

  const latitud = Number(latitudeRaw);
  const longitud = Number(longitudeRaw);

  if (
    latitudeRaw == null ||
    longitudeRaw == null ||
    !Number.isFinite(latitud) ||
    !Number.isFinite(longitud) ||
    Math.abs(latitud) > 90 ||
    Math.abs(longitud) > 180
  ) {
    throw new Error(
      "Confirma en el Paso 2 la ubicación exacta del meliponario."
    );
  }

  /* MÉTODO DE CAPTURA */

  const metodo_captura =
    (
      draft.locationSource ??
      draft.metodo_captura
    ) === "gps"
      ? "gps"
      : "mapa";

  let precision_metros = null;

  if (metodo_captura === "gps") {
    const raw =
      draft.locationAccuracy ??
      draft.precision_metros;

    if (
      raw != null &&
      raw !== ""
    ) {
      precision_metros = Number(raw);

      if (
        !Number.isFinite(
          precision_metros
        ) ||
        precision_metros < 0 ||
        precision_metros > 100000
      ) {
        throw new Error(
          "Precisión GPS fuera de rango."
        );
      }
    }
  }

  /* ===================================================
     RESULTADO FINAL
  =================================================== */

  return {
    localidad_id,

    nombre,

    descripcion,

    referencia_ubicacion,

    observaciones_cliente,

    especies,

    ubicacion: {
      latitud,
      longitud,
      metodo_captura,
      precision_metros,
    },

    ofrece_venta_miel: Boolean(
      draft.ofreceVentaMiel ??
      draft.ofrece_venta_miel
    ),

    ofrece_visitas: Boolean(
      draft.ofreceVisitas ??
      draft.ofrece_visitas
    ),
  };
}


/* =====================================================
   AUTORIZACIONES DE PUBLICACIÓN
   El responsable consiente que, al ser aprobado, el
   meliponario muestre su ubicación exacta y su teléfono
   a cualquier persona (con o sin cuenta).
===================================================== */

function autorizacionesPublicacion(draft = {}) {
  const autoriza = Boolean(
    draft.autorizacionPublicacion
  );

  return {
    autorizacion_ubicacion_exacta: autoriza,
    autorizacion_contacto_publico: autoriza,
  };
}


// Publica (o retira) la ubicación exacta y el contacto mediante la
// función autorizada del backend; la tabla no admite escritura directa.
export async function configurarPublicacionRequest(
  meliponarioId,
  autoriza
) {
  // El contacto público sale del perfil del responsable.
  const contacto = autoriza
    ? await contactoDelPerfil()
    : { nombre: null, telefono: null };

  return rpc(
    "configurar_publicacion_meliponario",
    {
      p_meliponario_id: meliponarioId,
      p_autorizar_ubicacion: Boolean(autoriza),
      p_autorizar_contacto: Boolean(autoriza),
      p_nombre_contacto: contacto.nombre,
      p_telefono_contacto: contacto.telefono,
    }
  );
}


async function contactoDelPerfil() {
  const { data: auth, error: authError } =
    await supabase.auth.getUser();

  if (authError || !auth?.user) {
    throw new Error("Inicia sesión para publicar tu meliponario.");
  }

  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("nombre,apellidos,telefono")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) throw error;

  const nombre = [perfil?.nombre, perfil?.apellidos]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const telefono = String(perfil?.telefono ?? "").trim();

  if (nombre.length < 3 || telefono.length < 7) {
    throw new Error(
      "Para publicar necesitas tu nombre y un teléfono de contacto " +
      "en tu perfil. Agrégalos en Cuenta y vuelve a intentarlo."
    );
  }

  return { nombre, telefono };
}


// La RPC del formulario rechaza campos que no conoce
// ("campos no permitidos"), por eso la autorización va aparte.
async function guardarAutorizaciones(meliponarioId, draft) {
  const { autorizacion_ubicacion_exacta } =
    autorizacionesPublicacion(draft);

  try {
    await configurarPublicacionRequest(
      meliponarioId,
      autorizacion_ubicacion_exacta
    );
  } catch (error) {
    // No bloquea el guardado del borrador; puede publicarse
    // después desde Mis registros con «Publicar».
    console.warn(
      "KAABMAP AUTORIZACIONES:",
      error?.code,
      error?.message
    );
  }
}


/* =====================================================
   EJECUTAR RPC
===================================================== */

async function rpc(nombre, parametros) {
  const { data, error } =
    await supabase.rpc(
      nombre,
      parametros
    );

  if (error) {
    throw error;
  }

  return data;
}


/* =====================================================
   GUARDAR BORRADOR EN SUPABASE
===================================================== */

export async function guardarFormularioRequest(
  draft,
  meliponarioId = null
) {
  const id = await rpc(
    "guardar_formulario_meliponario",
    {
      p_datos:
        construirFormularioBackend(draft),

      p_meliponario_id:
        meliponarioId,
    }
  );

  if (typeof id === "string" && id) {
    await guardarAutorizaciones(id, draft);
  }

  return id;
}


/* =====================================================
   ENVIAR A REVISIÓN
===================================================== */

export async function enviarRegistroBasicoRequest(
  meliponarioId
) {
  if (
    !UUID.test(
      String(meliponarioId ?? "")
    )
  ) {
    throw new Error(
      "ID del meliponario inválido."
    );
  }

  return rpc(
    "enviar_registro_basico",
    {
      p_meliponario_id: meliponarioId,
    }
  );
}


/* =====================================================
   REENVIAR CORRECCIÓN
===================================================== */

export async function reenviarRegistroCorregidoRequest(
  meliponarioId
) {
  if (
    !UUID.test(
      String(meliponarioId ?? "")
    )
  ) {
    throw new Error(
      "ID del meliponario inválido."
    );
  }

  return rpc(
    "reenviar_registro_corregido",
    {
      p_meliponario_id: meliponarioId,
    }
  );
}


/* =====================================================
   ÚLTIMA SOLICITUD
===================================================== */

export async function obtenerSolicitudMasRecienteRequest(
  meliponarioId
) {
  const { data, error } = await supabase
    .from("solicitudes_meliponario")
    .select(
      "id,estado,numero_intento,fecha_envio,fecha_resolucion,observaciones_cliente"
    )
    .eq(
      "meliponario_id",
      meliponarioId
    )
    .order(
      "numero_intento",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}


/* =====================================================
   ENVIAR SEGÚN ESTADO ACTUAL
===================================================== */

export async function enviarSegunEstadoRequest(
  meliponarioId
) {
  const solicitud =
    await obtenerSolicitudMasRecienteRequest(
      meliponarioId
    );

  if (
    solicitud?.estado === "correccion"
  ) {
    return reenviarRegistroCorregidoRequest(
      meliponarioId
    );
  }

  if (
    solicitud?.estado === "borrador"
  ) {
    return enviarRegistroBasicoRequest(
      meliponarioId
    );
  }

  throw new Error(
    `La solicitud no está disponible para envío (${solicitud?.estado ?? "sin solicitud"}).`
  );
}
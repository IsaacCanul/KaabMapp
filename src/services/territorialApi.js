import {
  supabase,
} from "../lib/supabase";


/* =====================================================
   EJECUTAR RPC
===================================================== */

async function rpc(
  name,
  args
) {
  const { data, error } =
    await supabase.rpc(
      name,
      args
    );

  if (error) {
    throw error;
  }

  return data;
}


/* =====================================================
   ZONAS ACTIVAS DEL TRABAJADOR
===================================================== */

export async function getMisZonasActivasRequest() {
  const { data: auth, error: authError } =
    await supabase.auth.getUser();

  if (authError || !auth?.user) {
    throw new Error("Inicia sesión para consultar tus zonas.");
  }

  const { data, error } = await supabase
    .from("asignaciones_zona")
    .select("id,fecha_fin,zonas(id,nombre,activo)")
    .eq("usuario_id", auth.user.id);

  if (error) throw error;

  const ahora = Date.now();

  return (data ?? [])
    .filter((a) =>
      a.zonas?.activo !== false &&
      (!a.fecha_fin || new Date(a.fecha_fin).getTime() > ahora)
    )
    .map((a) => a.zonas)
    .filter(Boolean);
}


/* =====================================================
   BANDEJA TERRITORIAL
===================================================== */

export function getBandejaSolicitudesTerritorialesRequest() {
  return rpc(
    "bandeja_solicitudes_territoriales",
    {}
  );
}


/* =====================================================
   TOMAR SOLICITUD
===================================================== */

export function tomarSolicitudTerritorialRequest(
  solicitudId
) {
  if (!solicitudId) {
    throw new Error(
      "Falta el ID de solicitud."
    );
  }

  return rpc(
    "tomar_solicitud_territorial",
    {
      p_solicitud_id:
        solicitudId,
    }
  );
}


/* =====================================================
   RESOLVER SOLICITUD TERRITORIAL
===================================================== */

export function resolverSolicitudTerritorialRequest({
  solicitudId,
  decision,
  comentario,
}) {
  const allowed = [
    "solicitar_correccion",
    "aprobar",
    "rechazar",
  ];

  if (
    !allowed.includes(decision)
  ) {
    throw new Error(
      "Decisión no permitida."
    );
  }

  const texto =
    String(comentario ?? "").trim();

  if (
    texto.length < 10 ||
    texto.length > 2000
  ) {
    throw new Error(
      "El comentario debe contener entre 10 y 2000 caracteres."
    );
  }

  return rpc(
    "resolver_solicitud_territorial",
    {
      p_solicitud_id:
        solicitudId,

      p_decision:
        decision,

      p_comentario:
        texto,
    }
  );
}
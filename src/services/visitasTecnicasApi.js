import {
  supabase,
} from "../lib/supabase";


/* =====================================================
   EJECUTAR RPC
===================================================== */

async function call(
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
   TRABAJADOR DE CAMPO - ROL 4
===================================================== */

export function getMisVisitasTecnicasAsignadasRequest() {
  return call(
    "mis_visitas_tecnicas_asignadas",
    {}
  );
}


/* =====================================================
   COORDINADOR - ROL 3
===================================================== */

export function getVisitasCoordinadasRequest() {
  return call(
    "coord_consultar_visitas_tecnicas",
    {}
  );
}


/* =====================================================
   ASIGNAR VISITA TÉCNICA
===================================================== */

export function asignarVisitaTecnicaRequest({
  meliponarioId,
  trabajadorId,
  motivo,
}) {
  const texto =
    String(motivo ?? "").trim();

  if (
    !meliponarioId ||
    !trabajadorId ||
    texto.length < 10 ||
    texto.length > 1000
  ) {
    throw new Error(
      "Indica meliponario, trabajador y un motivo de 10 a 1000 caracteres."
    );
  }

  return call(
    "coord_asignar_visita_tecnica",
    {
      p_meliponario_id:
        meliponarioId,

      p_trabajador_id:
        trabajadorId,

      p_motivo:
        texto,
    }
  );
}


/* =====================================================
   CANCELAR VISITA TÉCNICA
===================================================== */

export function cancelarVisitaTecnicaRequest({
  asignacionId,
  motivo,
}) {
  const texto =
    String(motivo ?? "").trim();

  if (
    !asignacionId ||
    texto.length < 10 ||
    texto.length > 1000
  ) {
    throw new Error(
      "Indica una asignación y un motivo de 10 a 1000 caracteres."
    );
  }

  return call(
    "coord_cancelar_visita_tecnica",
    {
      p_asignacion_id:
        asignacionId,

      p_motivo:
        texto,
    }
  );
}
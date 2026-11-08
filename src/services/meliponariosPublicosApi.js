import { supabase } from "../lib/supabase";

// Esta RPC debe ser provista por el equipo del backend.
// No se consulta auth.getUser(): funciona con la clave publishable
// siempre que el servidor autorice al rol anon.
async function consultarPublicados(id = null) {
  const { data, error } = await supabase.rpc(
    "listar_meliponarios_publicos",
    { p_id: id }
  );

  if (error) {
    console.warn("KAABMAP CONSULTA PÚBLICA:", error.code, error.message);

    if (error.code === "PGRST202" || error.code === "42883") {
      throw new Error(
        "El backend todavía no tiene disponible la función " +
        "listar_meliponarios_publicos(p_id). Contacta al equipo de base de datos."
      );
    }
    if (error.code === "42501" || error.code === "PGRST301") {
      throw new Error(
        "El servidor no permite consultar los meliponarios sin iniciar sesión. " +
        "El equipo de backend debe revisar el acceso de lectura pública."
      );
    }
    throw error;
  }

  // Es útil admitir una respuesta de un registro o una lista.
  // El backend es el responsable de filtrar lo realmente publicable.
  return Array.isArray(data) ? data : data ? [data] : [];
}

export async function getMeliponariosPublicosRequest() {
  return consultarPublicados(null);
}

export async function getDetalleMeliponarioPublicoRequest(id) {
  if (!id) throw new Error("Falta el ID del meliponario.");
  const lista = await consultarPublicados(id);
  return lista.find((m) =>
    String(m.id ?? m.meliponario_id) === String(id)
  ) ?? null;
}

// Las fotografías públicas requieren una función y URLs autorizadas
// por el backend. No leer el bucket privado directamente como visitante.
export async function getImagenesPublicasRequest(id) {
  if (!id) return [];
  const { data, error } = await supabase.rpc(
    "listar_imagenes_meliponario",
    { p_meliponario_id: id }
  );
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

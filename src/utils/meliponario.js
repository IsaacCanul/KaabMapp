export const TIPOS_OFERTA = {
  miel: {
    value: "miel",
    label: "Miel",
    color: "#E4A916",
  },
  visitas: {
    value: "visitas",
    label: "Visitas",
    color: "#159447",
  },
  ambos: {
    value: "ambos",
    label: "Miel y visitas",
    color: "#2878D9",
  },
  neutro: {
    value: "neutro",
    label: "Sin categoría",
    color: "#718096",
  },
};

export function normalizarTipoOferta(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (["miel", "venta", "venta_miel", "vende_miel"].includes(raw)) return "miel";
  if (["visita", "visitas", "visitante", "recorridos"].includes(raw)) return "visitas";
  if (["ambos", "miel_visitas", "venta_visitas", "venta y visitas"].includes(raw)) return "ambos";
  return "neutro";
}

export function obtenerTipoOferta(item) {
  if (item?.tipoOferta) return normalizarTipoOferta(item.tipoOferta);
  if (item?.tipo_oferta) return normalizarTipoOferta(item.tipo_oferta);

  const vendeMiel = Boolean(item?.vendeMiel ?? item?.vende_miel);
  const visitable = Boolean(item?.visitable ?? item?.acepta_visitas);
  if (vendeMiel && visitable) return "ambos";
  if (vendeMiel) return "miel";
  if (visitable) return "visitas";
  return "neutro";
}

export function obtenerDatosOferta(item) {
  return TIPOS_OFERTA[obtenerTipoOferta(item)] || TIPOS_OFERTA.neutro;
}

export function obtenerUbicacionTexto(item) {
  const municipio = item?.municipio || "";
  const localidad = item?.localidad || "";
  if (municipio && localidad && municipio.toLowerCase() !== localidad.toLowerCase()) {
    return `${localidad}, ${municipio}`;
  }
  return localidad || municipio || item?.ubicacion || "Yucatán";
}

export function tieneProductos(item) {
  if (typeof item?.tieneProductos === "boolean") return item.tieneProductos;
  if (typeof item?.productos === "boolean") return item.productos;
  if (Array.isArray(item?.productosDisponibles)) return item.productosDisponibles.length > 0;
  if (Array.isArray(item?.productos)) return item.productos.length > 0;
  return false;
}

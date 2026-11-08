// Utilidades compartidas por la bandeja y la ficha de solicitudes.

export const COLORS = {
  background: "#FCFAF2",
  green: "#06492E",
  primary: "#075A3D",
  white: "#FFFFFF",
  border: "#E6E1D5",
  gray: "#747A76",
  red: "#B42318",
  softGreen: "#EAF2EA",
};

export const ESTADOS = {
  enviada: { titulo: "Pendiente de revisión", bg: "#FFF0CE", fg: "#926000" },
  en_revision: { titulo: "En revisión", bg: "#E3ECF8", fg: "#244F86" },
  correccion: { titulo: "En corrección", bg: "#FFF0CE", fg: "#926000" },
  aprobada: { titulo: "Aprobada", bg: "#E5F3DF", fg: "#257849" },
  rechazada: { titulo: "Rechazada", bg: "#FCE9E7", fg: "#B42318" },
};

export function estadoInfo(estado) {
  return (
    ESTADOS[estado] ?? {
      titulo: estado || "Sin estado",
      bg: "#EDEDED",
      fg: "#6F7470",
    }
  );
}

export function actividades(categoria) {
  switch (categoria) {
    case "ambos":
      return "Venta de miel · Recibe visitas";
    case "miel":
      return "Venta de miel";
    case "visitas":
      return "Recibe visitas";
    default:
      return "Sin actividades declaradas";
  }
}

export function formatearFecha(valor) {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "Fecha no disponible";

  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function idCorto(id) {
  return String(id ?? "").slice(0, 8);
}

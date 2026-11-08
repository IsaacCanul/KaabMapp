export const MARKER_COLORS = {
  miel: "#E4A916",
  visitas: "#159447",
  ambos: "#2878D9",
  otro: "#718096",
};

export const BEE_PIN_PATHS = {
  pin: "M24 2 C12.3 2 3.5 10.8 3.5 22.6 C3.5 35.2 16.5 47.7 24 55.4 C31.5 47.7 44.5 35.2 44.5 22.6 C44.5 10.8 35.7 2 24 2 Z",
  leftWing: "M20.5 25.2 C15 18.2 10.9 19.2 10.5 24 C10 29.3 15.2 31 20 27.8",
  rightWing: "M27.5 25.2 C33 18.2 37.1 19.2 37.5 24 C38 29.3 32.8 31 28 27.8",
  body: "M24 19.1 C20.6 19.1 18.7 23.8 18.7 28.4 C18.7 33.6 21.4 37.3 24 39 C26.6 37.3 29.3 33.6 29.3 28.4 C29.3 23.8 27.4 19.1 24 19.1 Z",
  antennae: "M22.4 19.2 L19.8 14.1 M25.6 19.2 L28.2 14.1",
  stripes: "M19.3 26.2 H28.7 M19.4 31.6 H28.6",
};

function normalizar(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function esActivo(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return [
    "true",
    "1",
    "si",
    "yes",
  ].includes(normalizar(value));
}

export function getMarkerCategory(item = {}) {
  const categoria = normalizar(
    item.categoria_marcador ??
    item.categoriaMarcador ??
    item.tipoOferta ??
    item.tipo_oferta
  );

  if (
    categoria === "ambos" ||
    (
      categoria.includes("miel") &&
      categoria.includes("visita")
    )
  ) {
    return "ambos";
  }

  if (categoria.includes("visita")) {
    return "visitas";
  }

  if (categoria.includes("miel")) {
    return "miel";
  }

  const miel = esActivo(
    item.vende_miel ??
    item.ofrece_venta_miel ??
    item.vendeMiel ??
    item.ofreceVentaMiel
  );

  const visitas = esActivo(
    item.acepta_visitas ??
    item.ofrece_visitas ??
    item.visitable ??
    item.ofreceVisitas
  );

  if (miel && visitas) return "ambos";
  if (miel) return "miel";
  if (visitas) return "visitas";

  return "otro";
}

export function getMarkerColor(item = {}) {
  return MARKER_COLORS[
    getMarkerCategory(item)
  ] ?? MARKER_COLORS.otro;
}

export function getMarkerCoordinates(item) {
  if (!item) return null;

  const lat =
    item.latitude ??
    item.latitud ??
    item.ubicacion?.latitude ??
    item.ubicacion?.latitud;

  const lng =
    item.longitude ??
    item.longitud ??
    item.ubicacion?.longitude ??
    item.ubicacion?.longitud;

  if (
    lat == null ||
    lng == null ||
    lat === "" ||
    lng === ""
  ) {
    return null;
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}
import { apiRequest } from "./apiClient";
import { MAP_API_CONFIG } from "../config/mapApiConfig";
import { normalizarTipoOferta } from "../utils/meliponario";

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

export function normalizarMeliponarioApi(raw = {}) {
  const latitude = firstDefined(raw.latitude, raw.latitud, raw.lat, raw.ubicacion?.latitude, raw.ubicacion?.latitud);
  const longitude = firstDefined(raw.longitude, raw.longitud, raw.lng, raw.lon, raw.ubicacion?.longitude, raw.ubicacion?.longitud);

  return {
    ...raw,
    id: firstDefined(raw.id, raw.meliponario_id, raw.uuid),
    nombre: firstDefined(raw.nombre, raw.name, raw.nombre_meliponario, "Meliponario"),
    municipio: firstDefined(raw.municipio, raw.municipio_nombre, ""),
    localidad: firstDefined(raw.localidad, raw.localidad_nombre, ""),
    descripcion: firstDefined(raw.descripcion, raw.description, ""),
    referenciaUbicacion: firstDefined(
      raw.referenciaUbicacion,
      raw.referencia_ubicacion,
      raw.referencia,
      raw.direccion_referencia,
      ""
    ),
    latitude: latitude != null ? Number(latitude) : null,
    longitude: longitude != null ? Number(longitude) : null,
    tipoOferta: normalizarTipoOferta(firstDefined(raw.tipoOferta, raw.tipo_oferta, raw.categoria_mapa)),
    estado: firstDefined(raw.estado, raw.status, raw.estado_registro, "Activo"),
    especies: Array.isArray(raw.especies) ? raw.especies : [],
    productosDisponibles: Array.isArray(raw.productosDisponibles)
      ? raw.productosDisponibles
      : Array.isArray(raw.productos_disponibles)
        ? raw.productos_disponibles
        : [],
  };
}

function unwrapList(payload) {
  const candidate = payload?.data?.meliponarios ?? payload?.data ?? payload?.meliponarios ?? payload;
  return Array.isArray(candidate) ? candidate : [];
}

export const meliponariosApi = {
  isConfigured() {
    return Boolean(MAP_API_CONFIG.meliponariosPath);
  },

  async list() {
    if (!MAP_API_CONFIG.meliponariosPath) return [];
    const payload = await apiRequest(MAP_API_CONFIG.meliponariosPath, { auth: false });
    return unwrapList(payload).map(normalizarMeliponarioApi);
  },
};

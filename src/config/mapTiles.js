/*
 * Fuente de la cartografía para todos los mapas (web y teléfono).
 *
 * Con EXPO_PUBLIC_MAPTILER_KEY en .env se usa MapTiler (plan gratuito,
 * datos de OpenStreetMap), que permite su uso desde apps móviles.
 * Clave gratis en https://cloud.maptiler.com/account/keys/
 *
 * Sin clave:
 *   - Web: se usa el servidor de OpenStreetMap (funciona en navegador).
 *   - Teléfono: se usa el mapa propio (Google o Apple), porque
 *     OpenStreetMap bloquea las apps móviles («Access blocked»).
 */

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;

// Mapa de MapTiler a usar. Los mapas prediseñados («streets-v2») traen los
// nombres en inglés; con un mapa propio configurado en español en
// MapTiler Cloud, pon su identificador en EXPO_PUBLIC_MAPTILER_MAP_ID.
// Acepta el identificador solo o el enlace completo de MapTiler
// (https://api.maptiler.com/maps/<id>/...).
const MAPTILER_MAP_ID =
  String(process.env.EXPO_PUBLIC_MAPTILER_MAP_ID ?? "")
    .trim()
    .replace(/^.*\/maps\/([^/?#]+).*$/, "$1") || "streets-v2";

export const TIENE_PROVEEDOR = Boolean(MAPTILER_KEY);

const maptiler = (sufijo) =>
  `https://api.maptiler.com/maps/${MAPTILER_MAP_ID}/256/{z}/{x}/{y}${sufijo}.png?key=${MAPTILER_KEY}`;

// Web (Leaflet).
export const TILE_URL = MAPTILER_KEY
  ? maptiler("")
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Teléfono: mosaicos en alta resolución (@2x) para que el texto se vea
// nítido y a buen tamaño en pantallas de alta densidad.
export const TILE_URL_HD = MAPTILER_KEY ? maptiler("@2x") : TILE_URL;

// Texto corto para el teléfono.
export const ATRIBUCION_TEXTO = MAPTILER_KEY
  ? "© MapTiler © OpenStreetMap"
  : "© OpenStreetMap";

// Texto con enlaces para Leaflet (web).
export const ATRIBUCION_HTML = MAPTILER_KEY
  ? '<a href="https://www.maptiler.com/copyright/">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a>'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const MAX_ZOOM = 19;

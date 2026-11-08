import { Platform } from "react-native";
import * as Location from "expo-location";

import {
  estaEnYucatan,
} from "../utils/location";

const cache = new Map();

let ultimaPeticion = 0;

function puntoValido(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  if (!estaEnYucatan(latitude, longitude)) {
    return null;
  }

  return { latitude, longitude };
}

export async function geocodificarLugar({
  municipio,
  localidad = "",
  registro = null,
}) {
  /*
   * Si en el futuro Supabase devuelve
   * las coordenadas de una localidad,
   * las usamos directamente.
   */
  const puntoCatalogo = puntoValido(
    registro?.latitud ??
      registro?.latitude,
    registro?.longitud ??
      registro?.longitude
  );

  if (puntoCatalogo) {
    return puntoCatalogo;
  }

  const direccion = [
    localidad,
    municipio,
    "Yucatán",
    "México",
  ]
    .filter(Boolean)
    .join(", ");

  if (cache.has(direccion)) {
    return cache.get(direccion);
  }

  /* ===============================================
     ANDROID / IOS
  =============================================== */

  if (Platform.OS !== "web") {
    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        return null;
      }

      const results =
        await Location.geocodeAsync(direccion);

      const result = results?.[0];

      const point = result
        ? puntoValido(
            result.latitude,
            result.longitude
          )
        : null;

      if (point) {
        cache.set(direccion, point);
      }

      return point;
    } catch (error) {
      console.warn(
        "No se pudo geocodificar:",
        error?.message
      );

      return null;
    }
  }

  /* ===============================================
     WEB
  =============================================== */

  try {
    /*
     * Espaciar solicitudes a la API pública.
     * Para producción con muchos usuarios
     * se necesita un geocodificador propio
     * o un proveedor contratado.
     */
    const espera = Math.max(
      0,
      1100 - (Date.now() - ultimaPeticion)
    );

    if (espera > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, espera)
      );
    }

    ultimaPeticion = Date.now();

    const params = new URLSearchParams({
      q: direccion,
      format: "json",
      limit: "1",
      countrycodes: "mx",
      viewbox: "-90.6,21.7,-87.2,19.3",
      bounded: "1",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Geocodificación HTTP ${response.status}`
      );
    }

    const data = await response.json();

    const result = data?.[0];

    const point = result
      ? puntoValido(result.lat, result.lon)
      : null;

    if (point) {
      cache.set(direccion, point);
    }

    return point;
  } catch (error) {
    console.warn(
      "No se pudo localizar el lugar:",
      error?.message
    );

    return null;
  }
}
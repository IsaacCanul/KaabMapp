import { Platform } from "react-native";
import * as Location from "expo-location";

export async function obtenerUbicacionActual() {
  if (Platform.OS === "web") {
    const navegador = typeof navigator !== "undefined" ? navigator : null;
    if (!navegador?.geolocation) throw new Error("GEOLOCATION_NOT_SUPPORTED");

    return new Promise((resolve, reject) => {
      navegador.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
        }),
        (error) => {
          const codes = {
            1: "GEOLOCATION_PERMISSION_DENIED",
            2: "GEOLOCATION_POSITION_UNAVAILABLE",
            3: "GEOLOCATION_TIMEOUT",
          };
          reject(new Error(codes[error.code] || "GEOLOCATION_ERROR"));
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    });
  }

  const permiso = await Location.requestForegroundPermissionsAsync();
  if (permiso.status !== "granted") throw new Error("GEOLOCATION_PERMISSION_DENIED");

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
  };
}

export function pareceEstarEnYucatan(coords) {
  if (!coords) return false;
  const latitude = Number(coords.latitude);
  const longitude = Number(coords.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;

  return (
    latitude >= 19.4 &&
    latitude <= 21.8 &&
    longitude >= -90.8 &&
    longitude <= -87.3
  );
}

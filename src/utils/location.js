import {
  Platform,
} from "react-native";

import * as Location
  from "expo-location";


/* =====================================================
   LÍMITES APROXIMADOS DE YUCATÁN
===================================================== */

export const YUCATAN_BOUNDS = {
  minLatitude: 19.45,
  maxLatitude: 21.65,

  minLongitude: -90.45,
  maxLongitude: -87.45,
};


/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

export function normalizarLugar(
  value = ""
) {
  return String(value)
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /^municipio de\s+/,
      ""
    )
    .replace(
      /^estado de\s+/,
      ""
    )
    .replace(
      /,\s*yucatan$/,
      ""
    )
    .trim();
}


/* =====================================================
   VALIDAR YUCATÁN
===================================================== */

export function estaEnYucatan(
  latitudeOrCoords,
  longitude
) {
  let latitude =
    latitudeOrCoords;

  let finalLongitude =
    longitude;


  if (
    typeof latitudeOrCoords ===
    "object"
  ) {
    latitude =
      latitudeOrCoords?.latitude;

    finalLongitude =
      latitudeOrCoords?.longitude;
  }


  const lat =
    Number(latitude);

  const lng =
    Number(
      finalLongitude
    );


  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return false;
  }


  return (
    lat >=
      YUCATAN_BOUNDS.minLatitude &&
    lat <=
      YUCATAN_BOUNDS.maxLatitude &&
    lng >=
      YUCATAN_BOUNDS.minLongitude &&
    lng <=
      YUCATAN_BOUNDS.maxLongitude
  );
}


/*
 * Alias para no romper código viejo
 * de MapScreen.
 */
export function pareceEstarEnYucatan(
  coords
) {
  return estaEnYucatan(
    coords
  );
}


/* =====================================================
   OBTENER UBICACIÓN ACTUAL
===================================================== */

export async function obtenerUbicacionActual() {
  /* -------------------------------
     WEB
  -------------------------------- */

  if (
    Platform.OS === "web"
  ) {
    if (
      typeof navigator ===
        "undefined" ||
      !navigator.geolocation
    ) {
      throw new Error(
        "Este navegador no permite obtener tu ubicación."
      );
    }


    return new Promise(
      (
        resolve,
        reject
      ) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude:
                position.coords
                  .latitude,

              longitude:
                position.coords
                  .longitude,

              accuracy:
                position.coords
                  .accuracy,
            });
          },

          (error) => {
            console.error(
              "ERROR GEOLOCALIZACIÓN WEB:",
              error
            );


            if (
              error.code === 1
            ) {
              reject(
                new Error(
                  "Debes permitir el acceso a tu ubicación."
                )
              );

              return;
            }


            if (
              error.code === 2
            ) {
              reject(
                new Error(
                  "No fue posible determinar tu ubicación."
                )
              );

              return;
            }


            if (
              error.code === 3
            ) {
              reject(
                new Error(
                  "La ubicación tardó demasiado en responder."
                )
              );

              return;
            }


            reject(
              new Error(
                "No se pudo obtener tu ubicación."
              )
            );
          },

          {
            enableHighAccuracy:
              true,

            maximumAge:
              0,

            timeout:
              20000,
          }
        );
      }
    );
  }


  /* -------------------------------
     ANDROID / IOS
  -------------------------------- */

  const {
    status,
  } =
    await Location.requestForegroundPermissionsAsync();


  if (
    status !== "granted"
  ) {
    throw new Error(
      "Debes permitir el acceso a tu ubicación."
    );
  }


  const position =
    await Location.getCurrentPositionAsync({
      accuracy:
        Location.Accuracy.Highest,
  });


  return {
    latitude:
      position.coords.latitude,

    longitude:
      position.coords.longitude,

    accuracy:
      position.coords.accuracy,
  };
}


/* =====================================================
   GEOCODIFICACIÓN INVERSA
===================================================== */

export async function obtenerDireccionDesdeCoordenadas({
  latitude,
  longitude,
}) {
  /* ===================================================
     WEB → NOMINATIM / OSM
  =================================================== */

  if (
    Platform.OS === "web"
  ) {
    const params =
      new URLSearchParams({
        format:
          "jsonv2",

        lat:
          String(latitude),

        lon:
          String(longitude),

        addressdetails:
          "1",

        zoom:
          "18",

        "accept-language":
          "es",
      });


    const response =
      await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`
      );


    if (
      !response.ok
    ) {
      throw new Error(
        "No fue posible identificar el municipio y la localidad."
      );
    }


    const result =
      await response.json();


    const address =
      result?.address ??
      {};


    /*
     * Nominatim puede variar los nombres
     * dependiendo del lugar.
     *
     * Por eso regresamos varios candidatos.
     */
    const municipioCandidates = [
      address.municipality,
      address.county,
      address.city_district,
      address.city,
      address.town,
    ].filter(Boolean);


    const localidadCandidates = [
      address.village,
      address.hamlet,
      address.town,
      address.city,
      address.suburb,
      address.neighbourhood,
      address.quarter,
      address.locality,
    ].filter(Boolean);


    return {
      estado:
        address.state ??
        "",

      municipioCandidates,

      localidadCandidates,

      displayName:
        result?.display_name ??
        "",

      raw:
        result,
    };
  }


  /* ===================================================
     ANDROID / IOS → EXPO LOCATION
  =================================================== */

  const results =
    await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });


  const address =
    results?.[0];


  if (!address) {
    throw new Error(
      "No fue posible identificar el municipio y la localidad."
    );
  }


  const municipioCandidates = [
    address.subregion,
    address.district,
    address.city,
  ].filter(Boolean);


  const localidadCandidates = [
    address.city,
    address.district,
    address.name,
    address.subregion,
  ].filter(Boolean);


  return {
    estado:
      address.region ??
      "",

    municipioCandidates,

    localidadCandidates,

    displayName:
      address.formattedAddress ??
      "",

    raw:
      address,
  };
}
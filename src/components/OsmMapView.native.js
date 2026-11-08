import React, { forwardRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { UrlTile } from "react-native-maps";

import {
  ATRIBUCION_TEXTO,
  MAX_ZOOM,
  TIENE_PROVEEDOR,
  TILE_URL_HD,
} from "../config/mapTiles";

/*
 * Mapa nativo con cartografía de OpenStreetMap en lugar de Google o Apple.
 * La fuente de los mosaicos se configura en src/config/mapTiles.js.
 *
 * Uso: igual que <MapView>, con los mismos props y marcadores.
 */

const OsmMapView = forwardRef(function OsmMapView(
  { style, children, ...props },
  ref
) {
  // Sin clave del proveedor no se piden mosaicos a OpenStreetMap:
  // sus servidores bloquean las apps móviles («Access blocked»).
  // En ese caso se usa el mapa propio del teléfono (Google o Apple).
  if (!TIENE_PROVEEDOR) {
    return (
      <MapView ref={ref} style={style} mapType="standard" {...props}>
        {children}
      </MapView>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        // Android: ocultar el mapa base de Google.
        // iOS: el mosaico reemplaza el mapa de Apple (shouldReplaceMapContent).
        mapType={Platform.OS === "android" ? "none" : "standard"}
        maxZoomLevel={MAX_ZOOM}
        {...props}
      >
        <UrlTile
          urlTemplate={TILE_URL_HD}
          maximumZ={MAX_ZOOM}
          zIndex={-1}
          shouldReplaceMapContent
        />

        {children}
      </MapView>

      {/* Atribución obligatoria del proveedor y de OpenStreetMap. */}
      <View style={styles.attribution} pointerEvents="none">
        <Text style={styles.attributionText}>
          {ATRIBUCION_TEXTO}
        </Text>
      </View>
    </View>
  );
});

export default OsmMapView;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  attribution: {
    position: "absolute",
    right: 4,
    bottom: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  attributionText: {
    fontSize: 9,
    color: "#333",
  },
});

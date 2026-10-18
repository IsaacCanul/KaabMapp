import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera, Map, Marker } from "@maplibre/maplibre-react-native";
import { obtenerDatosOferta } from "../utils/meliponario";

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm-base", type: "raster", source: "osm" }],
};

export default function KaabMapMap({
  mode = "explorar",
  markers = [],
  selected = null,
  centerOn = null,
  userLocation = null,
  onSelect,
  onMarkerPress,
}) {
  const cameraRef = useRef(null);
  const valid = markers.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)));

  useEffect(() => {
    const point = centerOn || (mode === "registro" ? selected : null);
    if (!point) return;
    const latitude = Number(point.latitude);
    const longitude = Number(point.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    cameraRef.current?.easeTo({
      center: [longitude, latitude],
      zoom: Number(point.zoom) || 13,
      duration: 650,
    });
  }, [mode, selected?.latitude, selected?.longitude, centerOn?.latitude, centerOn?.longitude, centerOn?.zoom]);

  const handlePress = (event) => {
    if (mode !== "registro") return;
    const e = event?.nativeEvent ?? {};
    const coords = e.lngLat ?? e.coordinate;
    if (Array.isArray(coords) && coords.length >= 2) {
      onSelect?.({ latitude: Number(coords[1]), longitude: Number(coords[0]) });
      return;
    }
    const latitude = coords?.latitude ?? coords?.lat ?? e.latitude ?? e.lat;
    const longitude = coords?.longitude ?? coords?.lng ?? e.longitude ?? e.lng;
    if (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
      onSelect?.({ latitude: Number(latitude), longitude: Number(longitude) });
    }
  };

  return (
    <View style={styles.container}>
      <Map style={styles.map} mapStyle={OSM_STYLE} attribution compass onPress={handlePress}>
        <Camera ref={cameraRef} initialViewState={{ center: [-89.0, 20.85], zoom: 7.8 }} />
        {mode === "explorar" && valid.map((item) => {
          const oferta = obtenerDatosOferta(item);
          return (
            <Marker key={String(item.id)} id={String(item.id)} lngLat={[Number(item.longitude), Number(item.latitude)]} onPress={() => onMarkerPress?.(item)}>
              <View style={[styles.marker, { backgroundColor: oferta.color }]}><Text style={styles.markerText}>●</Text></View>
            </Marker>
          );
        })}
        {mode === "registro" && selected ? (
          <Marker id="ubicacion-meliponario" lngLat={[Number(selected.longitude), Number(selected.latitude)]}>
            <View style={[styles.marker, { backgroundColor: "#718096" }]}><Text style={styles.markerText}>●</Text></View>
          </Marker>
        ) : null}
        {mode === "explorar" && userLocation ? (
          <Marker id="ubicacion-usuario" lngLat={[Number(userLocation.longitude), Number(userLocation.latitude)]}>
            <View style={styles.userOuter}><View style={styles.userInner} /></View>
          </Marker>
        ) : null}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 300 },
  map: { flex: 1 },
  marker: { width: 40, height: 40, borderRadius: 22, borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  markerText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  userOuter: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#2878ED44", alignItems: "center", justifyContent: "center" },
  userInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#2878ED", borderWidth: 3, borderColor: "#FFFFFF" },
});

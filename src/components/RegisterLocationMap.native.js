import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { Marker } from "react-native-maps";

// Mapa con cartografía de OpenStreetMap (ver OsmMapView.native.js).
import MapView from "./OsmMapView";

const INITIAL_REGION = {
  latitude: 20.7099,
  longitude: -89.0943,
  latitudeDelta: 1.5,
  longitudeDelta: 1.5,
};

function regionDesdeEnfoque(focus) {
  if (
    !Number.isFinite(focus?.latitude) ||
    !Number.isFinite(focus?.longitude)
  ) {
    return null;
  }

  const zoom = focus.zoom ?? 15;
  const delta =
    zoom >= 17 ? 0.003 :
    zoom >= 16 ? 0.006 :
    zoom >= 15 ? 0.015 :
    zoom >= 12 ? 0.12 : 0.8;

  return {
    latitude: focus.latitude,
    longitude: focus.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export default function RegisterLocationMap({
  value,
  preview = false,
  focus,
  onChange,
}) {
  const mapRef = useRef(null);
  const readyRef = useRef(false);

  const centrarMapa = useCallback((siguienteEnfoque) => {
    const region = regionDesdeEnfoque(siguienteEnfoque);
    if (readyRef.current && region) {
      mapRef.current?.animateToRegion(region, 700);
    }
  }, []);

  // Se ejecuta cuando el formulario solicita centrar el mapa.
  useEffect(() => {
    centrarMapa(focus);
  }, [focus, centrarMapa]);

  // También cubre el caso en que la ubicación llega antes de cargar el mapa.
  const alPrepararMapa = () => {
    readyRef.current = true;
    centrarMapa(focus);
  };

  const alTocarMapa = (event) => {
    if (preview) return;
    const coords = event.nativeEvent?.coordinate;
    if (!coords) return;
    onChange?.({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={
        value
          ? {
              latitude: value.latitude,
              longitude: value.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }
          : INITIAL_REGION
      }
      onMapReady={alPrepararMapa}
      onPress={alTocarMapa}
    >
      {value && (
        <Marker
          coordinate={{
            latitude: value.latitude,
            longitude: value.longitude,
          }}
          pinColor={preview ? "#84918A" : "#075A3D"}
          draggable={!preview}
          onDragEnd={(event) => {
            if (preview) return;
            const coords = event.nativeEvent?.coordinate;
            if (!coords) return;
            onChange?.({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          }}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
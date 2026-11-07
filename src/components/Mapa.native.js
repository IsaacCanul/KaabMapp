
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";

// Mapa con cartografía de OpenStreetMap (ver OsmMapView.native.js).
import MapView from "./OsmMapView";
import Svg, { Path } from "react-native-svg";

import {
  BEE_PIN_PATHS,
  getMarkerColor,
  getMarkerCoordinates,
} from "./kaabMarkerStyle";

const REGION_YUCATAN = {
  latitude: 20.85,
  longitude: -89.0,
  latitudeDelta: 3.1,
  longitudeDelta: 3.1,
};

function regionParaPunto(coords, zoom = 13) {
  const z = Math.min(19, Math.max(3, Number(zoom) || 13));
  const delta = 0.035 * 2 ** (13 - z);

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

function PinAbeja({ color }) {
  const p = BEE_PIN_PATHS;

  return (
    <View
      style={styles.pin}
      collapsable={false}
      pointerEvents="none"
    >
      <Svg
        width={48}
        height={60}
        viewBox="0 0 48 60"
      >
        <Path
          d={p.pin}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2.7}
          strokeLinejoin="round"
        />

        <Path d={p.leftWing} {...stylesSvg} />
        <Path d={p.rightWing} {...stylesSvg} />
        <Path d={p.body} {...stylesSvg} />
        <Path d={p.antennae} {...stylesSvg} />
        <Path d={p.stripes} {...stylesSvg} />
      </Svg>
    </View>
  );
}

const stylesSvg = {
  fill: "none",
  stroke: "#FFFFFF",
  strokeWidth: 2.3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export default function KaabMapMap({
  mode = "explorar",
  markers,
  meliponarios,
  selected = null,
  centerOn = null,
  userLocation = null,
  onSelect,
  onMarkerPress,
  onSelectMeliponario,
}) {
  const mapRef = useRef(null);

  const lista = Array.isArray(markers)
    ? markers
    : Array.isArray(meliponarios)
      ? meliponarios
      : [];

  const marcadores = lista
    .map((item) => ({
      item,
      coords: getMarkerCoordinates(item),
    }))
    .filter(({ coords }) => coords !== null);

  const seleccion = getMarkerCoordinates(selected);
  const usuario = getMarkerCoordinates(userLocation);

  const foco = getMarkerCoordinates(centerOn) ??
    (mode === "registro" ? seleccion : null);

  useEffect(() => {
    if (!foco) return;

    mapRef.current?.animateToRegion(
      regionParaPunto(
        foco,
        centerOn?.zoom ?? 13
      ),
      600
    );
  }, [foco?.latitude, foco?.longitude, centerOn?.zoom]);

  const initialRegion = foco
    ? regionParaPunto(foco, centerOn?.zoom ?? 13)
    : REGION_YUCATAN;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onPress={(event) => {
          if (mode !== "registro") return;

          const coordinate =
            event?.nativeEvent?.coordinate;

          if (coordinate) {
            onSelect?.(coordinate);
          }
        }}
      >

        {mode !== "registro" &&
          marcadores.map(({ item, coords }, index) => (
            <Marker
              key={String(
                item.id ??
                `${coords.latitude}-${coords.longitude}-${index}`
              )}
              coordinate={coords}
              title={item.nombre ?? "Meliponario"}
              description={[
                item.localidad,
                item.municipio,
              ]
                .filter(Boolean)
                .join(", ")}
              anchor={{ x: 0.5, y: 0.93 }}
              tracksViewChanges={true}
              onPress={() =>
                (onMarkerPress ?? onSelectMeliponario)?.(item)
              }
            >
              <PinAbeja
                color={getMarkerColor(item)}
              />
            </Marker>
          ))}

        {mode === "registro" && seleccion && (
          <Marker
            coordinate={seleccion}
            anchor={{ x: 0.5, y: 0.93 }}
            tracksViewChanges={true}
          >
            <PinAbeja color="#718096" />
          </Marker>
        )}

        {mode !== "registro" && usuario && (
          <Marker
            coordinate={usuario}
            title="Tu ubicación"
          >
            <View style={styles.userDot} />
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    width: "100%",
  },

  map: {
    flex: 1,
  },

  pin: {
    width: 48,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  userDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2878ED",
    borderWidth: 3,
    borderColor: "white",
    elevation: 4,
  },
});
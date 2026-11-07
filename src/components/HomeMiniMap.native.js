import React from "react";

import {
  Marker,
} from "react-native-maps";

// Mapa con cartografía de OpenStreetMap (ver OsmMapView.native.js).
import MapView from "./OsmMapView";


const YUCATAN_REGION = {
  latitude: 20.72,
  longitude: -89.05,

  latitudeDelta: 3.1,
  longitudeDelta: 3.1,
};


export default function HomeMiniMap({
  points = [],
  userLocation = null,
}) {
  const region =
    userLocation?.latitude != null &&
    userLocation?.longitude != null
      ? {
          latitude:
            userLocation.latitude,

          longitude:
            userLocation.longitude,

          latitudeDelta: 1.4,
          longitudeDelta: 1.4,
        }
      : YUCATAN_REGION;


  return (
    <MapView
      style={{
        width: "100%",
        height: "100%",
      }}
      initialRegion={region}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      pointerEvents="none"
    >

      {points.map((point) => (
        <Marker
          key={String(point.id)}
          coordinate={{
            latitude:
              point.latitude,

            longitude:
              point.longitude,
          }}
          title={point.nombre}
        />
      ))}

      {userLocation?.latitude != null &&
      userLocation?.longitude != null ? (
        <Marker
          coordinate={{
            latitude:
              userLocation.latitude,

            longitude:
              userLocation.longitude,
          }}
          title="Tu ubicación"
        />
      ) : null}
    </MapView>
  );
}
import React from "react";
import { Marker } from "react-native-maps";

// Mapa con cartografía de OpenStreetMap (ver OsmMapView.native.js).
import MapView from "./OsmMapView";

// Vista previa pasiva con cartografía de OpenStreetMap.
export default function PuntoVentaMiniMap({ latitude, longitude }) {
  return (
    <MapView
      key={`${latitude}:${longitude}`}
      style={{ flex: 1, width: "100%", height: "100%" }}
      initialRegion={{
        latitude, longitude,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      pointerEvents="none"
    >
      <Marker coordinate={{ latitude, longitude }} pinColor="#075A3D" />
    </MapView>
  );
}

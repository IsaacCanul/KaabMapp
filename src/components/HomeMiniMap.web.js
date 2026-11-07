import React from "react";

import {
  CircleMarker,
  MapContainer,
  TileLayer,
} from "react-leaflet";

// Fuente de mosaicos compartida con la app móvil.
import { ATRIBUCION_HTML, TILE_URL } from "../config/mapTiles";

import "leaflet/dist/leaflet.css";


const YUCATAN_CENTER = [
  20.72,
  -89.05,
];


export default function HomeMiniMap({
  points = [],
  userLocation = null,
}) {
  const center =
    userLocation?.latitude != null &&
    userLocation?.longitude != null
      ? [
          userLocation.latitude,
          userLocation.longitude,
        ]
      : YUCATAN_CENTER;


  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{
        width: "100%",
        height: "100%",
      }}
      zoomControl={false}
      attributionControl={true}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
    >
      <TileLayer
        url={TILE_URL}
        attribution={ATRIBUCION_HTML}
      />

      {points.map((point) => (
        <CircleMarker
          key={String(point.id)}
          center={[
            point.latitude,
            point.longitude,
          ]}
          radius={7}
          pathOptions={{
            fillOpacity: 1,
          }}
        />
      ))}

      {userLocation?.latitude != null &&
      userLocation?.longitude != null ? (
        <CircleMarker
          center={[
            userLocation.latitude,
            userLocation.longitude,
          ]}
          radius={9}
          pathOptions={{
            fillOpacity: 1,
            weight: 3,
          }}
        />
      ) : null}
    </MapContainer>
  );
}

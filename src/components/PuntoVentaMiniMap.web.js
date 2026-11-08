import React from "react";
import { MapContainer, CircleMarker, TileLayer } from "react-leaflet";

// Fuente de mosaicos compartida con la app móvil.
import { ATRIBUCION_HTML, TILE_URL } from "../config/mapTiles";
import "leaflet/dist/leaflet.css";

// Vista previa web no interactiva; con atribución de OpenStreetMap.
export default function PuntoVentaMiniMap({ latitude, longitude }) {
  return (
    <MapContainer
      key={`${latitude}:${longitude}`}
      center={[latitude, longitude]}
      zoom={14}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution={ATRIBUCION_HTML}
        url={TILE_URL}
      />
      <CircleMarker center={[latitude, longitude]} radius={8}
        pathOptions={{ color: "#FFFFFF", fillColor: "#075A3D", fillOpacity: 1, weight: 3 }}
      />
    </MapContainer>
  );
}

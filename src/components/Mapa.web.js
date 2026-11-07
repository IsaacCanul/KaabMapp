import React, { useEffect } from "react";
import { View } from "react-native";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { obtenerDatosOferta } from "../utils/meliponario";

const CENTRO_YUCATAN = [20.85, -89.0];

function crearIcono(item = {}) {
  const oferta = obtenerDatosOferta(item);
  return L.divIcon({
    className: "kaabmap-marker",
    html: `<div title="${oferta.label}" style="width:38px;height:38px;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);background:${oferta.color};border:3px solid white;box-shadow:0 3px 8px #0005;display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:white;font:bold 15px Arial">●</span></div>`,
    iconSize: [42, 42],
    iconAnchor: [19, 38],
  });
}

const userIcon = L.divIcon({
  className: "kaabmap-user-marker",
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#2878ED;border:4px solid white;box-shadow:0 2px 8px #0005"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function Controller({ mode, selected, centerOn, onSelect }) {
  const map = useMap();

  useMapEvents({
    click(event) {
      if (mode !== "registro") return;
      onSelect?.({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });

  useEffect(() => {
    const point = centerOn || (mode === "registro" ? selected : null);
    if (!point) return;
    const lat = Number(point.latitude);
    const lng = Number(point.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.flyTo([lat, lng], Number(point.zoom) || 13, { animate: true, duration: 0.6 });
  }, [map, mode, selected?.latitude, selected?.longitude, centerOn?.latitude, centerOn?.longitude, centerOn?.zoom]);

  return null;
}

export default function KaabMapMap({
  mode = "explorar",
  markers = [],
  selected = null,
  centerOn = null,
  userLocation = null,
  onSelect,
  onMarkerPress,
}) {
  const valid = markers.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)));
  const initial = centerOn
    ? [Number(centerOn.latitude), Number(centerOn.longitude)]
    : selected
      ? [Number(selected.latitude), Number(selected.longitude)]
      : CENTRO_YUCATAN;

  return (
    <View style={{ flex: 1, minHeight: 300, width: "100%" }}>
      <MapContainer center={initial} zoom={centerOn?.zoom || (selected ? 14 : 8)} maxZoom={19} style={{ height: "100%", width: "100%", minHeight: 300 }} scrollWheelZoom>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Controller mode={mode} selected={selected} centerOn={centerOn} onSelect={onSelect} />
        {mode === "explorar" && valid.map((item) => (
          <Marker
            key={String(item.id)}
            position={[Number(item.latitude), Number(item.longitude)]}
            icon={crearIcono(item)}
            eventHandlers={{ click: () => onMarkerPress?.(item) }}
          />
        ))}
        {mode === "registro" && selected ? (
          <Marker position={[Number(selected.latitude), Number(selected.longitude)]} icon={crearIcono({ tipoOferta: "neutro" })} />
        ) : null}
        {mode === "explorar" && userLocation ? (
          <Marker position={[Number(userLocation.latitude), Number(userLocation.longitude)]} icon={userIcon} zIndexOffset={1000} />
        ) : null}
      </MapContainer>
    </View>
  );
}

import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

// Fuente de mosaicos compartida con la app móvil.
import { ATRIBUCION_HTML, TILE_URL } from "../config/mapTiles";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [20.7099, -89.0943];

function MapController({ focus }) {
  const map = useMap();

  useEffect(() => {
    if (
      !Number.isFinite(focus?.latitude) ||
      !Number.isFinite(focus?.longitude)
    ) {
      return;
    }

    map.flyTo(
      [focus.latitude, focus.longitude],
      focus.zoom ?? 16,
      { animate: true, duration: 0.7 }
    );
  }, [map, focus]);

  return null;
}

function MapClickHandler({ preview, onChange }) {
  useMapEvents({
    click(event) {
      if (preview) return;
      onChange?.({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function useLocationIcon(preview) {
  return useMemo(() => {
    const color = preview ? "#84918A" : "#075A3D";
    return L.divIcon({
      className: "",
      html: `<div style="
        width:22px;
        height:22px;
        border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }, [preview]);
}

export default function RegisterLocationMap({
  value,
  preview = false,
  focus,
  onChange,
}) {
  const icon = useLocationIcon(preview);

  return (
    <MapContainer
      center={
        value
          ? [value.latitude, value.longitude]
          : DEFAULT_CENTER
      }
      zoom={value ? 15 : 8}
      scrollWheelZoom
      style={{ width: "100%", height: "100%", minHeight: 230 }}
    >
      <TileLayer
        attribution={ATRIBUCION_HTML}
        url={TILE_URL}
        maxZoom={19}
      />
      <MapController focus={focus} />
      <MapClickHandler preview={preview} onChange={onChange} />

      {value && (
        <Marker
          position={[value.latitude, value.longitude]}
          icon={icon}
          draggable={!preview}
          eventHandlers={{
            dragend(event) {
              if (preview) return;
              const coords = event.target.getLatLng();
              onChange?.({
                latitude: coords.lat,
                longitude: coords.lng,
              });
            },
          }}
        />
      )}
    </MapContainer>
  );
}

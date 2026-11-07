
import React, { useEffect } from "react";
import { View } from "react-native";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

// Fuente de mosaicos compartida con la app móvil.
import { ATRIBUCION_HTML, TILE_URL } from "../config/mapTiles";
import "leaflet/dist/leaflet.css";

import {
  MARKER_COLORS,
  BEE_PIN_PATHS,
  getMarkerCategory,
  getMarkerCoordinates,
} from "./kaabMarkerStyle";

const CENTRO_YUCATAN = [20.85, -89.0];
const CATEGORIAS = ["miel", "visitas", "ambos", "otro"];

function construirSvgPin(color) {
  const p = BEE_PIN_PATHS;

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="48" height="60" viewBox="0 0 48 60"
         aria-hidden="true"
         style="display:block;overflow:visible;filter:drop-shadow(0px 3px 3px rgba(0,0,0,.32))">
      <path d="${p.pin}" fill="${color}"
            stroke="#fff" stroke-width="2.7" stroke-linejoin="round"/>
      <g fill="none" stroke="#fff" stroke-width="2.3"
         stroke-linecap="round" stroke-linejoin="round">
        <path d="${p.leftWing}"/>
        <path d="${p.rightWing}"/>
        <path d="${p.body}"/>
        <path d="${p.antennae}"/>
        <path d="${p.stripes}"/>
      </g>
    </svg>
  `;
}

// Reutilizar los iconos para evitar recrearlos en cada render.
const ICONOS = Object.fromEntries(
  CATEGORIAS.map((categoria) => [
    categoria,
    L.divIcon({
      className: "kaabmap-bee-marker",
      html: construirSvgPin(MARKER_COLORS[categoria]),
      iconSize: [48, 60],
      iconAnchor: [24, 56],
      popupAnchor: [0, -49],
    }),
  ])
);

const ICONO_USUARIO = L.divIcon({
  className: "kaabmap-ubicacion-usuario",
  html: '<span style="display:block;width:17px;height:17px;background:#2878ED;border:3px solid white;border-radius:50%;box-shadow:0 1px 7px #0005;"></span>',
  iconSize: [23, 23],
  iconAnchor: [11, 11],
});

function ControlMapa({ mode, selected, centerOn, onSelect }) {
  const map = useMap();

  useMapEvents({
    click(event) {
      if (mode !== "registro") return;

      onSelect?.({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  const punto = getMarkerCoordinates(centerOn) ??
    (mode === "registro" ? getMarkerCoordinates(selected) : null);

  useEffect(() => {
    if (!punto) return;

    const zoom = Number(centerOn?.zoom) || 13;

    map.flyTo(
      [punto.latitude, punto.longitude],
      zoom,
      { animate: true, duration: 0.6 }
    );
  }, [map, punto?.latitude, punto?.longitude, centerOn?.zoom]);

  return null;
}

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
  // Compatibilidad con pantallas antiguas y las nuevas.
  const lista = Array.isArray(markers)
    ? markers
    : Array.isArray(meliponarios)
      ? meliponarios
      : [];

  const validos = lista
    .map((item) => ({
      item,
      coords: getMarkerCoordinates(item),
    }))
    .filter(({ coords }) => coords !== null);

  const centro = getMarkerCoordinates(centerOn) ??
    getMarkerCoordinates(selected);

  const initialCenter = centro
    ? [centro.latitude, centro.longitude]
    : CENTRO_YUCATAN;

  const seleccion = getMarkerCoordinates(selected);
  const usuario = getMarkerCoordinates(userLocation);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        minHeight: 300,
      }}
    >
      <MapContainer
        center={initialCenter}
        zoom={Number(centerOn?.zoom) || (seleccion ? 14 : 8)}
        maxZoom={19}
        scrollWheelZoom
        style={{
          width: "100%",
          height: "100%",
          minHeight: 300,
        }}
      >
        <TileLayer
          url={TILE_URL}
          maxZoom={19}
          attribution={ATRIBUCION_HTML}
        />

        <ControlMapa
          mode={mode}
          selected={selected}
          centerOn={centerOn}
          onSelect={onSelect}
        />

        {mode !== "registro" &&
          validos.map(({ item, coords }, index) => (
            <Marker
              key={String(
                item.id ??
                `${coords.latitude}-${coords.longitude}-${index}`
              )}
              position={[
                coords.latitude,
                coords.longitude,
              ]}
              icon={ICONOS[getMarkerCategory(item)]}
              eventHandlers={{
                click: () =>
                  (onMarkerPress ?? onSelectMeliponario)?.(item),
              }}
            />
          ))}

        {mode === "registro" && seleccion && (
          <Marker
            position={[
              seleccion.latitude,
              seleccion.longitude,
            ]}
            icon={ICONOS.otro}
          />
        )}

        {mode !== "registro" && usuario && (
          <Marker
            position={[
              usuario.latitude,
              usuario.longitude,
            ]}
            icon={ICONO_USUARIO}
            zIndexOffset={1000}
          />
        )}
      </MapContainer>
    </View>
  );
}

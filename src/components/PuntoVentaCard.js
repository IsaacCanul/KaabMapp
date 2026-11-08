import React from "react";
import {
  Alert, Linking, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PuntoVentaMiniMap from "./PuntoVentaMiniMap";

const GREEN = "#06492E";
const BORDER = "#E6E1D5";

function aviso(mensaje) {
  if (Platform.OS === "web") globalThis.alert?.(mensaje);
  else Alert.alert("Punto de venta", mensaje);
}

function coordenadas(punto) {
  const lat = punto?.punto_venta_latitud;
  const lng = punto?.punto_venta_longitud;
  if (lat === null || lat === undefined || lat === "" ||
      lng === null || lng === undefined || lng === "") return null;
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    ? { latitude, longitude } : null;
}

export default function PuntoVentaCard({ punto, esPropietario = false }) {
  const coords = coordenadas(punto);
  const nombre = punto?.punto_venta_tipo === "Punto de venta externo"
    ? punto.punto_venta_nombre || "Punto de venta"
    : punto?.nombre_meliponario || "En el meliponario";
  const direccion = String(punto?.punto_venta_direccion ?? "").trim();
  const referencias = String(punto?.punto_venta_referencias ?? "").trim();
  const telefono = String(punto?.punto_venta_telefono ?? "").replace(/\D/g, "");
  const permisoUbicacion = esPropietario || punto?.punto_venta_autoriza_ubicacion === true;
  const permisoContacto = esPropietario || punto?.punto_venta_autoriza_contacto === true;
  const tieneDireccion = permisoUbicacion && (coords || direccion);
  const puedeContactar = permisoContacto && telefono.length >= 10 && telefono.length <= 15;

  async function abrir(url) {
    try { await Linking.openURL(url); }
    catch { aviso("No se pudo abrir el enlace. Comprueba que tengas una aplicación compatible."); }
  }

  const destino = coords ? `${coords.latitude},${coords.longitude}` : direccion;
  const buscarUbicacion = () => {
    if (!tieneDireccion) return aviso("Este punto no tiene una ubicación disponible.");
    abrir(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destino)}`);
  };
  const comoLlegar = () => {
    if (!tieneDireccion) return aviso("Se necesita una dirección o una ubicación marcada en el mapa.");
    abrir(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`);
  };
  const contactar = () => {
    if (!puedeContactar) return aviso("El productor aún no ha autorizado un número de contacto.");
    abrir(`https://wa.me/${telefono}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Ionicons name="storefront-outline" size={20} color={GREEN} />
        <Text style={styles.headingText}>Punto de venta</Text>
      </View>
      {esPropietario && punto?.visibilidad_meliponario !== "publico" && (
        <Text style={styles.privateNote}>Vista para el propietario · El meliponario sigue privado.</Text>
      )}
      <View style={styles.infoRow}>
        <View style={styles.mapWrap}>
          {coords && permisoUbicacion ? (
            <PuntoVentaMiniMap latitude={coords.latitude} longitude={coords.longitude} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="map-outline" size={36} color={GREEN} />
              <Text style={styles.placeholderText}>Sin marcador</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{nombre}</Text>
          {!!direccion && permisoUbicacion && <Text style={styles.address}>{direccion}</Text>}
          {!!referencias && permisoUbicacion && <Text style={styles.reference}>Ref.: {referencias}</Text>}
          {!tieneDireccion && <Text style={styles.address}>Ubicación no registrada</Text>}
          <TouchableOpacity
            accessibilityRole="button" disabled={!tieneDireccion}
            onPress={buscarUbicacion}
            style={[styles.seeButton, !tieneDireccion && styles.disabled]}
          >
            <Ionicons name="location-sharp" color={GREEN} size={14} />
            <Text style={styles.seeText}>Ver ubicación</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity accessibilityRole="button" disabled={!tieneDireccion}
          onPress={comoLlegar} style={[styles.routeButton, !tieneDireccion && styles.disabled]}>
          <Ionicons name="navigate-outline" size={18} color={GREEN} />
          <Text style={styles.routeText}>Cómo llegar</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={!puedeContactar}
          onPress={contactar} style={[styles.contactButton, !puedeContactar && styles.disabled]}>
          <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
          <Text style={styles.contactText}>Contactar productor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 9, marginBottom: 13, backgroundColor: "#FFFFFF", padding: 12,
    borderWidth: 1, borderColor: BORDER, borderRadius: 17 },
  heading: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 },
  headingText: { fontWeight: "900", fontSize: 16, color: GREEN },
  privateNote: { fontSize: 12, lineHeight: 17, color: "#866525", marginBottom: 9 },
  infoRow: { flexDirection: "row", gap: 10, minHeight: 125 },
  mapWrap: { width: "47%", minHeight: 125, borderRadius: 12, overflow: "hidden", backgroundColor: "#E5F2E8" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5 },
  placeholderText: { fontSize: 11, color: GREEN },
  info: { flex: 1, justifyContent: "center" },
  name: { fontWeight: "900", fontSize: 14, color: "#173326" },
  address: { marginTop: 4, color: "#66736B", fontSize: 12, lineHeight: 17 },
  reference: { marginTop: 3, color: "#4E5F55", fontSize: 12, lineHeight: 17 },
  seeButton: { marginTop: 8, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 11,
    borderWidth: 1, borderColor: GREEN, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  seeText: { fontSize: 11, fontWeight: "800", color: GREEN },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  routeButton: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1,
    borderColor: GREEN, flexDirection: "row", gap: 5, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  routeText: { color: GREEN, fontWeight: "800", fontSize: 12 },
  contactButton: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: GREEN,
    flexDirection: "row", gap: 5, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  contactText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  disabled: { opacity: 0.45 },
});

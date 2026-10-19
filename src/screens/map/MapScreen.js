import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppLogo from "../../components/AppLogo";
import KaabMapMap from "../../components/Mapa";
import { mockMeliponarios } from "../../data/mockData";
import { meliponariosApi } from "../../services/meliponariosApi";
import { obtenerUbicacionActual, pareceEstarEnYucatan } from "../../utils/location";
import { obtenerDatosOferta, obtenerTipoOferta, obtenerUbicacionTexto, tieneProductos, TIPOS_OFERTA } from "../../utils/meliponario";
import { COLORS } from "../../theme/colors";
import { styles } from "./MapScreen.styles";

const RADIO_CERCA_KM = 50;

const normalizar = (value = "") => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const distanciaKm = (a, b) => {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(Number(b.latitude) - Number(a.latitude));
  const dLon = toRad(Number(b.longitude) - Number(a.longitude));
  const lat1 = toRad(Number(a.latitude));
  const lat2 = toRad(Number(b.latitude));
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

function Chip({ label, active, icon, onPress }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.82}>
      {icon ? <Ionicons name={icon} size={16} color={active ? COLORS.white : COLORS.primaryDark} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function MapScreen({ navigation }) {
  const [items, setItems] = useState(mockMeliponarios);
  const [loadingData, setLoadingData] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [municipioFilter, setMunicipioFilter] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [centerOn, setCenterOn] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!meliponariosApi.isConfigured()) return;
      try {
        setLoadingData(true);
        const data = await meliponariosApi.list();
        if (mounted && data.length) {
          setItems(data);
          setApiMessage("");
        }
      } catch (error) {
        if (mounted) setApiMessage("No se pudo cargar la API; se muestran datos de demostración.");
      } finally {
        if (mounted) setLoadingData(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const municipios = useMemo(() => ["Todos", ...new Set(items.map((item) => item.municipio).filter(Boolean))], [items]);

  const filtered = useMemo(() => {
    const q = normalizar(search);
    let result = items.filter((item) => {
      const searchable = normalizar([
        item.nombre,
        item.municipio,
        item.localidad,
        item.descripcion,
        item.referenciaUbicacion,
        ...(item.especies || []),
      ].join(" "));

      if (q && !searchable.includes(q)) return false;
      if (municipioFilter !== "Todos" && normalizar(item.municipio) !== normalizar(municipioFilter)) return false;
      if (typeFilter !== "todos" && obtenerTipoOferta(item) !== typeFilter) return false;
      if (!Number.isFinite(Number(item.latitude)) || !Number.isFinite(Number(item.longitude))) return false;
      return true;
    });

    if (userLocation) {
      result = result.map((item) => ({ ...item, distanciaUsuario: distanciaKm(userLocation, item) }));
    }
    if (nearMe && userLocation) {
      result = result.filter((item) => item.distanciaUsuario <= RADIO_CERCA_KM).sort((a, b) => a.distanciaUsuario - b.distanciaUsuario);
    }
    return result;
  }, [items, search, municipioFilter, typeFilter, nearMe, userLocation]);

  useEffect(() => {
    if (!filtered.length) {
      setSelected(null);
      return;
    }
    if (!selected || !filtered.some((item) => String(item.id) === String(selected.id))) setSelected(filtered[0]);
  }, [filtered, selected]);

  const requestLocation = async () => {
    try {
      setLocating(true);
      setLocationMessage("");
      const pos = await obtenerUbicacionActual();
      const coords = { latitude: Number(pos.latitude), longitude: Number(pos.longitude) };

      if (!pareceEstarEnYucatan(coords)) {
        setLocationMessage("El dispositivo reportó una ubicación fuera de Yucatán. No se activó Cerca de mí.");
        return null;
      }
      if (pos.accuracy != null && pos.accuracy > 10000) {
        setLocationMessage(`La precisión es de aproximadamente ${(pos.accuracy / 1000).toFixed(1)} km. Prueba desde un teléfono para mejorarla.`);
        return null;
      }

      setUserLocation(coords);
      setCenterOn({ ...coords, zoom: 12 });
      return coords;
    } catch (error) {
      setLocationMessage("No pudimos obtener tu ubicación. Revisa los permisos del navegador o del dispositivo.");
      return null;
    } finally {
      setLocating(false);
    }
  };

  const toggleNearMe = async () => {
    if (nearMe) {
      setNearMe(false);
      return;
    }
    const coords = userLocation || await requestLocation();
    if (coords) setNearMe(true);
  };

  const selectMarker = (item) => {
    setSelected(item);
    setCenterOn({ latitude: Number(item.latitude), longitude: Number(item.longitude), zoom: 12 });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <AppLogo compact />
          {loadingData ? <ActivityIndicator color={COLORS.primary} /> : null}
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.primaryDark} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Nombre, municipio, localidad o referencia"
            placeholderTextColor={COLORS.gray2}
          />
          <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
            <Ionicons name="options-outline" size={22} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <Chip label="Todos" active={typeFilter === "todos"} onPress={() => setTypeFilter("todos")} />
          <Chip label="Miel" active={typeFilter === "miel"} onPress={() => setTypeFilter("miel")} />
          <Chip label="Visitas" active={typeFilter === "visitas"} onPress={() => setTypeFilter("visitas")} />
          <Chip label="Ambos" active={typeFilter === "ambos"} onPress={() => setTypeFilter("ambos")} />
          <Chip label="Cerca de mí" icon="locate-outline" active={nearMe} onPress={toggleNearMe} />
        </ScrollView>
      </View>

      <View style={styles.mapArea}>
        <KaabMapMap markers={filtered} onMarkerPress={selectMarker} centerOn={centerOn} userLocation={userLocation} />

        <View style={styles.legend}>
          {Object.values(TIPOS_OFERTA).map((item) => (
            <View key={item.value} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.locateButton} onPress={requestLocation} disabled={locating}>
          {locating ? <ActivityIndicator color={COLORS.primaryDark} /> : <Ionicons name="locate-outline" size={24} color={COLORS.primaryDark} />}
        </TouchableOpacity>

        {(apiMessage || locationMessage) ? (
          <View style={styles.messageBox}><Text style={styles.messageText}>{locationMessage || apiMessage}</Text></View>
        ) : null}

        {selected ? (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{selected.nombre}</Text>
                <Text style={styles.locationText}>{obtenerUbicacionTexto(selected)}</Text>
              </View>
              <View style={[styles.offerBadge, { backgroundColor: obtenerDatosOferta(selected).color }]}>
                <Text style={styles.offerText}>{obtenerDatosOferta(selected).label}</Text>
              </View>
            </View>

            {selected.descripcion ? <Text style={styles.description} numberOfLines={2}>{selected.descripcion}</Text> : null}
            {selected.referenciaUbicacion ? (
              <View style={styles.infoLine}>
                <Ionicons name="navigate-outline" size={15} color={COLORS.gray} />
                <Text style={styles.infoText} numberOfLines={2}>Referencia: {selected.referenciaUbicacion}</Text>
              </View>
            ) : null}

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{selected.especies?.length || 0} especies</Text>
              <Text style={styles.metaText}>{tieneProductos(selected) ? "Productos disponibles" : "Sin productos anunciados"}</Text>
              {typeof selected.distanciaUsuario === "number" ? <Text style={styles.metaText}>{selected.distanciaUsuario.toFixed(1)} km</Text> : null}
            </View>

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => navigation.navigate("MeliponarioDetail", { id: selected.id, meliponario: selected })}
            >
              <Text style={styles.detailButtonText}>Ver detalles</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar mapa</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}><Ionicons name="close" size={24} color={COLORS.primaryDark} /></TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Municipio</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {municipios.map((municipio) => (
                <TouchableOpacity key={municipio} style={[styles.modalOption, municipioFilter === municipio && styles.modalOptionActive]} onPress={() => setMunicipioFilter(municipio)}>
                  <Text style={[styles.modalOptionText, municipioFilter === municipio && styles.modalOptionTextActive]}>{municipio}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalDone} onPress={() => setShowFilters(false)}><Text style={styles.modalDoneText}>Aplicar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getMisVisitasTecnicasAsignadasRequest } from "../../services/visitasTecnicasApi";
import {
  getBandejaSolicitudesTerritorialesRequest,
  getMisZonasActivasRequest,
} from "../../services/territorialApi";
import { getMisInspeccionesPorRealizarRequest } from "../../services/fichaTecnicaApi";
import {
  COLORS,
  estadoInfo,
  formatearFecha,
  idCorto,
} from "./inspectionsShared";


function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}


/* =========================================
   CONTADOR
========================================= */

function Contador({ titulo, valor, activo }) {
  return (
    <View style={[styles.stat, activo && styles.statActive]}>
      <Text style={styles.statLabel}>{titulo}</Text>
      <Text style={styles.statValue}>{valor}</Text>
    </View>
  );
}


/* =========================================
   TARJETA DE SOLICITUD
========================================= */

function TarjetaSolicitud({ solicitud, onLeer }) {
  const estado = estadoInfo(solicitud.estado);

  return (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: estado.bg }]}>
        <Text style={[styles.badgeText, { color: estado.fg }]}>
          {estado.titulo}
        </Text>
      </View>

      <Text style={styles.cardTitle}>
        {solicitud.nombre_meliponario || "Meliponario sin nombre"}
      </Text>

      <Text style={styles.cardSubtitle}>
        {solicitud.localidad_nombre || "Localidad no disponible"}
      </Text>

      <Text style={styles.cardMeta}>
        {idCorto(solicitud.solicitud_id)} ·{" "}
        {formatearFecha(solicitud.fecha_envio)}
      </Text>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={onLeer}
        accessibilityRole="button"
      >
        <Text style={styles.outlineButtonText}>Leer ficha</Text>
      </TouchableOpacity>
    </View>
  );
}


/* =========================================
   TARJETA DE INSPECCIÓN PRESENCIAL
========================================= */

function TarjetaInspeccion({ item, onAbrir }) {
  const hecha = Boolean(item.ficha_id);

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.badge,
          { backgroundColor: hecha ? "#E5F3DF" : "#FFF0CE" },
        ]}
      >
        <Text style={[styles.badgeText, { color: hecha ? "#257849" : "#926000" }]}>
          {hecha
            ? `Ficha enviada · ${formatearFecha(item.fecha_inspeccion)}`
            : "Inspección pendiente"}
        </Text>
      </View>

      <Text style={styles.cardTitle}>
        {item.nombre_meliponario || "Meliponario sin nombre"}
      </Text>

      <Text style={styles.cardSubtitle}>
        {item.localidad_nombre || "Localidad no disponible"} · Aprobado el{" "}
        {formatearFecha(item.fecha_aprobacion)}
      </Text>

      <TouchableOpacity
        style={[styles.outlineButton, !hecha && styles.fillButton]}
        onPress={onAbrir}
        accessibilityRole="button"
      >
        <Text style={[styles.outlineButtonText, !hecha && { color: COLORS.white }]}>
          {hecha ? "Ver o editar ficha técnica" : "Llenar ficha técnica"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


/* =========================================
   TARJETA DE VISITA TÉCNICA
========================================= */

function TarjetaVisita({ visita }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="clipboard-outline" size={22} color={COLORS.green} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {visita.nombre_meliponario || "Meliponario sin nombre"}
          </Text>

          <Text style={styles.cardSubtitle}>
            {visita.localidad_nombre || "Localidad no disponible"} ·{" "}
            {formatearFecha(visita.fecha_asignacion)}
          </Text>
        </View>
      </View>

      <View style={styles.motivoBox}>
        <Text style={styles.motivoLabel}>Motivo de la visita</Text>
        <Text style={styles.motivoText}>
          {visita.motivo_asignacion || "No se especificó un motivo."}
        </Text>
      </View>
    </View>
  );
}


/* =========================================
   PANTALLA MIS INSPECCIONES
========================================= */

export default function InspectionsScreen({ navigation }) {
  const [zonas, setZonas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [errorInspecciones, setErrorInspecciones] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [revision, setRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargar() {
        setLoading(true);
        setError("");

        // Cada sección se carga por separado: si una falla,
        // las demás se siguen mostrando.
        const [zonasRes, bandejaRes, visitasRes, inspeccionesRes] =
          await Promise.allSettled([
            getMisZonasActivasRequest(),
            getBandejaSolicitudesTerritorialesRequest(),
            getMisVisitasTecnicasAsignadasRequest(),
            getMisInspeccionesPorRealizarRequest(),
          ]);

        if (!activo) return;

        setInspecciones(
          inspeccionesRes.status === "fulfilled" ? inspeccionesRes.value : []
        );
        setErrorInspecciones(
          inspeccionesRes.status === "rejected"
            ? inspeccionesRes.reason?.message ??
                "No se pudieron consultar las inspecciones."
            : ""
        );

        setZonas(zonasRes.status === "fulfilled" ? zonasRes.value : []);
        setSolicitudes(
          bandejaRes.status === "fulfilled" && Array.isArray(bandejaRes.value)
            ? bandejaRes.value
            : []
        );
        setVisitas(
          visitasRes.status === "fulfilled" && Array.isArray(visitasRes.value)
            ? visitasRes.value
            : []
        );

        if (bandejaRes.status === "rejected") {
          setError(
            bandejaRes.reason?.message ??
              "No se pudo consultar la bandeja de solicitudes."
          );
        }

        setLoading(false);
        setRefreshing(false);
      }

      cargar();

      return () => {
        activo = false;
      };
    }, [revision])
  );

  const actualizar = () => {
    setRefreshing(true);
    setRevision((n) => n + 1);
  };

  const conteo = useMemo(() => {
    const por = (estados) =>
      solicitudes.filter((s) => estados.includes(s.estado)).length;

    return {
      pendientes: por(["enviada", "en_revision"]),
      correccion: por(["correccion"]),
      aprobadas: por(["aprobada"]),
      rechazadas: por(["rechazada"]),
    };
  }, [solicitudes]);

  const visibles = useMemo(() => {
    const q = normalizar(filtro);

    if (!q) return solicitudes;

    return solicitudes.filter((s) =>
      [
        s.nombre_meliponario,
        s.localidad_nombre,
        s.solicitud_id,
        s.meliponario_id,
      ]
        .map(normalizar)
        .some((v) => v.includes(q))
    );
  }, [solicitudes, filtro]);

  const abrirFicha = (solicitud) => {
    navigation.navigate("SolicitudFicha", { solicitud });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={actualizar}
            colors={[COLORS.green]}
            tintColor={COLORS.green}
          />
        }
      >
        {/* ENCABEZADO */}

        <Text style={styles.kicker}>TRABAJO DE CAMPO</Text>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Solicitudes de mis zonas</Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={actualizar}
            disabled={loading}
            accessibilityLabel="Actualizar bandeja"
          >
            <Ionicons name="refresh-outline" size={22} color={COLORS.green} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Consulta las solicitudes de las zonas que el administrador
          asignó a tu cuenta.
        </Text>

        {/* ZONAS */}

        <View style={styles.zonasBox}>
          <Text style={styles.zonasTitle}>Tus zonas activas</Text>
          <Text style={styles.zonasText}>
            {zonas.length
              ? zonas.map((z) => z.nombre).join(", ")
              : loading
                ? "Cargando..."
                : "No tienes zonas activas asignadas."}
          </Text>
        </View>

        {/* CONTADORES */}

        <View style={styles.stats}>
          <Contador titulo="Pendientes" valor={conteo.pendientes} activo />
          <Contador titulo="En corrección" valor={conteo.correccion} />
          <Contador titulo="Aprobadas" valor={conteo.aprobadas} />
          <Contador titulo="Rechazadas" valor={conteo.rechazadas} />
        </View>

        {/* INSPECCIONES PRESENCIALES */}

        {!loading && (inspecciones.length > 0 || !!errorInspecciones) && (
          <>
            <Text style={styles.section}>Inspecciones por realizar</Text>
            <Text style={styles.subtitle}>
              Meliponarios que aprobaste. Visítalos y llena su ficha técnica.
            </Text>

            {!!errorInspecciones && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.red} />
                <Text style={styles.errorText}>{errorInspecciones}</Text>
              </View>
            )}

            <View style={{ marginTop: 10 }}>
              {inspecciones.map((item) => (
                <TarjetaInspeccion
                  key={String(item.meliponario_id)}
                  item={item}
                  onAbrir={() =>
                    navigation.navigate("FichaTecnica", { meliponario: item })
                  }
                />
              ))}
            </View>
          </>
        )}

        {/* BANDEJA */}

        <Text style={styles.section}>Bandeja de solicitudes</Text>

        <Text style={styles.label}>Buscar nombre o identificador</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={busqueda}
            onChangeText={setBusqueda}
            onSubmitEditing={() => setFiltro(busqueda)}
            placeholder="Ej. ITSVA o 9087a461"
            placeholderTextColor={COLORS.gray}
            returnKeyType="search"
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setFiltro(busqueda)}
          >
            <Text style={styles.outlineButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={COLORS.green}
            style={{ marginVertical: 30 }}
          />
        ) : (
          <>
            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.found}>
              {visibles.length}{" "}
              {visibles.length === 1
                ? "solicitud encontrada"
                : "solicitudes encontradas"}
            </Text>

            {visibles.map((s) => (
              <TarjetaSolicitud
                key={String(s.solicitud_id)}
                solicitud={s}
                onLeer={() => abrirFicha(s)}
              />
            ))}

            {!error && visibles.length === 0 && (
              <Text style={styles.empty}>
                No hay solicitudes por revisar en tus zonas.
              </Text>
            )}

            {/* VISITAS TÉCNICAS */}

            {visitas.length > 0 && (
              <>
                <Text style={[styles.section, { marginTop: 22 }]}>
                  Visitas técnicas asignadas
                </Text>

                {visitas.map((v, i) => (
                  <TarjetaVisita
                    key={String(v.asignacion_id ?? `visita-${i}`)}
                    visita={v}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


/* =========================================
   ESTILOS
========================================= */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 100 },

  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#926000",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  title: { flex: 1, fontSize: 26, fontWeight: "900", color: COLORS.green },
  subtitle: { fontSize: 14, color: COLORS.gray, marginTop: 6, lineHeight: 20 },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  zonasBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.softGreen,
  },
  zonasTitle: { fontSize: 14, fontWeight: "800", color: COLORS.green },
  zonasText: { fontSize: 14, color: "#253C30", marginTop: 6 },

  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  stat: {
    flexGrow: 1,
    flexBasis: "45%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  statActive: { backgroundColor: COLORS.softGreen, borderColor: COLORS.primary },
  statLabel: { fontSize: 13, color: COLORS.gray },
  statValue: { fontSize: 24, fontWeight: "900", color: COLORS.green, marginTop: 4 },

  section: { fontSize: 18, fontWeight: "900", color: COLORS.green, marginTop: 22 },
  label: { fontSize: 13, fontWeight: "800", color: COLORS.green, marginTop: 12 },
  searchRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  input: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.green,
  },
  searchButton: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: "center",
  },
  found: { fontSize: 12, color: COLORS.gray, marginTop: 12, marginBottom: 8 },
  empty: { fontSize: 14, color: COLORS.gray, textAlign: "center", marginVertical: 24 },

  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.softGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeText: { fontSize: 12, fontWeight: "800" },
  cardTitle: { fontSize: 17, fontWeight: "900", color: COLORS.green },
  cardSubtitle: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  cardMeta: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  outlineButton: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  outlineButtonText: { fontSize: 14, fontWeight: "800", color: COLORS.green },
  fillButton: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  motivoBox: { marginTop: 12, backgroundColor: "#F5F7F1", padding: 12, borderRadius: 12 },
  motivoLabel: { fontSize: 12, color: COLORS.gray, fontWeight: "800", marginBottom: 4 },
  motivoText: { fontSize: 14, color: "#253C30", lineHeight: 20 },

  errorBox: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  errorText: { flex: 1, color: COLORS.red, fontSize: 13, lineHeight: 19 },
});

import React, {
  useCallback,
  useEffect,
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

import {
  getBandejaSolicitudesTerritorialesRequest,
  getMisZonasActivasRequest,
} from "../../services/territorialApi";
import { getMisVisitasAsignadasRequest } from "../../services/fichaTecnicaApi";
import {
  abrirAprobadoComoTrabajadorRequest,
  getMisAprobadosTrabajadorRequest,
} from "../../services/edicionAprobadosApi";
import { useMeliponarioDraft } from "../../context/MeliponarioDraftContext";
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
   TARJETA DE VISITA ASIGNADA
   El coordinador de campo asigna el meliponario; aquí se elige
   para iniciar la encuesta (ficha técnica) en la visita presencial.
========================================= */

function TarjetaVisita({ visita, onIniciar }) {
  const hecha = Boolean(visita.ficha_id);

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
            ? `Encuesta enviada · ${formatearFecha(visita.fecha_inspeccion)}`
            : "Encuesta pendiente"}
        </Text>
      </View>

      <Text style={styles.cardTitle}>
        {visita.nombre_meliponario || "Meliponario sin nombre"}
      </Text>

      <Text style={styles.cardSubtitle}>
        {visita.localidad_nombre || "Localidad no disponible"} · Asignada el{" "}
        {formatearFecha(visita.fecha_asignacion)}
      </Text>

      <View style={styles.motivoBox}>
        <Text style={styles.motivoLabel}>Motivo de la visita</Text>
        <Text style={styles.motivoText}>
          {visita.motivo_asignacion || "No se especificó un motivo."}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.outlineButton, !hecha && styles.fillButton]}
        onPress={onIniciar}
        accessibilityRole="button"
      >
        <Text style={[styles.outlineButtonText, !hecha && { color: COLORS.white }]}>
          {hecha ? "Ver o corregir encuesta" : "Iniciar encuesta"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


/* =========================================
   TARJETA DE MELIPONARIO QUE APROBÉ
========================================= */

function TarjetaAprobado({ item, onEditar, ocupado }) {
  return (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: "#E5F3DF" }]}>
        <Text style={[styles.badgeText, { color: "#257849" }]}>
          Aprobado el {formatearFecha(item.fecha_aprobacion)}
        </Text>
      </View>

      <Text style={styles.cardTitle}>
        {item.nombre_meliponario || "Meliponario sin nombre"}
      </Text>

      <Text style={styles.cardSubtitle}>
        {item.localidad_nombre || "Localidad no disponible"}
        {item.fecha_actualizacion
          ? ` · Actualizado el ${formatearFecha(item.fecha_actualizacion)}`
          : ""}
      </Text>

      <TouchableOpacity
        style={[styles.outlineButton, ocupado && { opacity: 0.6 }]}
        onPress={onEditar}
        disabled={ocupado}
        accessibilityRole="button"
      >
        {ocupado ? (
          <ActivityIndicator color={COLORS.green} />
        ) : (
          <Text style={styles.outlineButtonText}>Editar meliponario</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}


/* =========================================
   SELECTOR DE APARTADO
========================================= */

function Apartado({ titulo, cantidad, activo, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.segment, activo && styles.segmentActive]}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: activo }}
    >
      <Text style={[styles.segmentText, activo && styles.segmentTextActive]}>
        {titulo}
      </Text>
      <View style={[styles.segmentCount, activo && styles.segmentCountActive]}>
        <Text style={[styles.segmentCountText, activo && styles.segmentCountTextActive]}>
          {cantidad}
        </Text>
      </View>
    </TouchableOpacity>
  );
}


/* =========================================
   PANTALLA REVISIONES (TRABAJADOR DE CAMPO)
   Dos apartados:
   1. Bandeja de solicitudes: aprobar registros básicos de su zona.
   2. Visitas asignadas: meliponarios que el coordinador le asignó;
      al elegir uno inicia la encuesta.
========================================= */

export default function InspectionsScreen({ navigation, route }) {
  const APARTADOS = ["bandeja", "visitas", "aprobados"];
  const [apartado, setApartado] = useState(
    APARTADOS.includes(route?.params?.apartado) ? route.params.apartado : "bandeja"
  );
  const [aprobados, setAprobados] = useState([]);
  const [errorAprobados, setErrorAprobados] = useState("");
  const [abriendo, setAbriendo] = useState(null);
  const { replaceDraft } = useMeliponarioDraft();
  const [zonas, setZonas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [errorVisitas, setErrorVisitas] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [revision, setRevision] = useState(0);

  // Una notificación puede abrir directo un apartado.
  useEffect(() => {
    const pedido = route?.params?.apartado;
    if (["bandeja", "visitas", "aprobados"].includes(pedido)) setApartado(pedido);
  }, [route?.params?.apartado]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargar() {
        setLoading(true);
        setError("");

        // Cada apartado se carga por separado: si uno falla,
        // el otro se sigue mostrando.
        const [zonasRes, bandejaRes, visitasRes, aprobadosRes] = await Promise.allSettled([
          getMisZonasActivasRequest(),
          getBandejaSolicitudesTerritorialesRequest(),
          getMisVisitasAsignadasRequest(),
          getMisAprobadosTrabajadorRequest(),
        ]);

        if (!activo) return;

        setAprobados(aprobadosRes.status === "fulfilled" ? aprobadosRes.value : []);
        setErrorAprobados(
          aprobadosRes.status === "rejected"
            ? aprobadosRes.reason?.message ??
                "No se pudieron consultar los meliponarios que aprobaste."
            : ""
        );

        setZonas(zonasRes.status === "fulfilled" ? zonasRes.value : []);
        setSolicitudes(
          bandejaRes.status === "fulfilled" && Array.isArray(bandejaRes.value)
            ? bandejaRes.value
            : []
        );
        setError(
          bandejaRes.status === "rejected"
            ? bandejaRes.reason?.message ??
                "No se pudo consultar la bandeja de solicitudes."
            : ""
        );

        setVisitas(
          visitasRes.status === "fulfilled" ? visitasRes.value.visitas : []
        );
        setErrorVisitas(
          visitasRes.status === "rejected"
            ? visitasRes.reason?.message ??
                "No se pudieron consultar tus visitas asignadas."
            : ""
        );

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

  const visitasPendientes = visitas.filter((v) => !v.ficha_id).length;

  // Abre el formulario del registro con los datos del meliponario.
  const editarAprobado = async (item) => {
    if (abriendo) return;
    setAbriendo(item.meliponario_id);

    try {
      const draft = await abrirAprobadoComoTrabajadorRequest(item.meliponario_id);

      if (draft.latitude == null || draft.longitude == null) {
        throw new Error(
          "No se recuperaron las coordenadas. Para no sobrescribir la " +
          "ubicación, no se abrirá la edición."
        );
      }

      replaceDraft(draft);
      navigation.navigate("RegisterStep1");
    } catch (e) {
      setErrorAprobados(e?.message ?? "No se pudo abrir la edición.");
    } finally {
      setAbriendo(null);
    }
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
          <Text style={styles.title}>Revisiones</Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={actualizar}
            disabled={loading}
            accessibilityLabel="Actualizar"
          >
            <Ionicons name="refresh-outline" size={22} color={COLORS.green} />
          </TouchableOpacity>
        </View>

        {/* ZONAS */}

        <View style={styles.zonasBox}>
          <Text style={styles.zonasTitle}>Tus zonas activas</Text>
          <Text style={styles.zonasText}>
            {zonas.length
              ? zonas.map((z) => z.nombre).join(", ")
              : loading
                ? "Cargando..."
                : "No tienes zonas activas asignadas. El administrador general te asigna una zona."}
          </Text>
        </View>

        {/* APARTADOS */}

        <View style={styles.segments} accessibilityRole="tablist">
          <Apartado
            titulo="Bandeja de solicitudes"
            cantidad={conteo.pendientes}
            activo={apartado === "bandeja"}
            onPress={() => setApartado("bandeja")}
          />
          <Apartado
            titulo="Visitas asignadas"
            cantidad={visitasPendientes}
            activo={apartado === "visitas"}
            onPress={() => setApartado("visitas")}
          />
          <Apartado
            titulo="Aprobados por mí"
            cantidad={aprobados.length}
            activo={apartado === "aprobados"}
            onPress={() => setApartado("aprobados")}
          />
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={COLORS.green}
            style={{ marginVertical: 30 }}
          />
        ) : apartado === "bandeja" ? (
          <>
            {/* ===== BANDEJA DE SOLICITUDES ===== */}

            <Text style={styles.subtitle}>
              Revisa y aprueba los registros básicos de tu zona. Después de
              aprobarlos, el coordinador de campo los asigna para la visita.
            </Text>

            <View style={styles.stats}>
              <Contador titulo="Pendientes" valor={conteo.pendientes} activo />
              <Contador titulo="En corrección" valor={conteo.correccion} />
              <Contador titulo="Aprobadas" valor={conteo.aprobadas} />
              <Contador titulo="Rechazadas" valor={conteo.rechazadas} />
            </View>

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
                onLeer={() => navigation.navigate("SolicitudFicha", { solicitud: s })}
              />
            ))}

            {!error && visibles.length === 0 && (
              <Text style={styles.empty}>
                No hay solicitudes por revisar en tus zonas.
              </Text>
            )}
          </>
        ) : apartado === "visitas" ? (
          <>
            {/* ===== VISITAS ASIGNADAS ===== */}

            <Text style={styles.subtitle}>
              Meliponarios que el coordinador de campo te asignó. Elige uno
              e inicia la encuesta durante la visita.
            </Text>

            {!!errorVisitas && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.red} />
                <Text style={styles.errorText}>{errorVisitas}</Text>
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              {visitas.map((v, i) => (
                <TarjetaVisita
                  key={String(v.asignacion_id ?? `visita-${i}`)}
                  visita={v}
                  onIniciar={() => navigation.navigate("FichaTecnica", { visita: v })}
                />
              ))}
            </View>

            {!errorVisitas && visitas.length === 0 && (
              <Text style={styles.empty}>
                Aún no tienes visitas asignadas. Cuando el coordinador de
                campo te asigne un meliponario, aparecerá aquí.
              </Text>
            )}
          </>
        ) : (
          <>
            {/* ===== APROBADOS POR MÍ ===== */}

            <Text style={styles.subtitle}>
              Meliponarios cuya solicitud aprobaste. Puedes corregir sus
              datos; los cambios se aplican de inmediato.
            </Text>

            {!!errorAprobados && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={20} color={COLORS.red} />
                <Text style={styles.errorText}>{errorAprobados}</Text>
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              {aprobados.map((item) => (
                <TarjetaAprobado
                  key={String(item.meliponario_id)}
                  item={item}
                  ocupado={abriendo === item.meliponario_id}
                  onEditar={() => editarAprobado(item)}
                />
              ))}
            </View>

            {!errorAprobados && aprobados.length === 0 && (
              <Text style={styles.empty}>
                Aún no has aprobado meliponarios.
              </Text>
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

  segments: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 4,
    padding: 4,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Tres apartados: nombre arriba y número abajo para que quepan.
  segment: {
    flex: 1,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 12,
  },
  segmentActive: { backgroundColor: COLORS.primary },
  segmentText: { fontSize: 12, fontWeight: "800", color: COLORS.green, textAlign: "center" },
  segmentTextActive: { color: COLORS.white },
  segmentCount: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentCountActive: { backgroundColor: COLORS.white },
  segmentCountText: { fontSize: 12, fontWeight: "900", color: COLORS.green },
  segmentCountTextActive: { color: COLORS.primary },

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

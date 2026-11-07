import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";
import {
  resolverSolicitudTerritorialRequest,
  tomarSolicitudTerritorialRequest,
} from "../../services/territorialApi";
import {
  COLORS,
  actividades,
  estadoInfo,
  formatearFecha,
  idCorto,
} from "./inspectionsShared";


const VALIDACIONES = [
  "El nombre identifica el meliponario.",
  "La localidad corresponde a mi asignación.",
  "Las especies y cantidades están completas.",
  "La ubicación está registrada y es coherente con la ficha.",
];

const DECISIONES = {
  aprobar: {
    titulo: "Aprobar solicitud",
    aviso:
      "Al confirmar se aprobará la solicitud y se publicará su ficha con " +
      "los datos revisados. Las observaciones de revisión permanecerán privadas.",
    exito:
      "La solicitud fue aprobada. Ahora aparece en «Inspecciones por " +
      "realizar» para que visites el meliponario y llenes su ficha técnica.",
  },
  solicitar_correccion: {
    titulo: "Solicitar correcciones",
    aviso:
      "El responsable recibirá la solicitud de vuelta para corregir los " +
      "datos que indiques en el comentario.",
    exito: "Se solicitaron correcciones al responsable.",
  },
  rechazar: {
    titulo: "Rechazar solicitud",
    aviso:
      "La solicitud quedará rechazada. Explica el motivo en el comentario.",
    exito: "La solicitud fue rechazada.",
  },
};

function aviso(titulo, mensaje) {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${titulo}\n\n${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

function Dato({ label, value }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoLabel}>{label}</Text>
      <Text style={styles.datoValue}>{value || "No disponible"}</Text>
    </View>
  );
}


export default function SolicitudFichaScreen({ navigation, route }) {
  const { user } = useAuth();

  const [solicitud, setSolicitud] = useState(
    route.params?.solicitud ?? {}
  );
  const [checks, setChecks] = useState(VALIDACIONES.map(() => false));
  const [decision, setDecision] = useState(null);
  const [comentario, setComentario] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const estado = estadoInfo(solicitud.estado);
  const soyRevisor =
    Boolean(user?.id) &&
    String(solicitud.trabajador_revisor_id ?? "") === String(user.id);
  const otroRevisor =
    Boolean(solicitud.trabajador_revisor_id) && !soyRevisor;
  const puedeTomar =
    !solicitud.trabajador_revisor_id &&
    ["enviada", "en_revision"].includes(solicitud.estado);
  const enRevision = solicitud.estado === "en_revision" && soyRevisor;
  const todoValidado = checks.every(Boolean);

  /* TOMAR SOLICITUD */

  const tomar = async () => {
    setOcupado(true);
    setError("");

    try {
      await tomarSolicitudTerritorialRequest(solicitud.solicitud_id);

      setSolicitud((s) => ({
        ...s,
        estado: "en_revision",
        trabajador_revisor_id: user?.id,
      }));
    } catch (e) {
      setError(e?.message ?? "No se pudo tomar la solicitud.");
    } finally {
      setOcupado(false);
    }
  };

  /* REGISTRAR DECISIÓN */

  const confirmarDecision = async () => {
    const texto = comentario.trim();

    if (texto.length < 10 || texto.length > 2000) {
      setError("El comentario debe tener entre 10 y 2000 caracteres.");
      return;
    }

    setOcupado(true);
    setError("");

    try {
      await resolverSolicitudTerritorialRequest({
        solicitudId: solicitud.solicitud_id,
        decision,
        comentario: texto,
      });

      const exito = DECISIONES[decision].exito;
      setDecision(null);
      aviso("Decisión registrada", exito);
      navigation.goBack();
    } catch (e) {
      setError(e?.message ?? "No se pudo registrar la decisión.");
    } finally {
      setOcupado(false);
    }
  };

  const abrirDecision = (tipo) => {
    setComentario("");
    setError("");
    setDecision(tipo);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Cerrar ficha"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.green} />
        </TouchableOpacity>

        <Text style={styles.topTitle}>
          FICHA · {idCorto(solicitud.solicitud_id)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {solicitud.nombre_meliponario || "Meliponario sin nombre"}
        </Text>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: estado.bg }]}>
            <Text style={[styles.badgeText, { color: estado.fg }]}>
              {estado.titulo}
            </Text>
          </View>

          <Text style={styles.meta}>
            Enviada el {formatearFecha(solicitud.fecha_envio)}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Dato label="Localidad" value={solicitud.localidad_nombre} />
          <Dato
            label="Actividades"
            value={actividades(solicitud.categoria_marcador)}
          />
          <Dato
            label="Identificador del meliponario"
            value={idCorto(solicitud.meliponario_id)}
          />
        </View>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.green} />
          <Text style={styles.noteText}>
            Las especies, la ubicación en el mapa y las fotografías aún no
            están disponibles para revisores en la app. Consúltalas en el
            panel web antes de decidir.
          </Text>
        </View>

        {/* FLUJO DE REVISIÓN */}

        {puedeTomar && (
          <TouchableOpacity
            style={[styles.primaryButton, ocupado && styles.disabled]}
            onPress={tomar}
            disabled={ocupado}
          >
            {ocupado ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryText}>
                Tomar solicitud e iniciar revisión
              </Text>
            )}
          </TouchableOpacity>
        )}

        {puedeTomar && (
          <Text style={styles.hint}>
            Toma la solicitud para habilitar la revisión.
          </Text>
        )}

        {otroRevisor && (
          <Text style={styles.hint}>
            Otro trabajador está revisando esta solicitud.
          </Text>
        )}

        {enRevision && (
          <>
            <Text style={styles.section}>Validación de datos mínimos</Text>
            <Text style={styles.sectionHelp}>
              Confirma cada punto después de revisar la ficha. Todas las
              decisiones requieren un comentario.
            </Text>

            {VALIDACIONES.map((texto, i) => (
              <TouchableOpacity
                key={texto}
                style={styles.check}
                onPress={() =>
                  setChecks((c) => c.map((v, j) => (j === i ? !v : v)))
                }
                accessibilityRole="checkbox"
                accessibilityState={{ checked: checks[i] }}
              >
                <Ionicons
                  name={checks[i] ? "checkbox" : "square-outline"}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.checkText}>{texto}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.primaryButton, !todoValidado && styles.disabled]}
                onPress={() => abrirDecision("aprobar")}
                disabled={!todoValidado || ocupado}
              >
                <Text style={styles.primaryText}>Aprobar solicitud</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => abrirDecision("solicitar_correccion")}
                disabled={ocupado}
              >
                <Text style={styles.secondaryText}>Solicitar correcciones</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => abrirDecision("rechazar")}
                disabled={ocupado}
              >
                <Text style={[styles.secondaryText, { color: COLORS.red }]}>
                  Rechazar
                </Text>
              </TouchableOpacity>
            </View>

            {!todoValidado && (
              <Text style={styles.hint}>
                Marca las 4 validaciones para poder aprobar.
              </Text>
            )}
          </>
        )}

        {!!error && !decision && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* COMENTARIO DE LA DECISIÓN */}

      <Modal
        visible={Boolean(decision)}
        transparent
        animationType="fade"
        onRequestClose={() => setDecision(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.kicker}>REVISIÓN EN SUPABASE</Text>
            <Text style={styles.dialogTitle}>
              {decision ? DECISIONES[decision].titulo : ""}
            </Text>
            <Text style={styles.meta}>
              {solicitud.nombre_meliponario} · {idCorto(solicitud.solicitud_id)}
            </Text>

            <View style={styles.dialogNote}>
              <Text style={styles.noteText}>
                {decision ? DECISIONES[decision].aviso : ""}
              </Text>
            </View>

            <Text style={styles.label}>Comentario de revisión (obligatorio)</Text>
            <TextInput
              style={styles.textArea}
              value={comentario}
              onChangeText={setComentario}
              multiline
              textAlignVertical="top"
              maxLength={2000}
              placeholder="Explica la decisión y, si aplica, qué datos se deben corregir."
              placeholderTextColor={COLORS.gray}
            />
            <Text style={styles.counter}>
              {comentario.trim().length} / 2000 · mínimo 10 caracteres
            </Text>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setDecision(null)}
                disabled={ocupado}
              >
                <Text style={styles.secondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, ocupado && styles.disabled]}
                onPress={confirmarDecision}
                disabled={ocupado}
              >
                {ocupado ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryText}>Confirmar decisión</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: { fontSize: 12, letterSpacing: 1, color: COLORS.gray, fontWeight: "700" },
  content: { padding: 20, paddingBottom: 100 },

  title: { fontSize: 26, fontWeight: "900", color: COLORS.green },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" },
  meta: { fontSize: 13, color: COLORS.gray },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "800" },

  infoBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.softGreen,
    gap: 12,
  },
  dato: {},
  datoLabel: { fontSize: 12, color: COLORS.gray },
  datoValue: { fontSize: 15, fontWeight: "800", color: COLORS.green, marginTop: 2 },

  note: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 19, color: "#253C30" },

  section: { fontSize: 18, fontWeight: "900", color: COLORS.green, marginTop: 24 },
  sectionHelp: { fontSize: 13, color: COLORS.gray, marginTop: 4, marginBottom: 10 },
  check: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F5F7F1",
    marginBottom: 8,
  },
  checkText: { flex: 1, fontSize: 14, color: "#253C30" },

  actions: { gap: 10, marginTop: 12 },
  primaryButton: {
    flexGrow: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  primaryText: { color: COLORS.white, fontSize: 15, fontWeight: "800" },
  secondaryButton: {
    flexGrow: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  secondaryText: { color: COLORS.green, fontSize: 15, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  hint: { fontSize: 13, color: COLORS.gray, marginTop: 10, textAlign: "center" },

  errorBox: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  errorText: { flex: 1, color: COLORS.red, fontSize: 13, lineHeight: 19, marginTop: 6 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(6, 40, 26, 0.55)",
    justifyContent: "center",
    padding: 16,
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  kicker: { fontSize: 11, letterSpacing: 1, fontWeight: "800", color: "#926000" },
  dialogTitle: { fontSize: 22, fontWeight: "900", color: COLORS.green, marginTop: 4 },
  dialogNote: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: "#F5F7F1" },
  label: { fontSize: 13, fontWeight: "800", color: COLORS.green, marginTop: 14 },
  textArea: {
    marginTop: 6,
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 15,
    color: COLORS.green,
  },
  counter: { fontSize: 11, color: COLORS.gray, marginTop: 4 },
  dialogActions: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
});

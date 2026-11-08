import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

import {
  guardarBorradorFicha,
  guardarFichaTecnicaRequest,
  leerBorradorFicha,
  obtenerFichaTecnicaRequest,
  preguntasVisibles,
  validarFicha,
} from "../../services/fichaTecnicaApi";
import { COLORS, formatearFecha } from "./inspectionsShared";


function aviso(titulo, mensaje) {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${titulo}\n\n${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}


/* =========================================
   UNA PREGUNTA
========================================= */

function Pregunta({ numero, pregunta, valor, onChange }) {
  const seleccion = valor?.seleccion ?? [];
  const multiple = pregunta.tipo === "multiple";

  const alternar = (opcion) => {
    let nueva;

    if (!multiple) {
      nueva = [opcion.value];
    } else if (seleccion.includes(opcion.value)) {
      nueva = seleccion.filter((v) => v !== opcion.value);
    } else if (opcion.exclusiva) {
      nueva = [opcion.value];
    } else {
      // Una opción normal quita las exclusivas («Ninguna», etc.).
      const exclusivas = pregunta.opciones
        .filter((o) => o.exclusiva)
        .map((o) => o.value);
      nueva = [
        ...seleccion.filter((v) => !exclusivas.includes(v)),
        opcion.value,
      ];
    }

    onChange({ ...valor, seleccion: nueva });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.qNumber}>Pregunta {numero}</Text>
      <Text style={styles.qTitle}>{pregunta.titulo}</Text>
      <Text style={styles.qHelp}>
        {multiple ? "Puedes marcar más de una opción." : "Elige una opción."}
      </Text>

      {pregunta.opciones.map((opcion) => {
        const activa = seleccion.includes(opcion.value);

        return (
          <View key={opcion.value}>
            <TouchableOpacity
              style={[styles.option, activa && styles.optionActive]}
              onPress={() => alternar(opcion)}
              accessibilityRole={multiple ? "checkbox" : "radio"}
              accessibilityState={{ checked: activa }}
            >
              <Ionicons
                name={
                  multiple
                    ? activa ? "checkbox" : "square-outline"
                    : activa ? "radio-button-on" : "radio-button-off"
                }
                size={22}
                color={COLORS.primary}
              />
              <Text style={styles.optionText}>{opcion.label}</Text>
            </TouchableOpacity>

            {opcion.otro && activa && (
              <TextInput
                style={styles.otroInput}
                value={valor?.otro ?? ""}
                onChangeText={(texto) => onChange({ ...valor, otro: texto })}
                placeholder="Escribe cuál"
                placeholderTextColor={COLORS.gray}
                maxLength={300}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}


/* =========================================
   PANTALLA
========================================= */

export default function FichaTecnicaScreen({ navigation, route }) {
  // Visita asignada por el coordinador de campo (mis_visitas_tecnicas_asignadas).
  const meliponario = route.params?.visita ?? {};
  const asignacionId = meliponario.asignacion_id;

  const [respuestas, setRespuestas] = useState({});
  const [observaciones, setObservaciones] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [origen, setOrigen] = useState("");
  const listo = useRef(false);

  // Carga: primero el borrador del teléfono; si no hay, la ficha ya enviada.
  useEffect(() => {
    let activo = true;

    (async () => {
      const borrador = await leerBorradorFicha(asignacionId);

      if (borrador) {
        if (!activo) return;
        setRespuestas(borrador.respuestas ?? {});
        setObservaciones(borrador.observaciones ?? "");
        setOrigen("Continúas el borrador guardado en este teléfono.");
      } else if (meliponario.ficha_id) {
        try {
          const ficha = await obtenerFichaTecnicaRequest(asignacionId);
          if (!activo || !ficha) return;
          setRespuestas(ficha.respuestas);
          setObservaciones(ficha.observaciones);
          setOrigen(
            `Ficha enviada el ${formatearFecha(ficha.fechaInspeccion)}. ` +
            "Si la cambias, se reemplaza."
          );
        } catch (e) {
          if (activo) setError(e?.message ?? "No se pudo cargar la ficha.");
        }
      }

      if (activo) {
        setCargando(false);
        listo.current = true;
      }
    })();

    return () => {
      activo = false;
    };
  }, [asignacionId, meliponario.ficha_id]);

  // Guarda el avance en el teléfono mientras se captura.
  useEffect(() => {
    if (!listo.current) return;
    guardarBorradorFicha(asignacionId, { respuestas, observaciones });
  }, [respuestas, observaciones, asignacionId]);

  const visibles = preguntasVisibles(respuestas);
  const contestadas = visibles.filter(
    (p) => respuestas[p.id]?.seleccion?.length
  ).length;

  const enviar = async () => {
    const problema = validarFicha(respuestas);

    if (problema) {
      setError(problema);
      return;
    }

    setEnviando(true);
    setError("");

    try {
      await guardarFichaTecnicaRequest(asignacionId, respuestas, observaciones);
      aviso("Ficha técnica enviada", "La inspección quedó registrada.");
      navigation.goBack();
    } catch (e) {
      setError(
        (e?.message ?? "No se pudo enviar la ficha.") +
        " Tus respuestas siguen guardadas en este teléfono."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.green} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>ENCUESTA · FICHA TÉCNICA</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>
            {meliponario.nombre_meliponario || "Meliponario"}
          </Text>
          <Text style={styles.meta}>
            {meliponario.localidad_nombre || "Localidad no disponible"} ·
            Inspección presencial
          </Text>

          {!!origen && (
            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.green} />
              <Text style={styles.noteText}>{origen}</Text>
            </View>
          )}

          <Text style={styles.progress}>
            {contestadas} de {visibles.length} preguntas respondidas
          </Text>

          {visibles.map((p, i) => (
            <Pregunta
              key={p.id}
              numero={i + 1}
              pregunta={p}
              valor={respuestas[p.id]}
              onChange={(v) => setRespuestas((r) => ({ ...r, [p.id]: v }))}
            />
          ))}

          <Text style={styles.label}>Observaciones (opcional)</Text>
          <TextInput
            style={styles.textArea}
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            textAlignVertical="top"
            maxLength={2000}
            placeholder="Notas de la visita..."
            placeholderTextColor={COLORS.gray}
          />

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, enviando && { opacity: 0.6 }]}
            onPress={enviar}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryText}>Enviar ficha técnica</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Tus respuestas se guardan en el teléfono mientras capturas, aunque
            no tengas señal.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 12 },
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
  meta: { fontSize: 13, color: COLORS.gray, marginTop: 4 },
  note: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.softGreen,
  },
  noteText: { flex: 1, fontSize: 13, color: "#253C30", lineHeight: 19 },
  progress: { fontSize: 13, fontWeight: "800", color: COLORS.green, marginTop: 14, marginBottom: 6 },

  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
  },
  qNumber: { fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#926000" },
  qTitle: { fontSize: 16, fontWeight: "900", color: COLORS.green, marginTop: 4, lineHeight: 22 },
  qHelp: { fontSize: 12, color: COLORS.gray, marginTop: 4, marginBottom: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F5F7F1",
    marginTop: 6,
  },
  optionActive: { backgroundColor: COLORS.softGreen, borderWidth: 1, borderColor: COLORS.primary },
  optionText: { flex: 1, fontSize: 15, color: "#253C30" },
  otroInput: {
    marginTop: 6,
    marginLeft: 34,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.green,
  },

  label: { fontSize: 15, fontWeight: "900", color: COLORS.green, marginTop: 20 },
  textArea: {
    marginTop: 6,
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 12,
    fontSize: 15,
    color: COLORS.green,
  },
  errorBox: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  errorText: { flex: 1, color: COLORS.red, fontSize: 13, lineHeight: 19 },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  primaryText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  hint: { fontSize: 12, color: COLORS.gray, textAlign: "center", marginTop: 10 },
});

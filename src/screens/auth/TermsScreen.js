import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../theme/colors";
import { TERMINOS, TERMINOS_VERSION } from "../../legal/terminos";


export default function TermsScreen({ navigation, route }) {
  // Desde «Crear cuenta» se puede aceptar aquí mismo.
  const puedeAceptar = Boolean(route.params?.desdeRegistro);

  // popTo regresa a la pantalla de registro existente (conserva lo
  // que el usuario ya escribió) en lugar de abrir una nueva.
  const aceptar = () => {
    navigation.popTo("Register", { aceptoTerminos: true }, { merge: true });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Términos y condiciones</Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Términos y condiciones de uso y aviso de privacidad de KaabMap.
        </Text>
        <Text style={styles.version}>Versión del {TERMINOS_VERSION}</Text>

        {TERMINOS.map((s) => (
          <View key={s.titulo} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.titulo}</Text>
            <Text style={styles.sectionText}>{s.texto}</Text>
          </View>
        ))}

        {puedeAceptar && (
          <TouchableOpacity
            style={styles.primary}
            onPress={aceptar}
            accessibilityRole="button"
          >
            <Text style={styles.primaryText}>He leído y acepto</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: COLORS.primaryDark },
  content: { padding: 20, paddingBottom: 40, maxWidth: 640, width: "100%", alignSelf: "center" },
  intro: { fontSize: 16, lineHeight: 23, color: COLORS.text ?? COLORS.primaryDark },
  version: { fontSize: 12, color: COLORS.gray, marginTop: 4, marginBottom: 8 },
  section: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: COLORS.primaryDark },
  sectionText: { fontSize: 14, lineHeight: 21, color: COLORS.text ?? "#253C30", marginTop: 6 },
  primary: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
});

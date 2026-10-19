import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";
import { openLogin, openRegister } from "../../navigation/navigationRef";

export default function GuestAccountScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name="person-outline" size={38} color={COLORS.primaryDark} />
        </View>
        <Text style={styles.title}>Tu cuenta de KaabMap</Text>
        <Text style={styles.text}>
          Puedes explorar el mapa sin registrarte. Inicia sesión para registrar un
          meliponario, administrar tus productos o acceder a funciones de tu perfil.
        </Text>

        <TouchableOpacity style={styles.primary} onPress={() => openLogin()}>
          <Text style={styles.primaryText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => openRegister()}>
          <Text style={styles.secondaryText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  icon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.primarySoft || "#E8F0E9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: COLORS.primaryDark,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 16,
    textAlign: "center",
  },
  text: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 9,
    marginBottom: 22,
  },
  primary: {
    width: "100%",
    minHeight: 52,
    borderRadius: 27,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: COLORS.white, fontWeight: "900", fontSize: 15 },
  secondary: {
    width: "100%",
    minHeight: 50,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryText: { color: COLORS.primaryDark, fontWeight: "900", fontSize: 15 },
});

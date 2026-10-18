import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useFocusEffect,
} from "@react-navigation/native";

import AppLogo
  from "../../components/AppLogo";

import {
  comprobarVerificacionCorreo,
  reenviarCorreoConfirmacion,
} from "../../services/authApi";

import {
  COLORS,
} from "../../theme/colors";

export default function EmailVerificationPendingScreen({
  navigation,
  route,
}) {
  const email =
    route.params?.email || "";

  const [checking, setChecking] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const verificarEstado =
    useCallback(async () => {
      if (!email || checking) {
        return;
      }

      try {
        setChecking(true);

        const response =
          await comprobarVerificacionCorreo(
            email
          );

        if (
          response?.verified === true
        ) {
          navigation.replace(
            "EmailVerified",
            {
              email,
            }
          );
        }
      } catch (error) {
        console.log(
          "Error comprobando correo:",
          error
        );
      } finally {
        setChecking(false);
      }
    }, [
      email,
      checking,
      navigation,
    ]);

  /*
   * Cada vez que el usuario vuelve
   * a esta pantalla comprobamos
   * nuevamente con la API.
   *
   * Esto resulta útil si salió de
   * KaabMap para abrir su correo.
   */
  useFocusEffect(
    useCallback(() => {
      verificarEstado();
    }, [verificarEstado])
  );

  const reenviar = async () => {
    try {
      setResending(true);

      await reenviarCorreoConfirmacion(
        email
      );

      Alert.alert(
        "Correo enviado",
        "Te enviamos un nuevo enlace de confirmación."
      );
    } catch (error) {
      Alert.alert(
        "No se pudo reenviar",
        error?.message ||
          "Inténtalo nuevamente."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.screen}
    >
      <View style={styles.container}>
        <AppLogo />

        <View
          style={styles.iconContainer}
        >
          <Ionicons
            name="mail-outline"
            size={42}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.title}>
          Revisa tu correo
        </Text>

        <Text style={styles.description}>
          Enviamos un enlace de
          confirmación a:
        </Text>

        <Text style={styles.email}>
          {email}
        </Text>

        <View style={styles.warning}>
          <Ionicons
            name="time-outline"
            size={22}
            color="#8A6200"
          />

          <Text
            style={styles.warningText}
          >
            Esperando confirmación de
            correo. Aún no puedes
            acceder a tu cuenta.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={verificarEstado}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Ya confirmé mi correo
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.help}>
          ¿No recibiste el correo?
        </Text>

        <TouchableOpacity
          onPress={reenviar}
          disabled={resending}
        >
          <Text style={styles.link}>
            {resending
              ? "Reenviando..."
              : "Reenviar enlace"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        COLORS.cream,
    },

    container: {
      flex: 1,
      paddingHorizontal: 25,
      justifyContent: "center",
      alignItems: "center",
      maxWidth: 480,
      width: "100%",
      alignSelf: "center",
    },

    iconContainer: {
      width: 82,
      height: 82,

      borderRadius: 41,

      backgroundColor:
        COLORS.primarySoft,

      alignItems: "center",
      justifyContent: "center",

      marginTop: 32,
      marginBottom: 22,
    },

    title: {
      color:
        COLORS.primaryDark,

      fontSize: 25,

      fontWeight: "900",

      textAlign: "center",
    },

    description: {
      color: COLORS.gray,

      textAlign: "center",

      marginTop: 12,

      fontSize: 14,
    },

    email: {
      color:
        COLORS.primaryDark,

      fontWeight: "800",

      marginTop: 5,
    },

    warning: {
      width: "100%",

      marginTop: 24,

      borderRadius: 16,

      backgroundColor: "#FFF2C9",

      padding: 15,

      flexDirection: "row",

      alignItems: "flex-start",

      gap: 10,
    },

    warningText: {
      flex: 1,

      color: "#785600",

      fontSize: 12,

      lineHeight: 18,
    },

    primaryButton: {
      width: "100%",

      minHeight: 52,

      borderRadius: 26,

      backgroundColor:
        COLORS.primaryDark,

      alignItems: "center",
      justifyContent: "center",

      marginTop: 24,
    },

    primaryButtonText: {
      color: "#FFFFFF",

      fontWeight: "900",
    },

    help: {
      color: COLORS.gray,

      marginTop: 22,

      fontSize: 12,
    },

    link: {
      color: COLORS.primary,

      fontWeight: "900",

      marginTop: 5,
    },
  });
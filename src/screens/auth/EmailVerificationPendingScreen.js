import React, {
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import PrimaryButton
  from "../../components/PrimaryButton";

import {
  resendVerificationRequest,
} from "../../services/authApi";

import {
  COLORS,
} from "../../theme/colors";


export default function EmailVerificationPendingScreen({
  navigation,
  route,
}) {
  const email =
    route?.params
      ?.email ??
    "";

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");


  const handleResend =
    async () => {
      setMessage("");
      setError("");

      try {
        setLoading(true);

        await resendVerificationRequest(
          email
        );

        setMessage(
          "Te enviamos un nuevo enlace de confirmación."
        );

      } catch (err) {
        console.error(
          "RESEND ERROR:",
          err
        );

        setError(
          err?.message ||
            "No se pudo reenviar el correo."
        );

      } finally {
        setLoading(false);
      }
    };


  return (
    <SafeAreaView
      style={
        styles.screen
      }
    >
      <View
        style={
          styles.content
        }
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <Ionicons
            name="mail-outline"
            size={48}
            color={
              COLORS.primary
            }
          />
        </View>

        <Text
          style={
            styles.title
          }
        >
          Revisa tu correo
        </Text>

        <Text
          style={
            styles.text
          }
        >
          Te enviamos un enlace
          para confirmar tu cuenta
          a:
        </Text>

        <Text
          style={
            styles.email
          }
        >
          {email}
        </Text>

        <Text
          style={
            styles.help
          }
        >
          Abre el mensaje y pulsa
          el enlace de confirmación.
        </Text>

        {message ? (
          <Text
            style={
              styles.success
            }
          >
            {message}
          </Text>
        ) : null}

        {error ? (
          <Text
            style={
              styles.error
            }
          >
            {error}
          </Text>
        ) : null}

        <PrimaryButton
          title={
            loading
              ? "Reenviando..."
              : "Reenviar correo"
          }
          outline
          disabled={
            loading
          }
          onPress={
            handleResend
          }
        />

        <PrimaryButton
          title="Ir a iniciar sesión"
          onPress={() =>
            navigation.navigate(
              "Login",
              {
                email,
              }
            )
          }
          style={{
            marginTop: 10,
          }}
        />
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

    content: {
      flex: 1,
      justifyContent:
        "center",
      padding: 28,
    },

    iconContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignSelf:
        "center",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EAF4EC",
      marginBottom: 22,
    },

    title: {
      textAlign:
        "center",
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 27,
      fontWeight: "900",
    },

    text: {
      textAlign:
        "center",
      color:
        COLORS.gray,
      marginTop: 12,
    },

    email: {
      textAlign:
        "center",
      color:
        COLORS.primary,
      fontWeight: "900",
      marginTop: 6,
    },

    help: {
      textAlign:
        "center",
      color:
        COLORS.gray,
      marginTop: 18,
      marginBottom: 25,
    },

    success: {
      color:
        COLORS.primary,
      textAlign:
        "center",
      marginBottom: 12,
    },

    error: {
      color:
        "#B42318",
      textAlign:
        "center",
      marginBottom: 12,
    },
  });
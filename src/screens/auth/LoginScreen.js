import React, {
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import AppLogo
  from "../../components/AppLogo";

import FormInput
  from "../../components/FormInput";

import PrimaryButton
  from "../../components/PrimaryButton";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  validateEmail,
} from "../../utils/validators";

import {
  COLORS,
} from "../../theme/colors";


export default function LoginScreen({
  navigation,
  route,
}) {
  const {
    login,
  } = useAuth();

  const [
    email,
    setEmail,
  ] =
    useState(
      route?.params
        ?.email ??
      ""
    );

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  const handleLogin =
    async () => {
      setError("");

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (!normalizedEmail) {
        setError(
          "Ingresa tu correo electrónico."
        );
        return;
      }

      if (
        !validateEmail(
          normalizedEmail
        )
      ) {
        setError(
          "Ingresa un correo electrónico válido."
        );
        return;
      }

      if (!password) {
        setError(
          "Ingresa tu contraseña."
        );
        return;
      }

      try {
        setLoading(true);

        console.log(
          "Intentando login..."
        );

        const result =
          await login(
            normalizedEmail,
            password
          );

        console.log(
          "LOGIN CORRECTO:",
          result.user
            ?.email
        );

        console.log(
          "PERFIL:",
          result.perfil
        );

        /*
         * AuthStack está dentro del
         * navigator raíz.
         */
        navigation
          .getParent()
          ?.reset({
            index: 0,

            routes: [
              {
                name:
                  "MainApp",
              },
            ],
          });

      } catch (err) {
        console.error(
          "LOGIN ERROR:",
          err
        );

        const message =
          err?.message ??
          "";

        if (
          message ===
          "Invalid login credentials"
        ) {
          setError(
            "Correo o contraseña incorrectos."
          );

        } else if (
          message ===
          "Email not confirmed"
        ) {
          setError(
            "Debes confirmar tu correo antes de iniciar sesión."
          );

        } else {
          setError(
            message ||
              "No se pudo iniciar sesión."
          );
        }

      } finally {
        setLoading(false);
      }
    };


  return (
    <ScrollView
      contentContainerStyle={
        styles.screen
      }
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={
          styles.container
        }
      >
        <AppLogo />

        <Text
          style={
            styles.title
          }
        >
          Iniciar sesión
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Accede a tu cuenta
          de KaabMap
        </Text>

        <FormInput
          label="Correo electrónico"
          value={email}
          onChangeText={
            setEmail
          }
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormInput
          label="Contraseña"
          value={password}
          onChangeText={
            setPassword
          }
          placeholder="Tu contraseña"
          secureTextEntry={
            !showPassword
          }
          rightIcon={
            showPassword
              ? "eye-outline"
              : "eye-off-outline"
          }
          onRightIconPress={() =>
            setShowPassword(
              (value) =>
                !value
            )
          }
        />

        {error ? (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "ForgotPassword"
            )
          }
          style={
            styles.forgot
          }
        >
          <Text
            style={
              styles.link
            }
          >
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          title={
            loading
              ? "Iniciando sesión..."
              : "Iniciar sesión"
          }
          disabled={
            loading
          }
          onPress={
            handleLogin
          }
        />

        <View
          style={
            styles.registerRow
          }
        >
          <Text>
            ¿No tienes cuenta?{" "}
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "Register"
              )
            }
          >
            <Text
              style={
                styles.link
              }
            >
              Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}


const styles =
  StyleSheet.create({
    screen: {
      flexGrow: 1,
      backgroundColor:
        COLORS.cream,
      justifyContent:
        "center",
    },

    container: {
      padding: 24,
    },

    title: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 28,
      fontWeight: "900",
      marginTop: 24,
    },

    subtitle: {
      color:
        COLORS.gray,
      marginTop: 6,
      marginBottom: 20,
    },

    errorBox: {
      backgroundColor:
        "#FDECEC",
      padding: 12,
      borderRadius: 10,
      marginTop: 10,
    },

    errorText: {
      color:
        "#B42318",
    },

    forgot: {
      alignSelf:
        "flex-end",
      marginVertical: 16,
    },

    link: {
      color:
        COLORS.primary,
      fontWeight: "800",
    },

    registerRow: {
      flexDirection:
        "row",
      justifyContent:
        "center",
      marginTop: 22,
    },
  });
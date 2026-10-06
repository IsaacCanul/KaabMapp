import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  styles,
} from "./LoginScreen.styles";

import {
  validarEmail,
  validarPassword,
} from "../../utils/validators";

export default function LoginScreen({
  navigation,
}) {
   const irARegistro = () => {
    navigation.navigate("Registro")
  };

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    remember,
    setRemember,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const handleLogin = () => {
    setError("");

    const errorEmail =
      validarEmail(email);

    if (errorEmail !== "") {
      setError(errorEmail);
      return;
    }

    const errorPassword =
      validarPassword(password);

    if (errorPassword !== "") {
      setError(errorPassword);
      return;
    }

    console.log(
      "Datos correctos"
    );

    console.log(
      "Correo:",
      email.trim()
    );

    console.log(
      "Recordar:",
      remember
    );

    /*
      Más adelante aquí llamaremos:

      login(email, password)

      desde:

      services/authService.js
    */
  };

  const togglePassword = () => {
    setShowPassword(
      !showPassword
    );
  };

  const toggleRemember = () => {
    setRemember(!remember);
  };

  const volver = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAF8F1"
      />

      {/* HOJAS SUPERIORES */}

      <Image
        source={require("../../../assets/leaves-top.png")}
        style={styles.leavesTop}
        resizeMode="stretch"
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={
              styles.screenContent
            }
          >
            {/* VOLVER */}

            <TouchableOpacity
              style={
                styles.backButton
              }
              activeOpacity={0.7}
              onPress={volver}
            >
              <Ionicons
                name="chevron-back"
                size={27}
                color="#06492E"
              />
            </TouchableOpacity>

            {/* LOGO */}

            <View
              style={
                styles.logoSection
              }
            >
              <Image
                source={require("../../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text
                style={styles.brand}
              >
                MeliponApp
              </Text>

              <Text
                style={
                  styles.tagline
                }
              >
                Abejas nativas,
                territorios vivos
              </Text>
            </View>

            {/* FORMULARIO */}

            <View
              style={styles.loginCard}
            >
              <Text
                style={styles.title}
              >
                Bienvenido de vuelta
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Inicia sesión para
                acceder a tu cuenta
              </Text>

              {/* CORREO */}

              <Text
                style={styles.label}
              >
                Correo electrónico
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color="#8A8A8A"
                />

                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={
                    setEmail
                  }
                />
              </View>

              {/* CONTRASEÑA */}

              <Text
                style={styles.label}
              >
                Contraseña
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#8A8A8A"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  value={password}
                  onChangeText={
                    setPassword
                  }
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={
                    togglePassword
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={23}
                    color="#8A8A8A"
                  />
                </TouchableOpacity>
              </View>

              {/* ERROR */}

              {error !== "" && (
                <View
                  style={
                    styles.errorContainer
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#B42318"
                  />

                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {error}
                  </Text>
                </View>
              )}

              {/* OPCIONES */}

              <View
                style={
                  styles.optionsRow
                }
              >
                <TouchableOpacity
                  style={
                    styles.rememberContainer
                  }
                  activeOpacity={0.7}
                  onPress={
                    toggleRemember
                  }
                >
                  <View
                    style={[
                      styles.checkbox,

                      remember &&
                        styles.checkboxActive,
                    ]}
                  >
                    {remember && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  <Text
                    style={
                      styles.rememberText
                    }
                  >
                    Recuérdame
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log(
                      "Recuperar contraseña"
                    );
                  }}
                >
                  <Text
                    style={
                      styles.forgotPassword
                    }
                  >
                    ¿Olvidaste tu
                    contraseña?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ACCEDER */}

              <TouchableOpacity
                style={
                  styles.loginButton
                }
                activeOpacity={0.85}
                onPress={
                  handleLogin
                }
              >
                <Text
                  style={
                    styles.loginButtonText
                  }
                >
                  Acceder
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={23}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* REGISTRO */}

              <View
                style={
                  styles.registerContainer
                }
              >
                <Text
                  style={
                    styles.registerNormal
                  }
                >
                  ¿Aún no tienes
                  cuenta?
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={irARegistro}
                >
                  <Text
                    style={
                      styles.registerLink
                    }
                  >
                    Regístrate
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* HOJAS INFERIORES */}

      <Image
        source={require("../../../assets/leaves-bottom.png")}
        style={styles.leavesBottom}
        resizeMode="stretch"
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}
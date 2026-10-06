import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./RegisterScreen.styles";

import {
  validarEmail,
  validarPassword,
  validarNombre,
  validarTel,
  validarConfirmPass,
  validarTelefono,
  validarApellido,
}from "../../utils/validators"
import HomeScreen from "../HomeScreens";

export default function RegisterScreen({
  navigation,
}) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [aceptaTerminos, setAceptaTerminos] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] = useState("");

  const volver = () => {
    navigation.goBack();
  };

  const irALogin = () => {
    navigation.navigate("Login");
  };

  const irAlHome = () => {
    navigation.navigate("Home");
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(
      !showConfirmPassword
    );
  };

  const toggleTerminos = () => {
    setAceptaTerminos(
      !aceptaTerminos
    );
  };

  const handleRegister = () => {
    setError ("");

    const errorNombre = validarNombre(nombre);

    if (errorNombre !== ""){
      setError(errorNombre);
      return;
    }

    const errorApeliido = validarApellido(apellido);

    if (errorApeliido !== ""){
      setError(errorApeliido);
      return;
    }
    
    const errorEmail = validarEmail(email);

    if (errorEmail !== ""){
      setError(errorEmail);
      return;
    }
    const errorTel = validarTelefono(telefono);

    if (errorTel !== ""){
      setError(errorTel);
      return;
    }

    const errorPassword = validarPassword(password);

    if (errorPassword !== ""){
      setError(errorPassword);
      return;
    }

    const errorConfirmPass = validarConfirmPass(password, confirmPassword);

    if (errorConfirmPass !== ""){
      setError(errorConfirmPass);
      return;
    }

    if (!aceptaTerminos){
      setError("Debes aceptar los terminos y condiciones")
      return;
    }

    console.log("Formulario valido");

    const nuevoUsuario = {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    telefono: telefono.trim(),
    password,
    };

    console.log("Usuario preparado:", nuevoUsuario);
   
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAF8F1"
      />

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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
              onPress={volver}
            >
              <Ionicons
                name="chevron-back"
                size={27}
                color="#06492E"
              />
            </TouchableOpacity>

            {/* LOGO */}

            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brand}>
              MeliponApp
            </Text>

            <Text
              style={styles.tagline}
            >
              Abejas nativas,
              territorios vivos
            </Text>

            {/* FORMULARIO */}

            <View
              style={styles.card}
            >
              <Text
                style={styles.title}
              >
                Crear cuenta
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Regístrate para comenzar
                a utilizar KaabMap
              </Text>

              {/* NOMBRE */}

              <Text style={styles.label}>
                Nombre(s)
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#8A8A8A"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor="#A0A0A0"
                  value={nombre}
                  onChangeText={
                    setNombre
                  }
                />
              </View>
              {/* APELLIDO */}

              <Text style={styles.label}>
                Apellido
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#8A8A8A"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Tu apellido"
                  placeholderTextColor="#A0A0A0"
                  value={apellido}
                  onChangeText={
                    setApellido
                  }
                />
              </View>


              {/* EMAIL */}

              <Text style={styles.label}>
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

              {/* TELÉFONO */}

              <Text style={styles.label}>
                Teléfono
              </Text>

              <View
                style={
                  styles.inputContainer
                }
              >
                <Ionicons
                  name="call-outline"
                  size={22}
                  color="#8A8A8A"
                />

                <TextInput
                  style={styles.input}
                  placeholder="9991234567"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  value={telefono}
                  onChangeText={
                    setTelefono
                  }
                />
              </View>

              {/* CONTRASEÑA */}

              <Text style={styles.label}>
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
                  placeholder="Contraseña"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={
                    !showPassword
                  }
                  value={password}
                  onChangeText={
                    setPassword
                  }
                />

                <TouchableOpacity
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

              {/* CONFIRMAR CONTRASEÑA */}

              <Text style={styles.label}>
                Confirmar contraseña
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
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  value={
                    confirmPassword
                  }
                  onChangeText={
                    setConfirmPassword
                  }
                />

                <TouchableOpacity
                  onPress={
                    toggleConfirmPassword
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword
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

              {/* TÉRMINOS */}

              <TouchableOpacity
                style={
                  styles.termsContainer
                }
                onPress={
                  toggleTerminos
                }
              >
                <View
                  style={[
                    styles.checkbox,

                    aceptaTerminos &&
                      styles.checkboxActive,
                  ]}
                >
                  {aceptaTerminos && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#FFFFFF"
                    />
                  )}
                </View>

                <Text
                  style={
                    styles.termsText
                  }
                >
                  Acepto los términos y
                  condiciones
                </Text>
              </TouchableOpacity>

              {/* CREAR CUENTA */}

              <TouchableOpacity
                style={
                  styles.registerButton
                }
                activeOpacity={0.85}
                onPress={
                  irAlHome
                }
              >
                <Text
                  style={
                    styles.registerButtonText
                  }
                >
                  Crear cuenta
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={23}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* LOGIN */}

              <View
                style={
                  styles.loginContainer
                }
              >
                <Text
                  style={
                    styles.loginNormal
                  }
                >
                  ¿Ya tienes cuenta?
                </Text>

                <TouchableOpacity
                  onPress={irALogin}
                >
                  <Text
                    style={
                      styles.loginLink
                    }
                  >
                    Inicia sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Image
        source={require("../../../assets/leaves-bottom.png")}
        style={styles.leavesBottom}
        resizeMode="stretch"
        pointerEvents="none"
      />
    </SafeAreaView>
  );
}
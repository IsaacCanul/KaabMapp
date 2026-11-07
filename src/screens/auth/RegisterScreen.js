import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import AppLogo
  from "../../components/AppLogo";

import {
  registerRequest,
} from "../../services/authApi";

import {
  COLORS,
} from "../../theme/colors";

import {
  authStyles as styles,
} from "./auth.styles";


export default function RegisterScreen({
  navigation,
}) {
  const [form, setForm] =
    useState({
      nombre: "",
      apellidos: "",
      email: "",
      telefono: "",
      institucionEmpresa: "",
      password: "",
      confirmPassword: "",
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  const setField = (
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,
        [key]: value,
      })
    );
  };


  const handleRegister =
    async () => {
      setError("");

      const nombre =
        String(
          form.nombre ?? ""
        ).trim();

      const apellidos =
        String(
          form.apellidos ?? ""
        ).trim();

      const email =
        String(
          form.email ?? ""
        )
          .trim()
          .toLowerCase();

      const telefono =
        String(
          form.telefono ?? ""
        ).trim();

      const institucion =
        String(
          form.institucionEmpresa ??
          ""
        ).trim();

      const password =
        form.password ?? "";

      const confirmPassword =
        form.confirmPassword ?? "";


      /*
       * =========================
       * VALIDACIONES
       * =========================
       */

      if (!nombre) {
        setError(
          "Escribe tu nombre."
        );
        return;
      }

      if (!apellidos) {
        setError(
          "Escribe tus apellidos."
        );
        return;
      }

      if (!email) {
        setError(
          "Escribe tu correo electrónico."
        );
        return;
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(email)
      ) {
        setError(
          "Escribe un correo electrónico válido."
        );
        return;
      }

      if (!telefono) {
        setError(
          "Escribe un número telefónico."
        );
        return;
      }

      if (!password) {
        setError(
          "Escribe una contraseña."
        );
        return;
      }

      if (
        password.length < 8
      ) {
        setError(
          "La contraseña debe tener al menos 8 caracteres."
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Las contraseñas no coinciden."
        );
        return;
      }


      /*
       * =========================
       * REGISTRO EN SUPABASE
       * =========================
       */

      try {
        setLoading(true);

        console.log(
          "Creando cuenta..."
        );

        const result =
          await registerRequest({
            nombre,
            apellidos,
            email,
            telefono,
            institucion,
            password,
          });

        console.log(
          "USUARIO CREADO:",
          result.user?.email
        );

        console.log(
          "REQUIERE CONFIRMACIÓN:",
          result.requiresVerification
        );


        /*
         * Si Supabase exige
         * confirmación de correo:
         */
        if (
          result.requiresVerification
        ) {
          navigation.replace(
            "EmailVerificationPending",
            {
              email,
            }
          );

          return;
        }


        /*
         * Si Supabase tiene desactivada
         * la confirmación de correo,
         * puede devolver sesión
         * inmediatamente.
         *
         * Aun así mandamos al Login.
         */
        navigation.replace(
          "Login",
          {
            email,
          }
        );

      } catch (err) {
        console.error(
          "REGISTER ERROR:",
          err
        );

        const message =
          err?.message ?? "";

        const lower =
          message.toLowerCase();


        if (
          lower.includes(
            "already registered"
          ) ||
          lower.includes(
            "already been registered"
          )
        ) {
          setError(
            "Ya existe una cuenta con este correo."
          );

        } else if (
          lower.includes(
            "invalid api key"
          )
        ) {
          setError(
            "La configuración de Supabase no es válida."
          );

        } else if (
          lower.includes(
            "password"
          )
        ) {
          setError(
            message
          );

        } else {
          setError(
            message ||
              "No se pudo crear la cuenta."
          );
        }

      } finally {
        setLoading(false);
      }
    };


  return (
    <SafeAreaView
      style={styles.screen}
      edges={[
        "top",
        "bottom",
      ]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* BOTÓN REGRESAR */}
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="chevron-back"
            size={23}
            color={
              COLORS.primaryDark
            }
          />
        </TouchableOpacity>


        {/* LOGO */}
        <View
          style={
            styles.logoWrap
          }
        >
          <AppLogo compact />
        </View>


        {/* TÍTULO */}
        <Text
          style={
            styles.title
          }
        >
          Crear cuenta
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Únete a KaabMap para
          registrar meliponarios y
          administrar la información
          de tu perfil.
        </Text>


        {/* NOMBRE + APELLIDOS */}
        <View
          style={
            styles.row
          }
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.label
              }
            >
              Nombre(s)
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                form.nombre
              }
              onChangeText={
                (value) =>
                  setField(
                    "nombre",
                    value
                  )
              }
              placeholder="Nombre"
              placeholderTextColor={
                COLORS.gray
              }
            />
          </View>


          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              style={
                styles.label
              }
            >
              Apellidos
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                form.apellidos
              }
              onChangeText={
                (value) =>
                  setField(
                    "apellidos",
                    value
                  )
              }
              placeholder="Apellidos"
              placeholderTextColor={
                COLORS.gray
              }
            />
          </View>
        </View>


        {/* CORREO */}
        <Text
          style={
            styles.label
          }
        >
          Correo electrónico
        </Text>

        <TextInput
          style={
            styles.input
          }
          value={
            form.email
          }
          onChangeText={
            (value) =>
              setField(
                "email",
                value
              )
          }
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="nombre@correo.com"
          placeholderTextColor={
            COLORS.gray
          }
        />


        {/* TELÉFONO */}
        <Text
          style={
            styles.label
          }
        >
          Teléfono
        </Text>

        <TextInput
          style={
            styles.input
          }
          value={
            form.telefono
          }
          onChangeText={
            (value) =>
              setField(
                "telefono",
                value
              )
          }
          keyboardType="phone-pad"
          placeholder="985 000 0000"
          placeholderTextColor={
            COLORS.gray
          }
        />


        {/* INSTITUCIÓN / EMPRESA */}
        <Text
          style={
            styles.label
          }
        >
          Institución o empresa
          (opcional)
        </Text>

        <TextInput
          style={
            styles.input
          }
          value={
            form.institucionEmpresa
          }
          onChangeText={
            (value) =>
              setField(
                "institucionEmpresa",
                value
              )
          }
          placeholder="Institución o empresa"
          placeholderTextColor={
            COLORS.gray
          }
        />


        {/* CONTRASEÑA */}
        <Text
          style={
            styles.label
          }
        >
          Contraseña
        </Text>

        <View
          style={
            styles.passwordRow
          }
        >
          <TextInput
            style={
              styles.passwordInput
            }
            value={
              form.password
            }
            onChangeText={
              (value) =>
                setField(
                  "password",
                  value
                )
            }
            secureTextEntry={
              !showPassword
            }
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={
              COLORS.gray
            }
          />

          <TouchableOpacity
            style={
              styles.eye
            }
            onPress={() =>
              setShowPassword(
                (value) =>
                  !value
              )
            }
          >
            <Ionicons
              name={
                showPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={21}
              color={
                COLORS.gray
              }
            />
          </TouchableOpacity>
        </View>


        {/* CONFIRMAR CONTRASEÑA */}
        <Text
          style={
            styles.label
          }
        >
          Confirmar contraseña
        </Text>

        <TextInput
          style={
            styles.input
          }
          value={
            form.confirmPassword
          }
          onChangeText={
            (value) =>
              setField(
                "confirmPassword",
                value
              )
          }
          secureTextEntry={
            !showPassword
          }
          placeholder="Repite tu contraseña"
          placeholderTextColor={
            COLORS.gray
          }
        />


        {/* ERROR */}
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


        {/* CREAR CUENTA */}
        <TouchableOpacity
          style={[
            styles.primary,

            loading &&
              styles.primaryDisabled,
          ]}
          disabled={
            loading
          }
          onPress={
            handleRegister
          }
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.primaryText
              }
            >
              Crear cuenta
            </Text>
          )}
        </TouchableOpacity>


        {/* NOTA */}
        <Text
          style={
            styles.bottomText
          }
        >
          El personal de campo debe
          ser creado o asignado
          desde el sistema
          administrativo.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
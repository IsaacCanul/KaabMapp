import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppLogo from "../../components/AppLogo";
import { useAuth } from "../../context/AuthContext";
import { closeAuthFlow } from "../../navigation/navigationRef";
import { validateEmail, validatePassword } from "../../utils/validators";
import { COLORS } from "../../theme/colors";
import { authStyles as styles } from "./auth.styles";

export default function LoginScreen({ navigation, route }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);
    const passwordError = validatePassword(password, { min: 6 });
    if (passwordError) return setError(passwordError);

    try {
      setLoading(true);
      const result = await login({ email, password });
      if (result?.requiresVerification) {
        navigation.navigate("Verification", { email: email.trim().toLowerCase(), phone: result?.user?.phone || "" });
        return;
      }
      closeAuthFlow();
    } catch (err) {
      setError(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={23} color={COLORS.primaryDark} />
        </TouchableOpacity>

        <View style={styles.logoWrap}><AppLogo /></View>

        <Text style={styles.title}>Inicia sesión</Text>
        <Text style={styles.subtitle}>Explorar KaabMap es público. Inicia sesión para registrar o administrar tus meliponarios.</Text>

        {route.params?.reason ? <View style={styles.infoBox}><Text style={styles.infoText}>{route.params.reason}</Text></View> : null}

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="nombre@correo.com" placeholderTextColor={COLORS.gray} />

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" placeholder="Tu contraseña" placeholderTextColor={COLORS.gray} />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPassword((value) => !value)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <TouchableOpacity style={[styles.primary, loading && styles.primaryDisabled]} disabled={loading} onPress={handleLogin}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("ForgotPassword")}><Text style={styles.link}>¿Olvidaste tu contraseña?</Text></TouchableOpacity>
        <Text style={styles.bottomText}>¿Aún no tienes cuenta? <Text style={styles.inlineLink} onPress={() => navigation.navigate("Register")}>Crear cuenta</Text></Text>
      </ScrollView>
    </SafeAreaView>
  );
}

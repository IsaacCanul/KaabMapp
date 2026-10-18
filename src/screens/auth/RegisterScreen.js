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

const USER_TYPES = [
  { value: "productor", label: "Productor / meliponicultor" },
  { value: "visitante", label: "Comprador / visitante" },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ nombre: "", apellidos: "", email: "", telefono: "", institucionEmpresa: "", tipoUsuario: "productor", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.nombre.trim()) return "Escribe tu nombre.";
    if (!form.apellidos.trim()) return "Escribe tus apellidos.";
    const emailError = validateEmail(form.email);
    if (emailError) return emailError;
    if (!form.telefono.trim()) return "Escribe un número telefónico.";
    const passwordError = validatePassword(form.password, { min: 8 });
    if (passwordError) return passwordError;
    if (form.password !== form.confirmPassword) return "Las contraseñas no coinciden.";
    return "";
  };

  const handleRegister = async () => {
    setError("");
    const validationError = validate();
    if (validationError) return setError(validationError);
    try {
      setLoading(true);
      const result = await register(form);
      if (result?.requiresVerification || !result?.accessToken) {
        navigation.navigate("Verification", { email: form.email.trim().toLowerCase(), phone: form.telefono.trim() });
        return;
      }
      closeAuthFlow();
    } catch (err) {
      setError(err?.message || "No fue posible crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={23} color={COLORS.primaryDark} /></TouchableOpacity>
        <View style={styles.logoWrap}><AppLogo compact /></View>

        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a KaabMap para registrar meliponarios y administrar la información de tu perfil.</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}><Text style={styles.label}>Nombre(s)</Text><TextInput style={styles.input} value={form.nombre} onChangeText={(v) => setField("nombre", v)} placeholder="Nombre" placeholderTextColor={COLORS.gray} /></View>
          <View style={{ flex: 1 }}><Text style={styles.label}>Apellidos</Text><TextInput style={styles.input} value={form.apellidos} onChangeText={(v) => setField("apellidos", v)} placeholder="Apellidos" placeholderTextColor={COLORS.gray} /></View>
        </View>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={(v) => setField("email", v)} autoCapitalize="none" keyboardType="email-address" placeholder="nombre@correo.com" placeholderTextColor={COLORS.gray} />
        <Text style={styles.label}>Teléfono</Text>
        <TextInput style={styles.input} value={form.telefono} onChangeText={(v) => setField("telefono", v)} keyboardType="phone-pad" placeholder="985 000 0000" placeholderTextColor={COLORS.gray} />

      

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput style={styles.passwordInput} value={form.password} onChangeText={(v) => setField("password", v)} secureTextEntry={!showPassword} placeholder="Mínimo 8 caracteres" placeholderTextColor={COLORS.gray} />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPassword((value) => !value)}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color={COLORS.gray} /></TouchableOpacity>
        </View>
        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput style={styles.input} value={form.confirmPassword} onChangeText={(v) => setField("confirmPassword", v)} secureTextEntry={!showPassword} placeholder="Repite tu contraseña" placeholderTextColor={COLORS.gray} />

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
        <TouchableOpacity style={[styles.primary, loading && styles.primaryDisabled]} disabled={loading} onPress={handleRegister}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Crear cuenta</Text>}</TouchableOpacity>
        <Text style={styles.bottomText}>El personal de campo debe ser creado o asignado desde el sistema administrativo.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

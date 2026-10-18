import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { validateEmail } from "../../utils/validators";
import { COLORS } from "../../theme/colors";
import { authStyles as styles } from "./auth.styles";

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const validationError = validateEmail(email);
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      setError("");
      await forgotPassword(email);
      setMessage("Si el correo está registrado, recibirás las instrucciones del servidor.");
    } catch (err) {
      setError(err?.message || "No se pudo solicitar la recuperación.");
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
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Escribe el correo asociado a tu cuenta.</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nombre@correo.com" placeholderTextColor={COLORS.gray} />
        {message ? <View style={styles.infoBox}><Text style={styles.infoText}>{message}</Text></View> : null}
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
        <TouchableOpacity style={[styles.primary, loading && styles.primaryDisabled]} onPress={send} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Enviar instrucciones</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export default function PrimaryButton({ title, onPress, icon, loading = false, disabled = false, outline = false, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, outline && styles.outline, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? COLORS.primary : COLORS.white} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={19} color={outline ? COLORS.primary : COLORS.white} style={styles.icon} /> : null}
          <Text style={[styles.text, outline && styles.textOutline]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  outline: { backgroundColor: COLORS.white, borderWidth: 1.2, borderColor: COLORS.primary },
  disabled: { opacity: 0.6 },
  text: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  textOutline: { color: COLORS.primary },
  icon: { marginRight: 7 },
});

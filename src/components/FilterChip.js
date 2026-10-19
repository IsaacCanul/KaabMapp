import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export default function FilterChip({ label, active = false, icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.chip, active && styles.active]}>
      {icon ? <Ionicons name={icon} size={14} color={active ? COLORS.primary : COLORS.gray} style={styles.icon} /> : null}
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  active: { backgroundColor: COLORS.primarySoft, borderColor: "#BFD8C4" },
  text: { fontSize: 12, color: COLORS.text, fontWeight: "600" },
  textActive: { color: COLORS.primary, fontWeight: "800" },
  icon: { marginRight: 5 },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../theme/colors";

export default function StatusBadge({ status }) {
  const active = status === "Activo";
  return (
    <View style={[styles.badge, active ? styles.active : styles.pending]}>
      <View style={[styles.dot, active ? styles.dotActive : styles.dotPending]} />
      <Text style={[styles.text, active ? styles.textActive : styles.textPending]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15 },
  active: { backgroundColor: COLORS.success },
  pending: { backgroundColor: COLORS.warning },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  dotActive: { backgroundColor: COLORS.successText },
  dotPending: { backgroundColor: COLORS.warningText },
  text: { fontSize: 10, fontWeight: "800" },
  textActive: { color: COLORS.successText },
  textPending: { color: COLORS.warningText },
});

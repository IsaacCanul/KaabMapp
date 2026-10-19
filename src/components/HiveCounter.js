import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export default function HiveCounter({ label, value, onChange, icon = "cube-outline" }) {
  const change = (delta) => onChange(Math.max(0, value + delta));
  return (
    <View style={styles.box}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={17} color={COLORS.primary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.circle} onPress={() => change(-1)}><Text style={styles.controlText}>−</Text></TouchableOpacity>
        <Text style={styles.value}>{value}</Text>
        <TouchableOpacity style={styles.circle} onPress={() => change(1)}><Text style={styles.controlText}>+</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, minWidth: 130, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, padding: 10, backgroundColor: COLORS.white },
  labelRow: { flexDirection: "row", alignItems: "center" },
  label: { color: COLORS.text, fontSize: 11, fontWeight: "700", marginLeft: 5 },
  controls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 9 },
  circle: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primarySoft, justifyContent: "center", alignItems: "center" },
  controlText: { color: COLORS.primaryDark, fontSize: 20, fontWeight: "800", lineHeight: 22 },
  value: { color: COLORS.primaryDark, fontSize: 18, fontWeight: "900" },
});

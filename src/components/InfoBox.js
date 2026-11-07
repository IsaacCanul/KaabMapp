import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export default function InfoBox({ title, children, warning = false }) {
  return (
    <View style={[styles.box, warning && styles.warning]}>
      <Ionicons name="information-circle-outline" size={22} color={warning ? COLORS.warningText : COLORS.primary} style={styles.icon} />
      <View style={{ flex: 1 }}>
        {title ? <Text style={[styles.title, warning && styles.warningTitle]}>{title}</Text> : null}
        <Text style={[styles.text, warning && styles.warningText]}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: "row", backgroundColor: COLORS.primarySoft2, borderRadius: 16, padding: 13, marginBottom: 14 },
  warning: { backgroundColor: COLORS.warning },
  icon: { marginRight: 9, marginTop: 1 },
  title: { color: COLORS.primaryDark, fontSize: 13, fontWeight: "800", marginBottom: 3 },
  text: { color: COLORS.gray, fontSize: 12.5, lineHeight: 18 },
  warningTitle: { color: COLORS.warningText },
  warningText: { color: COLORS.warningText },
});

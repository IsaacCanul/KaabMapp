import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../theme/colors";

export default function ScreenTitle({ eyebrow, title, subtitle }) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  eyebrow: { color: COLORS.primary, fontSize: 10, letterSpacing: 1.3, fontWeight: "900", marginBottom: 6 },
  title: { color: COLORS.primaryDark, fontSize: 31, lineHeight: 35, fontWeight: "900" },
  subtitle: { color: COLORS.gray, fontSize: 15, lineHeight: 22, marginTop: 8 },
});

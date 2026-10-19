import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../theme/colors";

export default function AppLogo({ compact = false }) {
  return (
    <View style={styles.row}>
      <Image
        source={require("../../assets/kaabmap-logo.png")}
        style={[styles.logo, compact && styles.logoCompact]}
        resizeMode="contain"
      />
      <View>
        <Text style={[styles.name, compact && styles.nameCompact]}>KaabMap</Text>
        {!compact && <Text style={styles.tagline}>Abejas nativas, territorios vivos</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  logo: { width: 56, height: 56, marginRight: 9 },
  logoCompact: { width: 38, height: 38, marginRight: 7 },
  name: { color: COLORS.primaryDark, fontSize: 26, fontWeight: "800" },
  nameCompact: { fontSize: 20 },
  tagline: { color: COLORS.honey, fontSize: 11, fontWeight: "600", marginTop: 1 },

});

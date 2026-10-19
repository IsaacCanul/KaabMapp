import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export default function Stepper({ current, total = 5 }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {Array.from({ length: total }).map((_, index) => {
          const step = index + 1;
          const done = step < current;
          const active = step === current;
          return (
            <React.Fragment key={step}>
              <View style={[styles.circle, done && styles.done, active && styles.active]}>
                {done ? <Ionicons name="checkmark" size={16} color={COLORS.white} /> : <Text style={[styles.num, (done || active) && styles.numLight]}>{step}</Text>}
              </View>
              {step < total ? <View style={[styles.line, step < current && styles.lineDone]} /> : null}
            </React.Fragment>
          );
        })}
      </View>
      <Text style={styles.label}>Paso {current} de {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  row: { flexDirection: "row", alignItems: "center" },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#ECEDE9", alignItems: "center", justifyContent: "center" },
  done: { backgroundColor: "#4F9B62" },
  active: { backgroundColor: COLORS.primary },
  num: { color: COLORS.gray, fontSize: 13, fontWeight: "800" },
  numLight: { color: COLORS.white },
  line: { flex: 1, height: 2, backgroundColor: "#DFE1DC" },
  lineDone: { backgroundColor: "#4F9B62" },
  label: { marginTop: 8, alignSelf: "flex-end", color: COLORS.primaryDark, fontSize: 13, fontWeight: "700" },
});

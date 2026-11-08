import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";


const ROUTES = [
  "RegisterStep1",
  "RegisterStep2",
  "RegisterStep3",
  "RegisterStep5",
];


export default function RegisterProgress({
  step = 1,
  navigation,
}) {
  const current = Math.min(
    4,
    Math.max(
      1,
      Number(step) || 1
    )
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {ROUTES.map((route, i) => {
          const number = i + 1;

          const finished =
            number < current;

          const active =
            number === current;

          return (
            <React.Fragment key={route}>
              {i > 0 && (
                <View
                  style={[
                    styles.line,
                    number <= current &&
                      styles.lineDone,
                  ]}
                />
              )}

              <TouchableOpacity
                accessibilityLabel={
                  `Ir al paso ${number}`
                }
                accessibilityRole="button"
                disabled={!finished}
                onPress={() =>
                  navigation.navigate(route)
                }
                style={[
                  styles.circle,
                  finished && styles.done,
                  active && styles.active,
                ]}
              >
                {finished ? (
                  <Ionicons
                    name="checkmark"
                    size={23}
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={[
                      styles.number,
                      active &&
                        styles.activeNumber,
                    ]}
                  >
                    {number}
                  </Text>
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      <Text style={styles.indicator}>
        Paso {current} de 4
      </Text>

      <Text style={styles.help}>
        Puedes tocar un paso anterior
        para volver rápidamente.
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  wrap: {
    paddingTop: 20,
    paddingBottom: 25,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E7E9E7",
    justifyContent: "center",
    alignItems: "center",
  },

  active: {
    backgroundColor: "#075A3D",
  },

  done: {
    backgroundColor: "#4BA16B",
  },

  number: {
    color: "#7A8680",
    fontWeight: "900",
    fontSize: 18,
  },

  activeNumber: {
    color: "#FFFFFF",
  },

  line: {
    height: 2,
    backgroundColor: "#E1E5E1",
    flex: 1,
  },

  lineDone: {
    backgroundColor: "#4BA16B",
  },

  indicator: {
    color: "#06492E",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 15,
  },

  help: {
    color: "#747A76",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
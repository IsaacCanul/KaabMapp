import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../theme/colors";

const GREEN = COLORS?.primaryDark || "#06492E";
const GOLD = COLORS?.honey || "#D9A514";
const WHITE = COLORS?.white || "#FFFFFF";
const GRAY = COLORS?.gray || "#66736D";
const BORDER = COLORS?.border || "#E6E6DE";

const icons = {
  Home: ["home", "home-outline"],
  Map: ["map", "map-outline"],
  Explore: ["compass", "compass-outline"],
  Profile: ["person", "person-outline"],
};

const labels = {
  Home: "Inicio",
  Map: "Mapa",
  Explore: "Explorar",
  Profile: "Cuenta",
};

export default function KaabBottomBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 7) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const names = icons[route.name] || ["ellipse", "ellipse-outline"];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.item}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons
                name={focused ? names[0] : names[1]}
                size={focused ? 22 : 21}
                color={focused ? WHITE : GRAY}
              />
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>
              {labels[route.name] || route.name}
            </Text>
            {focused ? <View style={styles.activeDot} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 67,
    paddingTop: 7,
    paddingHorizontal: 7,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  iconWrap: {
    width: 38,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: GREEN,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "700",
    color: GRAY,
  },
  labelActive: {
    color: GREEN,
    fontWeight: "900",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginTop: 2,
  },
});

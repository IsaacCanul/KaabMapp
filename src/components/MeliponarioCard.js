import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";
import StatusBadge from "./StatusBadge";

export default function MeliponarioCard({ item, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <Image source={item.imagen} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={styles.title}>{item.nombre}</Text>
          <StatusBadge status={item.estado} />
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.gray} />
          <Text style={styles.meta}>{item.municipio} · {item.distancia} km</Text>
        </View>

        <View style={styles.tags}>
          {item.especies.slice(0, 2).map((species) => (
            <View key={species} style={styles.tag}>
              <Text style={styles.tagText}>{species}</Text>
            </View>
          ))}
        </View>

        {item.productos ? (
          <View style={styles.productsRow}>
            <Ionicons name="cube-outline" size={15} color={COLORS.primary} />
            <Text style={styles.productsText}>Productos disponibles</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  image: { width: "100%", height: 170 },
  content: { padding: 14 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  title: { color: COLORS.primaryDark, fontSize: 16, fontWeight: "900", flex: 1, marginRight: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  meta: { color: COLORS.gray, fontSize: 12, marginLeft: 3 },
  tags: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  tag: { backgroundColor: COLORS.grayLight, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5, marginRight: 6, marginBottom: 5 },
  tagText: { color: COLORS.gray, fontSize: 10 },
  productsRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 6, paddingTop: 10 },
  productsText: { color: COLORS.primary, marginLeft: 7, fontSize: 12, fontWeight: "800" },
});

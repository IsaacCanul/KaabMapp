import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../theme/colors";

import StatusBadge from "./StatusBadge";

export default function MeliponarioCard({
  item,
  onPress,
}) {
  const especies = Array.isArray(item?.especies)
    ? item.especies
    : [];

  const productos = Array.isArray(
    item?.productosDisponibles
  )
    ? item.productosDisponibles
    : [];

  const obtenerNombreEspecie = (especie) => {
    if (typeof especie === "string") {
      return especie;
    }

    return especie?.nombre ?? "Especie";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons
          name="leaf-outline"
          size={46}
          color={COLORS.primary}
        />

        <Text style={styles.placeholderText}>
          KaabMap
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={2}
            style={styles.title}
          >
            {item?.nombre ?? "Meliponario"}
          </Text>

          <StatusBadge
            status={item?.estado ?? "Activo"}
          />
        </View>

        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={COLORS.gray}
          />

          <Text style={styles.meta}>
            {item?.localidad ??
              item?.municipio ??
              "Yucatán"}

            {item?.distancia != null
              ? ` · ${item.distancia} km`
              : ""}
          </Text>
        </View>

        <View style={styles.tags}>
          {especies
            .slice(0, 2)
            .map((especie, index) => {
              const nombre =
                obtenerNombreEspecie(especie);

              return (
                <View
                  key={`${nombre}-${index}`}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>
                    {nombre}
                  </Text>
                </View>
              );
            })}
        </View>

        {productos.length > 0 && (
          <View style={styles.productsRow}>
            <Ionicons
              name="cube-outline"
              size={15}
              color={COLORS.primary}
            />

            <Text style={styles.productsText}>
              Productos disponibles
            </Text>
          </View>
        )}
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
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  imagePlaceholder: {
    width: "100%",
    height: 170,
    backgroundColor:
      COLORS.cream ?? "#FAF8F1",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    marginTop: 8,
    color:
      COLORS.primaryDark ??
      COLORS.primary,
    fontWeight: "900",
    fontSize: 15,
  },

  content: {
    padding: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  title: {
    flex: 1,
    marginRight: 10,
    color:
      COLORS.primaryDark ??
      COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  meta: {
    marginLeft: 3,
    color: COLORS.gray,
    fontSize: 12,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  tag: {
    backgroundColor:
      COLORS.grayLight ??
      "#EDF4EA",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 5,
  },

  tagText: {
    color: COLORS.gray,
    fontSize: 10,
  },

  productsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 6,
    paddingTop: 10,
  },

  productsText: {
    marginLeft: 7,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
});
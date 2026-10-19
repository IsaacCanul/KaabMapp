import React, {
  useMemo,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import AppLogo
  from "../../components/AppLogo";

import FilterChip
  from "../../components/FilterChip";

import MeliponarioCard
  from "../../components/MeliponarioCard";

import {
  MELIPONARIOS,
} from "../../data/mockData";

import {
  COLORS,
} from "../../theme/colors";

export default function HomeScreen({
  navigation,
}) {
  const [search, setSearch] =
    useState("");

  const meliponarios =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return MELIPONARIOS;
      }

      return MELIPONARIOS.filter((item) => {
      const coincideNombre =
        item.nombre
          ?.toLowerCase()
          .includes(value);

      const coincideMunicipio =
        item.municipio
          ?.toLowerCase()
          .includes(value);

      const coincideLocalidad =
        item.localidad
          ?.toLowerCase()
          .includes(value);

      const coincideEspecie =
        item.especies?.some((especie) => {
          const nombre =
            typeof especie === "string"
              ? especie
              : especie?.nombre ?? "";

          return nombre
            .toLowerCase()
            .includes(value);
        });

      return (
        coincideNombre ||
        coincideMunicipio ||
        coincideLocalidad ||
        coincideEspecie
      );
    });
    }, [search]);

  const abrirDetalle = (
    item
  ) => {
    navigation.navigate(
      "MeliponarioDetail",
      {
        id: item.id,
      }
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <AppLogo />

          <TouchableOpacity
            style={
              styles.accountButton
            }
            onPress={() =>
              navigation
                .getParent()
                ?.navigate(
                  "Cuenta"
                )
            }
          >
            <Ionicons
              name="person-outline"
              size={22}
              color={
                COLORS.primary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <Text
          style={
            styles.eyebrow
          }
        >
          EXPLORA LA RUTA DE LA MIEL
        </Text>

        <Text style={styles.title}>
          Descubre la vida que
          florece{"\n"}
          en Yucatán.
        </Text>

        {/* Buscador */}
        <View
          style={
            styles.searchRow
          }
        >
          <View
            style={
              styles.searchBox
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={
                COLORS.primary
              }
            />

            <TextInput
              value={search}
              onChangeText={
                setSearch
              }
              placeholder="¿Dónde quieres explorar?"
              placeholderTextColor={
                COLORS.gray
              }
              style={
                styles.input
              }
            />
          </View>

          <TouchableOpacity
            style={
              styles.filterButton
            }
          >
            <Ionicons
              name="options-outline"
              size={23}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filters
          }
        >
          <FilterChip
            label="Cerca de mí"
            icon="location-outline"
            active
          />

          <FilterChip
            label="Especies"
            icon="leaf-outline"
          />

          <FilterChip
            label="Con productos"
            icon="cube-outline"
          />
        </ScrollView>

        {/* Sección */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Meliponarios cercanos
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation
                .getParent()
                ?.navigate(
                  "Explorar"
                )
            }
          >
            <Text
              style={
                styles.link
              }
            >
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        {meliponarios.length >
        0 ? (
          meliponarios.map(
            (item) => (
              <MeliponarioCard
                key={item.id}
                item={item}
                onPress={() =>
                  abrirDetalle(
                    item
                  )
                }
              />
            )
          )
        ) : (
          <View
            style={
              styles.empty
            }
          >
            <Ionicons
              name="search-outline"
              size={36}
              color={
                COLORS.gray
              }
            />

            <Text
              style={
                styles.emptyText
              }
            >
              No se encontraron
              meliponarios.
            </Text>
          </View>
        )}

        <View
          style={{
            height: 20,
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        COLORS.cream,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 30,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 24,
    },

    accountButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        COLORS.grayLight ??
        "#EAF4EC",
    },

    eyebrow: {
      color: COLORS.primary,
      fontSize: 10,
      letterSpacing: 1.3,
      fontWeight: "900",
      marginBottom: 8,
    },

    title: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 30,
      lineHeight: 34,
      fontWeight: "900",
      marginBottom: 22,
    },

    searchRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    searchBox: {
      flex: 1,
      height: 52,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      backgroundColor:
        COLORS.white,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
    },

    input: {
      flex: 1,
      marginLeft: 8,
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 14,
      outlineStyle: "none",
    },

    filterButton: {
      width: 52,
      height: 52,
      borderRadius: 16,
      marginLeft: 9,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        COLORS.primary,
    },

    filters: {
      paddingVertical: 14,
      paddingRight: 10,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop: 18,
      marginBottom: 12,
    },

    sectionTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 18,
      fontWeight: "900",
    },

    link: {
      color: COLORS.primary,
      fontSize: 12,
      fontWeight: "900",
    },

    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 50,
    },

    emptyText: {
      marginTop: 10,
      color: COLORS.gray,
    },
  });
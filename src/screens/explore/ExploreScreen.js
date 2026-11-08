
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import MeliponarioCard from "../../components/MeliponarioCard";

import {
  getMeliponariosPublicosRequest,
} from "../../services/meliponariosPublicosApi";

import { COLORS } from "../../theme/colors";

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function ExploreScreen({ navigation }) {
  const [busqueda, setBusqueda] = useState("");
  const [meliponarios, setMeliponarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargarMeliponarios() {
        setCargando(true);
        setError("");

        try {
          const data =
            await getMeliponariosPublicosRequest();

          if (activo) {
            setMeliponarios(
              Array.isArray(data) ? data : []
            );
          }
        } catch (e) {
          if (activo) {
            setMeliponarios([]);

            setError(
              e?.message ??
              "No se pudieron cargar los meliponarios."
            );
          }
        } finally {
          if (activo) setCargando(false);
        }
      }

      cargarMeliponarios();

      return () => {
        activo = false;
      };
    }, [revision])
  );

  const resultados = useMemo(() => {
    const termino = normalizar(busqueda);

    return meliponarios.filter((item) => {
      const especies = Array.isArray(item.especies)
        ? item.especies
            .map((e) =>
              typeof e === "string"
                ? e
                : e?.nombre ?? e?.nombre_comun ?? ""
            )
            .join(" ")
        : "";

      const contenido = normalizar([
        item.nombre,
        item.municipio,
        item.localidad,
        especies,
      ].join(" "));

      return !termino || contenido.includes(termino);
    });
  }, [meliponarios, busqueda]);

  const abrirDetalle = (item) => {
    navigation.navigate("MeliponarioDetail", {
      id: item.id ?? item.meliponario_id,
      meliponario: item,
    });
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top"]}
    >
      <FlatList
        data={resultados}
        keyExtractor={(item) =>
          String(item.id ?? item.meliponario_id)
        }
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={cargando && revision > 0}
            onRefresh={() =>
              setRevision((actual) => actual + 1)
            }
          />
        }
        renderItem={({ item }) => (
          <MeliponarioCard
            item={item}
            onPress={() => abrirDetalle(item)}
          />
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>
              Explorar meliponarios
            </Text>

            <Text style={styles.subtitle}>
              Conoce los meliponarios de Yucatán
              que han autorizado su publicación.
            </Text>

            <View style={styles.search}>
              <Ionicons
                name="search-outline"
                size={20}
                color={COLORS.primary}
              />

              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Nombre, localidad o municipio"
                placeholderTextColor={COLORS.gray2}
                style={styles.input}
              />

              <TouchableOpacity
                onPress={() =>
                  setRevision((actual) => actual + 1)
                }
              >
                <Ionicons
                  name="refresh-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {cargando && (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginBottom: 20 }}
              />
            )}

            {!!error && (
              <Text style={styles.error}>
                {error}
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !cargando && !error ? (
            <Text style={styles.empty}>
              No se encontraron meliponarios
              públicos con esta búsqueda.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  title: {
    color: COLORS.primaryDark,
    fontSize: 30,
    fontWeight: "900",
  },

  subtitle: {
    color: COLORS.gray,
    marginTop: 6,
    marginBottom: 16,
  },

  search: {
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.text,
  },

  error: {
    color: "#B42318",
    marginBottom: 16,
    lineHeight: 21,
  },

  empty: {
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 24,
  },
});

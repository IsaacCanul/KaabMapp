import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  getMisVisitasTecnicasAsignadasRequest,
} from "../../services/visitasTecnicasApi";


const GREEN = "#06492E";


export default function MyInspectionsScreen() {
  const [visitas, setVisitas] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  /* ===================================================
     CARGAR VISITAS
  =================================================== */

  const cargar = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data =
          await getMisVisitasTecnicasAsignadasRequest();

        setVisitas(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "ERROR VISITAS ASIGNADAS:",
          err
        );

        setError(
          err?.message ??
          "No se pudieron consultar las visitas asignadas."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /* ===================================================
     ACTUALIZAR AL ENTRAR A LA PESTAÑA
  =================================================== */

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );


  /* ===================================================
     RENDER
  =================================================== */

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top"]}
    >
      <Text style={styles.title}>
        Mis inspecciones
      </Text>

      <Text style={styles.subtitle}>
        Visitas técnicas asignadas
        a tu cuenta y zona vigente.
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={GREEN}
          style={{
            marginTop: 36,
          }}
        />
      ) : (
        <FlatList
          data={visitas}
          keyExtractor={(item) =>
            String(
              item.asignacion_id
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                cargar(true)
              }
            />
          }
          contentContainerStyle={
            styles.list
          }
          ListHeaderComponent={
            error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            !error ? (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="clipboard-outline"
                  size={48}
                  color={GREEN}
                />

                <Text style={styles.empty}>
                  No tienes visitas técnicas asignadas.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.nombre_meliponario}
              </Text>

              <Text style={styles.localidad}>
                Localidad:{" "}
                {item.localidad_nombre ||
                  "No disponible"}
              </Text>

              <Text style={styles.motivo}>
                {item.motivo_asignacion}
              </Text>

              <Text style={styles.fecha}>
                Asignada:{" "}
                {item.fecha_asignacion
                  ? new Date(
                      item.fecha_asignacion
                    ).toLocaleDateString(
                      "es-MX"
                    )
                  : "Sin fecha"}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}


/* =====================================================
   ESTILOS
===================================================== */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FCFAF2",
    paddingHorizontal: 18,
  },

  title: {
    color: GREEN,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 20,
  },

  subtitle: {
    fontSize: 14,
    color: "#777D76",
    marginVertical: 10,
  },

  list: {
    paddingVertical: 12,
    paddingBottom: 100,
  },

  card: {
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E1D5",
    borderRadius: 18,
    marginBottom: 12,
  },

  name: {
    color: GREEN,
    fontSize: 18,
    fontWeight: "800",
  },

  localidad: {
    marginTop: 8,
    color: "#506058",
  },

  motivo: {
    marginTop: 6,
    color: "#253C30",
  },

  fecha: {
    marginTop: 8,
    color: "#777D76",
    fontSize: 12,
  },

  error: {
    color: "#B42318",
    padding: 12,
  },

  emptyBox: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    color: "#777D76",
    marginTop: 12,
    textAlign: "center",
  },
});
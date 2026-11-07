import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import * as Location from "expo-location";

import KaabMapMap from "./map";

export default function RegistroUbicacion({
  value = null,
  onChange,
}) {
  const [seleccion, setSeleccion] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const seleccionarUbicacion = (coordenadas) => {
    setSeleccion(coordenadas);
    setError("");

    onChange?.(coordenadas);
  };

  const usarMiUbicacion = async () => {
    try {
      setError("");
      setLoading(true);

      // 1. Solicitar permiso al usuario
      const permiso =
        await Location.requestForegroundPermissionsAsync();

      if (permiso.status !== "granted") {
        setError(
          "Debes permitir el acceso a la ubicación."
        );
        return;
      }

      // 2. Obtener ubicación del dispositivo
      const posicion =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      // 3. Guardar únicamente las coordenadas
      const coordenadas = {
        latitude: posicion.coords.latitude,
        longitude: posicion.coords.longitude,
      };

      seleccionarUbicacion(coordenadas);

    } catch (err) {
      setError(
        "No fue posible obtener tu ubicación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Ubicación del meliponario
      </Text>

      <Text style={styles.description}>
        Selecciona dónde se encuentra tu
        meliponario.
      </Text>

      <View style={styles.mapContainer}>
        <KaabMapMap
          mode="registro"
          selected={seleccion}
          onSelect={seleccionarUbicacion}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={usarMiUbicacion}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Usar mi ubicación
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.help}>
        También puedes tocar el mapa para
        colocar el marcador manualmente.
      </Text>

      {seleccion && (
        <View style={styles.success}>
          <Text style={styles.successText}>
            ✓ Ubicación seleccionada correctamente
          </Text>
        </View>
      )}

      {error !== "" && (
        <Text style={styles.error}>{error}</Text>
      )}

      <Text style={styles.notice}>
        La ubicación deberá verificarse para
        confirmar que pertenece al estado
        de Yucatán.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FAF8F1",
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#06492E",
    marginBottom: 8,
  },

  description: {
    color: "#60646B",
    marginBottom: 16,
  },

  mapContainer: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
  },

  button: {
    backgroundColor: "#06492E",
    padding: 17,
    marginTop: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  help: {
    marginTop: 12,
    color: "#60646B",
    fontSize: 13,
    textAlign: "center",
  },

  success: {
    backgroundColor: "#E7F0E5",
    padding: 13,
    borderRadius: 12,
    marginTop: 14,
  },

  successText: {
    color: "#06492E",
    fontWeight: "600",
  },

  error: {
    color: "#B42318",
    marginTop: 12,
  },

  notice: {
    marginTop: 14,
    color: "#60646B",
    fontSize: 12,
  },
});
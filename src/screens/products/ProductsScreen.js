import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Image, Platform,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../../components/PrimaryButton";
import {
  eliminarProductoRequest,
  listarMeliponariosParaProductosRequest,
  listarProductosRequest,
  obtenerFotosProductosRequest,
} from "../../services/productosApi";
import { COLORS } from "../../theme/colors";

function confirmarBorrado(nombre) {
  if (Platform.OS === "web") {
    return Promise.resolve(Boolean(globalThis.confirm?.(`¿Eliminar ${nombre}?`)));
  }
  return new Promise((resolve) => {
    Alert.alert("Eliminar producto", `¿Quieres eliminar «${nombre}»?`, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: "Eliminar", style: "destructive", onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

export default function ProductsScreen({ navigation, route }) {
  const [productos, setProductos] = useState([]);
  const [meliponarios, setMeliponarios] = useState([]);
  const [fotos, setFotos] = useState({});
  const [cargando, setCargando] = useState(true);
  const [borrando, setBorrando] = useState(null);
  const [error, setError] = useState("");
  const meliponarioInicial = route.params?.meliponarioId ?? null;
  const [filtro, setFiltro] = useState(meliponarioInicial);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [misMeliponarios, listado] = await Promise.all([
        listarMeliponariosParaProductosRequest(),
        listarProductosRequest(),
      ]);
      setMeliponarios(misMeliponarios);
      setProductos(listado);
      setFotos(await obtenerFotosProductosRequest(listado));
    } catch (err) {
      setError(err?.message ?? "No se pudieron consultar los productos.");
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const nombres = Object.fromEntries(meliponarios.map((m) => [String(m.id), m.nombre]));
  const visibles = filtro ? productos.filter((p) => String(p.meliponario_id) === String(filtro)) : productos;

  const borrar = async (producto) => {
    if (!await confirmarBorrado(producto.nombre)) return;
    setBorrando(producto.id);
    setError("");
    try {
      await eliminarProductoRequest(producto);
      await cargar();
    } catch (err) {
      setError(err?.message ?? "No se pudo eliminar el producto.");
    } finally {
      setBorrando(null);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={visibles}
        keyExtractor={(item) => String(item.id)}
        refreshing={cargando && productos.length > 0}
        onRefresh={cargar}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Volver">
                <Ionicons name="chevron-back" size={24} color={COLORS.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.title}>Mis productos</Text>
            </View>
            <Text style={styles.subtitle}>
              Administra la disponibilidad y el punto de venta de cada meliponario.
              KaabMap no procesa compras, precios ni pagos.
            </Text>
            {meliponarios.length > 1 && (
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filtrar por meliponario</Text>
                <View style={styles.chips}>
                  <TouchableOpacity
                    style={[styles.chip, !filtro && styles.chipActive]}
                    onPress={() => setFiltro(null)}
                  >
                    <Text style={[styles.chipText, !filtro && styles.chipTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  {meliponarios.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.chip, filtro === m.id && styles.chipActive]}
                      onPress={() => setFiltro(m.id)}
                    >
                      <Text style={[styles.chipText, filtro === m.id && styles.chipTextActive]}>{m.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {!!error && <Text style={styles.error}>{error}</Text>}
            {cargando && productos.length === 0 && (
              <ActivityIndicator style={styles.loader} color={COLORS.primary} />
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {fotos[String(item.id)] ? (
              <Image style={styles.photo} source={{ uri: fotos[String(item.id)] }} />
            ) : (
              <View style={styles.icon}>
                <Ionicons name="cube-outline" size={24} color={COLORS.honey} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name}>{item.nombre}</Text>
              <Text style={styles.meta}>{[item.presentacion, item.cantidad].filter(Boolean).join(" · ")} · {nombres[String(item.meliponario_id)] ?? "Meliponario"}</Text>
              <Text style={styles.meta}>
                {item.punto_venta_tipo === "Punto de venta externo"
                  ? item.punto_venta_nombre
                  : "En el meliponario"}
              </Text>
              {!!item.punto_venta_direccion && <Text style={styles.meta} numberOfLines={2}>
                {item.punto_venta_direccion}
              </Text>}
              {!!item.punto_venta_referencias && <Text style={styles.meta} numberOfLines={2}>
                Referencia: {item.punto_venta_referencias}
              </Text>}
              <Text style={[styles.status, item.disponibilidad !== "Disponible" && styles.statusOff]}>
                {item.disponibilidad}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                accessibilityLabel={`Editar ${item.nombre}`}
                onPress={() => navigation.navigate("ProductForm", { product: item })}
                style={styles.action}
              >
                <Ionicons name="create-outline" size={23} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel={`Eliminar ${item.nombre}`}
                disabled={borrando === item.id}
                onPress={() => borrar(item)}
                style={styles.action}
              >
                {borrando === item.id ? <ActivityIndicator color={COLORS.error} /> : (
                  <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!cargando && !error && (
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={30} color={COLORS.gray} />
            <Text style={styles.emptyText}>
              {meliponarios.length === 0
                ? "Primero debes registrar un meliponario en tu cuenta."
                : "Todavía no tienes productos en este listado."}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <PrimaryButton
              title="Agregar producto"
              icon="add-outline"
              disabled={cargando || meliponarios.length === 0}
              onPress={() => navigation.navigate("ProductForm", { meliponarioId: filtro })}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: 18, paddingBottom: 30, maxWidth: 650, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  title: { color: COLORS.primaryDark, fontSize: 24, fontWeight: "900", flex: 1 },
  subtitle: { color: COLORS.gray, lineHeight: 21, marginBottom: 16 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 17, padding: 12, marginBottom: 10 },
  photo: { width: 54, height: 58, borderRadius: 12, marginRight: 11 },
  icon: { width: 54, height: 58, borderRadius: 12, backgroundColor: COLORS.honeySoft,
    alignItems: "center", justifyContent: "center", marginRight: 11 },
  info: { flex: 1, minWidth: 0 },
  name: { color: COLORS.primaryDark, fontWeight: "900", fontSize: 15 },
  meta: { color: COLORS.gray, fontSize: 12, marginTop: 3 },
  status: { color: COLORS.successText, backgroundColor: COLORS.success, alignSelf: "flex-start",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 10, fontWeight: "800", marginTop: 7 },
  statusOff: { color: COLORS.error, backgroundColor: COLORS.errorSoft },
  actions: { marginLeft: 8, alignItems: "center" },
  action: { minWidth: 38, minHeight: 42, alignItems: "center", justifyContent: "center" },
  footer: { marginTop: 14, marginBottom: 10 },
  empty: { alignItems: "center", paddingVertical: 28, gap: 8 },
  emptyText: { color: COLORS.gray, textAlign: "center", lineHeight: 19 },
  error: { color: COLORS.error, backgroundColor: COLORS.errorSoft, padding: 12,
    borderRadius: 12, marginVertical: 10 },
  loader: { marginVertical: 20 },
  filterContainer: { marginBottom: 12 },
  filterLabel: { fontWeight: "800", color: COLORS.primaryDark, marginBottom: 7 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white,
    paddingVertical: 9, paddingHorizontal: 12, borderRadius: 20 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.primaryDark, fontWeight: "700" },
  chipTextActive: { color: COLORS.white },
});

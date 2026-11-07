import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Image, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from "expo-location";
import RegisterLocationMap from "../../components/RegisterLocationMap";

import FilterChip from "../../components/FilterChip";
import FormInput from "../../components/FormInput";
import InfoBox from "../../components/InfoBox";
import PrimaryButton from "../../components/PrimaryButton";
import { COLORS } from "../../theme/colors";
import {
  guardarProductoRequest,
  listarMeliponariosParaProductosRequest,
  obtenerFotoProductoUrlRequest,
  quitarFotoProductoRequest,
  subirFotoProductoRequest,
} from "../../services/productosApi";

const TIPOS = ["Miel", "Propóleo", "Crema", "Jabón", "Shampoo", "Polen", "Geopropóleo", "Otro"];
const PRESENTACIONES = ["Frasco", "Botella", "Gotero", "Tarro", "Barra", "Bolsa", "Otra"];
const CANTIDADES_MIEL = ["50 mL", "100 mL", "250 mL", "400 mL", "500 mL", "1 L", "Otra"];
const DISPONIBILIDADES = ["Disponible", "Temporalmente no disponible"];
const PUNTOS = ["En el meliponario", "Punto de venta externo"];

function aviso(titulo, mensaje) {
  if (Platform.OS === "web") globalThis.alert?.(`${titulo}\n\n${mensaje}`);
  else Alert.alert(titulo, mensaje);
}

export default function ProductFormScreen({ navigation, route }) {
  const existente = route.params?.product ?? null;
  const tipoInicial = TIPOS.includes(existente?.nombre) ? existente.nombre : existente ? "Otro" : "Miel";
  const presentacionInicial = PRESENTACIONES.includes(existente?.presentacion)
    ? existente.presentacion : existente ? "Otra" : "Frasco";
  const cantidadGuardada = existente?.cantidad ?? "";
  const cantidadInicial = existente?.nombre === "Miel" || !existente
    ? (CANTIDADES_MIEL.includes(cantidadGuardada) ? cantidadGuardada : existente ? "Otra" : "250 mL")
    : "Otra";

  const [meliponarios, setMeliponarios] = useState([]);
  const [meliponarioId, setMeliponarioId] = useState(
    existente?.meliponario_id ?? route.params?.meliponarioId ?? null
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [tipo, setTipo] = useState(tipoInicial);
  const [otroNombre, setOtroNombre] = useState(tipoInicial === "Otro" ? existente?.nombre ?? "" : "");
  const [presentacion, setPresentacion] = useState(presentacionInicial);
  const [otraPresentacion, setOtraPresentacion] = useState(
    presentacionInicial === "Otra" ? existente?.presentacion ?? "" : ""
  );
  const [cantidadMiel, setCantidadMiel] = useState(cantidadInicial);
  const [otraCantidad, setOtraCantidad] = useState(
    cantidadInicial === "Otra" ? cantidadGuardada : (tipoInicial === "Miel" ? "" : cantidadGuardada)
  );
  const [disponibilidad, setDisponibilidad] = useState(existente?.disponibilidad ?? "Disponible");
  const [punto, setPunto] = useState(existente?.punto_venta_tipo ?? "En el meliponario");
  const [nombreExterno, setNombreExterno] = useState(existente?.punto_venta_nombre ?? "");
  const [direccionVenta, setDireccionVenta] = useState(existente?.punto_venta_direccion ?? "");
  const [referenciasVenta, setReferenciasVenta] = useState(existente?.punto_venta_referencias ?? "");
  const [latitudVenta, setLatitudVenta] = useState(existente?.punto_venta_latitud != null ? String(existente.punto_venta_latitud) : "");
  const [longitudVenta, setLongitudVenta] = useState(existente?.punto_venta_longitud != null ? String(existente.punto_venta_longitud) : "");
  const [telefonoVenta, setTelefonoVenta] = useState(existente?.punto_venta_telefono ?? "");
  const [autorizaUbicacion, setAutorizaUbicacion] = useState(existente?.punto_venta_autoriza_ubicacion === true);
  const [autorizaContacto, setAutorizaContacto] = useState(existente?.punto_venta_autoriza_contacto === true);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [enfoqueMapa, setEnfoqueMapa] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoExistente, setFotoExistente] = useState(null);
  const [quitarFoto, setQuitarFoto] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const lista = await listarMeliponariosParaProductosRequest();
        if (!activo) return;
        setMeliponarios(lista);
        setMeliponarioId((actual) => actual ?? (lista.length === 1 ? lista[0].id : null));
      } catch (err) {
        if (activo) setError(err?.message ?? "No se pudieron consultar los meliponarios.");
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    let activo = true;
    if (existente?.foto_ruta) {
      obtenerFotoProductoUrlRequest(existente.foto_ruta)
        .then((url) => { if (activo) setFotoExistente(url); })
        .catch((err) => console.warn("Foto de producto", err?.message));
    }
    return () => { activo = false; };
  }, [existente?.foto_ruta]);

  const seleccionarFoto = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        aviso("Permiso requerido", "Autoriza el acceso a tus fotografías para seleccionar una imagen.");
        return;
      }
      const seleccion = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], allowsEditing: true, quality: 0.8,
      });
      if (seleccion.canceled || !seleccion.assets?.[0]?.uri) return;
      const archivo = seleccion.assets[0];
      const convertido = await ImageManipulator.manipulateAsync(
        archivo.uri,
        [{ resize: { width: Math.min(1200, archivo.width || 1200) } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setFoto({ uri: convertido.uri, base64: convertido.base64 });
      setQuitarFoto(false);
      setError("");
    } catch (err) {
      aviso("Fotografía", err?.message ?? "No se pudo preparar la fotografía.");
    }
  };

  const coordenadasVenta = (() => {
    if (!latitudVenta.trim() || !longitudVenta.trim()) return null;
    const latitude = Number(latitudVenta);
    const longitude = Number(longitudVenta);
    return Number.isFinite(latitude) && Number.isFinite(longitude) &&
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
      ? { latitude, longitude } : null;
  })();

  const seleccionarPunto = ({ latitude, longitude }) => {
    setLatitudVenta(String(Number(latitude.toFixed(6))));
    setLongitudVenta(String(Number(longitude.toFixed(6))));
  };

  const obtenerMiUbicacion = async () => {
    setBuscandoUbicacion(true);
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (permiso.status !== "granted") {
        aviso("Permiso de ubicación", "Autoriza el acceso a la ubicación o selecciona el punto manualmente en el mapa.");
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = posicion.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("El dispositivo no devolvió una ubicación válida.");
      }
      seleccionarPunto({ latitude, longitude });
      // RegisterLocationMap.web.js usa flyTo y el .native.js animateToRegion.
      // El token cambia cada vez que se pulsa el botón, aunque la ubicación sea la misma.
      setEnfoqueMapa((anterior) => ({
        latitude,
        longitude,
        zoom: 17,
        token: (anterior?.token ?? 0) + 1,
      }));
    } catch (err) {
      aviso("Ubicación", err?.message ?? "No se pudo obtener la ubicación actual.");
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  const guardar = async () => {
    if (guardando) return;
    setError("");
    setGuardando(true);
    let guardado = null;
    try {
      guardado = await guardarProductoRequest({
        meliponario_id: meliponarioId,
        nombre: tipo === "Otro" ? otroNombre : tipo,
        presentacion: presentacion === "Otra" ? otraPresentacion : presentacion,
        cantidad: tipo === "Miel" && cantidadMiel !== "Otra" ? cantidadMiel : otraCantidad,
        disponibilidad,
        punto_venta_tipo: punto,
        punto_venta_nombre: punto === "Punto de venta externo" ? nombreExterno : null,
        punto_venta_direccion: direccionVenta,
        punto_venta_referencias: referenciasVenta,
        punto_venta_latitud: latitudVenta.trim(),
        punto_venta_longitud: longitudVenta.trim(),
        punto_venta_telefono: telefonoVenta,
        punto_venta_autoriza_ubicacion: autorizaUbicacion,
        punto_venta_autoriza_contacto: autorizaContacto,
      }, existente?.id);

      if (foto) {
        await subirFotoProductoRequest(guardado, foto);
      } else if (quitarFoto && guardado.foto_ruta) {
        await quitarFotoProductoRequest(guardado);
      }
      navigation.goBack();
    } catch (err) {
      const mensaje = err?.message ?? "No se pudo guardar el producto.";
      if (guardado) {
        aviso("Producto guardado parcialmente", `La información se guardó, pero hubo un problema con la fotografía: ${mensaje}`);
        navigation.goBack();
      } else {
        setError(mensaje);
      }
    } finally {
      setGuardando(false);
    }
  };

  const fotoVisible = foto?.uri ?? (!quitarFoto ? fotoExistente : null);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity accessibilityLabel="Volver" onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <Text style={styles.title}>{existente ? "Editar producto" : "Agregar producto"}</Text>
        </View>

        <InfoBox>
          Catálogo de productos del meliponario. Esta versión guarda los cambios
          únicamente en este dispositivo, sin modificar la base de datos.
        </InfoBox>

        <Text style={styles.label}>Meliponario *</Text>
        {cargando ? <ActivityIndicator color={COLORS.primary} /> : (
          <View style={styles.wrap}>
            {meliponarios.map((m) => (
              <FilterChip
                key={m.id}
                label={m.nombre}
                active={meliponarioId === m.id}
                onPress={() => setMeliponarioId(m.id)}
              />
            ))}
          </View>
        )}
        {!cargando && meliponarios.length === 0 && (
          <Text style={styles.help}>Primero registra un meliponario para agregarle productos.</Text>
        )}

        <Text style={styles.label}>Producto *</Text>
        <View style={styles.wrap}>
          {TIPOS.map((v) => <FilterChip key={v} label={v} active={tipo === v} onPress={() => setTipo(v)} />)}
        </View>
        {tipo === "Otro" && (
          <FormInput label="Nombre del producto" required value={otroNombre}
            onChangeText={setOtroNombre} placeholder="Ej. Bálsamo de propóleo" />
        )}

        <Text style={styles.label}>Presentación *</Text>
        <View style={styles.wrap}>
          {PRESENTACIONES.map((v) => (
            <FilterChip key={v} label={v} active={presentacion === v} onPress={() => setPresentacion(v)} />
          ))}
        </View>
        {presentacion === "Otra" && (
          <FormInput label="Especificar presentación" required value={otraPresentacion}
            onChangeText={setOtraPresentacion} placeholder="Ej. Frasco de 125 g" />
        )}

        <Text style={styles.label}>Cantidad o contenido *</Text>
        {tipo === "Miel" ? (
          <View style={styles.wrap}>
            {CANTIDADES_MIEL.map((valor) => (
              <FilterChip key={valor} label={valor} active={cantidadMiel === valor}
                onPress={() => setCantidadMiel(valor)} />
            ))}
          </View>
        ) : (
          <Text style={styles.help}>Escribe la cantidad según el producto (mL, g o piezas).</Text>
        )}
        {(tipo !== "Miel" || cantidadMiel === "Otra") && (
          <FormInput label="Especificar cantidad" required value={otraCantidad}
            onChangeText={setOtraCantidad} placeholder="Ej. 30 mL, 100 g o 1 pieza" />
        )}

        <Text style={styles.label}>Disponibilidad *</Text>
        <View style={styles.wrap}>
          {DISPONIBILIDADES.map((v) => (
            <FilterChip key={v} label={v} active={disponibilidad === v} onPress={() => setDisponibilidad(v)} />
          ))}
        </View>

        <Text style={styles.label}>Punto de venta *</Text>
        <View style={styles.wrap}>
          {PUNTOS.map((v) => <FilterChip key={v} label={v} active={punto === v} onPress={() => setPunto(v)} />)}
        </View>
        {punto === "Punto de venta externo" && (
          <FormInput label="Nombre del punto de venta" required value={nombreExterno}
            onChangeText={setNombreExterno} placeholder="Ej. Mercado municipal" />
        )}

        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Ionicons name="storefront-outline" size={23} color={COLORS.primaryDark} />
            <Text style={styles.locationHeading}>Ubicación del punto de venta</Text>
          </View>
          <Text style={styles.help}>
            Puedes añadir la dirección y las referencias que ayudarán a encontrar el lugar.
            La ubicación exacta no se publicará automáticamente.
          </Text>
          <FormInput
            label="Dirección"
            value={direccionVenta}
            onChangeText={setDireccionVenta}
            placeholder="Ej. Calle 24 por 31 y 33, Centro, Izamal"
            multiline
          />
          <FormInput
            label="Referencias para llegar"
            value={referenciasVenta}
            onChangeText={setReferenciasVenta}
            placeholder="Ej. Portón verde, frente a la plaza, junto a la farmacia"
            multiline
          />
          <Text style={styles.label}>Marca el punto en el mapa (opcional)</Text>
          <Text style={styles.help}>Toca el mapa para ubicar tu punto de venta. También puedes mover el marcador.</Text>
          <View style={styles.mapPicker}>
            <RegisterLocationMap
              value={coordenadasVenta}
              focus={enfoqueMapa}
              onChange={seleccionarPunto}
            />
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={buscandoUbicacion}
            style={styles.locationButton}
            onPress={obtenerMiUbicacion}
          >
            <Ionicons name="locate-outline" size={19} color={COLORS.primary} />
            <Text style={styles.locationButtonText}>
              {buscandoUbicacion ? "Buscando ubicación..." : "Usar mi ubicación actual"}
            </Text>
          </TouchableOpacity>
          {coordenadasVenta && (
            <View style={styles.locationStatus}>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.locationStatusText}>
                Ubicación marcada. Puedes mover el marcador para ajustarla.
              </Text>
            </View>
          )}
          <FormInput
            label="WhatsApp del punto de venta (opcional)"
            value={telefonoVenta}
            onChangeText={setTelefonoVenta}
            keyboardType="phone-pad"
            placeholder="Ej. 529861234567"
          />
          <Text style={styles.label}>Permisos para futura publicación</Text>
          <Text style={styles.help}>
            Estos permisos se guardan por ahora en tu teléfono. No hacen público el meliponario
            ni sus datos; el backend deberá verificar la publicación autorizada.
          </Text>
          <View style={styles.wrap}>
            <FilterChip label={autorizaUbicacion ? "✓ Autorizo compartir el punto de venta" : "Autorizar compartir dirección y ubicación"}
              active={autorizaUbicacion} onPress={() => setAutorizaUbicacion((v) => !v)} />
          </View>
          <View style={styles.wrap}>
            <FilterChip label={autorizaContacto ? "✓ Autorizo compartir WhatsApp" : "Autorizar mostrar WhatsApp"}
              active={autorizaContacto} onPress={() => setAutorizaContacto((v) => !v)} />
          </View>
        </View>

        <Text style={styles.label}>Fotografía (opcional)</Text>
        <TouchableOpacity style={styles.photo} onPress={seleccionarFoto} disabled={guardando}>
          {fotoVisible ? <Image source={{ uri: fotoVisible }} style={styles.preview} /> : (
            <Ionicons name="image-outline" size={30} color={COLORS.primary} />
          )}
          <Text style={styles.photoText}>{fotoVisible ? "Cambiar fotografía" : "Agregar fotografía"}</Text>
        </TouchableOpacity>
        {fotoVisible && (
          <TouchableOpacity style={styles.removePhoto} onPress={() => { setFoto(null); setQuitarFoto(true); }}>
            <Ionicons name="trash-outline" size={17} color={COLORS.error} />
            <Text style={styles.removeText}>Quitar fotografía</Text>
          </TouchableOpacity>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <PrimaryButton title={existente ? "Guardar cambios" : "Guardar producto"}
          loading={guardando} disabled={cargando || meliponarios.length === 0} onPress={guardar} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: 18, paddingBottom: 36, maxWidth: 560, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  title: { color: COLORS.primaryDark, fontSize: 24, fontWeight: "900", flex: 1 },
  label: { color: COLORS.primaryDark, fontSize: 15, fontWeight: "900", marginTop: 14, marginBottom: 9 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 10 },
  photo: { minHeight: 128, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#B9C8B9",
    borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 14, overflow: "hidden" },
  preview: { width: "100%", height: 155, resizeMode: "contain" },
  photoText: { color: COLORS.primary, fontWeight: "800", marginTop: 7, marginBottom: 7 },
  removePhoto: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 14 },
  removeText: { color: COLORS.error, fontWeight: "700" },
  help: { color: COLORS.gray, marginBottom: 12, lineHeight: 20 },
  locationSection: { backgroundColor: COLORS.white, borderRadius: 18, padding: 15,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 12, marginBottom: 16 },
  locationHeader: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 9 },
  locationHeading: { color: COLORS.primaryDark, fontWeight: "900", fontSize: 17, flex: 1 },
  mapPicker: { width: "100%", height: 230, borderRadius: 13, overflow: "hidden",
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  locationButton: { flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 11, gap: 8, marginBottom: 12 },
  locationButtonText: { color: COLORS.primary, fontWeight: "800", fontSize: 13 },
  locationStatus: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  locationStatusText: { color: COLORS.primaryDark, fontSize: 12, flex: 1 },
  error: { color: COLORS.error, backgroundColor: COLORS.errorSoft, padding: 12,
    borderRadius: 12, marginVertical: 12 },
});
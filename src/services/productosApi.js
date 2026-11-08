// Prototipo funcional del frontend: productos locales, sin crear tablas.
// Este servicio conserva los nombres que usan las pantallas de KaabMap.
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "../lib/supabase";

const PREFIJO = "kaabmap:productos-locales:v1:";
const CARPETA = `${FileSystem.documentDirectory ?? ""}kaabmap-productos/`;

async function idUsuario() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const id = data?.session?.user?.id;
  if (!id) throw new Error("Inicia sesión para administrar productos.");
  return id;
}

async function clave() {
  return `${PREFIJO}${await idUsuario()}`;
}

async function leer() {
  const valor = await AsyncStorage.getItem(await clave());
  if (!valor) return [];
  const datos = JSON.parse(valor);
  return Array.isArray(datos) ? datos : [];
}

async function escribir(productos) {
  await AsyncStorage.setItem(await clave(), JSON.stringify(productos));
}

export async function listarMeliponariosParaProductosRequest() {
  const id = await idUsuario();
  // Solo se consulta la tabla de meliponarios que KaabMap ya utiliza.
  const { data, error } = await supabase
    .from("meliponarios")
    .select("id,nombre")
    .eq("responsable_principal_id", id)
    .order("nombre", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listarProductosRequest(meliponarioId = null) {
  const productos = await leer();
  return meliponarioId == null
    ? productos
    : productos.filter((p) => String(p.meliponario_id) === String(meliponarioId));
}

export async function obtenerFotoProductoUrlRequest(ruta) {
  return ruta ?? null;
}

export async function obtenerFotosProductosRequest(productos = []) {
  return Object.fromEntries(
    productos.map((producto) => [String(producto.id), producto.foto_ruta ?? null])
  );
}

export async function guardarProductoRequest(datos, productoId = null) {
  const nombre = String(datos.nombre ?? "").trim();
  const presentacion = String(datos.presentacion ?? "").trim();
  const cantidad = String(datos.cantidad ?? "").trim();
  const direccion = String(datos.punto_venta_direccion ?? "").trim();
  const referencias = String(datos.punto_venta_referencias ?? "").trim();
  const telefono = String(datos.punto_venta_telefono ?? "").trim();
  const latTexto = String(datos.punto_venta_latitud ?? "").trim();
  const lngTexto = String(datos.punto_venta_longitud ?? "").trim();
  const tieneCoordenadas = latTexto !== "" || lngTexto !== "";
  const latitud = latTexto !== "" ? Number(latTexto) : null;
  const longitud = lngTexto !== "" ? Number(lngTexto) : null;
  if (direccion.length > 250 || referencias.length > 350) {
    throw new Error("La dirección o las referencias son demasiado largas.");
  }
  if (tieneCoordenadas && (
    latTexto === "" || lngTexto === "" ||
    !Number.isFinite(latitud) || !Number.isFinite(longitud) ||
    latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180
  )) {
    throw new Error("Indica una latitud y longitud válidas o selecciónalas en el mapa.");
  }
  if (telefono && !/^\+?[0-9\s()-]{10,22}$/.test(telefono)) {
    throw new Error("Escribe un teléfono válido, incluyendo la lada si corresponde.");
  }
  if (datos.punto_venta_autoriza_contacto && !telefono) {
    throw new Error("Agrega un teléfono antes de autorizar que se comparta.");
  }
  if (datos.punto_venta_autoriza_ubicacion && !direccion && !tieneCoordenadas) {
    throw new Error("Agrega la dirección o marca el punto en el mapa antes de autorizar compartirlo.");
  }
  if (!datos.meliponario_id) throw new Error("Selecciona un meliponario.");
  if (!nombre) throw new Error("Selecciona el nombre del producto.");
  if (!presentacion) throw new Error("Selecciona la presentación.");
  if (!cantidad) throw new Error("Indica la cantidad o el contenido.");
  if (datos.punto_venta_tipo === "Punto de venta externo" && !String(datos.punto_venta_nombre ?? "").trim()) {
    throw new Error("Escribe el nombre del punto de venta.");
  }

  const productos = await leer();
  const indice = productoId == null
    ? -1
    : productos.findIndex((p) => String(p.id) === String(productoId));
  if (productoId != null && indice === -1) throw new Error("No se encontró el producto para editarlo.");

  const anterior = indice >= 0 ? productos[indice] : null;
  const guardado = {
    ...anterior,
    id: anterior?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    meliponario_id: datos.meliponario_id,
    nombre,
    presentacion,
    cantidad,
    disponibilidad: datos.disponibilidad ?? "Disponible",
    punto_venta_tipo: datos.punto_venta_tipo ?? "En el meliponario",
    punto_venta_nombre: datos.punto_venta_tipo === "Punto de venta externo"
      ? String(datos.punto_venta_nombre).trim()
      : null,
    // Datos del punto de venta. Se guardan SOLO en el dispositivo,
    // nunca se incorporan a una consulta pública sin el backend.
    punto_venta_direccion: direccion,
    punto_venta_referencias: referencias,
    punto_venta_latitud: latitud,
    punto_venta_longitud: longitud,
    punto_venta_telefono: telefono,
    punto_venta_autoriza_ubicacion: datos.punto_venta_autoriza_ubicacion === true,
    punto_venta_autoriza_contacto: datos.punto_venta_autoriza_contacto === true,
    foto_ruta: anterior?.foto_ruta ?? null,
    fecha_creacion: anterior?.fecha_creacion ?? new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  };

  if (indice >= 0) productos[indice] = guardado;
  else productos.unshift(guardado);
  await escribir(productos);
  return guardado;
}

async function borrarFotoLocal(ruta) {
  if (Platform.OS !== "web" && ruta?.startsWith(CARPETA)) {
    await FileSystem.deleteAsync(ruta, { idempotent: true }).catch(() => {});
  }
}

export async function subirFotoProductoRequest(producto, foto) {
  if (!foto?.uri) throw new Error("Selecciona una fotografía.");
  const productos = await leer();
  const indice = productos.findIndex((p) => String(p.id) === String(producto.id));
  if (indice < 0) throw new Error("Guarda primero el producto.");

  let ruta;
  if (Platform.OS === "web") {
    ruta = foto.base64 ? `data:image/jpeg;base64,${foto.base64}` : foto.uri;
  } else {
    await FileSystem.makeDirectoryAsync(CARPETA, { intermediates: true });
    ruta = `${CARPETA}${producto.id}-${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: foto.uri, to: ruta });
  }

  const anterior = productos[indice].foto_ruta;
  productos[indice] = { ...productos[indice], foto_ruta: ruta };
  await escribir(productos);
  await borrarFotoLocal(anterior);
  return productos[indice];
}

export async function quitarFotoProductoRequest(producto) {
  const productos = await leer();
  const indice = productos.findIndex((p) => String(p.id) === String(producto.id));
  if (indice < 0) return producto;
  const anterior = productos[indice].foto_ruta;
  productos[indice] = { ...productos[indice], foto_ruta: null };
  await escribir(productos);
  await borrarFotoLocal(anterior);
  return productos[indice];
}

export async function eliminarProductoRequest(producto) {
  const productos = await leer();
  const restantes = productos.filter((p) => String(p.id) !== String(producto.id));
  if (productos.length === restantes.length) throw new Error("No se encontró el producto.");
  await escribir(restantes);
  await borrarFotoLocal(producto.foto_ruta);
}

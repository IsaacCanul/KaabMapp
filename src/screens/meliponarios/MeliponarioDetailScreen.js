import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import PuntoVentaCard from "../../components/PuntoVentaCard";

import { useAuth } from "../../context/AuthContext";
import {
  getMeliponarioByIdRequest,
} from "../../services/meliponariosApi";
import {
  getDetalleMeliponarioPublicoRequest,
} from "../../services/meliponariosPublicosApi";
import {
  obtenerImagenesRemotas,
} from "../../services/meliponarioRemotePhotos";
import {
  listarProductosRequest,
  obtenerFotosProductosRequest,
} from "../../services/productosApi";
import {
  styles,
} from "./MeliponarioDetailScreen.styles";

const GREEN = "#06492E";

function aviso(titulo, mensaje) {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${titulo}\n\n${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

function getStatus(item) {
  const value =
    item?.solicitud_estado ??
    item?.solicitud?.estado ??
    (item?.estado_operativo === "desactivado"
      ? "desactivado"
      : item?.visibilidad === "publico"
        ? "publicada"
        : null);

  const statuses = {
    borrador: ["Borrador", "#655F50", "#F0EBDF"],
    enviada: ["Enviado", "#9B6500", "#FFF0CE"],
    en_revision: ["En revisión", "#26659A", "#E8F1FC"],
    correccion: ["Corrección solicitada", "#A56003", "#FFF1D8"],
    aprobada: ["Aprobado", "#FFFFFF", "#075A3D"],
    rechazada: ["Rechazado", "#A33232", "#FDEAEA"],
    desactivado: ["Desactivado", "#666666", "#EDEDED"],
    publicada: ["Publicado", "#FFFFFF", "#075A3D"],
  };

  const [label, color, background] =
    statuses[value] ??
    (value === null
      ? ["Borrador", "#655F50", "#F0EBDF"]
      : ["Sin verificar", "#9B6500", "#FFF0CE"]);

  return { label, color, background };
}

function getLocation(item) {
  const places = [
    item?.localidad,
    item?.municipio,
    "Yucatán",
  ]
    .filter(Boolean)
    .map((x) => String(x).trim());

  return places
    .filter(
      (value, index) =>
        places.findIndex(
          (other) =>
            other.toLowerCase() === value.toLowerCase()
        ) === index
    )
    .join(", ");
}

function SpeciesCard({ item }) {
  return (
    <View style={styles.speciesCard}>
      <View style={styles.speciesIcon}>
        <Ionicons
          name="leaf-outline"
          size={26}
          color={GREEN}
        />
      </View>

      <View style={styles.speciesMain}>
        <Text
          style={styles.speciesName}
          numberOfLines={2}
        >
          {item.nombre ??
            item.nombre_comun ??
            "Especie"}
        </Text>

        {!!(
          item.nombreCientifico ??
          item.nombre_cientifico
        ) && (
          <Text style={styles.scientific}>
            {item.nombreCientifico ??
              item.nombre_cientifico}
          </Text>
        )}

        <View style={styles.countsRow}>
          <View style={styles.countBox}>
            <Ionicons
              name="cube-outline"
              size={18}
              color={GREEN}
            />

            <View style={styles.countTextWrap}>
              <Text style={styles.countLabel}>
                Cajas tecnificadas
              </Text>

              <Text style={styles.countValue}>
                {Number(
                  item.cajasTecnificadas ??
                  item.cantidad_cajas ??
                  0
                )}
              </Text>
            </View>
          </View>

          <View style={styles.countBox}>
            <Ionicons
              name="home-outline"
              size={18}
              color="#AC7910"
            />

            <View style={styles.countTextWrap}>
              <Text style={styles.countLabel}>
                Jobones
              </Text>

              <Text style={styles.countValue}>
                {Number(
                  item.jobones ??
                  item.cantidad_jobones ??
                  0
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function MeliponarioDetailScreen({
  route,
  navigation,
}) {
  const { user } = useAuth();

  const initial = route?.params?.meliponario ?? null;

  const id =
    route?.params?.id ??
    route?.params?.meliponarioId ??
    initial?.id ??
    null;

  // No renderizar detalles de una ruta anterior como visitante:
  // la ficha pública debe venir de la consulta autorizada del servidor.
  const [record, setRecord] = useState(user?.id ? initial : null);
  const [photos, setPhotos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [fotosProductos, setFotosProductos] = useState({});
  const [errorProductos, setErrorProductos] = useState("");
  const [loading, setLoading] = useState(!initial || !user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [index, setIndex] = useState(0);
  const [galleryWidth, setGalleryWidth] = useState(0);

  const galleryRef = useRef(null);

  const favoriteKey =
    user?.id && id
      ? `@kaabmap:favorite:${user.id}:${id}`
      : null;

  useEffect(() => {
    setRecord(user?.id ? initial : null);
    setPhotos([]);
    setProductos([]);
    setFotosProductos({});
    setErrorProductos("");
    setIndex(0);
    setError("");
    setLoading(!initial || !user?.id);
  }, [id, user?.id]);

  const regresar = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    const names =
      navigation.getState?.()?.routeNames ?? [];

    if (names.includes("MyMeliponarios")) {
      navigation.navigate("MyMeliponarios");
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        if (!id) {
          setLoading(false);
          setError("No se recibió el ID del meliponario.");
          return;
        }

        setRefreshing(true);
        setError("");

        // Visitantes: detalle público, nunca una consulta de titular.
        // Usuarios con sesión: priorizar su detalle privado y, si no
        // tienen acceso, consultar la versión pública autorizada.
        const cargarDetalle = async () => {
          if (user?.id) {
            try {
              const propio = await getMeliponarioByIdRequest(id);
              if (propio) return propio;
            } catch (e) {
              console.warn("DETALLE PRIVADO:", e?.message);
            }
          }
          return getDetalleMeliponarioPublicoRequest(id);
        };

        const results = await Promise.allSettled([
          cargarDetalle(),
          // Las fotos y productos actuales se administran por cuenta.
          // Su publicación para visitantes requiere una API pública
          // autorizada del equipo de backend.
          user?.id ? obtenerImagenesRemotas(id) : Promise.resolve([]),
          user?.id ? listarProductosRequest(id) : Promise.resolve([]),
          favoriteKey
            ? AsyncStorage.getItem(favoriteKey)
            : Promise.resolve(null),
        ]);

        if (!active) return;

        if (results[0].status === "fulfilled") {
          const data = results[0].value;

          if (data) {
            setRecord((previous) => {
              const datosPreviosPropios = Boolean(user?.id && (
                previous?.responsable_principal_id === user.id ||
                initial?.responsable_principal_id === user.id
              ));
              const respaldo = datosPreviosPropios ? (previous ?? initial ?? {}) : {};
              return {
                ...respaldo,
                ...data,
                latitude: data.latitude ?? data.latitud ?? respaldo.latitude ?? null,
                longitude: data.longitude ?? data.longitud ?? respaldo.longitude ?? null,
                localidad: data.localidad || respaldo.localidad || "",
                municipio: data.municipio || respaldo.municipio || "",
              };
            });
          } else if (!initial || !user?.id) {
            setRecord(null);
            setError(
              "El meliponario no existe o no tienes permiso para consultarlo."
            );
          }
        } else {
          setError(
            results[0].reason?.message ??
            "No se pudo cargar la información."
          );
        }

        if (results[1].status === "fulfilled") {
          const items = Array.isArray(
            results[1].value
          )
            ? results[1].value
            : [];

          setPhotos(
            items
              .map((foto) => foto.uri)
              .filter(Boolean)
          );

          setIndex(0);

          galleryRef.current?.scrollTo({
            x: 0,
            animated: false,
          });
        } else {
          console.warn(
            "ERROR FOTOS REMOTAS:",
            results[1].reason
          );

          setPhotos([]);
        }

        if (results[2].status === "fulfilled") {
          const lista = Array.isArray(results[2].value) ? results[2].value : [];
          setProductos(lista);
          setErrorProductos("");
          const fotosMap = await obtenerFotosProductosRequest(lista);
          if (active) setFotosProductos(fotosMap);
        } else {
          setProductos([]);
          setFotosProductos({});
          setErrorProductos(results[2].reason?.message ?? "No se pudieron cargar los productos.");
        }

        if (!active) return;
        if (results[3].status === "fulfilled") {
          setFavorite(results[3].value === "1");
        }

        setLoading(false);
        setRefreshing(false);
      }

      load();

      return () => {
        active = false;
      };
    }, [id, favoriteKey, user?.id])
  );

  const onGalleryScroll = (event) => {
    if (galleryWidth <= 0 || photos.length === 0) {
      return;
    }

    const offset = Number(
      event?.nativeEvent?.contentOffset?.x ?? 0
    );

    if (!Number.isFinite(offset)) return;

    setIndex(
      Math.max(
        0,
        Math.min(
          photos.length - 1,
          Math.round(offset / galleryWidth)
        )
      )
    );
  };

  const goToPhoto = (photoIndex) => {
    if (
      photoIndex < 0 ||
      photoIndex >= photos.length
    ) {
      return;
    }

    setIndex(photoIndex);

    if (galleryWidth > 0) {
      galleryRef.current?.scrollTo({
        x: photoIndex * galleryWidth,
        animated: true,
      });
    }
  };

  const status = useMemo(
    () => getStatus(record),
    [record]
  );

  const especies =
    Array.isArray(record?.especies)
      ? record.especies
      : [];

  const location = getLocation(record);

  const responsable = [
    record?.responsable?.nombre,
    record?.responsable?.apellidos,
  ].filter(Boolean).join(" ");

  // El teléfono privado del responsable nunca debe revelarse a visitantes.
  const phone = String(
    user?.id === record?.responsable_principal_id ||
    record?.autorizacion_contacto_publico === true
      ? record?.responsable?.telefono ?? ""
      : ""
  ).replace(/[^\d+]/g, "");

  const isOwner = Boolean(
    user?.id &&
    user.id === record?.responsable_principal_id
  );

  const latitude = Number(
    record?.latitude ?? record?.latitud
  );

  const longitude = Number(
    record?.longitude ?? record?.longitud
  );

  const hasCoords =
    (
      record?.latitude ??
      record?.latitud
    ) != null &&
    (
      record?.longitude ??
      record?.longitud
    ) != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const mayShowExact =
    isOwner ||
    (
      record?.visibilidad === "publico" &&
      record?.autorizacion_ubicacion_exacta === true
    );

  // Actualmente la lista de productos se guarda localmente y se
  // recupera solo para el propietario. El filtro también está listo
  // para cuando el backend ofrezca productos públicos autorizados.
  const puntosVenta = useMemo(() => {
    const mapa = new Map();
    for (const producto of productos) {
      const autorizado = isOwner || (
        record?.visibilidad === "publico" &&
        producto.punto_venta_autoriza_ubicacion === true
      );
      if (!autorizado) continue;
      const tieneInfo = producto.punto_venta_direccion ||
        producto.punto_venta_referencias ||
        producto.punto_venta_nombre ||
        (producto.punto_venta_latitud != null && producto.punto_venta_longitud != null);
      if (!tieneInfo) continue;
      const key = [producto.punto_venta_tipo, producto.punto_venta_nombre,
        producto.punto_venta_direccion, producto.punto_venta_latitud,
        producto.punto_venta_longitud].map((v) => String(v ?? "")).join("|");
      if (!mapa.has(key)) {
        mapa.set(key, {
          ...producto,
          nombre_meliponario: record?.nombre,
          visibilidad_meliponario: record?.visibilidad,
        });
      }
    }
    return [...mapa.values()];
  }, [productos, isOwner, record?.nombre, record?.visibilidad]);

  const onShare = async () => {
    try {
      await Share.share({
        message:
          `${record?.nombre || "Meliponario"} — ${location}`,
      });
    } catch (err) {
      console.warn("ERROR COMPARTIR:", err?.message);
    }
  };

  const onFavorite = async () => {
    if (!favoriteKey) {
      aviso(
        "Inicia sesión",
        "Debes iniciar sesión para guardar favoritos."
      );
      return;
    }

    const next = !favorite;

    try {
      await AsyncStorage.setItem(
        favoriteKey,
        next ? "1" : "0"
      );

      setFavorite(next);
    } catch {
      aviso(
        "Error",
        "No se pudo guardar el favorito."
      );
    }
  };

  const onDirections = async () => {
    if (!hasCoords || !mayShowExact) {
      aviso(
        "Ubicación no disponible",
        "La ubicación exacta no está disponible para esta cuenta."
      );
      return;
    }

    try {
      await Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude}%2C${longitude}`
      );
    } catch {
      aviso(
        "Error",
        "No se pudieron abrir las indicaciones."
      );
    }
  };

  const onContact = async () => {
    if (!phone) {
      aviso(
        "Contacto no disponible",
        "No existe un teléfono de contacto registrado."
      );
      return;
    }

    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      aviso(
        "Error",
        "No se pudo abrir la aplicación de teléfono."
      );
    }
  };

  if (loading && !record) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator
          color={GREEN}
          size="large"
        />

        <Text style={styles.muted}>
          Cargando meliponario...
        </Text>
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={58}
          color="#747A76"
        />

        <Text style={styles.errorTitle}>
          Meliponario no encontrado
        </Text>

        <Text style={styles.muted}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.backAction}
          onPress={regresar}
        >
          <Text style={styles.backActionText}>
            Regresar
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={styles.gallery}
          onLayout={(event) => {
            setGalleryWidth(
              event.nativeEvent.layout.width
            );
          }}
        >
          {photos.length > 0 ? (
            <ScrollView
              ref={galleryRef}
              style={styles.galleryScroll}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={onGalleryScroll}
              onMomentumScrollEnd={onGalleryScroll}
            >
              {photos.map((uri, photoIndex) => (
                <Image
                  key={`${photoIndex}-${uri}`}
                  source={{ uri }}
                  style={[
                    styles.galleryImage,
                    { width: galleryWidth || 1 },
                  ]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons
                name="leaf-outline"
                size={67}
                color={GREEN}
              />

              <Text style={styles.noPhotoBrand}>
                KaabMap
              </Text>

              <Text style={styles.noPhotoCaption}>
                Sin fotografías registradas en Supabase
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.roundIcon, styles.backIcon]}
            onPress={regresar}
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color={GREEN}
            />
          </TouchableOpacity>

          {photos.length > 1 && (
            <View style={styles.dots}>
              {photos.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.dotTouch}
                  onPress={() => goToPhoto(i)}
                >
                  <View
                    style={[
                      styles.dot,
                      index === i && styles.dotActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {record.nombre}
            </Text>

            {refreshing && (
              <ActivityIndicator
                size="small"
                color={GREEN}
              />
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={17}
              color="#727D75"
            />

            <Text style={styles.location}>
              {location}
            </Text>
          </View>

          <View style={styles.badges}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    status.background,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      status.color,
                  },
                ]}
              />

              <Text
                style={[
                  styles.badgeText,
                  { color: status.color },
                ]}
              >
                {status.label}
              </Text>
            </View>

            {especies.length > 0 && (
              <View style={styles.softBadge}>
                <Ionicons
                  name="leaf-outline"
                  size={14}
                  color={GREEN}
                />

                <Text style={styles.softBadgeText}>
                  {especies[0].nombre ??
                    especies[0].nombre_comun ??
                    "Especie"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Ionicons
                name="person-outline"
                size={26}
                color={GREEN}
              />
            </View>

            <View style={styles.ownerContent}>
              <Text style={styles.ownerName}>
                Responsable:{" "}
                {responsable || "No disponible"}
              </Text>

              <Text style={styles.ownerSub}>
                Responsable registrado del meliponario
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Sobre este meliponario
          </Text>

          <Text style={styles.description}>
            {record.descripcion ||
              "Sin descripción registrada."}
          </Text>

          {isOwner && !!record.referencia_ubicacion && (
            <View style={styles.reference}>
              <Ionicons
                name="navigate-outline"
                size={17}
                color={GREEN}
              />

              <Text style={styles.referenceText}>
                {record.referencia_ubicacion}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            Especies registradas
          </Text>

          {especies.length > 0 ? (
            especies.map((item, i) => (
              <SpeciesCard
                key={`${item.id ?? i}-${i}`}
                item={item}
              />
            ))
          ) : (
            <Text style={styles.muted}>
              No hay especies registradas.
            </Text>
          )}

          <Text style={styles.sectionTitle}>
            Servicios
          </Text>

          <View style={styles.services}>
            <View
              style={[
                styles.service,
                record.ofrece_venta_miel &&
                  styles.serviceActive,
              ]}
            >
              <Ionicons
                name="water-outline"
                size={19}
                color={GREEN}
              />

              <Text style={styles.serviceText}>
                Miel:{" "}
                {record.ofrece_venta_miel ? "Sí" : "No"}
              </Text>
            </View>

            <View
              style={[
                styles.service,
                record.ofrece_visitas &&
                  styles.serviceActive,
              ]}
            >
              <Ionicons
                name="people-outline"
                size={19}
                color={GREEN}
              />

              <Text style={styles.serviceText}>
                Visitas:{" "}
                {record.ofrece_visitas ? "Sí" : "No"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Productos disponibles
          </Text>

          {!user?.id ? (
            <Text style={styles.muted}>
              Los productos públicos estarán disponibles cuando el backend
              habilite su consulta para visitantes.
            </Text>
          ) : errorProductos ? (
            <Text style={styles.muted}>
              No fue posible cargar los productos: {errorProductos}
            </Text>
          ) : productos.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Ionicons name="cube-outline" size={26} color="#747A76" />
              <Text style={styles.emptyBlockText}>
                Todavía no hay productos registrados para este meliponario.
              </Text>
            </View>
          ) : productos.map((producto) => (
            <View
              key={producto.id}
              style={{ flexDirection: "row", padding: 12, borderRadius: 14,
                backgroundColor: "#FFFFFF", marginBottom: 9, alignItems: "center", gap: 11 }}
            >
              {fotosProductos[String(producto.id)] ? (
                <Image
                  source={{ uri: fotosProductos[String(producto.id)] }}
                  style={{ width: 58, height: 58, borderRadius: 10 }}
                />
              ) : (
                <Ionicons name="cube-outline" size={25} color={GREEN} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: GREEN, fontWeight: "800", fontSize: 15 }}>
                  {producto.nombre}
                </Text>
                <Text style={styles.muted}>{[producto.presentacion, producto.cantidad].filter(Boolean).join(" · ")}</Text>
                <Text style={styles.muted}>{producto.disponibilidad}</Text>
                <Text style={styles.muted}>
                  {producto.punto_venta_tipo === "Punto de venta externo"
                    ? producto.punto_venta_nombre : "Venta en el meliponario"}
                </Text>
              </View>
            </View>
          ))}

          {puntosVenta.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.sectionTitle}>Dónde comprar</Text>
              {puntosVenta.map((punto) => (
                <PuntoVentaCard key={String(punto.id)} punto={punto} esPropietario={isOwner} />
              ))}
            </View>
          )}

          {record?.responsable_principal_id === user?.id && (
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate("Cuenta", {
                screen: "Products", params: { meliponarioId: id },
              })}
              style={{ alignSelf: "flex-start", paddingVertical: 10 }}
            >
              <Text style={{ color: GREEN, fontWeight: "800" }}>
                Administrar productos de este meliponario
              </Text>
            </TouchableOpacity>
          )}

          {!!error && (
            <View style={styles.warning}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#A66B00"
              />

              <Text style={styles.warningText}>
                {error}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionOutline,
            (!hasCoords || !mayShowExact) &&
              styles.disabledAction,
          ]}
          onPress={onDirections}
        >
          <Ionicons
            name="navigate-outline"
            size={20}
            color={GREEN}
          />

          <Text style={styles.outlineText}>
            Cómo llegar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionSolid,
            !phone && styles.disabledAction,
          ]}
          onPress={onContact}
        >
          <Ionicons
            name="call-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.solidText}>
            Contactar productor
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
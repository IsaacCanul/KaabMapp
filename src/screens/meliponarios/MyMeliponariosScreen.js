import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import { MAX_FOTOS } from "../../config/fotos";

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import {
  useMeliponarioDraft,
} from "../../context/MeliponarioDraftContext";

import {
  getMisMeliponariosRequest,
  getMeliponarioByIdRequest,
} from "../../services/meliponariosApi";

import {
  obtenerImagenesRemotas,
} from "../../services/meliponarioRemotePhotos";

import {
  enviarBorradorARevisionRequest,
} from "../../services/borradoresMeliponarioApi";

import {
  configurarPublicacionRequest,
} from "../../services/backend/formularioApi";

import {
  abrirAprobadoComoClienteRequest,
} from "../../services/edicionAprobadosApi";

import {
  getMeliponarioPhotos,
} from "../../services/meliponarioPhotos";

import {
  migrarFotosAnteriores,
} from "../../services/migrarFotosAnteriores";

const C = {
  cream: "#FCFAF2",
  white: "#FFFFFF",
  green: "#075A3D",
  dark: "#06492E",
  soft: "#EAF2EA",
  text: "#17251F",
  gray: "#747A76",
  border: "#E6E1D5",
  red: "#BE332B",
};

function mostrarAviso(titulo, mensaje) {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${titulo}\n\n${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

function confirmar(titulo, mensaje) {
  if (Platform.OS === "web") {
    return Promise.resolve(
      Boolean(
        globalThis.confirm?.(`${titulo}\n\n${mensaje}`)
      )
    );
  }

  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Confirmar",
          onPress: () => resolve(true),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => resolve(false),
      }
    );
  });
}

function estadoSolicitud(item) {
  return (
    item?.solicitud_estado ??
    item?.solicitud?.estado ??
    item?.estado_solicitud ??
    null
  );
}

function editable(item) {
  if (!item) return false;

  const estado = estadoSolicitud(item);

  return (
    estado === null ||
    estado === "borrador" ||
    estado === "correccion"
  );
}

function presentacionEstado(item) {
  if (
    item?.estado_operativo === "desactivado" ||
    item?.activo === false
  ) {
    return {
      titulo: "Desactivado",
      grupo: "pendientes",
      bg: "#EDEDED",
      fg: "#6F7470",
    };
  }

  const estado = estadoSolicitud(item);

  if (estado === null || estado === "borrador") {
    return {
      titulo: "Borrador",
      grupo: "borradores",
      bg: "#E8F0E8",
      fg: C.dark,
    };
  }

  if (estado === "correccion") {
    return {
      titulo: "Corrección solicitada",
      grupo: "pendientes",
      bg: "#FFF0CE",
      fg: "#926000",
    };
  }

  if (estado === "aprobada") {
    return {
      titulo: "Aprobado",
      grupo: "aprobados",
      bg: "#E5F3DF",
      fg: "#257849",
    };
  }

  if (estado === "rechazada") {
    return {
      titulo: "Rechazado",
      grupo: "pendientes",
      bg: "#FCE9E7",
      fg: C.red,
    };
  }

  if (estado === "en_revision" || estado === "enviada") {
    return {
      titulo:
        estado === "en_revision"
          ? "En revisión"
          : "Enviado",
      grupo: "pendientes",
      bg: "#FFF0CE",
      fg: "#926000",
    };
  }

  return {
    titulo: "Estado por confirmar",
    grupo: "pendientes",
    bg: "#EDEDED",
    fg: "#6F7470",
  };
}

function Action({
  title,
  icon,
  onPress,
  primary = false,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.78}
      accessibilityRole="button"
      style={[
        styles.action,
        primary && styles.primaryAction,
        disabled && styles.disabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={primary ? C.white : C.green}
      />

      <Text
        style={[
          styles.actionLabel,
          primary && styles.primaryActionLabel,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function asNumberOrNull(value) {
  if (value == null || value === "") return null;

  const n = Number(value);

  return Number.isFinite(n) ? n : null;
}

export default function MyMeliponariosScreen({
  navigation,
}) {
  const {
    replaceDraft,
    resetDraft,
    updateDraft,
  } = useMeliponarioDraft();

  const [registros, setRegistros] = useState([]);
  const [portadas, setPortadas] = useState({});
  const [fotosAntiguas, setFotosAntiguas] = useState({});
  const [filtro, setFiltro] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const recargar = useCallback(() => {
    setRevision((n) => n + 1);
  }, []);

  /* ===================================
     CARGAR REGISTROS Y PORTADAS
  =================================== */

  useFocusEffect(
    useCallback(() => {
      console.log(
        "KAABMAP MIS REGISTROS V4 - SUPABASE BORRADORES Y FOTOS"
      );

      let activo = true;

      async function cargar() {
        setCargando(true);
        setError("");

        try {
          const datos =
            await getMisMeliponariosRequest();

          const lista =
            Array.isArray(datos) ? datos : [];

          if (!activo) return;

          setRegistros(lista);

          const fotosPorRegistro =
            await Promise.all(
              lista.map(async (item) => {
                try {
                  const fotos =
                    await obtenerImagenesRemotas(item.id);

                  return [
                    String(item.id),
                    fotos?.[0]?.uri ?? null,
                  ];
                } catch (err) {
                  console.warn(
                    "FOTO REMOTA",
                    item.id,
                    err?.message
                  );

                  return [
                    String(item.id),
                    null,
                  ];
                }
              })
            );

          if (!activo) return;

          setPortadas(
            Object.fromEntries(fotosPorRegistro)
          );

          const antiguas = await Promise.all(
            lista.map(async (item) => {
              const tienePortada = fotosPorRegistro.some(
                ([id, uri]) =>
                  id === String(item.id) &&
                  Boolean(uri)
              );

              if (!editable(item) || tienePortada) {
                return [String(item.id), false];
              }

              try {
                const fotos =
                  await getMeliponarioPhotos(item.id);

                return [
                  String(item.id),
                  Array.isArray(fotos) &&
                    fotos.length > 0,
                ];
              } catch {
                return [String(item.id), false];
              }
            })
          );

          if (activo) {
            setFotosAntiguas(
              Object.fromEntries(antiguas)
            );
          }
        } catch (err) {
          if (activo) {
            setError(
              err?.message ??
                "No se pudieron cargar tus meliponarios."
            );
          }
        } finally {
          if (activo) setCargando(false);
        }
      }

      cargar();

      return () => {
        activo = false;
      };
    }, [revision])
  );

  /* ===================================
     FILTRAR
  =================================== */

  const visibles = useMemo(() => {
    if (filtro === "todos") return registros;

    return registros.filter(
      (item) =>
        presentacionEstado(item).grupo === filtro
    );
  }, [registros, filtro]);

  /* ===================================
     VER DETALLES
  =================================== */

  const abrirDetalle = (item) => {
    navigation.navigate("MeliponarioDetail", {
      id: item.id,
      meliponarioId: item.id,
      meliponario: item,
    });
  };

  /* ===================================
     EDITAR BORRADOR
  =================================== */

  const editarBorrador = async (item) => {
    if (ocupado !== null || !editable(item)) {
      return;
    }

    setOcupado(item.id);

    try {
      const [detalle, imagenes] = await Promise.all([
        getMeliponarioByIdRequest(item.id),
        obtenerImagenesRemotas(item.id),
      ]);

      if (!detalle) {
        throw new Error(
          "No se encontró el borrador en Supabase."
        );
      }

      const draft = {
        meliponarioId: item.id,
        localJobId: null,

        nombre: detalle.nombre ?? "",
        descripcion: detalle.descripcion ?? "",

        responsableNombre: [
          detalle.responsable?.nombre,
          detalle.responsable?.apellidos,
        ]
          .filter(Boolean)
          .join(" "),

        municipioId:
          detalle.municipio_id ?? null,

        municipio:
          detalle.municipio ?? "",

        localidadId:
          detalle.localidad_id ?? null,

        localidad:
          detalle.localidad ?? "",

        latitude: asNumberOrNull(
          detalle.latitude ?? detalle.latitud
        ),

        longitude: asNumberOrNull(
          detalle.longitude ?? detalle.longitud
        ),

        locationSource: "manual",
        locationAccuracy: null,

        referenciaUbicacion:
          detalle.referencia_ubicacion ?? "",

        observacionesCliente:
          detalle.observaciones_cliente ?? "",

        autorizacionUbicacionExacta: Boolean(
          detalle.autorizacion_ubicacion_exacta
        ),

        autorizacionPublicacion: Boolean(
          detalle.autorizacion_ubicacion_exacta &&
          detalle.autorizacion_contacto_publico
        ),

        ofreceVentaMiel: Boolean(
          detalle.ofrece_venta_miel
        ),

        ofreceVisitas: Boolean(
          detalle.ofrece_visitas
        ),

        especies: (
          Array.isArray(detalle.especies)
            ? detalle.especies
            : []
        ).map((s) => ({
          id:
            s.especieId ??
            s.especie_id ??
            s.id,

          especieId:
            s.especieId ??
            s.especie_id ??
            s.id,

          nombre:
            s.nombre ??
            s.nombre_comun ??
            "",

          cientifico:
            s.nombreCientifico ??
            s.nombre_cientifico ??
            s.cientifico ??
            "",

          maya: s.maya ?? "",

          cajasTecnificadas: Number(
            s.cajasTecnificadas ??
            s.cantidad_cajas ??
            0
          ),

          jobones: Number(
            s.jobones ??
            s.cantidad_jobones ??
            0
          ),
        })),

        imagenes: imagenes.slice(0, MAX_FOTOS),
      };

      if (
        draft.latitude == null ||
        draft.longitude == null
      ) {
        throw new Error(
          "No se recuperaron las coordenadas del borrador. " +
          "Para evitar sobrescribir la ubicación, " +
          "revisa primero la respuesta de la API."
        );
      }

      if (typeof replaceDraft === "function") {
        replaceDraft(draft);
      } else {
        resetDraft();
        updateDraft(draft);
      }

      navigation.navigate("RegisterStep1");
    } catch (err) {
      mostrarAviso(
        "No se pudo abrir el borrador",
        err?.message ?? "Error inesperado."
      );
    } finally {
      setOcupado(null);
    }
  };

  /* ===================================
     ENVIAR A REVISIÓN
  =================================== */

  const enviarRevision = async (item) => {
    if (ocupado !== null || !editable(item)) {
      return;
    }

    const esCorreccion =
      estadoSolicitud(item) === "correccion";

    const acepto = await confirmar(
      esCorreccion
        ? "Reenviar corrección"
        : "Enviar a revisión",
      `¿Confirmas que los datos de «${item.nombre}» ` +
        "están completos? Después del envío no podrás editarlos libremente."
    );

    if (!acepto) return;

    setOcupado(item.id);

    try {
      await enviarBorradorARevisionRequest(item.id);

      mostrarAviso(
        "Solicitud enviada",
        "El registro fue enviado a revisión correctamente."
      );

      recargar();
    } catch (err) {
      mostrarAviso(
        "No se pudo enviar",
        err?.message ??
          "Error al enviar a revisión."
      );
    } finally {
      setOcupado(null);
    }
  };

  /* ===================================
     EDITAR UN MELIPONARIO APROBADO
     Abre el mismo formulario del registro; al guardar, el
     cambio se aplica directo (sin nueva revisión).
  =================================== */

  const editarAprobado = async (item) => {
    if (ocupado !== null) return;

    setOcupado(item.id);

    try {
      const draft = await abrirAprobadoComoClienteRequest(item.id);

      if (draft.latitude == null || draft.longitude == null) {
        throw new Error(
          "No se recuperaron las coordenadas del meliponario. " +
          "Para no sobrescribir la ubicación, no se abrirá la edición."
        );
      }

      if (typeof replaceDraft === "function") {
        replaceDraft(draft);
      } else {
        resetDraft();
        updateDraft(draft);
      }

      navigation.navigate("RegisterStep1");
    } catch (err) {
      mostrarAviso(
        "No se pudo abrir la edición",
        err?.message ?? "Error inesperado."
      );
    } finally {
      setOcupado(null);
    }
  };

  /* ===================================
     PUBLICAR UN MELIPONARIO APROBADO
  =================================== */

  const publicar = async (item) => {
    if (ocupado !== null) return;

    const acepto = await confirmar(
      "Publicar meliponario",
      `Al publicar «${item.nombre}», cualquier persona, con o sin ` +
        "cuenta, podrá ver su ubicación exacta en el mapa y tu " +
        "número de teléfono de contacto. ¿Lo autorizas?"
    );

    if (!acepto) return;

    setOcupado(item.id);

    try {
      await configurarPublicacionRequest(item.id, true);

      mostrarAviso(
        "Meliponario publicado",
        "Ya aparece en el inicio y en el mapa para todas las personas."
      );

      recargar();
    } catch (err) {
      mostrarAviso(
        "No se pudo publicar",
        err?.message ??
          "Error al publicar el meliponario."
      );
    } finally {
      setOcupado(null);
    }
  };

  /* ===================================
     RECUPERAR FOTOS ANTIGUAS
  =================================== */

  const recuperarFotosAntiguas = async (item) => {
    if (ocupado !== null || !editable(item)) {
      return;
    }

    const acepto = await confirmar(
      "Recuperar fotografías antiguas",
      `Se encontraron fotos anteriores de «${item.nombre}» ` +
        "en este dispositivo. ¿Quieres subirlas a Supabase?"
    );

    if (!acepto) return;

    setOcupado(item.id);

    try {
      await migrarFotosAnteriores(item.id);

      mostrarAviso(
        "Fotografías sincronizadas",
        "Ahora están vinculadas al meliponario en Supabase."
      );

      recargar();
    } catch (err) {
      mostrarAviso(
        "No se pudieron subir",
        err?.message ??
          "No fue posible migrar las fotografías."
      );
    } finally {
      setOcupado(null);
    }
  };

  /* ===================================
     PANTALLA
  =================================== */

  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={cargando}
            onRefresh={recargar}
            tintColor={C.green}
          />
        }
      >
        <Text style={styles.title}>
          Mis meliponarios
        </Text>

        <Text style={styles.subtitle}>
          Guarda y modifica borradores.
          Cuando estén listos, envíalos a revisión.
        </Text>

        <View style={styles.filters}>
          {[
            ["todos", "Todos"],
            ["borradores", "Borradores"],
            ["pendientes", "Pendientes"],
            ["aprobados", "Aprobados"],
          ].map(([value, label]) => (
            <TouchableOpacity
              key={value}
              onPress={() => setFiltro(value)}
              style={[
                styles.filter,
                filtro === value &&
                  styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filtro === value &&
                    styles.filterTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {cargando && registros.length === 0 && (
          <ActivityIndicator
            color={C.green}
            size="large"
            style={{ marginVertical: 28 }}
          />
        )}

        {!!error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        {!cargando &&
          !error &&
          visibles.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons
                name="leaf-outline"
                color={C.green}
                size={40}
              />

              <Text style={styles.emptyText}>
                No hay meliponarios en esta categoría.
              </Text>
            </View>
          )}

        {visibles.map((item) => {
          const estado = presentacionEstado(item);
          const puedeEditar = editable(item);
          const portada = portadas[String(item.id)];

          return (
            <View
              key={String(item.id)}
              style={styles.card}
            >
              <View style={styles.cover}>
                {portada ? (
                  <Image
                    source={{ uri: portada }}
                    style={styles.coverImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="leaf-outline"
                    size={50}
                    color={C.green}
                  />
                )}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.headingRow}>
                  <Text style={styles.name}>
                    {item.nombre || "Meliponario"}
                  </Text>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: estado.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: estado.fg },
                      ]}
                    >
                      {estado.titulo}
                    </Text>
                  </View>
                </View>

                {!!item.descripcion && (
                  <Text style={styles.description}>
                    {item.descripcion}
                  </Text>
                )}

                <View style={styles.visibilityRow}>
                  <Ionicons
                    name={
                      item.visibilidad === "publico"
                        ? "globe-outline"
                        : "lock-closed-outline"
                    }
                    size={15}
                    color={C.gray}
                  />

                  <Text style={styles.visibility}>
                    {item.visibilidad === "publico"
                      ? "Público"
                      : "Privado"}
                  </Text>
                </View>

                <Action
                  title="Ver detalles"
                  icon="eye-outline"
                  onPress={() => abrirDetalle(item)}
                  disabled={ocupado !== null}
                />

                {puedeEditar && (
                  <>
                    <Action
                      title={
                        estadoSolicitud(item) === "correccion"
                          ? "Corregir datos"
                          : "Editar borrador"
                      }
                      icon="create-outline"
                      onPress={() => editarBorrador(item)}
                      disabled={ocupado !== null}
                    />

                    <Action
                      title={
                        estadoSolicitud(item) === "correccion"
                          ? "Reenviar corrección"
                          : "Enviar a revisión"
                      }
                      icon="send-outline"
                      primary
                      onPress={() => enviarRevision(item)}
                      disabled={ocupado !== null}
                    />
                  </>
                )}

                {estadoSolicitud(item) === "aprobada" && (
                  <Action
                    title="Editar meliponario"
                    icon="create-outline"
                    onPress={() => editarAprobado(item)}
                    disabled={ocupado !== null}
                  />
                )}

                {estadoSolicitud(item) === "aprobada" &&
                  item.visibilidad !== "publico" && (
                    <Action
                      title="Enviar registro"
                      icon="globe-outline"
                      primary
                      onPress={() => publicar(item)}
                      disabled={ocupado !== null}
                    />
                  )}

                {puedeEditar &&
                  fotosAntiguas[String(item.id)] &&
                  !portada && (
                    <Action
                      title="Subir fotos anteriores a Supabase"
                      icon="cloud-upload-outline"
                      onPress={() =>
                        recuperarFotosAntiguas(item)
                      }
                      disabled={ocupado !== null}
                    />
                  )}

                {!puedeEditar && (
                  <Text style={styles.notice}>
                    Los registros enviados o aprobados
                    no pueden eliminarse directamente.
                    Su desactivación corresponde al
                    personal autorizado.
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={[
            styles.addButton,
            ocupado !== null && styles.disabled,
          ]}
          onPress={() => {
            resetDraft();
            navigation.navigate("RegisterStep1");
          }}
          disabled={ocupado !== null}
          accessibilityRole="button"
        >
          <Ionicons
            name="add"
            size={25}
            color={C.white}
          />

          <Text style={styles.addText}>
            Registrar meliponario
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.cream,
  },
  content: {
    padding: 18,
    paddingBottom: 108,
  },
  title: {
    fontSize: 29,
    fontWeight: "900",
    color: C.dark,
  },
  subtitle: {
    fontSize: 15,
    color: C.gray,
    lineHeight: 22,
    marginTop: 7,
    marginBottom: 20,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22,
  },
  filter: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 26,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  filterActive: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  filterText: {
    color: C.dark,
    fontSize: 13,
    fontWeight: "800",
  },
  filterTextActive: {
    color: C.white,
  },
  card: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: C.white,
    marginBottom: 18,
  },
  cover: {
    height: 152,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.soft,
  },
  coverImage: {
    height: "100%",
    width: "100%",
  },
  cardBody: {
    padding: 17,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  name: {
    flex: 1,
    color: C.dark,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 27,
  },
  badge: {
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 138,
  },
  badgeText: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "900",
  },
  description: {
    fontSize: 14,
    color: C.gray,
    marginTop: 10,
    lineHeight: 20,
  },
  visibilityRow: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 5,
  },
  visibility: {
    color: C.gray,
    fontSize: 13,
  },
  action: {
    minHeight: 45,
    borderRadius: 13,
    marginTop: 10,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  primaryAction: {
    backgroundColor: C.green,
    borderColor: C.green,
  },
  disabled: {
    opacity: 0.55,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: C.dark,
    textAlign: "center",
  },
  primaryActionLabel: {
    color: C.white,
  },
  notice: {
    fontSize: 12,
    lineHeight: 18,
    color: C.gray,
    marginTop: 14,
  },
  addButton: {
    minHeight: 60,
    borderRadius: 17,
    backgroundColor: C.green,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  addText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "900",
  },
  error: {
    color: C.red,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: C.gray,
    fontSize: 14,
    textAlign: "center",
  },
});
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

import AppLogo from "../../components/AppLogo";
import { contarNoLeidasRequest } from "../../services/notificacionesApi";
import KaabMapMap from "../../components/Mapa";

import {
  getMeliponariosMapaRequest,
} from "../../services/mapaMeliponariosApi";

import {
  obtenerImagenesRemotas,
} from "../../services/meliponarioRemotePhotos";

const C = {
  green: "#06492E",
  action: "#075A3D",
  cream: "#FCFAF2",
  border: "#E6E1D5",
  gray: "#747A76",
};

function norm(v) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function numero(v) {
  if (
    v === null ||
    v === undefined ||
    v === ""
  ) {
    return null;
  }

  const n = Number(v);

  return Number.isFinite(n)
    ? n
    : null;
}

function tipoOferta(item) {
  const miel = Boolean(
    item.vende_miel ??
    item.vendeMiel ??
    item.ofrece_venta_miel
  );

  const visitas = Boolean(
    item.acepta_visitas ??
    item.visitable ??
    item.ofrece_visitas
  );

  if (miel && visitas) return "ambos";
  if (miel) return "miel";
  if (visitas) return "visitas";

  return "neutro";
}

function Chip({
  label,
  active,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        s.chip,
        active && s.chipActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          s.chipText,
          active && s.chipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({
  navigation,
}) {
  const [registros, setRegistros] =
    useState([]);

  // Contador de notificaciones sin leer para la campanita.
  const [noLeidas, setNoLeidas] =
    useState(0);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      contarNoLeidasRequest().then((n) => {
        if (activo) setNoLeidas(n);
      });

      return () => {
        activo = false;
      };
    }, [])
  );

  const [portadas, setPortadas] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [tipo, setTipo] =
    useState("todos");

  const [municipio, setMunicipio] =
    useState("");

  const [localidad, setLocalidad] =
    useState("");

  const [mostrarFiltros, setMostrarFiltros] =
    useState(false);

  const [revision, setRevision] =
    useState(0);

  /* =========================================
     CARGAR MELIPONARIOS PÚBLICOS
  ========================================= */

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargar() {
        setLoading(true);
        setError("");

        try {
          // Inicio muestra los meliponarios publicados
          // y, con sesión, también los propios ya
          // aprobados (no borradores ni pendientes).
          const data =
            await getMeliponariosMapaRequest();

          const lista = (
            Array.isArray(data) ? data : []
          ).filter((item) =>
            !item.es_mio ||
            item.solicitud_estado === "aprobada"
          ).map((item) => ({
            ...item,

            latitude: numero(
              item.latitude ?? item.latitud
            ),

            longitude: numero(
              item.longitude ?? item.longitud
            ),
          }));

          if (!activo) return;

          setRegistros(lista);

          /* PORTADAS DE SUPABASE */

          const resultados =
            await Promise.all(
              lista.map(async (item) => {
                try {
                  const fotos =
                    await obtenerImagenesRemotas(
                      item.id
                    );

                  return [
                    String(item.id),
                    fotos?.[0]?.uri ?? null,
                  ];
                } catch (e) {
                  console.warn(
                    "INICIO: foto remota",
                    item.id,
                    e?.message
                  );

                  return [
                    String(item.id),
                    null,
                  ];
                }
              })
            );

          if (activo) {
            setPortadas(
              Object.fromEntries(
                resultados
              )
            );
          }
        } catch (e) {
          if (activo) {
            setError(
              e?.message ??
              "No se pudieron consultar los meliponarios públicos."
            );

            setRegistros([]);
            setPortadas({});
          }
        } finally {
          if (activo) {
            setLoading(false);
          }
        }
      }

      cargar();

      return () => {
        activo = false;
      };
    }, [revision])
  );

  /* =========================================
     FILTROS DE UBICACIÓN
  ========================================= */

  const municipios = useMemo(
    () =>
      [
        ...new Set(
          registros
            .map((i) =>
              String(
                i.municipio ?? ""
              ).trim()
            )
            .filter(Boolean)
        ),
      ].sort(),
    [registros]
  );

  const localidades = useMemo(
    () =>
      [
        ...new Set(
          registros
            .filter(
              (i) =>
                !municipio ||
                norm(i.municipio) ===
                  norm(municipio)
            )
            .map((i) =>
              String(
                i.localidad ?? ""
              ).trim()
            )
            .filter(Boolean)
        ),
      ].sort(),
    [registros, municipio]
  );

  /* =========================================
     APLICAR FILTROS
  ========================================= */

  const visibles = useMemo(
    () =>
      registros.filter((item) => {
        const busqueda = [
          item.nombre,
          item.descripcion,
          item.municipio,
          item.localidad,
        ]
          .map(norm)
          .join(" ");

        if (
          search &&
          !busqueda.includes(
            norm(search)
          )
        ) {
          return false;
        }

        if (
          tipo !== "todos" &&
          tipoOferta(item) !== tipo
        ) {
          return false;
        }

        if (
          municipio &&
          norm(item.municipio) !==
            norm(municipio)
        ) {
          return false;
        }

        if (
          localidad &&
          norm(item.localidad) !==
            norm(localidad)
        ) {
          return false;
        }

        return true;
      }),
    [
      registros,
      search,
      tipo,
      municipio,
      localidad,
    ]
  );

  const marcadores = useMemo(
    () =>
      visibles.filter(
        (i) =>
          i.latitude !== null &&
          i.longitude !== null
      ),
    [visibles]
  );

  /* =========================================
     NAVEGACIÓN
  ========================================= */

  const verDetalle = (item) => {
    navigation.navigate(
      "MeliponarioDetail",
      {
        id: item.id,
        meliponarioId: item.id,
        meliponario: item,
      }
    );
  };

  const abrirMapa = () => {
    navigation.getParent()?.navigate(
      "Mapa",
      {
        screen: "MapScreen",
      }
    );
  };

  /* =========================================
     PANTALLA
  ========================================= */

  return (
    <SafeAreaView
      style={s.screen}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* CABECERA */}

        <View style={s.header}>
          <AppLogo compact />

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "Notifications"
              )
            }
            accessibilityLabel={
              noLeidas
                ? `Notificaciones, ${noLeidas} sin leer`
                : "Notificaciones"
            }
            style={s.bell}
          >
            <Ionicons
              name={
                noLeidas
                  ? "notifications"
                  : "notifications-outline"
              }
              color={C.green}
              size={24}
            />

            {noLeidas > 0 && (
              <View style={s.bellBadge}>
                <Text style={s.bellBadgeText}>
                  {noLeidas > 9 ? "9+" : noLeidas}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={s.title}>
          Explora meliponarios de Yucatán
        </Text>

        <Text style={s.subtitle}>
          Conoce los meliponarios que han
          autorizado su publicación.
        </Text>

        {/* BÚSQUEDA */}

        <View style={s.search}>
          <Ionicons
            name="search-outline"
            color={C.green}
            size={21}
          />

          <TextInput
            style={s.input}
            placeholder="Nombre, localidad o municipio"
            placeholderTextColor={C.gray}
            value={search}
            onChangeText={setSearch}
          />

          <TouchableOpacity
            onPress={() =>
              setMostrarFiltros(
                (v) => !v
              )
            }
          >
            <Ionicons
              name="options-outline"
              color={C.green}
              size={22}
            />
          </TouchableOpacity>
        </View>

        {/* FILTROS DE OFERTA */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chips}
        >
          {[
            ["todos", "Todos"],
            ["miel", "Miel"],
            ["visitas", "Visitas"],
            ["ambos", "Ambos"],
            ["neutro", "Sin categoría"],
          ].map(([id, titulo]) => (
            <Chip
              key={id}
              label={titulo}
              active={tipo === id}
              onPress={() =>
                setTipo(id)
              }
            />
          ))}
        </ScrollView>

        {/* MUNICIPIOS Y LOCALIDADES */}

        {mostrarFiltros && (
          <View style={s.filters}>
            <View style={s.row}>
              <Text style={s.filterTitle}>
                Municipio y localidad
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setMunicipio("");
                  setLocalidad("");
                  setSearch("");
                  setTipo("todos");
                }}
              >
                <Text style={s.link}>
                  Limpiar
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={s.filterLabel}>
              Municipio
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chips}
            >
              <Chip
                label="Todos"
                active={!municipio}
                onPress={() => {
                  setMunicipio("");
                  setLocalidad("");
                }}
              />

              {municipios.map((m) => (
                <Chip
                  key={m}
                  label={m}
                  active={municipio === m}
                  onPress={() => {
                    setMunicipio(m);
                    setLocalidad("");
                  }}
                />
              ))}
            </ScrollView>

            <Text style={s.filterLabel}>
              Localidad
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chips}
            >
              <Chip
                label="Todas"
                active={!localidad}
                onPress={() =>
                  setLocalidad("")
                }
              />

              {localidades.map((l) => (
                <Chip
                  key={l}
                  label={l}
                  active={localidad === l}
                  onPress={() =>
                    setLocalidad(l)
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* MAPA */}

        <View style={s.row}>
          <Text style={s.section}>
            Explorar en el mapa
          </Text>

          <TouchableOpacity
            onPress={abrirMapa}
          >
            <Text style={s.link}>
              Ver mapa
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.mapContainer}>
          <KaabMapMap
            mode="explorar"
            markers={marcadores}
            onMarkerPress={verDetalle}
          />
        </View>

        {/* LISTADO */}

        <View style={s.row}>
          <Text style={s.section}>
            Meliponarios publicados
          </Text>

          <TouchableOpacity
            onPress={() =>
              setRevision((v) => v + 1)
            }
          >
            <Ionicons
              name="refresh"
              size={21}
              color={C.green}
            />
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color={C.green}
            style={{
              marginTop: 20,
            }}
          />
        )}

        {!!error && (
          <Text style={s.error}>
            {error}
          </Text>
        )}

        {!loading &&
          !error &&
          visibles.length === 0 && (
            <Text style={s.empty}>
              No hay meliponarios publicados
              disponibles para estos filtros.
              Si deberían aparecer, revisa el
              acceso anónimo de la RPC y sus
              políticas RLS.
            </Text>
          )}

        {!loading &&
          visibles.map((item) => (
            <TouchableOpacity
              key={String(item.id)}
              style={s.card}
              onPress={() =>
                verDetalle(item)
              }
            >
              {/* PORTADA REMOTA */}

              {portadas[String(item.id)] ? (
                <Image
                  source={{
                    uri:
                      portadas[
                        String(item.id)
                      ],
                  }}
                  style={s.cover}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    s.cover,
                    s.placeholder,
                  ]}
                >
                  <Ionicons
                    name="leaf-outline"
                    color={C.green}
                    size={48}
                  />
                </View>
              )}

              {/* DATOS */}

              <View style={s.cardBody}>
                <View style={s.row}>
                  <Text style={s.cardTitle}>
                    {item.nombre ??
                      "Meliponario"}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={C.action}
                  />
                </View>

                <Text style={s.location}>
                  {[
                    item.localidad,
                    item.municipio,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                    "Yucatán"}
                </Text>

                {!!item.descripcion && (
                  <Text
                    style={s.description}
                    numberOfLines={2}
                  >
                    {item.descripcion}
                  </Text>
                )}

                <Text style={s.view}>
                  Ver detalles
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================
   ESTILOS
========================================= */

const s = StyleSheet.create({
  bell: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  bellBadge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#B42318",
    alignItems: "center",
    justifyContent: "center",
  },

  bellBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  screen: {
    flex: 1,
    backgroundColor: C.cream,
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    minHeight: 40,
  },

  title: {
    color: C.green,
    fontWeight: "900",
    fontSize: 28,
    lineHeight: 35,
  },

  subtitle: {
    color: C.gray,
    marginTop: 7,
    marginBottom: 15,
    lineHeight: 20,
    fontSize: 14,
  },

  search: {
    backgroundColor: "white",
    borderColor: C.border,
    borderWidth: 1,
    minHeight: 54,
    borderRadius: 27,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: C.green,
  },

  chips: {
    gap: 8,
    paddingVertical: 12,
    paddingRight: 13,
  },

  chip: {
    backgroundColor: "white",
    borderColor: C.border,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },

  chipActive: {
    backgroundColor: C.action,
    borderColor: C.action,
  },

  chipText: {
    color: C.green,
    fontWeight: "800",
    fontSize: 12,
  },

  chipTextActive: {
    color: "white",
  },

  filters: {
    backgroundColor: "#F2F6F0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },

  filterTitle: {
    color: C.green,
    fontWeight: "800",
  },

  filterLabel: {
    color: C.gray,
    fontSize: 12,
    fontWeight: "700",
    paddingTop: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  section: {
    color: C.green,
    fontSize: 19,
    fontWeight: "900",
    paddingTop: 19,
    paddingBottom: 10,
    flex: 1,
  },

  link: {
    color: C.action,
    fontWeight: "800",
    fontSize: 12,
  },

  mapContainer: {
    height: 235,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    overflow: "hidden",
  },

  error: {
    color: "#A33232",
    backgroundColor: "#FFF0F0",
    padding: 12,
    borderRadius: 10,
  },

  empty: {
    color: C.gray,
    lineHeight: 20,
    paddingVertical: 20,
  },

  card: {
    backgroundColor: "white",
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginVertical: 9,
  },

  cover: {
    height: 145,
    width: "100%",
  },

  placeholder: {
    backgroundColor: "#EAF2EA",
    alignItems: "center",
    justifyContent: "center",
  },

  cardBody: {
    padding: 15,
  },

  cardTitle: {
    color: C.green,
    fontWeight: "900",
    fontSize: 19,
    flex: 1,
  },

  location: {
    color: C.gray,
    marginTop: 7,
    fontSize: 13,
  },

  description: {
    color: C.gray,
    marginTop: 9,
    lineHeight: 19,
  },

  view: {
    color: C.action,
    fontWeight: "800",
    paddingTop: 9,
    fontSize: 12,
  },
});
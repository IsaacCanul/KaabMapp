import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import KaabMapMap from "../../components/Mapa";
import {
  getMeliponariosMapaRequest,
} from "../../services/mapaMeliponariosApi";
import {
  obtenerUbicacionActual,
  pareceEstarEnYucatan,
} from "../../utils/location";

const C = {
  green: "#06492E",
  action: "#075A3D",
  cream: "#FCFAF2",
  border: "#E6E1D5",
  gray: "#747A76",
};

function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function distancia(a, b) {
  const rad = (n) => n * Math.PI / 180;

  const dLat = rad(
    b.latitude - a.latitude
  );

  const dLon = rad(
    b.longitude - a.longitude
  );

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(
    Math.sqrt(h),
    Math.sqrt(1 - h)
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        s.chip,
        active && s.chipActive,
      ]}
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

export default function MapScreen({ navigation }) {
  const [todos, setTodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [buscar, setBuscar] = useState("");
  const [tipo, setTipo] = useState("todos");

  const [municipio, setMunicipio] =
    useState("");

  const [localidad, setLocalidad] =
    useState("");

  const [filtros, setFiltros] =
    useState(false);

  const [cerca, setCerca] =
    useState(false);

  const [ubicacion, setUbicacion] =
    useState(null);

  const [centrar, setCentrar] =
    useState(null);

  const [mensaje, setMensaje] =
    useState("");

  const [revision, setRevision] =
    useState(0);

  const recargar = () =>
    setRevision((n) => n + 1);

  /* =========================================
     CARGAR MAPA DESDE SUPABASE
  ========================================= */

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargar() {
        setCargando(true);
        setError("");

        try {
          const lista =
            await getMeliponariosMapaRequest();

          if (activo) {
            setTodos(
              Array.isArray(lista) ? lista : []
            );
          }
        } catch (e) {
          if (activo) {
            setError(
              e?.message ??
              "No fue posible cargar el mapa."
            );

            setTodos([]);
          }
        } finally {
          if (activo) {
            setCargando(false);
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
     MUNICIPIOS Y LOCALIDADES
  ========================================= */

  const municipios = useMemo(
    () =>
      [
        ...new Set(
          todos
            .map((i) =>
              String(i.municipio ?? "").trim()
            )
            .filter(Boolean)
        ),
      ].sort(),
    [todos]
  );

  const localidades = useMemo(
    () =>
      [
        ...new Set(
          todos
            .filter(
              (i) =>
                !municipio ||
                normalizar(i.municipio) ===
                  normalizar(municipio)
            )
            .map((i) =>
              String(i.localidad ?? "").trim()
            )
            .filter(Boolean)
        ),
      ].sort(),
    [todos, municipio]
  );

  /* =========================================
     APLICAR FILTROS
  ========================================= */

  const visibles = useMemo(
    () =>
      todos.filter((item) => {
        if (
          !item ||
          !Number.isFinite(Number(item.latitude)) ||
          !Number.isFinite(Number(item.longitude))
        ) {
          return false;
        }

        const contenido = [
          item.nombre,
          item.descripcion,
          item.municipio,
          item.localidad,
        ]
          .map(normalizar)
          .join(" ");

        if (
          buscar &&
          !contenido.includes(normalizar(buscar))
        ) {
          return false;
        }

        if (
          municipio &&
          normalizar(item.municipio) !==
            normalizar(municipio)
        ) {
          return false;
        }

        if (
          localidad &&
          normalizar(item.localidad) !==
            normalizar(localidad)
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
          cerca &&
          ubicacion &&
          distancia(ubicacion, item) > 50
        ) {
          return false;
        }

        return true;
      }),
    [
      todos,
      buscar,
      municipio,
      localidad,
      tipo,
      cerca,
      ubicacion,
    ]
  );

  /* =========================================
     NAVEGACIÓN
  ========================================= */

  const irADetalle = (item) => {
    navigation.navigate(
      "MeliponarioDetail",
      {
        id: item.id,
        meliponarioId: item.id,
        meliponario: item,
      }
    );
  };

  /* =========================================
     FILTRO CERCA DE MÍ
  ========================================= */

  const activarCerca = async () => {
    if (cerca) {
      setCerca(false);
      return;
    }

    try {
      setMensaje("");

      const pos =
        ubicacion ??
        await obtenerUbicacionActual();

      if (!pareceEstarEnYucatan(pos)) {
        setMensaje(
          "La ubicación del dispositivo está fuera de Yucatán; " +
          "no se activó el filtro."
        );
        return;
      }

      setUbicacion(pos);
      setCerca(true);

      setCentrar({
        ...pos,
        zoom: 11,
      });
    } catch (e) {
      setMensaje(
        e?.message ??
        "No se pudo obtener tu ubicación."
      );
    }
  };

  const limpiar = () => {
    setBuscar("");
    setTipo("todos");
    setMunicipio("");
    setLocalidad("");
    setCerca(false);
  };

  /* =========================================
     PANTALLA
  ========================================= */

  return (
    <SafeAreaView
      style={s.screen}
      edges={["top"]}
    >
      <View style={s.header}>
        <View style={s.titleRow}>
          <Text style={s.title}>
            Mapa de meliponarios
          </Text>

          <TouchableOpacity
            onPress={recargar}
            accessibilityLabel="Actualizar mapa"
          >
            <Ionicons
              name="refresh"
              color={C.green}
              size={23}
            />
          </TouchableOpacity>
        </View>

        <Text style={s.subtitle}>
          Explora los publicados y, al iniciar sesión,
          tus propios registros privados.
        </Text>

        {/* BÚSQUEDA */}

        <View style={s.search}>
          <Ionicons
            name="search-outline"
            size={20}
            color={C.green}
          />

          <TextInput
            style={s.input}
            value={buscar}
            onChangeText={setBuscar}
            placeholder="Buscar nombre, municipio o localidad"
            placeholderTextColor={C.gray}
          />

          <TouchableOpacity
            onPress={() =>
              setFiltros((v) => !v)
            }
          >
            <Ionicons
              name="options-outline"
              size={23}
              color={C.green}
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
          ].map(([valor, nombre]) => (
            <Chip
              key={valor}
              label={nombre}
              active={tipo === valor}
              onPress={() => setTipo(valor)}
            />
          ))}

          <Chip
            label="Cerca de mí"
            active={cerca}
            onPress={activarCerca}
          />
        </ScrollView>
      </View>

      {/* FILTROS DE UBICACIÓN */}

      {filtros && (
        <View style={s.filters}>
          <View style={s.titleRow}>
            <Text style={s.filterTitle}>
              Filtrar ubicación
            </Text>

            <TouchableOpacity onPress={limpiar}>
              <Text style={s.link}>
                Limpiar
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={s.filterCaption}>
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

          <Text style={s.filterCaption}>
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

      {/* MENSAJES */}

      {!!mensaje && (
        <Text style={s.warning}>
          {mensaje}
        </Text>
      )}

      {!!error && (
        <Text style={s.warning}>
          {error}
        </Text>
      )}

      {/* MAPA */}

      <View style={s.mapContainer}>
        <KaabMapMap
          mode="explorar"
          markers={visibles}
          centerOn={centrar}
          userLocation={ubicacion}
          onMarkerPress={irADetalle}
        />

        {cargando && (
          <View style={s.loading}>
            <ActivityIndicator
              color={C.green}
              size="large"
            />
          </View>
        )}
      </View>

      {/* LISTADO */}

      <View style={s.listSection}>
        <Text style={s.count}>
          {visibles.length} meliponario(s)
          con ubicación visible
        </Text>

        {!cargando &&
          visibles.length === 0 && (
            <Text style={s.empty}>
              No hay puntos disponibles para esta
              sesión o los filtros seleccionados.
              Si esperabas registros públicos,
              comprueba la RPC y sus políticas RLS.
            </Text>
          )}

        <ScrollView
          contentContainerStyle={s.list}
        >
          {visibles.map((item) => (
            <TouchableOpacity
              key={String(item.id)}
              style={s.card}
              onPress={() =>
                irADetalle(item)
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>
                  {item.nombre ??
                    "Meliponario"}
                </Text>

                <Text style={s.cardLocation}>
                  {[
                    item.localidad,
                    item.municipio,
                  ].filter(Boolean).join(", ") ||
                    "Yucatán"}
                </Text>

                <Text style={s.cardType}>
                  {item.es_mio
                    ? "Tu registro · "
                    : ""}

                  {item.visibilidad === "privado"
                    ? "Privado"
                    : "Ver detalles"}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                color={C.green}
                size={23}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* =========================================
   ESTILOS
========================================= */

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.cream,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: C.green,
  },
  subtitle: {
    color: C.gray,
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 8,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 18,
    paddingHorizontal: 13,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 49,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: C.green,
  },
  chips: {
    gap: 7,
    paddingVertical: 8,
    paddingRight: 15,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 25,
    backgroundColor: "white",
    borderColor: C.border,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: C.action,
    borderColor: C.action,
  },
  chipText: {
    color: C.green,
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "white",
  },
  filters: {
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: C.border,
    backgroundColor: "#F4F6EF",
  },
  filterTitle: {
    color: C.green,
    fontWeight: "800",
    paddingTop: 9,
  },
  link: {
    color: C.action,
    fontWeight: "800",
    paddingTop: 9,
  },
  filterCaption: {
    color: C.gray,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
  warning: {
    color: "#9D5A00",
    backgroundColor: "#FFF1D3",
    fontSize: 12,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  mapContainer: {
    flex: 1,
    minHeight: 220,
    position: "relative",
    borderTopWidth: 1,
    borderColor: C.border,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF99",
    alignItems: "center",
    justifyContent: "center",
  },
  listSection: {
    height: "30%",
    minHeight: 130,
    paddingTop: 9,
    borderTopColor: C.border,
    borderTopWidth: 1,
  },
  count: {
    color: C.green,
    fontSize: 12,
    fontWeight: "800",
    marginHorizontal: 16,
    marginBottom: 6,
  },
  empty: {
    color: C.gray,
    fontSize: 12,
    lineHeight: 18,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: {
    color: C.green,
    fontWeight: "900",
    fontSize: 14,
  },
  cardLocation: {
    color: C.gray,
    fontSize: 12,
    marginTop: 5,
  },
  cardType: {
    color: C.action,
    fontSize: 11,
    marginTop: 4,
  },
});
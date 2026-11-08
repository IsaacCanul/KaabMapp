import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import PrimaryButton
  from "../../components/PrimaryButton";

import RegisterLayout
  from "../../components/RegisterLayout";

import InfoBox
  from "../../components/InfoBox";

import RegisterLocationMap
  from "../../components/RegisterLocationMap";

import {
  useMeliponarioDraft,
} from "../../context/MeliponarioDraftContext";

import {
  estaEnYucatan,
  normalizarLugar,
  obtenerDireccionDesdeCoordenadas,
  obtenerUbicacionActual,
} from "../../utils/location";

import {
  getLocalidadesByMunicipioRequest,
  getMunicipiosRequest,
} from "../../services/ubicacionesApi";

import {
  geocodificarLugar,
} from "../../services/geocodificarLugar";

import styles
  from "./RegisterStep2Screen.styles";


/* =====================================================
   ENCONTRAR LOCALIDAD O MUNICIPIO
===================================================== */

function encontrarCoincidencia(catalogo, candidatos) {
  const values = (candidatos ?? [])
    .filter(Boolean)
    .map((value) => normalizarLugar(value))
    .filter(Boolean);

  for (const value of values) {
    const exacta = (catalogo ?? []).find(
      (item) =>
        normalizarLugar(item.nombre) === value
    );

    if (exacta) {
      return exacta;
    }
  }

  /*
   * Coincidencias parciales solo para
   * nombres suficientemente largos.
   */
  for (const value of values) {
    if (value.length < 5) continue;

    const parcial = (catalogo ?? []).find(
      (item) => {
        const nombre = normalizarLugar(
          item.nombre
        );

        return (
          nombre.length >= 5 &&
          (
            nombre.includes(value) ||
            value.includes(nombre)
          )
        );
      }
    );

    if (parcial) {
      return parcial;
    }
  }

  return null;
}


/* =====================================================
   NORMALIZAR COORDENADAS
===================================================== */

function normalizarPunto(value) {
  const latitude = Number(
    value?.latitude ??
    value?.coords?.latitude
  );

  const longitude = Number(
    value?.longitude ??
    value?.coords?.longitude
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    latitude,
    longitude,

    accuracy:
      value?.accuracy ??
      value?.coords?.accuracy ??
      null,
  };
}


/* =====================================================
   PANTALLA PASO 2
===================================================== */

export default function RegisterStep2Screen({
  navigation,
}) {
  const { draft, updateDraft } =
    useMeliponarioDraft();

  const initialPoint =
    draft.latitude != null &&
    draft.longitude != null
      ? {
          latitude: Number(draft.latitude),
          longitude: Number(draft.longitude),
        }
      : null;

  const [municipios, setMunicipios] =
    useState([]);

  const [localidades, setLocalidades] =
    useState([]);

  const [municipio, setMunicipio] =
    useState(
      draft.municipioId
        ? {
            id: draft.municipioId,
            nombre: draft.municipio ?? "",
          }
        : null
    );

  const [localidad, setLocalidad] =
    useState(
      draft.localidadId
        ? {
            id: draft.localidadId,
            nombre: draft.localidad ?? "",
          }
        : null
    );

  /*
   * Punto exacto elegido mediante
   * GPS o al tocar el mapa.
   */
  const [point, setPoint] =
    useState(initialPoint);

  /*
   * Punto aproximado obtenido al
   * seleccionar una localidad.
   *
   * No se guardará como posición exacta.
   */
  const [previewPoint, setPreviewPoint] =
    useState(null);

  /*
   * Indica al mapa que debe centrarse
   * en una posición determinada.
   */
  const [focus, setFocus] =
    useState(
      initialPoint
        ? {
            ...initialPoint,
            zoom: 15,
            token: 1,
          }
        : null
    );

  const [locationAccuracy, setLocationAccuracy] =
    useState(
      draft.locationAccuracy ?? null
    );

  const [locationSource, setLocationSource] =
    useState(
      draft.locationSource ?? null
    );

  const [selector, setSelector] =
    useState(null);

  const [loadingMunicipios, setLoadingMunicipios] =
    useState(true);

  const [loadingLocalidades, setLoadingLocalidades] =
    useState(false);

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [loadingPlace, setLoadingPlace] =
    useState(false);

  const [resolvingAddress, setResolvingAddress] =
    useState(false);

  const [detectionMessage, setDetectionMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * Evita que una búsqueda lenta reemplace
   * una ubicación seleccionada después.
   */
  const operationRef = useRef(0);
  const focusRef = useRef(1);


  /* ===================================================
     CENTRAR EL MAPA
  =================================================== */

  const centrarMapa = useCallback(
    (position, zoom = 15) => {
      focusRef.current += 1;

      setFocus({
        latitude: position.latitude,
        longitude: position.longitude,
        zoom,
        token: focusRef.current,
      });
    },
    []
  );


  /* ===================================================
     CARGAR MUNICIPIOS
  =================================================== */

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data =
          await getMunicipiosRequest();

        if (active) {
          setMunicipios(data ?? []);
        }
      } catch (err) {
        if (active) {
          setError(
            "No se pudieron cargar los municipios."
          );
        }
      } finally {
        if (active) {
          setLoadingMunicipios(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);


  /* ===================================================
     CARGAR LOCALIDADES DEL MUNICIPIO
  =================================================== */

  useEffect(() => {
    let active = true;

    async function load() {
      if (!municipio?.id) {
        setLocalidades([]);
        return;
      }

      setLoadingLocalidades(true);

      try {
        const data =
          await getLocalidadesByMunicipioRequest(
            municipio.id
          );

        if (active) {
          setLocalidades(data ?? []);
        }
      } catch (err) {
        if (active) {
          setError(
            "No se pudieron cargar las localidades."
          );
        }
      } finally {
        if (active) {
          setLoadingLocalidades(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [municipio?.id]);


  /* ===================================================
     AUTOCOMPLETAR DESDE COORDENADAS
  =================================================== */

  const detectarMunicipioYLocalidad =
    async (coords, operation) => {
      setResolvingAddress(true);

      try {
        const address =
          await obtenerDireccionDesdeCoordenadas({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

        if (operation !== operationRef.current) {
          return;
        }

        let disponibles = municipios;

        if (!disponibles.length) {
          disponibles =
            await getMunicipiosRequest();

          if (operation !== operationRef.current) {
            return;
          }

          setMunicipios(disponibles ?? []);
        }

        const foundMunicipio =
          encontrarCoincidencia(
            disponibles,
            address?.municipioCandidates
          );

        if (!foundMunicipio) {
          setDetectionMessage(
            "Se marcó la ubicación, pero no se encontró el municipio exacto en el catálogo. Selecciónalo manualmente."
          );
          return;
        }

        const availableLocalidades =
          await getLocalidadesByMunicipioRequest(
            foundMunicipio.id
          );

        if (operation !== operationRef.current) {
          return;
        }

        const foundLocalidad =
          encontrarCoincidencia(
            availableLocalidades,
            address?.localidadCandidates
          );

        setMunicipio(foundMunicipio);

        setLocalidades(
          availableLocalidades ?? []
        );

        setLocalidad(foundLocalidad ?? null);

        updateDraft({
          municipioId: foundMunicipio.id,
          municipio: foundMunicipio.nombre,

          localidadId:
            foundLocalidad?.id ?? null,

          localidad:
            foundLocalidad?.nombre ?? "",
        });

        if (foundLocalidad) {
          setDetectionMessage(
            `Ubicación detectada: ${foundLocalidad.nombre}, ${foundMunicipio.nombre}. Puedes corregirla manualmente.`
          );
        } else {
          setDetectionMessage(
            `Municipio detectado: ${foundMunicipio.nombre}. Selecciona la localidad correspondiente.`
          );
        }
      } catch (err) {
        if (operation === operationRef.current) {
          setDetectionMessage(
            "No fue posible identificar automáticamente la localidad. Selecciónala manualmente."
          );
        }
      } finally {
        if (operation === operationRef.current) {
          setResolvingAddress(false);
        }
      }
    };


  /* ===================================================
     SELECCIONAR MUNICIPIO

     NUEVO: CENTRAR MAPA EN MUNICIPIO
  =================================================== */

  const selectMunicipio = async (item) => {
    const operation = ++operationRef.current;

    setSelector(null);
    setMunicipio(item);
    setLocalidad(null);
    setLocalidades([]);

    setPoint(null);
    setPreviewPoint(null);
    setLocationAccuracy(null);
    setLocationSource(null);

    setError("");
    setDetectionMessage(
      "Buscando el municipio en el mapa..."
    );

    updateDraft({
      municipioId: item.id,
      municipio: item.nombre,

      localidadId: null,
      localidad: "",

      latitude: null,
      longitude: null,

      locationAccuracy: null,
      locationSource: null,
    });

    setLoadingPlace(true);

    try {
      const position =
        await geocodificarLugar({
          municipio: item.nombre,
          registro: item,
        });

      if (operation !== operationRef.current) {
        return;
      }

      if (position) {
        /*
         * Desplazamos el mapa.
         * Todavía no hay ubicación exacta.
         */
        centrarMapa(position, 12);

        setDetectionMessage(
          `Mapa centrado en ${item.nombre}. Ahora selecciona la localidad.`
        );
      } else {
        setDetectionMessage(
          "No encontramos el centro del municipio en el mapa. Puedes continuar seleccionando la localidad."
        );
      }
    } finally {
      if (operation === operationRef.current) {
        setLoadingPlace(false);
      }
    }
  };


  /* ===================================================
     SELECCIONAR LOCALIDAD

     NUEVO: CENTRAR MAPA Y MOSTRAR MARCADOR
  =================================================== */

  const selectLocalidad = async (item) => {
    if (!municipio?.id) {
      return;
    }

    const operation = ++operationRef.current;

    setSelector(null);
    setLocalidad(item);

    setPoint(null);
    setPreviewPoint(null);
    setLocationAccuracy(null);
    setLocationSource(null);

    setError("");
    setDetectionMessage(
      `Buscando ${item.nombre} en el mapa...`
    );

    updateDraft({
      localidadId: item.id,
      localidad: item.nombre,

      latitude: null,
      longitude: null,

      locationAccuracy: null,
      locationSource: null,
    });

    setLoadingPlace(true);

    try {
      const position =
        await geocodificarLugar({
          municipio: municipio.nombre,
          localidad: item.nombre,
          registro: item,
        });

      if (operation !== operationRef.current) {
        return;
      }

      if (position) {
        /*
         * Mostramos un pin provisional
         * en la localidad seleccionada.
         */
        setPreviewPoint(position);

        centrarMapa(position, 15);

        setDetectionMessage(
          `Mapa centrado en ${item.nombre}. El marcador es aproximado: toca el lugar exacto de tu meliponario en el mapa o usa GPS.`
        );
      } else {
        setDetectionMessage(
          `Seleccionaste ${item.nombre}, pero no se encontró su posición aproximada. Toca el mapa para señalar tu meliponario.`
        );
      }
    } finally {
      if (operation === operationRef.current) {
        setLoadingPlace(false);
      }
    }
  };


  /* ===================================================
     TOCAR EL MAPA

     NUEVO: AUTOCOMPLETAR MUNICIPIO Y LOCALIDAD
  =================================================== */

  const handleMapChange = async (value) => {
    const coords = normalizarPunto(value);

    if (!coords) {
      return;
    }

    if (
      !estaEnYucatan(
        coords.latitude,
        coords.longitude
      )
    ) {
      setError(
        "El punto seleccionado está fuera de Yucatán."
      );

      return;
    }

    const operation = ++operationRef.current;

    setError("");
    setLoadingPlace(false);
    setPreviewPoint(null);

    setPoint({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    setLocationAccuracy(null);
    setLocationSource("manual");

    /*
     * Limpiamos datos administrativos anteriores
     * para no asociar la ubicación nueva
     * con una localidad equivocada.
     */
    setMunicipio(null);
    setLocalidad(null);

    updateDraft({
      latitude: coords.latitude,
      longitude: coords.longitude,

      locationAccuracy: null,
      locationSource: "manual",

      municipioId: null,
      municipio: "",

      localidadId: null,
      localidad: "",
    });

    setDetectionMessage(
      "Punto seleccionado. Detectando municipio y localidad..."
    );

    await detectarMunicipioYLocalidad(
      coords,
      operation
    );
  };


  /* ===================================================
     USAR MI UBICACIÓN GPS
  =================================================== */

  const handleUseMyLocation = async () => {
    const operation = ++operationRef.current;

    setError("");
    setLoadingLocation(true);
    setDetectionMessage("");

    try {
      const response =
        await obtenerUbicacionActual();

      if (operation !== operationRef.current) {
        return;
      }

      const coords =
        normalizarPunto(response);

      if (
        !coords ||
        !estaEnYucatan(
          coords.latitude,
          coords.longitude
        )
      ) {
        throw new Error(
          "No se obtuvo una ubicación válida dentro de Yucatán."
        );
      }

      const exactPoint = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      setPoint(exactPoint);
      setPreviewPoint(null);

      setMunicipio(null);
      setLocalidad(null);

      setLocationAccuracy(
        coords.accuracy
      );

      setLocationSource("gps");

      centrarMapa(exactPoint, 16);

      updateDraft({
        latitude: coords.latitude,
        longitude: coords.longitude,

        locationAccuracy:
          coords.accuracy,

        locationSource: "gps",

        municipioId: null,
        municipio: "",

        localidadId: null,
        localidad: "",
      });

      setDetectionMessage(
        "Ubicación GPS obtenida. Detectando municipio y localidad..."
      );

      await detectarMunicipioYLocalidad(
        coords,
        operation
      );
    } catch (err) {
      if (operation === operationRef.current) {
        setError(
          err?.message ??
          "No se pudo obtener tu ubicación."
        );
      }
    } finally {
      if (operation === operationRef.current) {
        setLoadingLocation(false);
      }
    }
  };


  /* ===================================================
     CONTINUAR
  =================================================== */

  const next = () => {
    setError("");

    if (!municipio?.id) {
      setError(
        "Selecciona o confirma el municipio."
      );
      return;
    }

    if (!localidad?.id) {
      setError(
        "Selecciona o confirma la localidad."
      );
      return;
    }

    /*
     * No dejamos guardar el centro
     * aproximado de una localidad como
     * si fuera el meliponario exacto.
     */
    if (!point) {
      setError(
        "Falta la ubicación exacta. Toca el mapa donde está tu meliponario o pulsa Usar mi ubicación."
      );
      return;
    }

    updateDraft({
      municipioId: municipio.id,
      municipio: municipio.nombre,

      localidadId: localidad.id,
      localidad: localidad.nombre,

      latitude: point.latitude,
      longitude: point.longitude,

      locationAccuracy,
      locationSource,
    });

    navigation.navigate("RegisterStep3");
  };


  /* ===================================================
     UI
  =================================================== */

  return (
    <RegisterLayout
      navigation={navigation}
      step={2}
      title={draft?.modoEdicion === "aprobado" ? "Editar meliponario" : "Registrar meliponario"}
      subtitle="Ubicación"
    >
      <Text style={styles.intro}>
        Selecciona el municipio y la localidad,
        o señala directamente la ubicación
        de tu meliponario en el mapa.
      </Text>

      {/* MAPA */}

      <View
        style={[
          styles.map,
          {
            minHeight: 230,
            overflow: "hidden",
          },
        ]}
      >
        <RegisterLocationMap
          value={point ?? previewPoint}
          preview={!point && !!previewPoint}
          focus={focus}
          onChange={handleMapChange}
        />
      </View>

      <Text style={styles.mapHelp}>
        Al elegir una localidad, el mapa se
        acercará automáticamente. Toca el punto
        exacto para confirmar la ubicación.
      </Text>

      {/* GPS */}

      <PrimaryButton
        title={
          loadingLocation
            ? "Detectando ubicación..."
            : "Usar mi ubicación"
        }
        icon="locate-outline"
        onPress={handleUseMyLocation}
        disabled={loadingLocation}
      />

      {/* ESTADO DE BÚSQUEDA */}

      {(loadingPlace || resolvingAddress) && (
        <View
          style={{
            flexDirection: "row",
            gap: 9,
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <ActivityIndicator
            size="small"
            color="#075A3D"
          />

          <Text style={{ color: "#63746A" }}>
            {loadingPlace
              ? "Ubicando el lugar..."
              : "Detectando localidad..."}
          </Text>
        </View>
      )}

      {!!detectionMessage && (
        <View style={styles.detectedBox}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#075A3D"
          />

          <Text style={styles.detectedText}>
            {detectionMessage}
          </Text>
        </View>
      )}

      {/* COORDENADAS CONFIRMADAS */}

      {point && (
        <View style={styles.coordinates}>
          <Ionicons
            name="navigate-outline"
            size={22}
            color="#075A3D"
          />

          <View style={styles.coordinateText}>
            <Text style={styles.small}>
              Ubicación seleccionada
            </Text>

            <Text style={styles.value}>
              {point.latitude.toFixed(6)}
              {", "}
              {point.longitude.toFixed(6)}
            </Text>

            {locationAccuracy != null && (
              <Text style={styles.accuracy}>
                Precisión aproximada: ±
                {Math.round(locationAccuracy)} m
              </Text>
            )}
          </View>
        </View>
      )}

      {/* MUNICIPIO */}

      <Text style={styles.label}>
        Municipio
      </Text>

      <TouchableOpacity
        style={[
          styles.selector,
          municipio && styles.selectorSelected,
        ]}
        disabled={loadingMunicipios}
        onPress={() =>
          setSelector("municipio")
        }
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectorSmall}>
            Municipio
          </Text>

          <Text
            style={[
              styles.selectorValue,
              !municipio && styles.placeholder,
            ]}
            numberOfLines={1}
          >
            {loadingMunicipios
              ? "Cargando..."
              : municipio?.nombre ??
                "Selecciona un municipio"}
          </Text>
        </View>

        <Ionicons
          name="chevron-down"
          size={21}
          color="#075A3D"
        />
      </TouchableOpacity>

      {/* LOCALIDAD */}

      <Text style={styles.label}>
        Localidad
      </Text>

      <TouchableOpacity
        style={[
          styles.selector,
          localidad && styles.selectorSelected,
          !municipio && styles.selectorDisabled,
        ]}
        disabled={
          !municipio ||
          loadingLocalidades
        }
        onPress={() =>
          setSelector("localidad")
        }
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectorSmall}>
            Localidad
          </Text>

          <Text
            style={[
              styles.selectorValue,
              !localidad && styles.placeholder,
            ]}
            numberOfLines={1}
          >
            {!municipio
              ? "Selecciona primero un municipio"
              : loadingLocalidades
                ? "Cargando..."
                : localidad?.nombre ??
                  "Selecciona una localidad"}
          </Text>
        </View>

        <Ionicons
          name="chevron-down"
          size={21}
          color="#075A3D"
        />
      </TouchableOpacity>

      <InfoBox warning>
        El centro de una localidad es aproximado.
        Confirma en el mapa la posición real
        del meliponario antes de continuar.
      </InfoBox>

      {/* ERROR */}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons
            name="alert-circle-outline"
            size={21}
            color="#B42318"
          />

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      <PrimaryButton
        title="Continuar"
        onPress={next}
        disabled={
          loadingPlace ||
          resolvingAddress ||
          loadingLocation
        }
      />

      {/* MODAL DE CATÁLOGOS */}

      <Modal
        visible={Boolean(selector)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelector(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelector(null)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) =>
              event.stopPropagation?.()
            }
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selector === "municipio"
                  ? "Seleccionar municipio"
                  : "Seleccionar localidad"}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setSelector(null)
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#15261F"
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={
                selector === "municipio"
                  ? municipios
                  : localidades
              }
              keyExtractor={(item) =>
                String(item.id)
              }
              renderItem={({ item }) => {
                const selectedId =
                  selector === "municipio"
                    ? municipio?.id
                    : localidad?.id;

                const selected =
                  String(selectedId) ===
                  String(item.id);

                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      selected &&
                        styles.optionSelected,
                    ]}
                    onPress={() => {
                      if (selector === "municipio") {
                        selectMunicipio(item);
                      } else {
                        selectLocalidad(item);
                      }
                    }}
                  >
                    <Text style={styles.optionText}>
                      {item.nombre}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={21}
                        color="#075A3D"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </RegisterLayout>
  );
}
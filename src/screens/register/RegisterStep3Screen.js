import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import * as Speech
  from "expo-speech";

import RegisterLayout
  from "../../components/RegisterLayout";

import InfoBox
  from "../../components/InfoBox";

import PrimaryButton
  from "../../components/PrimaryButton";

import {
  getEspeciesRequest,
} from "../../services/especiesApi";

import {
  useMeliponarioDraft,
} from "../../context/MeliponarioDraftContext";

import {
  COLORS,
} from "../../theme/colors";

import {
  styles,
} from "./RegisterStep3Screen.styles";


/* =====================================================
   NORMALIZAR ESPECIE DESDE SUPABASE
===================================================== */

function normalizeSpecies(row) {
  if (!row?.id) {
    return null;
  }


  return {
    id:
      row.id,

    especieId:
      row.id,

    nombre:
      row.nombre ??
      row.nombre_comun ??
      row.nombre_especie ??
      "Especie",

    cientifico:
      row.nombre_cientifico ??
      row.cientifico ??
      "",

    maya:
      row.nombre_maya ??
      row.maya ??
      "",

    origen:
      row.origen ??
      row.procedencia ??
      "",

    imagen:
      row.imagen_url ??
      row.foto_url ??
      row.imagen ??
      null,

    _raw:
      row,
  };
}


/* =====================================================
   IMAGEN
===================================================== */

function getImageSource(value) {
  if (!value) {
    return null;
  }


  if (
    typeof value ===
    "string"
  ) {
    return {
      uri: value,
    };
  }


  return value;
}


/* =====================================================
   CONTADOR COMPACTO
===================================================== */

function CompactCounter({
  label,
  icon,
  value,
  onChange,
}) {
  const current =
    Number(value) || 0;


  const decrease = () => {
    onChange(
      Math.max(
        0,
        current - 1
      )
    );
  };


  const increase = () => {
    onChange(
      current + 1
    );
  };


  return (
    <View
      style={
        styles.counterRowItem
      }
    >
      <View
        style={
          styles.counterNameWrap
        }
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            COLORS.primaryDark
          }
        />

        <Text
          style={
            styles.counterRowLabel
          }
        >
          {label}
        </Text>
      </View>


      <View
        style={
          styles.counterActions
        }
      >
        <TouchableOpacity
          style={
            styles.counterCircleButton
          }
          onPress={
            decrease
          }
        >
          <Ionicons
            name="remove"
            size={19}
            color={
              COLORS.primaryDark
            }
          />
        </TouchableOpacity>


        <Text
          style={
            styles.counterRowValue
          }
        >
          {current}
        </Text>


        <TouchableOpacity
          style={
            styles.counterCircleButton
          }
          onPress={
            increase
          }
        >
          <Ionicons
            name="add"
            size={19}
            color={
              COLORS.primaryDark
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}


/* =====================================================
   PANTALLA
===================================================== */

export default function RegisterStep3Screen({
  navigation,
}) {
  const {
    draft,
    updateDraft,
  } =
    useMeliponarioDraft();


  const [
    selected,
    setSelected,
  ] = useState(
    Array.isArray(
      draft?.especies
    )
      ? draft.especies.map(
          (item) => ({
            ...item,

            cajasTecnificadas:
              item.cajasTecnificadas ??
              item.cajas ??
              0,

            jobones:
              item.jobones ??
              0,
          })
        )
      : []
  );


  const [
    catalog,
    setCatalog,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    source,
    setSource,
  ] = useState(null);


  /* ===================================================
     CARGAR CATÁLOGO
  =================================================== */

  useEffect(() => {
    let mounted =
      true;


    async function loadSpecies() {
      try {
        setLoading(
          true
        );

        setError(
          ""
        );


        const response =
          await getEspeciesRequest();


        const normalized =
          (
            response?.data ??
            []
          )
            .map(
              normalizeSpecies
            )
            .filter(
              Boolean
            )
            .sort(
              (
                a,
                b
              ) =>
                a.nombre.localeCompare(
                  b.nombre,
                  "es"
                )
            );


        if (mounted) {
          setCatalog(
            normalized
          );

          setSource(
            response?.source ??
            null
          );
        }
      } catch (err) {
        console.error(
          "ERROR CARGANDO ESPECIES:",
          err
        );


        if (mounted) {
          setCatalog(
            []
          );

          setError(
            err?.message ??
              "No se pudo cargar el catálogo de especies."
          );
        }
      } finally {
        if (mounted) {
          setLoading(
            false
          );
        }
      }
    }


    loadSpecies();


    return () => {
      mounted =
        false;
    };
  }, []);


  /* ===================================================
     IDS SELECCIONADOS
  =================================================== */

  const selectedIds =
    useMemo(() => {
      return new Set(
        selected.map(
          (item) =>
            String(
              item.id ??
              item.especieId
            )
        )
      );
    }, [
      selected,
    ]);


  /* ===================================================
     ESPECIES DISPONIBLES
  =================================================== */

  const available =
    useMemo(() => {
      return catalog.filter(
        (species) =>
          !selectedIds.has(
            String(
              species.id
            )
          )
      );
    }, [
      catalog,
      selectedIds,
    ]);


  /* ===================================================
     AGREGAR ESPECIE
  =================================================== */

  const addSpecies =
    (species) => {
      if (
        selectedIds.has(
          String(
            species.id
          )
        )
      ) {
        return;
      }


      setSelected(
        (current) => [
          ...current,

          {
            ...species,

            cajasTecnificadas:
              0,

            jobones:
              0,
          },
        ]
      );


      setError("");
    };


  /* ===================================================
     QUITAR ESPECIE
  =================================================== */

  const removeSpecies =
    (id) => {
      setSelected(
        (current) =>
          current.filter(
            (species) =>
              String(
                species.id
              ) !==
              String(id)
          )
      );
    };


  /* ===================================================
     CONTADORES
  =================================================== */

  const updateCount =
    (
      id,
      key,
      value
    ) => {
      const finalValue =
        Math.max(
          0,
          Number(value) || 0
        );


      setSelected(
        (current) =>
          current.map(
            (species) =>
              String(
                species.id
              ) ===
              String(id)
                ? {
                    ...species,

                    [key]:
                      finalValue,
                  }
                : species
          )
      );
    };


  /* ===================================================
     ALTAVOZ
  =================================================== */

  const speakSpeciesName =
    async (species) => {
      try {
        await Speech.stop();


        /*
         * Primero se pronuncia el nombre
         * visible de KaabMap.
         *
         * Después el científico.
         */
        const parts = [
          species?.nombre,
          species?.cientifico
            ? `Nombre científico: ${species.cientifico}`
            : null,
        ].filter(Boolean);


        if (
          species?.maya
        ) {
          parts.push(
            `Nombre maya: ${species.maya}`
          );
        }


        const text =
          parts.join(". ");


        if (!text) {
          return;
        }


        Speech.speak(
          text,
          {
            language:
              "es-MX",

            pitch:
              1,

            rate:
              0.85,
          }
        );
      } catch (err) {
        console.warn(
          "ERROR REPRODUCIENDO NOMBRE:",
          err
        );
      }
    };


  /* ===================================================
     CONTINUAR
  =================================================== */

  const next =
    () => {
      setError("");


      if (
        !selected.length
      ) {
        setError(
          "Selecciona al menos una especie."
        );

        return;
      }


      /*
       * Cada especie debe tener al menos
       * una caja tecnificada o un jobón.
       */
      const invalid =
        selected.find(
          (species) =>
            Number(
              species.cajasTecnificadas ??
              0
            ) <= 0 &&
            Number(
              species.jobones ??
              0
            ) <= 0
        );


      if (invalid) {
        setError(
          `Indica al menos una caja tecnificada o un jobón para ${invalid.nombre}.`
        );

        return;
      }


      updateDraft({
        especies:
          selected.map(
            (species) => ({
              id:
                species.id,

              especieId:
                species.id,

              nombre:
                species.nombre,

              cientifico:
                species.cientifico,

              maya:
                species.maya,

              origen:
                species.origen,

              cajasTecnificadas:
                Number(
                  species.cajasTecnificadas ??
                  0
                ),

              jobones:
                Number(
                  species.jobones ??
                  0
                ),
            })
          ),
      });


      navigation.navigate(
        "RegisterStep5"
      );
    };


  /* ===================================================
     UI
  =================================================== */

  return (
    <RegisterLayout
      navigation={
        navigation
      }
      step={3}
      title="Registrar meliponario"
      subtitle="Especies y colmenas"
    >

      <Text
        style={
          styles.intro
        }
      >
        Selecciona las especies
        presentes en el meliponario
        y registra sus alojamientos.
      </Text>


      <InfoBox
        title="Catálogo oficial"
      >
        La aplicación solo permite
        seleccionar especies ya
        registradas en KaabMap.
      </InfoBox>


      {/* OFFLINE */}

      {source ===
      "cache" ? (
        <View
          style={
            styles.offlineBox
          }
        >
          <Ionicons
            name="cloud-offline-outline"
            size={20}
            color="#8A6100"
          />

          <Text
            style={
              styles.offlineText
            }
          >
            Estás utilizando el catálogo
            guardado en este dispositivo.
            Se actualizará cuando tengas
            conexión.
          </Text>
        </View>
      ) : null}


      {/* LOADING */}

      {loading ? (
        <View
          style={
            styles.loadingBox
          }
        >
          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Cargando especies...
          </Text>
        </View>
      ) : null}


      {/* ERROR DE CARGA */}

      {!loading &&
      error &&
      !selected.length ? (
        <View
          style={
            styles.errorBox
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={21}
            color="#B42318"
          />

          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>
        </View>
      ) : null}


      {/* =================================================
         ESPECIES SELECCIONADAS
      ================================================= */}

      {!loading &&
      selected.length >
        0 ? (
        <>
          <Text
            style={
              styles.heading
            }
          >
            Especies seleccionadas (
            {selected.length})
          </Text>


          {selected.map(
            (species) => {
              const imageSource =
                getImageSource(
                  species.imagen
                );


              return (
                <View
                  key={
                    species.id
                  }
                  style={
                    styles.selectedCard
                  }
                >

                  {/* CABECERA */}

                  <View
                    style={
                      styles.speciesTop
                    }
                  >
                    {imageSource ? (
                      <Image
                        source={
                          imageSource
                        }
                        style={
                          styles.image
                        }
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.image,
                          styles.imagePlaceholder,
                        ]}
                      >
                        <Ionicons
                          name="leaf-outline"
                          size={34}
                          color={
                            COLORS.primary
                          }
                        />
                      </View>
                    )}


                    <View
                      style={
                        styles.selectedBody
                      }
                    >
                      <View
                        style={
                          styles.titleRow
                        }
                      >
                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <View
                            style={
                              styles.nameRow
                            }
                          >
                            <Text
                              style={
                                styles.name
                              }
                            >
                              {
                                species.nombre
                              }
                            </Text>


                            <TouchableOpacity
                              style={
                                styles.speakerButton
                              }
                              onPress={() =>
                                speakSpeciesName(
                                  species
                                )
                              }
                            >
                              <Ionicons
                                name="volume-high-outline"
                                size={18}
                                color={
                                  COLORS.primary
                                }
                              />
                            </TouchableOpacity>
                          </View>


                          {species.cientifico ? (
                            <Text
                              style={
                                styles.scientific
                              }
                            >
                              {
                                species.cientifico
                              }
                            </Text>
                          ) : null}


                          {species.maya ? (
                            <Text
                              style={
                                styles.maya
                              }
                            >
                              Nombre maya:{" "}
                              {
                                species.maya
                              }
                            </Text>
                          ) : null}
                        </View>


                        <TouchableOpacity
                          style={
                            styles.removeButton
                          }
                          onPress={() =>
                            removeSpecies(
                              species.id
                            )
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#B94A48"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>


                  {/* ALOJAMIENTOS */}

                  <View
                    style={
                      styles.housingSection
                    }
                  >
                    <View
                      style={
                        styles.housingHeader
                      }
                    >
                      <Text
                        style={
                          styles.housingTitle
                        }
                      >
                        Alojamientos
                      </Text>

                      <Ionicons
                        name="information-circle-outline"
                        size={17}
                        color={
                          COLORS.primaryDark
                        }
                      />
                    </View>


                    <Text
                      style={
                        styles.housingHelp
                      }
                    >
                      Cada alojamiento registrado
                      representa una colonia.
                    </Text>


                    <View
                      style={
                        styles.housingDivider
                      }
                    />


                    <CompactCounter
                      label="Cajas tecnificadas"
                      icon="cube-outline"
                      value={
                        species.cajasTecnificadas ??
                        0
                      }
                      onChange={(
                        value
                      ) =>
                        updateCount(
                          species.id,
                          "cajasTecnificadas",
                          value
                        )
                      }
                    />


                    <View
                      style={
                        styles.counterDivider
                      }
                    />


                    <CompactCounter
                      label="Hobones"
                      icon="ellipse-outline"
                      value={
                        species.jobones ??
                        0
                      }
                      onChange={(
                        value
                      ) =>
                        updateCount(
                          species.id,
                          "jobones",
                          value
                        )
                      }
                    />
                  </View>
                </View>
              );
            }
          )}
        </>
      ) : null}


      {/* =================================================
         ESPECIES DISPONIBLES
      ================================================= */}

      {!loading &&
      !error ? (
        <>
          <Text
            style={
              styles.heading
            }
          >
            Especies disponibles
          </Text>


          {!available.length ? (
            <View
              style={
                styles.emptyBox
              }
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.emptyText
                }
              >
                No hay más especies
                disponibles para agregar.
              </Text>
            </View>
          ) : null}


          {available.map(
            (species) => {
              const imageSource =
                getImageSource(
                  species.imagen
                );


              return (
                <View
                  key={
                    species.id
                  }
                  style={
                    styles.catalogCard
                  }
                >
                  {imageSource ? (
                    <Image
                      source={
                        imageSource
                      }
                      style={
                        styles.catalogImage
                      }
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.catalogImage,
                        styles.imagePlaceholder,
                      ]}
                    >
                      <Ionicons
                        name="leaf-outline"
                        size={27}
                        color={
                          COLORS.primary
                        }
                      />
                    </View>
                  )}


                  <View
                    style={
                      styles.catalogBody
                    }
                  >
                    <View
                      style={
                        styles.nameRow
                      }
                    >
                      <Text
                        style={
                          styles.catalogName
                        }
                      >
                        {
                          species.nombre
                        }
                      </Text>


                      <TouchableOpacity
                        style={
                          styles.speakerButton
                        }
                        onPress={() =>
                          speakSpeciesName(
                            species
                          )
                        }
                      >
                        <Ionicons
                          name="volume-high-outline"
                          size={17}
                          color={
                            COLORS.primary
                          }
                        />
                      </TouchableOpacity>
                    </View>


                    {species.cientifico ? (
                      <Text
                        style={
                          styles.scientific
                        }
                      >
                        {
                          species.cientifico
                        }
                      </Text>
                    ) : null}


                    {species.maya ? (
                      <Text
                        style={
                          styles.maya
                        }
                      >
                        Nombre maya:{" "}
                        {
                          species.maya
                        }
                      </Text>
                    ) : null}
                  </View>


                  <TouchableOpacity
                    style={
                      styles.selectBtn
                    }
                    onPress={() =>
                      addSpecies(
                        species
                      )
                    }
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color={
                        COLORS.primary
                      }
                    />

                    <Text
                      style={
                        styles.selectText
                      }
                    >
                      Agregar
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }
          )}
        </>
      ) : null}


      {/* ERROR VALIDACIÓN */}

      {error &&
      selected.length >
        0 ? (
        <View
          style={
            styles.errorBox
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={21}
            color="#B42318"
          />

          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>
        </View>
      ) : null}


      <PrimaryButton
        title="Continuar"
        disabled={
          !selected.length
        }
        onPress={
          next
        }
      />

    </RegisterLayout>
  );
}
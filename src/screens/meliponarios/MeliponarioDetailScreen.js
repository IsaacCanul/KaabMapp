import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import PrimaryButton
  from "../../components/PrimaryButton";

import StatusBadge
  from "../../components/StatusBadge";

import {
  MELIPONARIOS,
} from "../../data/mockData";

import {
  COLORS,
} from "../../theme/colors";

export default function MeliponarioDetailScreen({
  navigation,
  route,
}) {
  /*
   * Permitimos las dos formas:
   *
   * navigate("MeliponarioDetail", {
   *   id: 1
   * })
   *
   * o:
   *
   * navigate("MeliponarioDetail", {
   *   meliponario: item
   * })
   */
  const meliponario =
    route?.params
      ?.meliponario ??
    MELIPONARIOS.find(
      (item) =>
        String(item.id) ===
        String(
          route?.params?.id
        )
    );

  if (!meliponario) {
    return (
      <SafeAreaView
        style={
          styles.notFound
        }
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.gray}
        />

        <Text
          style={
            styles.notFoundTitle
          }
        >
          Meliponario no
          encontrado
        </Text>

        <Text
          style={
            styles.notFoundText
          }
        >
          No se encontró el
          meliponario
          seleccionado.
        </Text>

        <PrimaryButton
          title="Regresar"
          onPress={() =>
            navigation.goBack()
          }
        />
      </SafeAreaView>
    );
  }

  const especies =
    Array.isArray(
      meliponario.especies
    )
      ? meliponario.especies
      : [];

  const productos =
    Array.isArray(
      meliponario
        .productosDisponibles
    )
      ? meliponario
          .productosDisponibles
      : [];

  return (
    <SafeAreaView
      style={styles.screen}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scroll
        }
      >
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity
            style={[
              styles.circleButton,
              styles.backButton,
            ]}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color={
                COLORS.primaryDark ??
                COLORS.primary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.circleButton,
              styles.shareButton,
            ]}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={
                COLORS.primaryDark ??
                COLORS.primary
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.heroContent
            }
          >
            <Ionicons
              name="leaf-outline"
              size={58}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.heroText
              }
            >
              KaabMap
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Nombre */}
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
              <Text
                style={
                  styles.title
                }
              >
                {
                  meliponario.nombre
                }
              </Text>

              <View
                style={
                  styles.locationRow
                }
              >
                <Ionicons
                  name="location-outline"
                  size={15}
                  color={
                    COLORS.gray
                  }
                />

                <Text
                  style={
                    styles.location
                  }
                >
                  {[
                    meliponario.localidad,
                    meliponario.municipio,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(", ")}
                </Text>
              </View>
            </View>

            <StatusBadge
              status={
                meliponario.estado
              }
            />
          </View>

          {/* Descripción */}
          <View style={styles.card}>
            <Text
              style={
                styles.cardTitle
              }
            >
              Acerca del
              meliponario
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {
                meliponario.descripcion
              }
            </Text>

            {meliponario
              .referenciaUbicacion ? (
              <View
                style={
                  styles.referenceRow
                }
              >
                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color={
                    COLORS.primary
                  }
                />

                <Text
                  style={
                    styles.reference
                  }
                >
                  {
                    meliponario
                      .referenciaUbicacion
                  }
                </Text>
              </View>
            ) : null}
          </View>

          {/* Especies */}
          <Text
            style={
              styles.sectionTitle
            }
          >
            Especies registradas
          </Text>

          {especies.length > 0 ? (
            especies.map(
              (especie) => (
                <View
                  key={especie}
                  style={
                    styles.speciesCard
                  }
                >
                  <View
                    style={
                      styles.speciesIcon
                    }
                  >
                    <Ionicons
                      name="leaf-outline"
                      size={25}
                      color={
                        COLORS.primary
                      }
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.speciesName
                      }
                    >
                      {especie}
                    </Text>

                    <Text
                      style={
                        styles.speciesCaption
                      }
                    >
                      Abeja nativa
                      sin aguijón
                    </Text>
                  </View>
                </View>
              )
            )
          ) : (
            <Text
              style={styles.empty}
            >
              No hay especies
              registradas.
            </Text>
          )}

          {/* Productos */}
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Productos
              disponibles
            </Text>
          </View>

          {productos.length > 0 ? (
            <View
              style={
                styles.productsContainer
              }
            >
              {productos.map(
                (producto) => (
                  <View
                    key={producto}
                    style={
                      styles.productCard
                    }
                  >
                    <View
                      style={
                        styles.productIcon
                      }
                    >
                      <Ionicons
                        name="cube-outline"
                        size={23}
                        color={
                          COLORS.honey ??
                          COLORS.primary
                        }
                      />
                    </View>

                    <Text
                      style={
                        styles.productName
                      }
                    >
                      {producto}
                    </Text>
                  </View>
                )
              )}
            </View>
          ) : (
            <View
              style={
                styles.emptyCard
              }
            >
              <Ionicons
                name="cube-outline"
                size={26}
                color={
                  COLORS.gray
                }
              />

              <Text
                style={
                  styles.empty
                }
              >
                Este meliponario
                no tiene productos
                registrados.
              </Text>
            </View>
          )}

          {/* Punto de venta */}
          {productos.length >
            0 && (
            <>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Punto de venta
              </Text>

              <View
                style={
                  styles.card
                }
              >
                <View
                  style={
                    styles.pointRow
                  }
                >
                  <Ionicons
                    name="storefront-outline"
                    size={25}
                    color={
                      COLORS.primary
                    }
                  />

                  <View
                    style={{
                      flex: 1,
                      marginLeft: 10,
                    }}
                  >
                    <Text
                      style={
                        styles.pointTitle
                      }
                    >
                      {
                        meliponario.nombre
                      }
                    </Text>

                    <Text
                      style={
                        styles.pointText
                      }
                    >
                      {
                        meliponario
                          .municipio
                      }
                      , Yucatán
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Acciones */}
          <View
            style={
              styles.actions
            }
          >
            <PrimaryButton
              title="Cómo llegar"
              icon="navigate-outline"
              outline
              style={{
                flex: 1,
                marginRight: 5,
              }}
            />

            <PrimaryButton
              title="Contactar"
              icon="chatbubble-outline"
              style={{
                flex: 1,
                marginLeft: 5,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        COLORS.cream,
    },

    scroll: {
      paddingBottom: 30,
    },

    hero: {
      height: 260,
      position: "relative",
      backgroundColor:
        COLORS.grayLight ??
        "#EDF4EA",
    },

    heroContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    heroText: {
      marginTop: 8,
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 18,
      fontWeight: "900",
    },

    circleButton: {
      position: "absolute",
      top: 14,
      width: 42,
      height: 42,
      borderRadius: 21,
      zIndex: 5,
      backgroundColor:
        "rgba(255,255,255,0.95)",
      alignItems: "center",
      justifyContent: "center",
    },

    backButton: {
      left: 14,
    },

    shareButton: {
      right: 14,
    },

    body: {
      padding: 18,
      marginTop: -18,
      backgroundColor:
        COLORS.cream,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },

    title: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 25,
      fontWeight: "900",
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },

    location: {
      color: COLORS.gray,
      marginLeft: 4,
      fontSize: 13,
    },

    card: {
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 18,
      padding: 16,
      marginBottom: 20,
    },

    cardTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 8,
    },

    description: {
      color: COLORS.gray,
      fontSize: 14,
      lineHeight: 21,
    },

    referenceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border,
    },

    reference: {
      flex: 1,
      marginLeft: 7,
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 12,
    },

    sectionHeader: {
      marginTop: 4,
    },

    sectionTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 10,
      marginTop: 6,
    },

    speciesCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 16,
      padding: 12,
      marginBottom: 9,
    },

    speciesIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor:
        COLORS.grayLight ??
        "#EDF4EA",
    },

    speciesName: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 15,
      fontWeight: "900",
    },

    speciesCaption: {
      color: COLORS.gray,
      fontSize: 11,
      marginTop: 3,
    },

    productsContainer: {
      marginBottom: 14,
    },

    productCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 16,
      padding: 12,
      marginBottom: 8,
    },

    productIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        COLORS.cream,
      marginRight: 10,
    },

    productName: {
      flex: 1,
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 14,
      fontWeight: "800",
    },

    emptyCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
    },

    empty: {
      flex: 1,
      marginLeft: 8,
      color: COLORS.gray,
      fontSize: 13,
    },

    pointRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    pointTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontWeight: "900",
      fontSize: 14,
    },

    pointText: {
      color: COLORS.gray,
      fontSize: 12,
      marginTop: 3,
    },

    actions: {
      flexDirection: "row",
      marginTop: 6,
    },

    notFound: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        COLORS.cream,
      padding: 24,
    },

    notFoundTitle: {
      marginTop: 12,
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 20,
      fontWeight: "900",
    },

    notFoundText: {
      color: COLORS.gray,
      textAlign: "center",
      marginTop: 6,
      marginBottom: 20,
    },
  });
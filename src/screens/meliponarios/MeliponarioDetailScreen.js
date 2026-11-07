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

import {
  MELIPONARIOS,
} from "../../data/mockData";

import {
  COLORS,
} from "../../theme/colors";

import StatusBadge
  from "../../components/StatusBadge";

export default function MeliponarioDetailScreen({
  navigation,
  route,
}) {
  const meliponario =
    route?.params?.meliponario ??
    MELIPONARIOS.find(
      (item) =>
        String(item.id) ===
        String(route?.params?.id)
    );

  if (!meliponario) {
    return (
      <SafeAreaView
        style={styles.notFound}
      >
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color={COLORS.gray}
        />

        <Text
          style={styles.notFoundTitle}
        >
          Meliponario no encontrado
        </Text>

        <TouchableOpacity
          style={styles.backAction}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text
            style={
              styles.backActionText
            }
          >
            Regresar
          </Text>
        </TouchableOpacity>
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
      meliponario.productosDisponibles
    )
      ? meliponario.productosDisponibles
      : [];

  const puntoVenta =
    meliponario.puntoVenta;

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
          styles.scrollContent
        }
      >
        {/* =================================================
            GALERÍA / HERO
        ================================================= */}
        <View style={styles.hero}>
          <View
            style={styles.heroPlaceholder}
          >
            <Ionicons
              name="leaf-outline"
              size={64}
              color={COLORS.primary}
            />

            <Text style={styles.heroText}>
              KaabMap
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.heroButton,
              styles.backButton,
            ]}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color={
                COLORS.primaryDark ??
                COLORS.primary
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.heroRightActions
            }
          >
          

        
          </View>

          {/* Indicadores provisionales de galería */}
          <View
            style={
              styles.galleryIndicators
            }
          >
            <View
              style={[
                styles.galleryDot,
                styles.galleryDotActive,
              ]}
            />

            <View
              style={styles.galleryDot}
            />

            <View
              style={styles.galleryDot}
            />
          </View>
        </View>

        {/* =================================================
            CONTENIDO
        ================================================= */}
        <View style={styles.body}>
          {/* Nombre + ubicación */}
          <View
            style={styles.titleRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {meliponario.nombre}
              </Text>

              <View
                style={
                  styles.locationRow
                }
              >
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={COLORS.gray}
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
                    .filter(Boolean)
                    .join(", ")}
                  , Yucatán
                </Text>
              </View>
            </View>
          </View>

          {/* Estado + especies */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.chipsRow
            }
          >
            <StatusBadge
              status={meliponario.estado}
            />

            {especies
              .slice(0, 1)
              .map((especie) => (
                <View
                  key={especie.nombre}
                  style={styles.speciesChip}
                >
                  <Ionicons
                    name="leaf-outline"
                    size={15}
                    color={COLORS.primary}
                  />

                  <Text
                    style={
                      styles.speciesChipText
                    }
                  >
                    {especie.nombre}
                  </Text>
                </View>
              ))}

            {especies.length > 1 && (
              <View
                style={styles.moreChip}
              >
                <Text
                  style={
                    styles.moreChipText
                  }
                >
                  y{" "}
                  {especies.length - 1}{" "}
                  especie
                  {especies.length - 1 >
                  1
                    ? "s"
                    : ""}{" "}
                  más
                </Text>
              </View>
            )}
          </ScrollView>

          {/* =================================================
              RESPONSABLE
          ================================================= */}
          {meliponario.responsable && (
            <View
              style={
                styles.responsibleCard
              }
            >
              <View
                style={
                  styles.avatarPlaceholder
                }
              >
                <Ionicons
                  name="person-outline"
                  size={29}
                  color={COLORS.primary}
                />
              </View>

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.responsibleName
                  }
                >
                  Responsable:{" "}
                  {
                    meliponario
                      .responsable.nombre
                  }
                </Text>

                <Text
                  style={
                    styles.responsibleDescription
                  }
                >
                  {
                    meliponario
                      .responsable
                      .descripcion
                  }
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color={COLORS.gray}
              />
            </View>
          )}

          {/* =================================================
              SOBRE EL MELIPONARIO
          ================================================= */}
          <Text
            style={styles.sectionTitle}
          >
            Sobre este meliponario
          </Text>

          <Text
            style={styles.description}
          >
            {meliponario.descripcion}
          </Text>

          {meliponario
            .referenciaUbicacion && (
            <View
              style={
                styles.referenceBox
              }
            >
              <Ionicons
                name="navigate-outline"
                size={20}
                color={COLORS.primary}
              />

              <Text
                style={
                  styles.referenceText
                }
              >
                {
                  meliponario
                    .referenciaUbicacion
                }
              </Text>
            </View>
          )}

          {/* No mostramos:
              - tipo de estructura
              - materiales
              - vegetación

              Esos datos quedarán en Inspecciones.
          */}

          <View style={styles.divider} />

          {/* =================================================
              ESPECIES REGISTRADAS
          ================================================= */}
          <Text
            style={styles.sectionTitle}
          >
            Especies registradas
          </Text>

          {especies.length === 0 ? (
            <Text style={styles.empty}>
              No hay especies registradas.
            </Text>
          ) : (
            especies.map((especie) => (
              <View
                key={especie.nombre}
                style={styles.speciesCard}
              >
                {/* Foto provisional */}
                <View
                  style={
                    styles.speciesPhoto
                  }
                >
                  <Ionicons
                    name="leaf-outline"
                    size={28}
                    color={COLORS.primary}
                  />
                </View>

                {/* Nombre */}
                <View
                  style={
                    styles.speciesInfo
                  }
                >
                  <Text
                    style={
                      styles.speciesName
                    }
                  >
                    {especie.nombre}
                  </Text>

                  {especie.nombreMaya && (
                    <View
                      style={
                        styles.mayaRow
                      }
                    >
                      <Text
                        style={
                          styles.mayaBee
                        }
                      >
                        ✿
                      </Text>

                      <Text
                        style={
                          styles.mayaName
                        }
                      >
                        {
                          especie.nombreMaya
                        }
                      </Text>
                    </View>
                  )}
                </View>

                {/* Audio futuro */}
                <TouchableOpacity
                  style={
                    styles.audioButton
                  }
                >
                  <Ionicons
                    name="volume-medium-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>

                {/* Cajas tecnificadas */}
                <View
                  style={
                    styles.housingBox
                  }
                >
                  <Ionicons
                    name="layers-outline"
                    size={21}
                    color={COLORS.primary}
                  />

                  <Text
                    style={
                      styles.housingLabel
                    }
                  >
                    Cajas
                  </Text>

                  <Text
                    style={
                      styles.housingValue
                    }
                  >
                    {especie.cajasTecnificadas ??
                      0}
                  </Text>
                </View>

                {/* Jobones */}
                <View
                  style={[
                    styles.housingBox,
                    styles.jobonBox,
                  ]}
                >
                  <Ionicons
                    name="ellipse-outline"
                    size={21}
                    color={
                      COLORS.honey ??
                      COLORS.primary
                    }
                  />

                  <Text
                    style={
                      styles.housingLabel
                    }
                  >
                    Jobones
                  </Text>

                  <Text
                    style={
                      styles.housingValue
                    }
                  >
                    {especie.jobones ?? 0}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* =================================================
              PRODUCTOS
          ================================================= */}
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  marginBottom: 0,
                },
              ]}
            >
              Productos disponibles
            </Text>

            {productos.length > 0 && (
              <TouchableOpacity>
                <Text
                  style={
                    styles.viewAll
                  }
                >
                  Ver todos →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {productos.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.productsRow
              }
            >
              {productos.map(
                (producto) => (
                  <View
                    key={
                      producto.id ??
                      producto.nombre
                    }
                    style={
                      styles.productCard
                    }
                  >
                    <View
                      style={
                        styles.productImage
                      }
                    >
                      <Ionicons
                        name="cube-outline"
                        size={38}
                        color={
                          COLORS.honey ??
                          COLORS.primary
                        }
                      />
                    </View>

                    <Text
                      numberOfLines={2}
                      style={
                        styles.productName
                      }
                    >
                      {producto.nombre}
                    </Text>

                    <Text
                      style={
                        styles.productPresentation
                      }
                    >
                      {
                        producto.presentacion
                      }
                    </Text>

                    <View
                      style={
                        styles.availableBadge
                      }
                    >
                      <Ionicons
                        name="storefront-outline"
                        size={14}
                        color={
                          COLORS.honey ??
                          COLORS.primary
                        }
                      />

                      <Text
                        style={
                          styles.availableText
                        }
                      >
                        Disponible
                      </Text>
                    </View>
                  </View>
                )
              )}
            </ScrollView>
          ) : (
            <View
              style={styles.emptyBox}
            >
              <Ionicons
                name="cube-outline"
                size={27}
                color={COLORS.gray}
              />

              <Text
                style={styles.empty}
              >
                Este meliponario no
                tiene productos
                registrados.
              </Text>
            </View>
          )}

          {/* =================================================
              PUNTO DE VENTA
          ================================================= */}
          {puntoVenta && (
            <>
              <View
                style={
                  styles.saleTitleRow
                }
              >
                <Ionicons
                  name="storefront-outline"
                  size={25}
                  color={COLORS.primary}
                />

                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      marginBottom: 0,
                      marginLeft: 8,
                    },
                  ]}
                >
                  Punto de venta
                </Text>
              </View>

              <View
                style={
                  styles.saleCard
                }
              >
                {/* Placeholder del mini mapa */}
                <View
                  style={
                    styles.mapPlaceholder
                  }
                >
                  <Ionicons
                    name="location"
                    size={38}
                    color={COLORS.primary}
                  />

                  <Text
                    style={
                      styles.mapCity
                    }
                  >
                    {
                      meliponario
                        .municipio
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.saleInfo
                  }
                >
                  <Text
                    style={
                      styles.saleName
                    }
                  >
                    {
                      puntoVenta.nombre
                    }
                  </Text>

                  <Text
                    style={
                      styles.saleAddress
                    }
                  >
                    {
                      puntoVenta.direccion
                    }
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.locationButton
                    }
                  >
                    <Ionicons
                      name="location"
                      size={17}
                      color={COLORS.primary}
                    />

                    <Text
                      style={
                        styles.locationButtonText
                      }
                    >
                      Ver ubicación
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* =================================================
          ACCIONES FIJAS
      ================================================= */}
      <View
        style={
          styles.bottomActions
        }
      >
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.outlineButton,
          ]}
        >
          <Ionicons
            name="navigate-outline"
            size={22}
            color={COLORS.primary}
          />

          <Text
            style={
              styles.outlineButtonText
            }
          >
            Cómo llegar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
          ]}
        >
          <Ionicons
            name="chatbubble-outline"
            size={21}
            color={COLORS.white}
          />

          <Text
            style={
              styles.primaryButtonText
            }
          >
            Contactar productor
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        COLORS.cream ?? "#FAF8F1",
    },

    scrollContent: {
      paddingBottom: 110,
    },

    /* HERO */

    hero: {
      height: 270,
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#E8EFE4",
    },

    heroPlaceholder: {
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

    heroButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "rgba(255,255,255,0.94)",

      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },

    backButton: {
      position: "absolute",
      top: 16,
      left: 16,
    },

    heroRightActions: {
      position: "absolute",
      top: 16,
      right: 16,
      flexDirection: "row",
      gap: 9,
    },

    galleryIndicators: {
      position: "absolute",
      bottom: 15,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },

    galleryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: COLORS.white,
      backgroundColor:
        "rgba(255,255,255,0.35)",
    },

    galleryDotActive: {
      backgroundColor:
        COLORS.white,
    },

    /* BODY */

    body: {
      backgroundColor:
        COLORS.cream ?? "#FAF8F1",
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      marginTop: -18,
      paddingHorizontal: 18,
      paddingTop: 20,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    title: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 27,
      lineHeight: 31,
      fontWeight: "900",
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },

    location: {
      marginLeft: 4,
      color: COLORS.gray,
      fontSize: 14,
    },

    /* CHIPS */

    chipsRow: {
      alignItems: "center",
      paddingVertical: 15,
      gap: 7,
    },

    speciesChip: {
      height: 36,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        COLORS.border ?? "#E1E1DB",
      borderRadius: 18,
      backgroundColor: COLORS.white,
      paddingHorizontal: 13,
    },

    speciesChipText: {
      marginLeft: 6,
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 12,
      fontWeight: "700",
    },

    moreChip: {
      height: 36,
      justifyContent: "center",
      borderRadius: 18,
      paddingHorizontal: 13,
      backgroundColor: "#EEF1EC",
    },

    moreChipText: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 12,
    },

    /* RESPONSABLE */

    responsibleCard: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        COLORS.border ?? "#E1E1DB",
      borderRadius: 18,
      padding: 14,
      backgroundColor: COLORS.white,
      marginBottom: 18,
    },

    avatarPlaceholder: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EDF4EA",
      marginRight: 12,
    },

    responsibleName: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 14,
      fontWeight: "900",
    },

    responsibleDescription: {
      color: COLORS.gray,
      fontSize: 12,
      marginTop: 4,
    },

    /* GENERAL */

    sectionTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 19,
      fontWeight: "900",
      marginBottom: 8,
    },

    description: {
      color: COLORS.gray,
      fontSize: 14,
      lineHeight: 21,
    },

    referenceBox: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 13,
    },

    referenceText: {
      flex: 1,
      marginLeft: 7,
      color: COLORS.gray,
      fontSize: 12,
    },

    divider: {
      height: 1,
      backgroundColor:
        COLORS.border ?? "#E1E1DB",
      marginVertical: 18,
    },

    /* ESPECIES */

    speciesCard: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border ?? "#E1E1DB",
      paddingVertical: 10,
    },

    speciesPhoto: {
      width: 68,
      height: 68,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#E6EFE2",
      marginRight: 11,
    },

    speciesInfo: {
      flex: 1,
      minWidth: 105,
    },

    speciesName: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontWeight: "900",
      fontSize: 13,
    },

    mayaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },

    mayaBee: {
      color:
        COLORS.honey ?? "#C79218",
      marginRight: 4,
    },

    mayaName: {
      color: COLORS.gray,
      fontSize: 11,
    },

    audioButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor:
        COLORS.border ?? "#E1E1DB",
      marginRight: 6,
    },

    housingBox: {
      width: 62,
      minHeight: 58,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EDF4EA",
      marginLeft: 4,
      padding: 4,
    },

    jobonBox: {
      backgroundColor: "#FFF8DE",
    },

    housingLabel: {
      color: COLORS.gray,
      fontSize: 9,
      marginTop: 2,
    },

    housingValue: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 14,
      fontWeight: "900",
    },

    /* PRODUCTOS */

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 10,
    },

    viewAll: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 12,
      fontWeight: "800",
      textDecorationLine:
        "underline",
    },

    productsRow: {
      paddingRight: 14,
      gap: 9,
    },

    productCard: {
      width: 148,
      borderWidth: 1,
      borderColor:
        COLORS.border ?? "#E1E1DB",
      borderRadius: 17,
      backgroundColor: COLORS.white,
      overflow: "hidden",
      paddingBottom: 10,
    },

    productImage: {
      height: 94,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F2EAD2",
    },

    productName: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontWeight: "900",
      fontSize: 13,
      marginHorizontal: 9,
      marginTop: 7,
    },

    productPresentation: {
      color: COLORS.gray,
      fontSize: 10,
      marginHorizontal: 9,
      marginTop: 2,
    },

    availableBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 8,
      marginTop: 8,
      borderRadius: 8,
      paddingVertical: 5,
      backgroundColor: "#FFF1B8",
    },

    availableText: {
      marginLeft: 5,
      color: "#9A6A00",
      fontSize: 10,
      fontWeight: "800",
    },

    emptyBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        COLORS.border ?? "#E1E1DB",
      backgroundColor: COLORS.white,
      padding: 14,
    },

    empty: {
      flex: 1,
      color: COLORS.gray,
      fontSize: 12,
      marginLeft: 8,
    },

    /* PUNTO DE VENTA */

    saleTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 22,
      marginBottom: 10,
    },

    saleCard: {
      flexDirection: "row",
      borderRadius: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        COLORS.border ?? "#E1E1DB",
      backgroundColor: COLORS.white,
      marginBottom: 18,
    },

    mapPlaceholder: {
      width: "48%",
      minHeight: 145,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#CFE5D4",
    },

    mapCity: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 12,
      fontWeight: "900",
      marginTop: 4,
    },

    saleInfo: {
      flex: 1,
      padding: 12,
      justifyContent: "center",
    },

    saleName: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontWeight: "900",
      fontSize: 13,
    },

    saleAddress: {
      color: COLORS.gray,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 4,
    },

    locationButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: 11,
      paddingVertical: 8,
      marginTop: 10,
    },

    locationButtonText: {
      color: COLORS.primary,
      fontSize: 11,
      fontWeight: "900",
      marginLeft: 5,
    },

    /* BOTTOM */

    bottomActions: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 13,
      gap: 9,
      backgroundColor: COLORS.white,
      borderTopWidth: 1,
      borderTopColor:
        COLORS.border ?? "#E1E1DB",
    },

    actionButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    outlineButton: {
      borderWidth: 1.5,
      borderColor: COLORS.primary,
      backgroundColor: COLORS.white,
    },

    outlineButtonText: {
      marginLeft: 8,
      color: COLORS.primary,
      fontSize: 13,
      fontWeight: "900",
    },

    primaryButton: {
      backgroundColor:
        COLORS.primary,
    },

    primaryButtonText: {
      marginLeft: 8,
      color: COLORS.white,
      fontSize: 13,
      fontWeight: "900",
    },

    /* NOT FOUND */

    notFound: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor:
        COLORS.cream ?? "#FAF8F1",
    },

    notFoundTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 20,
      fontWeight: "900",
      marginTop: 10,
    },

    backAction: {
      marginTop: 18,
      backgroundColor:
        COLORS.primary,
      borderRadius: 12,
      paddingHorizontal: 25,
      paddingVertical: 12,
    },

    backActionText: {
      color: COLORS.white,
      fontWeight: "900",
    },
  });
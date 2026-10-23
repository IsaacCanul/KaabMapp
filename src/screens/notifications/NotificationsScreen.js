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
  COLORS,
} from "../../theme/colors";

const NOTIFICATIONS = [
  {
    id: "1",

    type: "approved",

    title:
      "Registro aprobado",

    message:
      "Tu registro de Meliponario Izamal fue aprobado.",

    time:
      "Hace 10 min",

    read:
      false,
  },

  {
    id: "2",

    type: "review",

    title:
      "Registro en revisión",

    message:
      "Tu solicitud está siendo revisada por el equipo de KaabMap.",

    time:
      "Hace 2 h",

    read:
      false,
  },

  {
    id: "3",

    type: "info",

    title:
      "Registro enviado",

    message:
      "Recibimos correctamente la información de tu meliponario.",

    time:
      "Ayer",

    read:
      true,
  },
];


function getIcon(type) {
  switch (type) {
    case "approved":
      return "checkmark-circle-outline";

    case "review":
      return "time-outline";

    case "correction":
      return "create-outline";

    case "rejected":
      return "close-circle-outline";

    default:
      return "notifications-outline";
  }
}


export default function NotificationsScreen({
  navigation,
}) {
  return (
    <SafeAreaView
      style={styles.screen}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={
              COLORS.primaryDark ??
              COLORS.primary
            }
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          Notificaciones
        </Text>

        <View
          style={{
            width: 44,
          }}
        />
      </View>


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {NOTIFICATIONS.length >
        0 ? (
          NOTIFICATIONS.map(
            (notification) => (
              <TouchableOpacity
                key={
                  notification.id
                }
                activeOpacity={0.8}
                style={[
                  styles.notification,

                  !notification.read &&
                    styles.unreadNotification,
                ]}
              >
                <View
                  style={
                    styles.iconContainer
                  }
                >
                  <Ionicons
                    name={getIcon(
                      notification.type
                    )}
                    size={24}
                    color={
                      COLORS.primary
                    }
                  />
                </View>


                <View
                  style={
                    styles.notificationContent
                  }
                >
                  <View
                    style={
                      styles.titleRow
                    }
                  >
                    <Text
                      style={
                        styles.notificationTitle
                      }
                    >
                      {
                        notification.title
                      }
                    </Text>

                    {!notification.read && (
                      <View
                        style={
                          styles.unreadDot
                        }
                      />
                    )}
                  </View>


                  <Text
                    style={
                      styles.notificationMessage
                    }
                  >
                    {
                      notification.message
                    }
                  </Text>


                  <Text
                    style={
                      styles.notificationTime
                    }
                  >
                    {
                      notification.time
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            )
          )
        ) : (
          <View
            style={
              styles.empty
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="notifications-outline"
                size={42}
                color={
                  COLORS.primary
                }
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Sin notificaciones
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Aquí aparecerán las
              novedades relacionadas
              con tus registros.
            </Text>
          </View>
        )}
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

    header: {
      height: 64,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        16,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,

      backgroundColor:
        COLORS.cream,
    },

    backButton: {
      width: 44,

      height: 44,

      borderRadius:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        COLORS.white,
    },

    headerTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,

      fontSize:
        19,

      fontWeight:
        "900",
    },

    content: {
      padding:
        16,

      paddingBottom:
        30,
    },

    notification: {
      flexDirection:
        "row",

      backgroundColor:
        COLORS.white,

      borderRadius:
        16,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      padding:
        14,

      marginBottom:
        10,
    },

    unreadNotification: {
      backgroundColor:
        "#F4F8F1",
    },

    iconContainer: {
      width:
        46,

      height:
        46,

      borderRadius:
        23,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EAF4EC",

      marginRight:
        12,
    },

    notificationContent: {
      flex:
        1,

      minWidth:
        0,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    notificationTitle: {
      flex:
        1,

      color:
        COLORS.primaryDark ??
        COLORS.primary,

      fontSize:
        14,

      fontWeight:
        "900",
    },

    unreadDot: {
      width:
        8,

      height:
        8,

      borderRadius:
        4,

      backgroundColor:
        COLORS.honey ??
        "#D89E16",

      marginLeft:
        8,
    },

    notificationMessage: {
      color:
        COLORS.gray,

      fontSize:
        13,

      lineHeight:
        19,

      marginTop:
        4,
    },

    notificationTime: {
      color:
        COLORS.gray,

      fontSize:
        10,

      marginTop:
        8,
    },

    empty: {
      alignItems:
        "center",

      paddingTop:
        100,

      paddingHorizontal:
        30,
    },

    emptyIcon: {
      width:
        82,

      height:
        82,

      borderRadius:
        41,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EAF4EC",
    },

    emptyTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,

      fontSize:
        19,

      fontWeight:
        "900",

      marginTop:
        16,
    },

    emptyText: {
      color:
        COLORS.gray,

      fontSize:
        13,

      lineHeight:
        19,

      textAlign:
        "center",

      marginTop:
        6,
    },
  });
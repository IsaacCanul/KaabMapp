import React from "react";

import {
  StyleSheet,
  Text,
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

import {
  useAuth,
} from "../../context/AuthContext";

import {
  COLORS,
} from "../../theme/colors";


export default function ProfileScreen() {
  const {
    user,
    perfil,
    logout,
  } = useAuth();


  const nombreCompleto =
    [
      perfil?.nombre,
      perfil?.apellidos,
    ]
      .filter(Boolean)
      .join(" ");


  return (
    <SafeAreaView
      style={
        styles.screen
      }
    >
      <View
        style={
          styles.content
        }
      >
        <View
          style={
            styles.avatar
          }
        >
          <Ionicons
            name="person"
            size={40}
            color={
              COLORS.primary
            }
          />
        </View>

        <Text
          style={
            styles.name
          }
        >
          {nombreCompleto ||
            "Usuario"}
        </Text>

        <Text
          style={
            styles.email
          }
        >
          {user?.email}
        </Text>

        <View
          style={
            styles.card
          }
        >
          <ProfileRow
            icon="person-outline"
            label="Nombre"
            value={
              perfil?.nombre
            }
          />

          <ProfileRow
            icon="person-outline"
            label="Apellidos"
            value={
              perfil?.apellidos
            }
          />

          <ProfileRow
            icon="mail-outline"
            label="Correo"
            value={
              user?.email
            }
          />

          <ProfileRow
            icon="checkmark-circle-outline"
            label="Estado"
            value={
              perfil?.activo
                ? "Activo"
                : "Inactivo"
            }
          />
        </View>

        <PrimaryButton
          title="Cerrar sesión"
          icon="log-out-outline"
          outline
          onPress={
            logout
          }
        />
      </View>
    </SafeAreaView>
  );
}


function ProfileRow({
  icon,
  label,
  value,
}) {
  return (
    <View
      style={
        styles.row
      }
    >
      <Ionicons
        name={icon}
        size={21}
        color={
          COLORS.primary
        }
      />

      <View
        style={
          styles.rowContent
        }
      >
        <Text
          style={
            styles.rowLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.rowValue
          }
        >
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}


const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        COLORS.cream,
    },

    content: {
      padding: 22,
    },

    avatar: {
      width: 86,
      height: 86,
      borderRadius: 43,
      alignSelf:
        "center",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EAF4EC",
      marginTop: 20,
    },

    name: {
      textAlign:
        "center",
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 22,
      fontWeight: "900",
      marginTop: 12,
    },

    email: {
      textAlign:
        "center",
      color:
        COLORS.gray,
      marginTop: 4,
      marginBottom: 22,
    },

    card: {
      backgroundColor:
        COLORS.white,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      paddingHorizontal: 16,
      marginBottom: 20,
    },

    row: {
      minHeight: 64,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderBottomWidth: 1,
      borderBottomColor:
        COLORS.border,
    },

    rowContent: {
      flex: 1,
      marginLeft: 12,
    },

    rowLabel: {
      color:
        COLORS.gray,
      fontSize: 11,
    },

    rowValue: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 3,
    },
  });
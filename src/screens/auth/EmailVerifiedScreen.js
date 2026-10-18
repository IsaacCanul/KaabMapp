import React from "react";

import {
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

import AppLogo
  from "../../components/AppLogo";

import {
  COLORS,
} from "../../theme/colors";

export default function EmailVerifiedScreen({
  navigation,
}) {
  return (
    <SafeAreaView
      style={styles.screen}
    >
      <View style={styles.container}>
        <AppLogo />

        <View style={styles.success}>
          <Ionicons
            name="checkmark"
            size={48}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.title}>
          Correo confirmado
        </Text>

        <Text
          style={styles.description}
        >
          Tu correo electrónico fue
          verificado correctamente.
          {"\n\n"}
          Ya puedes utilizar tu cuenta
          de KaabMap.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.reset({
              index: 0,

              routes: [
                {
                  name: "Login",
                },
              ],
            });
          }}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Iniciar sesión
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
        COLORS.cream,
    },

    container: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal: 25,

      maxWidth: 480,

      width: "100%",

      alignSelf: "center",
    },

    success: {
      width: 90,
      height: 90,

      borderRadius: 45,

      backgroundColor: "#14764C",

      alignItems: "center",
      justifyContent: "center",

      marginTop: 32,
      marginBottom: 24,
    },

    title: {
      color:
        COLORS.primaryDark,

      fontSize: 27,

      fontWeight: "900",
    },

    description: {
      marginTop: 12,

      color: COLORS.gray,

      fontSize: 14,

      lineHeight: 21,

      textAlign: "center",
    },

    button: {
      width: "100%",

      minHeight: 52,

      borderRadius: 26,

      marginTop: 30,

      backgroundColor:
        COLORS.primaryDark,

      alignItems: "center",
      justifyContent: "center",
    },

    buttonText: {
      color: "#FFFFFF",

      fontWeight: "900",
    },
  });
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
  COLORS,
} from "../../theme/colors";


export default function EmailVerifiedScreen({
  navigation,
}) {
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
            styles.iconContainer
          }
        >
          <Ionicons
            name="checkmark-circle"
            size={72}
            color={
              COLORS.primary
            }
          />
        </View>

        <Text
          style={
            styles.title
          }
        >
          Correo confirmado
        </Text>

        <Text
          style={
            styles.text
          }
        >
          Tu correo electrónico
          fue confirmado
          correctamente.
        </Text>

        <Text
          style={
            styles.text
          }
        >
          Ya puedes iniciar sesión
          en KaabMap.
        </Text>

        <PrimaryButton
          title="Iniciar sesión"
          icon="log-in-outline"
          onPress={() =>
            navigation.replace(
              "Login"
            )
          }
          style={{
            marginTop: 28,
          }}
        />
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

    content: {
      flex: 1,
      justifyContent:
        "center",
      padding: 28,
    },

    iconContainer: {
      width: 110,
      height: 110,
      borderRadius: 55,
      alignSelf:
        "center",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EAF4EC",
      marginBottom: 24,
    },

    title: {
      textAlign:
        "center",
      color:
        COLORS.primaryDark ??
        COLORS.primary,
      fontSize: 28,
      fontWeight: "900",
    },

    text: {
      textAlign:
        "center",
      color:
        COLORS.gray,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 8,
    },
  });
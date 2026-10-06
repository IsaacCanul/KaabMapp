import React from "react";

import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import { styles } from "./WelcomeScreen.styles";

export default function WelcomeScreen({
  navigation,
}) {
  const irAlLogin = () => {
    navigation.navigate("Login");
  };

  const irARegistro = () => {
    navigation.navigate("Registro")
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* IMAGEN SUPERIOR */}
      <ImageBackground
        source={require("../../../assets/welcome-bg.png")}
        style={styles.hero}
        resizeMode="cover"
      >
        <View
          style={styles.heroOverlay}
        />

        {/* ABEJA */}
        <Image
          source={require("../../../assets/bee.png")}
          style={styles.bee}
          resizeMode="contain"
        />

        {/* HOJAS */}
        <Image
          source={require("../../../assets/leaves-top.png")}
          style={styles.leavesTop}
          resizeMode="stretch"
        />
      </ImageBackground>

      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.contentCard}
        >
          {/* LOGO */}

          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.brand}>
            MeliponApp
          </Text>

          <Text style={styles.tagline}>
            Abejas nativas, territorios vivos
          </Text>

          {/* TEXTO */}

          <View
            style={styles.textSection}
          >
            <Text style={styles.title}>
              Bienvenido a{"\n"}MeliponApp
            </Text>

            <Text
              style={styles.description}
            >
              Descubre, registra y protege
              meliponarios en tu territorio.
            </Text>
          </View>

          {/* BOTÓN COMENZAR */}

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={irARegistro}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Comenzar
            </Text>

            <Ionicons
              name="chevron-forward"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* YA TENGO CUENTA */}

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.7}
            onPress={irAlLogin}
          >
            <Text
              style={styles.loginText}
            >
              Ya tengo cuenta
            </Text>
          </TouchableOpacity>

          {/* HOJAS INFERIORES */}

          <Image
            source={require("../../../assets/leaves-bottom.png")}
            style={styles.leavesBottom}
            resizeMode="stretch"
            pointerEvents="none"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
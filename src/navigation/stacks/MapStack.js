import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import MapScreen
  from "../../screens/map/MapScreen";

import MeliponarioDetailScreen
  from "../../screens/meliponarios/MeliponarioDetailScreen";


const Stack = createNativeStackNavigator();


export default function MapStack() {
  return (
    <Stack.Navigator
      initialRouteName="MapScreen"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* ============================================
          PANTALLA PRINCIPAL
      ============================================ */}

      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
      />

      {/* ============================================
          DETALLES
      ============================================ */}

      <Stack.Screen
        name="MeliponarioDetail"
        component={MeliponarioDetailScreen}
      />
    </Stack.Navigator>
  );
}
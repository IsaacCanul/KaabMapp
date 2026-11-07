import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import InspectionsScreen from "../../screens/inspections/InspectionsScreen";
import SolicitudFichaScreen from "../../screens/inspections/SolicitudFichaScreen";
import FichaTecnicaScreen from "../../screens/inspections/FichaTecnicaScreen";

const Stack = createNativeStackNavigator();

// Pestaña «Mis inspecciones» del trabajador de campo (rol 4):
// bandeja de solicitudes de sus zonas y ficha de revisión.
export default function InspectionsStack() {
  return (
    <Stack.Navigator
      initialRouteName="InspectionsMain"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="InspectionsMain" component={InspectionsScreen} />
      <Stack.Screen name="SolicitudFicha" component={SolicitudFichaScreen} />
      <Stack.Screen name="FichaTecnica" component={FichaTecnicaScreen} />
    </Stack.Navigator>
  );
}

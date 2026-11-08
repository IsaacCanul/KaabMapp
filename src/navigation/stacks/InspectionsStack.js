import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MeliponarioDraftProvider } from "../../context/MeliponarioDraftContext";

import InspectionsScreen from "../../screens/inspections/InspectionsScreen";
import SolicitudFichaScreen from "../../screens/inspections/SolicitudFichaScreen";
import FichaTecnicaScreen from "../../screens/inspections/FichaTecnicaScreen";

// El trabajador edita con el mismo formulario del registro.
import RegisterStep1Screen from "../../screens/register/RegisterStep1Screen";
import RegisterStep2Screen from "../../screens/register/RegisterStep2Screen";
import RegisterStep3Screen from "../../screens/register/RegisterStep3Screen";
import RegisterStep5Screen from "../../screens/register/RegisterStep5Screen";

const Stack = createNativeStackNavigator();

// Pestaña «Revisiones» del trabajador de campo (rol 4):
// bandeja de solicitudes, visitas asignadas con su encuesta y
// edición de los meliponarios que aprobó.
export default function InspectionsStack() {
  return (
    <MeliponarioDraftProvider>
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
        <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
        <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
        <Stack.Screen name="RegisterStep3" component={RegisterStep3Screen} />
        <Stack.Screen name="RegisterStep5" component={RegisterStep5Screen} />
      </Stack.Navigator>
    </MeliponarioDraftProvider>
  );
}

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapScreen from "../../screens/map/MapScreen";
import MeliponarioDetailScreen from "../../screens/meliponarios/MeliponarioDetailScreen";

const Stack = createNativeStackNavigator();

export default function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen name="MeliponarioDetail" component={MeliponarioDetailScreen} />
    </Stack.Navigator>
  );
}

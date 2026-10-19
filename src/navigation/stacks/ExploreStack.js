import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreScreen from "../../screens/explore/ExploreScreen";
import MeliponarioDetailScreen from "../../screens/meliponarios/MeliponarioDetailScreen";

const Stack = createNativeStackNavigator();

export default function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="MeliponarioDetail" component={MeliponarioDetailScreen} />
    </Stack.Navigator>
  );
}

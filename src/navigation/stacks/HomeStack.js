import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../screens/home/HomeScreen";
import MeliponarioDetailScreen from "../../screens/meliponarios/MeliponarioDetailScreen";
import NotificationsScreen
  from "../../screens/notifications/NotificationsScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MeliponarioDetail" component={MeliponarioDetailScreen} />
      <Stack.Screen name="Notifications"component={NotificationsScreen}/>
    </Stack.Navigator>
  );
}

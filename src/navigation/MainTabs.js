import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import KaabBottomBar from "./KaabBottomBar";
import HomeStack from "./stacks/HomeStack";
import MapStack from "./stacks/MapStack";
import ExploreStack from "./stacks/ExploreStack";
import AccountStack from "./stacks/AccountStack";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <KaabBottomBar {...props} />}
    >
      {/* Mantenemos los nombres Home, Map, Explore y Profile para no romper
          llamadas navigation.navigate(...) que ya existen en tus pantallas. */}
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Map" component={MapStack} />
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen name="Profile" component={AccountStack} />
    </Tab.Navigator>
  );
}

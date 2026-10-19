import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import MainTabs
  from "./MainTabs";

import AuthStack
  from "./AuthStack";

import {
  navigationRef,
} from "./navigationRef";

const Root =
  createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer
      ref={navigationRef}
    >
      <Root.Navigator
        initialRouteName="MainApp"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Root.Screen
          name="MainApp"
          component={MainTabs}
        />

        <Root.Screen
          name="Auth"
          component={AuthStack}
        />
      </Root.Navigator>
    </NavigationContainer>
  );
}
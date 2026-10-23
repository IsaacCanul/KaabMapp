import React from "react";

import * as Linking
  from "expo-linking";

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


const linking = {
  prefixes: [
    Linking.createURL("/"),
    "kaabmap://",
  ],

  config: {
    screens: {
      MainApp: "",

      Auth: {
        screens: {
          Login:
            "login",

          Register:
            "register",

          EmailVerificationPending:
            "email-verification-pending",

          EmailVerified:
            "email-confirmed",
        },
      },
    },
  },
};


export default function AppNavigator() {
  return (
    <NavigationContainer
      ref={
        navigationRef
      }
      linking={
        linking
      }
    >
      <Root.Navigator
        initialRouteName="MainApp"
        screenOptions={{
          headerShown:
            false,
        }}
      >
        <Root.Screen
          name="MainApp"
          component={
            MainTabs
          }
        />

        <Root.Screen
          name="Auth"
          component={
            AuthStack
          }
        />
      </Root.Navigator>
    </NavigationContainer>
  );
}
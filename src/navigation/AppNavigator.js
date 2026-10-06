import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Registro"
          component={RegisterScreen}
        />
          
      
      </Stack.Navigator>
    </NavigationContainer>
  );
}
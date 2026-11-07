import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { useAuth } from "../../context/AuthContext";

import GuestAccountScreen
  from "../../screens/auth/GuestAccountScreen";

import ProfileScreen
  from "../../screens/profile/ProfileScreen";

import ProductsScreen
  from "../../screens/products/ProductsScreen";

import ProductFormScreen
  from "../../screens/products/ProductFormScreen";

import InspectionsScreen
  from "../../screens/inspections/InspectionsScreen";

import InspectionFormScreen
  from "../../screens/inspections/InspectionFormScreen";

const Stack = createNativeStackNavigator();

function AccountHome(props) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? <ProfileScreen {...props} />
    : <GuestAccountScreen />;
}

export default function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="AccountHome"
        component={AccountHome}
      />

      <Stack.Screen
        name="Products"
        component={ProductsScreen}
      />

      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
      />

      <Stack.Screen
        name="Inspections"
        component={InspectionsScreen}
      />

      <Stack.Screen
        name="InspectionForm"
        component={InspectionFormScreen}
      />
    </Stack.Navigator>
  );
}
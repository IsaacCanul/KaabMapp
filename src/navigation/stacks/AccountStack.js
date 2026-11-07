import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import GuestAccountScreen from "../../screens/auth/GuestAccountScreen";
import ProfileScreen from "../../screens/profile/ProfileScreen";
import MyMeliponariosScreen from "../../screens/meliponarios/MyMeliponariosScreen";
import MeliponarioDetailScreen from "../../screens/meliponarios/MeliponarioDetailScreen";
import ProductsScreen from "../../screens/products/ProductsScreen";
import ProductFormScreen from "../../screens/products/ProductFormScreen";
import RegisterStep1Screen from "../../screens/register/RegisterStep1Screen";
import RegisterStep2Screen from "../../screens/register/RegisterStep2Screen";
import RegisterStep3Screen from "../../screens/register/RegisterStep3Screen";
import RegisterStep4Screen from "../../screens/register/RegisterStep4Screen";
import RegisterStep5Screen from "../../screens/register/RegisterStep5Screen";
import InspectionsScreen from "../../screens/inspections/InspectionsScreen";
import InspectionFormScreen from "../../screens/inspections/InspectionFormScreen";

const Stack = createNativeStackNavigator();

function AccountHome(props) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <ProfileScreen {...props} /> : <GuestAccountScreen />;
}

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountHome" component={AccountHome} />
      <Stack.Screen name="MyMeliponarios" component={MyMeliponariosScreen} />
      <Stack.Screen name="MeliponarioDetail" component={MeliponarioDetailScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} />
      <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
      <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
      <Stack.Screen name="RegisterStep3" component={RegisterStep3Screen} />
      <Stack.Screen name="RegisterStep4" component={RegisterStep4Screen} />
      <Stack.Screen name="RegisterStep5" component={RegisterStep5Screen} />
      <Stack.Screen name="Inspections" component={InspectionsScreen} />
      <Stack.Screen name="InspectionForm" component={InspectionFormScreen} />
    </Stack.Navigator>
  );
}

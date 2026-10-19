import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import EmailVerificationPendingScreen from "../screens/auth/EmailVerificationPendingScreen";
import EmailVerifiedScreen from "../screens/auth/EmailVerifiedScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerificationPending" component={EmailVerificationPendingScreen}></Stack.Screen>
      <Stack.Screen name="EmailVerified" component={EmailVerifiedScreen}></Stack.Screen>:
    </Stack.Navigator>
  );
}

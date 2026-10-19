import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { MeliponarioDraftProvider } from "./src/context/MeliponarioDraftContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MeliponarioDraftProvider>
          <AppNavigator />
        </MeliponarioDraftProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

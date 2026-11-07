import React from "react";

import AppNavigator
  from "./src/navigation/AppNavigator";

import {
  AuthProvider,
} from "./src/context/AuthContext";

import {
  MeliponarioDraftProvider,
} from "./src/context/MeliponarioDraftContext";


export default function App() {
  return (
    <AuthProvider>
      <MeliponarioDraftProvider>
        <AppNavigator />
      </MeliponarioDraftProvider>
    </AuthProvider>
  );
}
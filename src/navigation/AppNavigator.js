import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import AuthStack from "./AuthStack";
import { navigationRef } from "./navigationRef";

const Root = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Root.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainApp">
        {/* La aplicación se puede explorar sin iniciar sesión. */}
        <Root.Screen name="MainApp" component={MainTabs} />
        {/* Login/registro se muestran aparte; la navbar principal no cambia ni se duplica. */}
        <Root.Screen
          name="Auth"
          component={AuthStack}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Root.Navigator>
    </NavigationContainer>
  );
}

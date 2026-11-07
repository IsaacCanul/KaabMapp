import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import MyMeliponariosScreen
  from "../../screens/meliponarios/MyMeliponariosScreen";

import RegisterStep1Screen
  from "../../screens/register/RegisterStep1Screen";

import RegisterStep2Screen
  from "../../screens/register/RegisterStep2Screen";

import RegisterStep3Screen
  from "../../screens/register/RegisterStep3Screen";

import RegisterStep4Screen
  from "../../screens/register/RegisterStep4Screen";

import RegisterStep5Screen
  from "../../screens/register/RegisterStep5Screen";


const Stack =
  createNativeStackNavigator();


export default function MyRecordsStack() {
  return (
    <Stack.Navigator
      initialRouteName="MyMeliponarios"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MyMeliponarios"
        component={
          MyMeliponariosScreen
        }
      />

      <Stack.Screen
        name="RegisterStep1"
        component={
          RegisterStep1Screen
        }
      />

      <Stack.Screen
        name="RegisterStep2"
        component={
          RegisterStep2Screen
        }
      />

      <Stack.Screen
        name="RegisterStep3"
        component={
          RegisterStep3Screen
        }
      />

      <Stack.Screen
        name="RegisterStep4"
        component={
          RegisterStep4Screen
        }
      />

      <Stack.Screen
        name="RegisterStep5"
        component={
          RegisterStep5Screen
        }
      />
    </Stack.Navigator>
  );
}
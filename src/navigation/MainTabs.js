import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  Ionicons,
} from "@expo/vector-icons";

import HomeStack
  from "./stacks/HomeStack";

import MapStack
  from "./stacks/MapStack";

import ExploreStack
  from "./stacks/ExploreStack";

import AccountStack
  from "./stacks/AccountStack";

import MyRecordsStack
  from "./stacks/MyRecordsStack";

import InspectionsScreen
  from "../screens/inspections/InspectionsScreen";

import {
  useAuth,
} from "../context/AuthContext";

import {
  COLORS,
} from "../theme/colors";


const Tab =
  createBottomTabNavigator();


/*
 * IMPORTANTE:
 * Todavía necesitamos conocer qué rol_id
 * corresponde realmente al trabajador
 * de campo.
 *
 * Cuando lo sepamos, por ejemplo si es 4:
 *
 * const FIELD_WORKER_ROLE_ID = 4;
 */
const FIELD_WORKER_ROLE_ID = null;


export default function MainTabs() {
  const {
    isAuthenticated,
    perfil,
    loading,
  } = useAuth();


  const isFieldWorker =
    isAuthenticated &&
    FIELD_WORKER_ROLE_ID !== null &&
    Number(perfil?.rol_id) ===
      Number(
        FIELD_WORKER_ROLE_ID
      );


  /*
   * Hace que los tabs se reconstruyan
   * automáticamente cuando:
   *
   * visitante -> usuario registrado
   * usuario -> cerrar sesión
   * usuario -> trabajador
   */
  const navigatorKey =
    !isAuthenticated
      ? "guest"
      : isFieldWorker
        ? "field-worker"
        : "registered-user";


  if (loading) {
    return null;
  }


  return (
    <Tab.Navigator
      key={navigatorKey}
      initialRouteName="Inicio"
      screenOptions={({
        route,
      }) => ({
        headerShown: false,

        tabBarActiveTintColor:
          COLORS.primary,

        tabBarInactiveTintColor:
          COLORS.gray,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },

        tabBarStyle: {
          height: 68,

          paddingTop: 7,

          paddingBottom: 8,

          backgroundColor:
            COLORS.white,

          borderTopWidth: 1,

          borderTopColor:
            COLORS.border,
        },


        tabBarIcon: ({
          color,
          size,
          focused,
        }) => {
          let iconName =
            "ellipse-outline";


          /*
           * INICIO
           */
          if (
            route.name ===
            "Inicio"
          ) {
            iconName =
              focused
                ? "home"
                : "home-outline";
          }


          /*
           * MAPA
           */
          else if (
            route.name ===
            "Mapa"
          ) {
            iconName =
              focused
                ? "map"
                : "map-outline";
          }


          /*
           * EXPLORAR
           */
          else if (
            route.name ===
            "Explorar"
          ) {
            iconName =
              focused
                ? "compass"
                : "compass-outline";
          }


          /*
           * MIS REGISTROS
           */
          else if (
            route.name ===
            "Mis registros"
          ) {
            iconName =
              focused
                ? "file-tray-full"
                : "file-tray-full-outline";
          }


          /*
           * MIS INSPECCIONES
           */
          else if (
            route.name ===
            "Mis inspecciones"
          ) {
            iconName =
              focused
                ? "clipboard"
                : "clipboard-outline";
          }


          /*
           * CUENTA
           */
          else if (
            route.name ===
            "Cuenta"
          ) {
            iconName =
              focused
                ? "person"
                : "person-outline";
          }


          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >

      {/* =========================
          INICIO
      ========================= */}
      <Tab.Screen
        name="Inicio"
        component={
          HomeStack
        }
      />


      {/* =========================
          MAPA
      ========================= */}
      <Tab.Screen
        name="Mapa"
        component={
          MapStack
        }
      />


      {/* =========================
          TERCER TAB DINÁMICO
      ========================= */}

      {!isAuthenticated ? (

        /*
         * VISITANTE
         *
         * Inicio
         * Mapa
         * Explorar
         * Cuenta
         */
        <Tab.Screen
          name="Explorar"
          component={
            ExploreStack
          }
        />

      ) : isFieldWorker ? (

        /*
         * TRABAJADOR DE CAMPO
         *
         * Inicio
         * Mapa
         * Mis inspecciones
         * Cuenta
         */
        <Tab.Screen
          name="Mis inspecciones"
          component={
            InspectionsScreen
          }
        />

      ) : (

        /*
         * USUARIO REGISTRADO
         *
         * Inicio
         * Mapa
         * Mis registros
         * Cuenta
         */
        <Tab.Screen
          name="Mis registros"
          component={
            MyRecordsStack
          }
        />

      )}


      {/* =========================
          CUENTA
      ========================= */}
      <Tab.Screen
        name="Cuenta"
        component={
          AccountStack
        }
      />

    </Tab.Navigator>
  );
}
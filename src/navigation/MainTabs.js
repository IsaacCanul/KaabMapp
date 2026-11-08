import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import HomeStack from "./stacks/HomeStack";
import MapStack from "./stacks/MapStack";
import ExploreStack from "./stacks/ExploreStack";
import AccountStack from "./stacks/AccountStack";
import MyRecordsStack from "./stacks/MyRecordsStack";
import InspectionsStack from "./stacks/InspectionsStack";

import { useAuth } from "../context/AuthContext";
import { COLORS } from "../theme/colors";

const Tab = createBottomTabNavigator();
const FIELD_WORKER_ROLE_ID = 4;

export default function MainTabs() {
  const { isAuthenticated, perfil, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomSpace = Math.max(insets.bottom, 12);

  const isFieldWorker =
    isAuthenticated &&
    Number(perfil?.rol_id) === FIELD_WORKER_ROLE_ID;

  const navigatorKey = !isAuthenticated
    ? "guest"
    : isFieldWorker
      ? "field-worker"
      : "registered-user";

  if (loading) return null;

  const iconos = {
    Inicio: ["home-outline", "home"],
    Mapa: ["map-outline", "map"],
    Explorar: ["compass-outline", "compass"],
    "Mis registros": [
      "file-tray-full-outline",
      "file-tray-full",
    ],
    "Mis inspecciones": [
      "shield-checkmark-outline",
      "shield-checkmark",
    ],
    Cuenta: ["person-outline", "person"],
  };

  return (
    <Tab.Navigator
      key={navigatorKey}
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },

        tabBarStyle: {
          // Se suma el espacio de la barra de gestos de Android/iOS.
          height: 62 + bottomSpace,
          paddingTop: 7,
          paddingBottom: bottomSpace,
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },

        tabBarIcon: ({ color, size, focused }) => {
          const nombres = iconos[route.name] ?? [
            "ellipse-outline",
            "ellipse",
          ];

          return (
            <Ionicons
              name={nombres[focused ? 1 : 0]}
              color={color}
              size={size}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeStack}
      />

      <Tab.Screen
        name="Mapa"
        component={MapStack}
      />

      {!isAuthenticated ? (
        <Tab.Screen
          name="Explorar"
          component={ExploreStack}
        />
      ) : isFieldWorker ? (
        <Tab.Screen
          name="Mis inspecciones"
          component={InspectionsStack}
          // Etiqueta corta para que quepa en la barra; el nombre
          // de la ruta se conserva porque Perfil navega con él.
          options={{ tabBarLabel: "Revisiones" }}
        />
      ) : (
        <Tab.Screen
          name="Mis registros"
          component={MyRecordsStack}
        />
      )}

      <Tab.Screen
        name="Cuenta"
        component={AccountStack}
      />
    </Tab.Navigator>
  );
}
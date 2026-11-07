import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  COLORS,
} from "../../theme/colors";

import {
  getNotificacionesRequest,
  marcarLeidasRequest,
  tiempoRelativo,
} from "../../services/notificacionesApi";


function getIcon(tipo) {
  switch (tipo) {
    case "aprobada":
      return "checkmark-circle-outline";

    case "publico":
      return "globe-outline";

    case "enviada":
      return "paper-plane-outline";

    case "revision":
      return "time-outline";

    case "correccion":
      return "create-outline";

    case "rechazada":
      return "close-circle-outline";

    case "borrador":
      return "document-text-outline";

    case "nueva":
      return "mail-unread-outline";

    case "inspeccion":
      return "clipboard-outline";

    default:
      return "notifications-outline";
  }
}


export default function NotificationsScreen({
  navigation,
}) {
  const [lista, setLista] = useState([]);
  const [autenticado, setAutenticado] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      (async () => {
        setError("");

        try {
          const data = await getNotificacionesRequest();
          if (!activo) return;
          setAutenticado(data.autenticado);
          setLista(data.notificaciones);
        } catch (e) {
          if (activo) {
            setError(e?.message ?? "No se pudieron cargar las notificaciones.");
          }
        } finally {
          if (activo) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      })();

      return () => {
        activo = false;
      };
    }, [revision])
  );

  const actualizar = () => {
    setRefreshing(true);
    setRevision((n) => n + 1);
  };

  const noLeidas = lista.filter((n) => !n.leida);

  const marcarTodas = async () => {
    await marcarLeidasRequest(noLeidas.map((n) => n.id));
    setLista((l) => l.map((n) => ({ ...n, leida: true })));
  };

  const abrir = async (n) => {
    if (!n.leida) {
      await marcarLeidasRequest([n.id]);
      setLista((l) => l.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
    }

    if (n.destino?.tab) {
      // La pestaña destino vive en el navegador de pestañas (padre).
      const tabs = navigation.getParent?.() ?? navigation;
      tabs.navigate(n.destino.tab, { screen: n.destino.screen, params: n.destino.params });
    }
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={COLORS.primaryDark ?? COLORS.primary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Notificaciones
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={actualizar}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {noLeidas.length > 0 && (
          <View style={styles.toolbar}>
            <Text style={styles.toolbarText}>
              {noLeidas.length} sin leer
            </Text>

            <TouchableOpacity onPress={marcarTodas}>
              <Text style={styles.toolbarAction}>
                Marcar todas como leídas
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : !autenticado ? (
          <Vacio
            icono="person-circle-outline"
            titulo="Inicia sesión"
            texto="Las notificaciones son sobre tus registros. Inicia sesión desde Cuenta para verlas."
          />
        ) : error ? (
          <Vacio
            icono="alert-circle-outline"
            titulo="No se pudieron cargar"
            texto={error}
          />
        ) : lista.length === 0 ? (
          <Vacio
            icono="notifications-outline"
            titulo="Sin notificaciones"
            texto="Aquí aparecerán las novedades relacionadas con tus registros."
          />
        ) : (
          lista.map((n) => (
            <TouchableOpacity
              key={n.id}
              activeOpacity={0.8}
              onPress={() => abrir(n)}
              style={[
                styles.notification,
                !n.leida && styles.unreadNotification,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${n.leida ? "" : "No leída. "}${n.titulo}. ${n.mensaje}`}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIcon(n.tipo)}
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notificationTitle}>
                    {n.titulo}
                  </Text>

                  {!n.leida && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.notificationMessage}>
                  {n.mensaje}
                </Text>

                {!!tiempoRelativo(n.fecha) && (
                  <Text style={styles.notificationTime}>
                    {tiempoRelativo(n.fecha)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


function Vacio({ icono, titulo, texto }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={icono}
          size={42}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {titulo}
      </Text>

      <Text style={styles.emptyText}>
        {texto}
      </Text>
    </View>
  );
}


const styles =
  StyleSheet.create({
    toolbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    toolbarText: {
      fontSize: 13,
      fontWeight: "800",
      color: COLORS.primaryDark ?? COLORS.primary,
    },

    toolbarAction: {
      fontSize: 13,
      fontWeight: "800",
      color: COLORS.primary,
      textDecorationLine: "underline",
    },

    screen: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },

    header: {
      height: 64,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        16,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,

      backgroundColor:
        COLORS.cream,
    },

    backButton: {
      width: 44,

      height: 44,

      borderRadius:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        COLORS.white,
    },

    headerTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,

      fontSize:
        19,

      fontWeight:
        "900",
    },

    content: {
      padding:
        16,

      paddingBottom:
        30,
    },

    notification: {
      flexDirection:
        "row",

      backgroundColor:
        COLORS.white,

      borderRadius:
        16,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      padding:
        14,

      marginBottom:
        10,
    },

    unreadNotification: {
      backgroundColor:
        "#F4F8F1",
    },

    iconContainer: {
      width:
        46,

      height:
        46,

      borderRadius:
        23,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EAF4EC",

      marginRight:
        12,
    },

    notificationContent: {
      flex:
        1,

      minWidth:
        0,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    notificationTitle: {
      flex:
        1,

      color:
        COLORS.primaryDark ??
        COLORS.primary,

      fontSize:
        14,

      fontWeight:
        "900",
    },

    unreadDot: {
      width:
        8,

      height:
        8,

      borderRadius:
        4,

      backgroundColor:
        COLORS.honey ??
        "#D89E16",

      marginLeft:
        8,
    },

    notificationMessage: {
      color:
        COLORS.gray,

      fontSize:
        13,

      lineHeight:
        19,

      marginTop:
        4,
    },

    notificationTime: {
      color:
        COLORS.gray,

      fontSize:
        10,

      marginTop:
        8,
    },

    empty: {
      alignItems:
        "center",

      paddingTop:
        100,

      paddingHorizontal:
        30,
    },

    emptyIcon: {
      width:
        82,

      height:
        82,

      borderRadius:
        41,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EAF4EC",
    },

    emptyTitle: {
      color:
        COLORS.primaryDark ??
        COLORS.primary,

      fontSize:
        19,

      fontWeight:
        "900",

      marginTop:
        16,
    },

    emptyText: {
      color:
        COLORS.gray,

      fontSize:
        13,

      lineHeight:
        19,

      textAlign:
        "center",

      marginTop:
        6,
    },
  });
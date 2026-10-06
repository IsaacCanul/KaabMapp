import {
  StyleSheet,
} from "react-native";

import {
  COLORS,
} from "../../theme/colors";

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        COLORS.cream,
    },

    keyboard: {
      flex: 1,

      zIndex: 2,
    },

    scrollContent: {
      flexGrow: 1,

      alignItems: "center",

      paddingHorizontal: 22,

      paddingTop: 12,

      paddingBottom: 60,
    },

    screenContent: {
      width: "100%",

      maxWidth: 520,

      alignItems: "center",
    },

    backButton: {
      alignSelf: "flex-start",

      width: 48,

      height: 48,

      justifyContent: "center",

      alignItems: "center",

      borderRadius: 24,

      backgroundColor:
        "rgba(255,255,255,0.90)",

      marginBottom: 5,

      shadowColor: "#000",

      shadowOpacity: 0.08,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 3,
    },

    logoSection: {
      width: "100%",

      alignItems: "center",

      marginTop: 3,

      marginBottom: 28,
    },

    logo: {
      width: 115,

      height: 115,
    },

    brand: {
      fontSize: 40,

      fontWeight: "800",

      color: COLORS.green,

      marginTop: 2,
    },

    tagline: {
      fontSize: 15,

      color: COLORS.gold,

      fontWeight: "600",

      marginTop: 2,
    },

    loginCard: {
      width: "100%",

      paddingHorizontal: 23,

      paddingVertical: 31,

      borderRadius: 30,

      backgroundColor:
        "rgba(255,255,255,0.93)",

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.7)",

      shadowColor: "#000",

      shadowOpacity: 0.08,

      shadowRadius: 20,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      elevation: 5,
    },

    title: {
      color: COLORS.greenDark,

      fontSize: 32,

      fontWeight: "800",

      textAlign: "center",
    },

    subtitle: {
      marginTop: 8,

      marginBottom: 29,

      color: COLORS.gray,

      fontSize: 16,

      lineHeight: 23,

      textAlign: "center",
    },

    label: {
      marginBottom: 8,

      fontSize: 14,

      fontWeight: "600",

      color: COLORS.text,
    },

    inputContainer: {
      width: "100%",

      height: 61,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 16,

      marginBottom: 18,

      borderRadius: 17,

      borderWidth: 1,

      borderColor: COLORS.border,

      backgroundColor:
        COLORS.input,
    },

    input: {
      flex: 1,

      height: "100%",

      marginLeft: 12,

      fontSize: 16,

      color: COLORS.text,
    },

    errorContainer: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        COLORS.errorBackground,

      paddingHorizontal: 12,

      paddingVertical: 10,

      borderRadius: 10,

      marginTop: -5,

      marginBottom: 15,
    },

    errorText: {
      flex: 1,

      color: COLORS.error,

      fontSize: 13,

      marginLeft: 7,
    },

    optionsRow: {
      width: "100%",

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginTop: 1,

      marginBottom: 29,
    },

    rememberContainer: {
      flexDirection: "row",

      alignItems: "center",
    },

    checkbox: {
      width: 22,

      height: 22,

      borderWidth: 1.5,

      borderColor: "#949494",

      borderRadius: 5,

      justifyContent: "center",

      alignItems: "center",

      marginRight: 8,

      backgroundColor:
        COLORS.white,
    },

    checkboxActive: {
      backgroundColor:
        COLORS.green,

      borderColor:
        COLORS.green,
    },

    rememberText: {
      fontSize: 14,

      color: COLORS.text,
    },

    forgotPassword: {
      fontSize: 13,

      fontWeight: "600",

      color: COLORS.green,

      textDecorationLine:
        "underline",
    },

    loginButton: {
      width: "100%",

      height: 61,

      borderRadius: 31,

      backgroundColor:
        COLORS.green,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      shadowColor: "#000",

      shadowOpacity: 0.16,

      shadowRadius: 9,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 5,
    },

    loginButtonText: {
      color: COLORS.white,

      fontSize: 19,

      fontWeight: "700",

      marginRight: 6,
    },

    registerContainer: {
      marginTop: 27,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",
    },

    registerNormal: {
      color: COLORS.text,

      fontSize: 14,

      marginRight: 5,
    },

    registerLink: {
      color: COLORS.green,

      fontSize: 14,

      fontWeight: "700",

      textDecorationLine:
        "underline",
    },

    leavesTop: {
      position: "absolute",

      top: 0,

      left: 0,

      width: "100%",

      height: 150,

      opacity: 0.38,

      zIndex: 1,
    },

    leavesBottom: {
      position: "absolute",

      bottom: 0,

      left: 0,

      width: "100%",

      height: 145,

      opacity: 0.24,

      zIndex: 1,
    },
  });
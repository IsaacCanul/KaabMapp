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

      paddingBottom: 70,
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

      elevation: 3,
    },

    logo: {
      width: 95,

      height: 95,
    },

    brand: {
      fontSize: 36,

      fontWeight: "800",

      color: COLORS.green,
    },

    tagline: {
      fontSize: 14,

      fontWeight: "600",

      color: COLORS.gold,

      marginTop: 2,

      marginBottom: 25,
    },

    card: {
      width: "100%",

      backgroundColor:
        "rgba(255,255,255,0.93)",

      paddingHorizontal: 23,

      paddingVertical: 30,

      borderRadius: 30,

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
      fontSize: 32,

      fontWeight: "800",

      color:
        COLORS.greenDark,

      textAlign: "center",
    },

    subtitle: {
      marginTop: 8,

      marginBottom: 28,

      fontSize: 16,

      lineHeight: 23,

      color: COLORS.gray,

      textAlign: "center",
    },

    label: {
      fontSize: 14,

      fontWeight: "600",

      color: COLORS.text,

      marginBottom: 8,
    },

    inputContainer: {
      width: "100%",

      height: 61,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 16,

      marginBottom: 17,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        COLORS.border,

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

      marginBottom: 15,
    },

    errorText: {
      flex: 1,

      marginLeft: 7,

      fontSize: 13,

      color: COLORS.error,
    },

    termsContainer: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      marginTop: 4,

      marginBottom: 25,
    },

    checkbox: {
      width: 22,

      height: 22,

      borderWidth: 1.5,

      borderColor: "#949494",

      borderRadius: 5,

      justifyContent: "center",

      alignItems: "center",

      marginRight: 10,

      backgroundColor:
        COLORS.white,
    },

    checkboxActive: {
      backgroundColor:
        COLORS.green,

      borderColor:
        COLORS.green,
    },

    termsText: {
      flex: 1,

      fontSize: 14,

      color: COLORS.text,
    },

    registerButton: {
      width: "100%",

      height: 61,

      borderRadius: 31,

      backgroundColor:
        COLORS.green,

      flexDirection: "row",

      justifyContent: "center",

      alignItems: "center",

      elevation: 5,
    },

    registerButtonText: {
      color: COLORS.white,

      fontSize: 19,

      fontWeight: "700",

      marginRight: 6,
    },

    loginContainer: {
      marginTop: 25,

      flexDirection: "row",

      justifyContent: "center",

      alignItems: "center",
    },

    loginNormal: {
      fontSize: 14,

      color: COLORS.text,

      marginRight: 5,
    },

    loginLink: {
      fontSize: 14,

      fontWeight: "700",

      color: COLORS.green,

      textDecorationLine:
        "underline",
    },

    leavesTop: {
      position: "absolute",

      top: 0,
      left: 0,

      width: "100%",

      height: 150,

      opacity: 0.35,

      zIndex: 1,
    },

    leavesBottom: {
      position: "absolute",

      bottom: 0,
      left: 0,

      width: "100%",

      height: 145,

      opacity: 0.22,

      zIndex: 1,
    },
  });
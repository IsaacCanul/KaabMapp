import {
  StyleSheet,
} from "react-native";

import {
  COLORS,
} from "../../theme/colors";


export const styles =
  StyleSheet.create({
    intro: {
      color:
        COLORS.gray,

      fontSize: 15,

      lineHeight: 22,

      marginBottom: 14,
    },


    heading: {
      color:
        COLORS.primaryDark,

      fontSize: 20,

      fontWeight: "900",

      marginBottom: 12,

      marginTop: 20,
    },


    /* =================================================
       TARJETA SELECCIONADA
    ================================================= */

    selectedCard: {
      backgroundColor:
        COLORS.white,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      padding: 14,

      marginBottom: 14,
    },


    speciesTop: {
      flexDirection: "row",

      alignItems:
        "flex-start",
    },


    image: {
      width: 82,

      height: 82,

      borderRadius: 16,

      marginRight: 12,
    },


    imagePlaceholder: {
      backgroundColor:
        "#EEF5EF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    selectedBody: {
      flex: 1,

      minWidth: 0,
    },


    titleRow: {
      flexDirection: "row",

      alignItems:
        "flex-start",
    },


    nameRow: {
      flexDirection: "row",

      alignItems: "center",

      flexWrap: "wrap",
    },


    name: {
      color:
        COLORS.primaryDark,

      fontSize: 17,

      fontWeight: "900",

      flexShrink: 1,
    },


    scientific: {
      color:
        COLORS.gray,

      fontSize: 12,

      fontStyle:
        "italic",

      marginTop: 3,
    },


    maya: {
      color:
        COLORS.gray,

      fontSize: 11,

      marginTop: 4,
    },


    speakerButton: {
      width: 30,

      height: 30,

      marginLeft: 6,

      borderRadius: 15,

      backgroundColor:
        COLORS.primarySoft,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    removeButton: {
      width: 34,

      height: 34,

      marginLeft: 6,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    /* =================================================
       ALOJAMIENTOS
    ================================================= */

    housingSection: {
      marginTop: 14,
    },


    housingHeader: {
      flexDirection: "row",

      alignItems:
        "center",

      gap: 6,
    },


    housingTitle: {
      color:
        COLORS.primaryDark,

      fontSize: 14,

      fontWeight: "900",
    },


    housingHelp: {
      color:
        COLORS.gray,

      fontSize: 11,

      lineHeight: 16,

      marginTop: 5,
    },


    housingDivider: {
      height: 1,

      backgroundColor:
        COLORS.border,

      marginTop: 10,
    },


    counterRowItem: {
      minHeight: 58,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    counterNameWrap: {
      flex: 1,

      flexDirection: "row",

      alignItems:
        "center",

      gap: 8,

      paddingRight: 10,
    },


    counterRowLabel: {
      color:
        COLORS.primaryDark,

      fontSize: 13,

      fontWeight: "700",

      flexShrink: 1,
    },


    counterActions: {
      flexDirection: "row",

      alignItems:
        "center",

      gap: 9,
    },


    counterCircleButton: {
      width: 38,

      height: 38,

      borderRadius: 19,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.white,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    counterRowValue: {
      minWidth: 25,

      textAlign:
        "center",

      color:
        COLORS.primaryDark,

      fontSize: 16,

      fontWeight: "900",
    },


    counterDivider: {
      height: 1,

      backgroundColor:
        COLORS.border,
    },


    /* =================================================
       CATÁLOGO
    ================================================= */

    catalogCard: {
      flexDirection: "row",

      alignItems:
        "center",

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius: 18,

      padding: 10,

      marginBottom: 10,
    },


    catalogImage: {
      width: 62,

      height: 62,

      borderRadius: 14,

      marginRight: 10,
    },


    catalogBody: {
      flex: 1,

      minWidth: 0,

      marginRight: 7,
    },


    catalogName: {
      color:
        COLORS.primaryDark,

      fontSize: 14,

      fontWeight: "900",

      flexShrink: 1,
    },


    selectBtn: {
      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius: 12,

      paddingHorizontal: 8,

      paddingVertical: 7,
    },


    selectText: {
      color:
        COLORS.primary,

      fontSize: 9,

      fontWeight: "800",

      marginLeft: 3,
    },


    /* =================================================
       OFFLINE
    ================================================= */

    offlineBox: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap: 8,

      backgroundColor:
        "#FFF4D6",

      padding: 13,

      borderRadius: 14,

      marginVertical: 10,
    },


    offlineText: {
      flex: 1,

      color:
        "#805B00",

      fontSize: 11,

      lineHeight: 16,
    },


    /* =================================================
       LOADING
    ================================================= */

    loadingBox: {
      paddingVertical: 40,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    loadingText: {
      marginTop: 10,

      color:
        COLORS.gray,

      fontSize: 13,
    },


    /* =================================================
       ERROR
    ================================================= */

    errorBox: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap: 8,

      backgroundColor:
        "#FFF1F1",

      borderRadius: 14,

      padding: 13,

      marginVertical: 10,
    },


    errorText: {
      flex: 1,

      color:
        "#B42318",

      fontSize: 12,

      lineHeight: 17,
    },


    /* =================================================
       VACÍO
    ================================================= */

    emptyBox: {
      alignItems:
        "center",

      justifyContent:
        "center",

      paddingVertical: 25,
    },


    emptyText: {
      marginTop: 8,

      color:
        COLORS.gray,

      fontSize: 12,

      textAlign:
        "center",
    },
  });
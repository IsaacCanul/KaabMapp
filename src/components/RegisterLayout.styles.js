import {
  StyleSheet,
} from "react-native";


const COLORS = {
  background:
    "#FCFAF2",

  green:
    "#075A3D",

  greenDark:
    "#06492E",

  greenLight:
    "#4FA36B",

  gray:
    "#747A76",

  grayLight:
    "#E8EAE7",

  white:
    "#FFFFFF",

  border:
    "#E6E1D5",
};


export const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },


    container: {
      flex: 1,
    },


    /* =================================================
       HEADER
    ================================================= */

    header: {
      minHeight: 82,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        22,

      paddingTop:
        5,
    },


    backButton: {
      width: 52,

      height: 52,

      borderRadius: 26,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    logoContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    headerSpacer: {
      width: 52,
    },


    /* =================================================
       PROGRESO
    ================================================= */

    progressSection: {
      paddingHorizontal:
        24,

      marginTop:
        10,

      marginBottom:
        26,
    },


    stepsRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      width:
        "100%",
    },


    stepCircle: {
      width: 46,

      height: 46,

      borderRadius: 23,

      alignItems:
        "center",

      justifyContent:
        "center",

      zIndex: 2,
    },


    /*
     * Pasos anteriores.
     */
    stepCompleted: {
      backgroundColor:
        COLORS.greenLight,
    },


    /*
     * Paso actual.
     */
    stepCurrent: {
      backgroundColor:
        COLORS.green,
    },


    /*
     * Pasos todavía no disponibles.
     */
    stepFuture: {
      backgroundColor:
        COLORS.grayLight,
    },


    /*
     * Da una sensación ligeramente
     * más marcada de botón.
     */
    stepPressable: {
      /*
       * No ponemos sombra para evitar
       * warnings de RN web.
       */
    },


    stepNumber: {
      fontSize: 17,

      fontWeight:
        "900",

      color:
        COLORS.white,
    },


    stepNumberCurrent: {
      color:
        COLORS.white,
    },


    stepNumberFuture: {
      color:
        "#6F766F",
    },


    stepLine: {
      flex: 1,

      height: 2,

      backgroundColor:
        "#DFE3DF",

      marginHorizontal:
        -1,
    },


    stepLineCompleted: {
      backgroundColor:
        COLORS.greenLight,
    },


    stepInformation: {
      marginTop:
        12,

      alignItems:
        "flex-end",
    },


    stepLabel: {
      color:
        COLORS.greenDark,

      fontSize: 16,

      fontWeight:
        "900",
    },


    stepHint: {
      marginTop: 4,

      color:
        COLORS.gray,

      fontSize: 11,

      textAlign:
        "right",
    },


    /* =================================================
       CONTENIDO
    ================================================= */

    scroll: {
      flex: 1,
    },


    scrollContent: {
      paddingHorizontal:
        24,

      paddingBottom:
        130,
    },


    title: {
      color:
        COLORS.greenDark,

      fontSize: 32,

      lineHeight: 38,

      fontWeight:
        "900",
    },


    subtitle: {
      color:
        COLORS.gray,

      fontSize: 24,

      lineHeight: 30,

      fontWeight:
        "800",

      marginTop: 6,

      marginBottom: 12,
    },


    children: {
      marginTop: 8,
    },
  });
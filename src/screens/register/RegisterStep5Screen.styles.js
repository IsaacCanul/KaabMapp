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

      fontSize:
        15,

      lineHeight:
        22,

      marginBottom:
        16,
    },


    card: {
      backgroundColor:
        COLORS.white,

      borderRadius:
        18,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      padding:
        15,

      marginBottom:
        12,
    },


    heading: {
      color:
        COLORS.primaryDark,

      fontSize:
        17,

      fontWeight:
        "900",

      marginBottom:
        9,
    },


    row: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingVertical:
        7,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#F0ECE3",
    },


    label: {
      width:
        110,

      color:
        COLORS.gray,

      fontSize:
        11,

      lineHeight:
        16,
    },


    value: {
      flex:
        1,

      color:
        COLORS.text,

      fontSize:
        11,

      lineHeight:
        16,

      fontWeight:
        "700",
    },


    species: {
      paddingVertical:
        10,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,
    },


    speciesName: {
      color:
        COLORS.primaryDark,

      fontWeight:
        "900",

      fontSize:
        14,

      marginBottom:
        4,
    },


    small: {
      color:
        COLORS.gray,

      fontSize:
        11,

      lineHeight:
        16,
    },


    totalText: {
      color:
        COLORS.primaryDark,

      fontSize:
        11,

      fontWeight:
        "900",

      marginTop:
        3,
    },


    offlineInfo: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        10,

      backgroundColor:
        "#EDF6EF",

      borderRadius:
        16,

      padding:
        14,

      marginTop:
        12,

      marginBottom:
        16,
    },


    offlineInfoText: {
      flex:
        1,

      color:
        "#35634E",

      fontSize:
        11,

      lineHeight:
        17,
    },


    errorBox: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        8,

      backgroundColor:
        "#FFF1F1",

      borderRadius:
        14,

      padding:
        13,

      marginBottom:
        14,
    },


    errorText: {
      flex:
        1,

      color:
        "#B42318",

      fontSize:
        12,

      lineHeight:
        17,
    },


    submitButton: {
      minHeight:
        58,

      borderRadius:
        18,

      backgroundColor:
        COLORS.primary,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        8,

      marginBottom:
        20,
    },


    submitButtonDisabled: {
      opacity:
        0.65,
    },


    submitButtonText: {
      color:
        COLORS.white,

      fontSize:
        16,

      fontWeight:
        "900",
    },
  });
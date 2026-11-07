import {
  StyleSheet,
} from "react-native";

import {
  COLORS,
} from "../../theme/colors";


const styles =
  StyleSheet.create({
    map: {
      height: 280,

      borderRadius: 20,

      overflow: "hidden",

      marginBottom: 8,

      borderWidth: 1,

      borderColor:
        COLORS.border,
    },


    mapHelp: {
      fontSize: 12,

      lineHeight: 18,

      color:
        COLORS.gray,

      marginBottom: 14,
    },


    coordinates: {
      flexDirection: "row",

      alignItems: "flex-start",

      backgroundColor:
        "#EFF7F0",

      padding: 15,

      borderRadius: 16,

      marginTop: 12,

      marginBottom: 4,
    },


    coordinateText: {
      flex: 1,

      marginLeft: 10,
    },


    locationSource: {
      marginTop: 4,

      fontSize: 11,

      color:
        COLORS.primary,
    },


    accuracy: {
      marginTop: 3,

      fontSize: 11,

      color:
        COLORS.gray,
    },


    label: {
      fontSize: 16,

      fontWeight: "800",

      color:
        COLORS.primaryDark,

      marginBottom: 7,

      marginTop: 18,
    },


    selector: {
      minHeight: 68,

      backgroundColor:
        COLORS.white,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      borderRadius: 16,

      paddingHorizontal: 16,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },


    selectorContent: {
      flex: 1,

      minWidth: 0,

      marginRight: 10,
    },


    selectorDisabled: {
      opacity: 0.5,
    },


    selectorSmall: {
      color:
        COLORS.gray,

      fontSize: 11,

      marginBottom: 3,
    },


    selectorValue: {
      color:
        COLORS.primaryDark,

      fontSize: 15,

      fontWeight: "800",
    },


    placeholder: {
      color: "#9CA3AF",

      fontWeight: "500",
    },


    locationCard: {
      flexDirection: "row",

      backgroundColor:
        "#EFF7F0",

      borderRadius: 16,

      padding: 15,

      marginTop: 16,

      marginBottom: 12,

      gap: 20,
    },


    locationColumn: {
      flex: 1,
    },


    small: {
      color:
        COLORS.gray,

      fontSize: 11,
    },


    value: {
      color:
        COLORS.primaryDark,

      fontWeight: "900",

      marginTop: 3,
    },


    errorBox: {
      flexDirection: "row",

      alignItems: "flex-start",

      gap: 8,

      padding: 14,

      backgroundColor:
        "#FFF1F1",

      borderRadius: 14,

      marginVertical: 14,
    },


    errorText: {
      flex: 1,

      color: "#B42318",

      fontSize: 13,

      lineHeight: 18,
    },


    modalBackdrop: {
      flex: 1,

      justifyContent: "flex-end",

      backgroundColor:
        "rgba(0,0,0,0.30)",
    },


    modalCard: {
      maxHeight: "65%",

      backgroundColor:
        COLORS.white,

      borderTopLeftRadius: 24,

      borderTopRightRadius: 24,

      paddingHorizontal: 20,

      paddingTop: 18,

      paddingBottom: 28,
    },


    modalHeader: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom: 10,
    },


    modalTitle: {
      flex: 1,

      marginRight: 12,

      fontSize: 20,

      fontWeight: "900",

      color:
        COLORS.primaryDark,
    },


    option: {
      minHeight: 54,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      borderBottomWidth: 1,

      borderBottomColor:
        COLORS.border,
    },


    optionText: {
      flex: 1,

      fontSize: 15,

      color:
        COLORS.primaryDark,

      fontWeight: "600",
    },


    emptyList: {
      paddingVertical: 30,

      alignItems: "center",
    },


    emptyListText: {
      color:
        COLORS.gray,

      fontSize: 14,
    },

    intro: {
  color:
    COLORS.gray,

  fontSize: 15,

  lineHeight: 22,

  marginBottom: 16,
},

detectedBox: {
  flexDirection: "row",

  alignItems: "flex-start",

  gap: 10,

  backgroundColor: "#FFF4D6",

  padding: 14,

  borderRadius: 16,

  marginTop: 14,
},

detectedBoxSuccess: {
  backgroundColor: "#EAF6ED",
},

detectedText: {
  flex: 1,

  color: "#8A6100",

  fontSize: 12,

  lineHeight: 18,
},

detectedTextSuccess: {
  color: "#176B45",
},

selectorSelected: {
  borderColor: "#A9CDB9",

  backgroundColor: "#FCFFFC",
},

optionSelected: {
  backgroundColor: "#EFF7F1",
},

accuracy: {
  marginTop: 4,

  color:
    COLORS.gray,

  fontSize: 11,
},
  });


export default styles;
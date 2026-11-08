import {
  StyleSheet,
} from "react-native";

import {
  COLORS,
} from "../../theme/colors";


export const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        COLORS.cream,
    },


    loadingScreen: {
      flex: 1,
      backgroundColor:
        COLORS.cream,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    loadingText: {
      marginTop: 12,
      color:
        COLORS.gray,
      fontSize: 14,
    },


    content: {
      padding: 16,
      paddingBottom: 110,
    },


    headerCard: {
      backgroundColor:
        COLORS.white,

      borderRadius: 28,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      padding: 18,

      marginBottom: 18,
    },


    headerTopRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    avatarWrap: {
      width: 88,
      height: 88,

      borderRadius: 44,

      position:
        "relative",

      marginRight: 16,
    },


    avatar: {
      width:
        "100%",

      height:
        "100%",

      borderRadius: 44,

      backgroundColor:
        "#E9E9E9",
    },


    avatarPlaceholder: {
      width:
        "100%",

      height:
        "100%",

      borderRadius: 44,

      backgroundColor:
        COLORS.primarySoft,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    initials: {
      color:
        COLORS.primaryDark,

      fontSize: 25,

      fontWeight:
        "900",
    },


    avatarEditBadge: {
      position:
        "absolute",

      right:
        -2,

      bottom:
        -2,

      width:
        30,

      height:
        30,

      borderRadius:
        15,

      backgroundColor:
        COLORS.primaryDark,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        2,

      borderColor:
        COLORS.white,
    },


    headerTextWrap: {
      flex: 1,
    },


    nameText: {
      color:
        COLORS.primaryDark,

      fontSize: 28,

      fontWeight:
        "900",

      lineHeight: 32,
    },


    subtitleText: {
      color:
        COLORS.gray,

      fontSize: 15,

      marginTop: 6,
    },


    photoButton: {
      marginTop: 18,

      minHeight: 48,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.cream,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,
    },


    photoButtonText: {
      color:
        COLORS.primaryDark,

      fontSize: 15,

      fontWeight:
        "800",
    },


    errorBox: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap: 8,

      borderRadius:
        16,

      padding:
        13,

      marginBottom:
        16,

      backgroundColor:
        "#FFF0F0",
    },


    errorText: {
      flex: 1,

      color:
        "#B42318",

      fontSize: 13,

      lineHeight: 18,
    },


    infoCard: {
      backgroundColor:
        COLORS.white,

      borderRadius: 26,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      paddingHorizontal:
        18,

      paddingVertical:
        8,

      marginBottom: 18,
    },


    fieldBlock: {
      paddingVertical:
        14,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,
    },


    fieldLabel: {
      color:
        COLORS.gray,

      fontSize: 13,

      marginBottom: 7,
    },


    fieldValue: {
      color:
        COLORS.text,

      fontSize: 16,

      fontWeight:
        "800",
    },


    input: {
      minHeight: 48,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.cream,

      paddingHorizontal:
        14,

      color:
        COLORS.text,

      fontSize: 15,
    },


    editButton: {
      minHeight: 58,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.white,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,

      marginBottom: 26,
    },


    editButtonText: {
      color:
        COLORS.primaryDark,

      fontSize: 16,

      fontWeight:
        "900",
    },


    editActionsRow: {
      flexDirection:
        "row",

      gap: 10,

      marginBottom: 26,
    },


    cancelButton: {
      flex: 1,

      minHeight: 54,

      borderRadius: 18,

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


    cancelButtonText: {
      color:
        COLORS.gray,

      fontSize: 15,

      fontWeight:
        "800",
    },


    saveButton: {
      flex: 1,

      minHeight: 54,

      borderRadius: 18,

      backgroundColor:
        COLORS.primaryDark,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    saveButtonText: {
      color:
        COLORS.white,

      fontSize: 15,

      fontWeight:
        "900",
    },


    buttonDisabled: {
      opacity: 0.55,
    },


    sectionTitle: {
      color:
        COLORS.primaryDark,

      fontSize: 18,

      fontWeight:
        "900",

      marginBottom: 14,
    },


    toolsCard: {
      backgroundColor:
        "transparent",

      marginBottom: 18,
    },


    toolRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        16,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,
    },


    toolIconBox: {
      width: 48,

      height: 48,

      borderRadius: 16,

      backgroundColor:
        COLORS.primarySoft,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 14,
    },


    toolTextWrap: {
      flex: 1,
    },


    toolTitle: {
      color:
        COLORS.primaryDark,

      fontSize: 16,

      fontWeight:
        "800",
    },


    toolSubtitle: {
      color:
        COLORS.gray,

      fontSize: 13,

      marginTop: 4,
    },


    logoutButton: {
      minHeight: 56,

      marginTop: 4,

      marginBottom: 20,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        "#F1D1CC",

      backgroundColor:
        "#FFF9F8",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,
    },


    logoutText: {
      color:
        "#C83A2A",

      fontSize: 16,

      fontWeight:
        "800",
    },
  });
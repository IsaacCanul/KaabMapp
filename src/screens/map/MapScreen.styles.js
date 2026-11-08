import {
  StyleSheet,
} from "react-native";


const COLORS = {
  background:
    "#FCFAF2",

  white:
    "#FFFFFF",

  green:
    "#075A3D",

  greenDark:
    "#06492E",

  greenSoft:
    "#EAF4EA",

  text:
    "#15261F",

  gray:
    "#747A76",

  gray2:
    "#858B87",

  border:
    "#E6E1D5",

  warning:
    "#8B6800",

  warningBg:
    "#FFF3CE",

  danger:
    "#A33232",
};


export const styles =
  StyleSheet.create({

    /* =================================================
       SCREEN
    ================================================= */

    screen: {
      flex: 1,

      backgroundColor:
        COLORS.background,
    },


    /* =================================================
       HEADER
    ================================================= */

    header: {
      backgroundColor:
        COLORS.background,

      paddingHorizontal:
        16,

      paddingTop:
        8,

      paddingBottom:
        12,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EEE9DC",

      zIndex:
        10,
    },


    brandRow: {
      minHeight:
        50,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },


    /* =================================================
       BÚSQUEDA
    ================================================= */

    searchBox: {
      minHeight:
        56,

      marginTop:
        8,

      paddingLeft:
        16,

      paddingRight:
        7,

      borderWidth:
        1,

      borderColor:
        "#D8D8D0",

      borderRadius:
        28,

      backgroundColor:
        COLORS.white,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        9,
    },


    searchInput: {
      flex:
        1,

      minHeight:
        52,

      color:
        COLORS.text,

      fontSize:
        15,

      outlineStyle:
        "none",
    },


    filterButton: {
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

      position:
        "relative",
    },


    filterButtonActive: {
      backgroundColor:
        COLORS.greenSoft,
    },


    filterBadge: {
      position:
        "absolute",

      top:
        2,

      right:
        1,

      minWidth:
        17,

      height:
        17,

      paddingHorizontal:
        4,

      borderRadius:
        9,

      backgroundColor:
        COLORS.green,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    filterBadgeText: {
      color:
        COLORS.white,

      fontSize:
        9,

      fontWeight:
        "900",
    },


    /* =================================================
       CHIPS
    ================================================= */

    chipsRow: {
      paddingTop:
        14,

      paddingBottom:
        2,

      gap:
        9,
    },


    chip: {
      minHeight:
        44,

      paddingHorizontal:
        17,

      borderRadius:
        23,

      borderWidth:
        1,

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

      gap:
        6,
    },


    chipActive: {
      backgroundColor:
        COLORS.greenDark,

      borderColor:
        COLORS.greenDark,
    },


    chipText: {
      color:
        COLORS.text,

      fontSize:
        14,

      fontWeight:
        "800",
    },


    chipTextActive: {
      color:
        COLORS.white,
    },


    /* =================================================
       MAPA
    ================================================= */

    mapArea: {
      flex: 1,

      position:
        "relative",

      overflow:
        "hidden",

      backgroundColor:
        "#EEF1E9",
    },


    /* =================================================
       LEYENDA
    ================================================= */

    legend: {
      position:
        "absolute",

      top:
        16,

      left:
        16,

      paddingHorizontal:
        12,

      paddingVertical:
        10,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "rgba(0,0,0,0.08)",

      backgroundColor:
        "rgba(255,255,255,0.94)",

      zIndex:
        5,
    },


    legendRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginVertical:
        3,
    },


    legendDot: {
      width:
        12,

      height:
        12,

      borderRadius:
        6,

      marginRight:
        8,
    },


    legendText: {
      color:
        COLORS.text,

      fontSize:
        12,

      fontWeight:
        "700",
    },


    /* =================================================
       LOCALIZAR
    ================================================= */

    locateButton: {
      position:
        "absolute",

      top:
        18,

      right:
        16,

      width:
        54,

      height:
        54,

      borderRadius:
        27,

      borderWidth:
        1,

      borderColor:
        "rgba(0,0,0,0.05)",

      backgroundColor:
        "rgba(255,255,255,0.96)",

      alignItems:
        "center",

      justifyContent:
        "center",

      zIndex:
        5,
    },


    /* =================================================
       MENSAJE GPS/API
    ================================================= */

    messageBox: {
      position:
        "absolute",

      top:
        100,

      left:
        16,

      right:
        90,

      padding:
        12,

      borderRadius:
        13,

      backgroundColor:
        "rgba(255,243,206,0.96)",

      zIndex:
        5,
    },


    messageText: {
      color:
        "#735700",

      fontSize:
        12,

      lineHeight:
        17,
    },


    /* =================================================
       VACÍO
    ================================================= */

    emptyCard: {
      position:
        "absolute",

      top:
        "36%",

      left:
        34,

      right:
        34,

      minHeight:
        180,

      padding:
        24,

      borderRadius:
        24,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      backgroundColor:
        "rgba(255,255,255,0.94)",

      alignItems:
        "center",

      justifyContent:
        "center",

      zIndex:
        4,
    },


    emptyTitle: {
      marginTop:
        12,

      color:
        COLORS.greenDark,

      fontSize:
        20,

      fontWeight:
        "900",

      textAlign:
        "center",
    },


    emptyText: {
      marginTop:
        8,

      color:
        COLORS.gray,

      fontSize:
        13,

      lineHeight:
        19,

      textAlign:
        "center",
    },


    /* =================================================
       CARD MELIPONARIO
    ================================================= */

    card: {
      position:
        "absolute",

      left:
        14,

      right:
        14,

      bottom:
        18,

      padding:
        16,

      borderRadius:
        22,

      borderWidth:
        1,

      borderColor:
        COLORS.border,

      backgroundColor:
        COLORS.white,

      zIndex:
        6,
    },


    cardTop: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        10,
    },


    cardTitle: {
      color:
        COLORS.greenDark,

      fontSize:
        18,

      fontWeight:
        "900",
    },


    locationText: {
      marginTop:
        4,

      color:
        COLORS.gray,

      fontSize:
        12,
    },


    offerBadge: {
      paddingHorizontal:
        9,

      paddingVertical:
        6,

      borderRadius:
        15,
    },


    offerText: {
      color:
        COLORS.white,

      fontSize:
        10,

      fontWeight:
        "900",
    },


    description: {
      marginTop:
        10,

      color:
        COLORS.gray,

      fontSize:
        12,

      lineHeight:
        17,
    },


    infoLine: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        6,

      marginTop:
        9,
    },


    infoText: {
      flex:
        1,

      color:
        COLORS.gray,

      fontSize:
        11,

      lineHeight:
        16,
    },


    metaRow: {
      marginTop:
        12,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        8,
    },


    metaText: {
      paddingHorizontal:
        9,

      paddingVertical:
        5,

      borderRadius:
        10,

      backgroundColor:
        "#F4F1E8",

      color:
        COLORS.gray,

      fontSize:
        10,

      fontWeight:
        "700",
    },


    detailButton: {
      minHeight:
        46,

      marginTop:
        14,

      borderRadius:
        15,

      backgroundColor:
        COLORS.green,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        5,
    },


    detailButtonText: {
      color:
        COLORS.white,

      fontSize:
        14,

      fontWeight:
        "900",
    },


    /* =================================================
       MODAL
    ================================================= */

    modalBackdrop: {
      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.38)",

      justifyContent:
        "flex-end",
    },


    modalCard: {
      width:
        "100%",

      maxHeight:
        "84%",

      paddingHorizontal:
        20,

      paddingTop:
        20,

      paddingBottom:
        28,

      borderTopLeftRadius:
        30,

      borderTopRightRadius:
        30,

      backgroundColor:
        COLORS.background,
    },


    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        20,
    },


    modalTitle: {
      color:
        COLORS.greenDark,

      fontSize:
        23,

      fontWeight:
        "900",
    },


    modalClose: {
      width:
        40,

      height:
        40,

      borderRadius:
        20,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    modalLabel: {
      marginBottom:
        8,

      color:
        COLORS.greenDark,

      fontSize:
        16,

      fontWeight:
        "900",
    },


    localidadLabel: {
      marginTop:
        18,
    },


    /* =================================================
       DROPDOWN
    ================================================= */

    dropdownButton: {
      minHeight:
        56,

      paddingHorizontal:
        16,

      borderWidth:
        1,

      borderColor:
        COLORS.green,

      borderRadius:
        16,

      backgroundColor:
        COLORS.white,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        10,
    },


    dropdownButtonOpen: {
      borderColor:
        COLORS.greenDark,

      borderWidth:
        1.5,
    },


    dropdownButtonDisabled: {
      borderColor:
        "#D8DCD8",

      backgroundColor:
        "#F2F2EC",

      opacity:
        0.7,
    },


    dropdownButtonText: {
      flex: 1,

      color:
        COLORS.text,

      fontSize:
        14,

      fontWeight:
        "800",
    },


    dropdownPlaceholder: {
      color:
        COLORS.gray2,

      fontWeight:
        "500",
    },


    dropdownList: {
      marginTop:
        6,

      borderWidth:
        1,

      borderColor:
        "#D9DDD8",

      borderRadius:
        14,

      overflow:
        "hidden",

      backgroundColor:
        COLORS.white,
    },


    dropdownScroll: {
      maxHeight:
        210,
    },


    dropdownOption: {
      minHeight:
        48,

      paddingHorizontal:
        15,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EEEAE1",
    },


    dropdownOptionSelected: {
      backgroundColor:
        COLORS.greenSoft,
    },


    dropdownOptionText: {
      flex: 1,

      color:
        "#303A35",

      fontSize:
        14,
    },


    dropdownOptionTextSelected: {
      color:
        COLORS.greenDark,

      fontWeight:
        "900",
    },


    /* =================================================
       SIN LOCALIDADES
    ================================================= */

    noLocalidadesBox: {
      marginTop:
        10,

      padding:
        11,

      borderRadius:
        12,

      backgroundColor:
        COLORS.warningBg,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        7,
    },


    noLocalidadesText: {
      flex: 1,

      color:
        COLORS.warning,

      fontSize:
        11,

      lineHeight:
        16,
    },


    /* =================================================
       LIMPIAR
    ================================================= */

    clearFiltersButton: {
      alignSelf:
        "center",

      marginTop:
        18,

      paddingHorizontal:
        12,

      paddingVertical:
        9,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        6,
    },


    clearFiltersText: {
      color:
        COLORS.danger,

      fontSize:
        12,

      fontWeight:
        "800",
    },


    /* =================================================
       APLICAR
    ================================================= */

    modalDone: {
      minHeight:
        58,

      marginTop:
        20,

      borderRadius:
        29,

      backgroundColor:
        COLORS.greenDark,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    modalDoneText: {
      color:
        COLORS.white,

      fontSize:
        16,

      fontWeight:
        "900",
    },
  });
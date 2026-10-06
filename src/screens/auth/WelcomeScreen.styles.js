import {
  StyleSheet,
  Platform,
} from "react-native";

import {
  COLORS,
} from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: COLORS.cream,
  },

  hero: {
    position: "absolute",

    top: 0,

    width: "100%",
    height: "45%",

    overflow: "hidden",
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      "rgba(0, 40, 20, 0.05)",
  },

  bee: {
    position: "absolute",

    width: 85,
    height: 85,

    right: "12%",
    top: "25%",
  },

  leavesTop: {
    position: "absolute",

    width: "100%",
    height: 145,

    top: 0,
    left: 0,
  },

  safeArea: {
    flex: 1,

    justifyContent: "flex-end",
  },

  contentCard: {
    minHeight: "63%",

    width: "100%",

    backgroundColor: COLORS.cream,

    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,

    alignItems: "center",

    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 34,

    overflow: "hidden",

    shadowColor: "#000",

    shadowOpacity:
      Platform.OS === "web"
        ? 0.08
        : 0.12,

    shadowRadius: 18,

    shadowOffset: {
      width: 0,
      height: -4,
    },

    elevation: 6,
  },

  logo: {
    width: 120,
    height: 120,
  },

  brand: {
    marginTop: 2,

    fontSize: 44,

    fontWeight: "800",

    color: COLORS.green,

    letterSpacing: 0.3,
  },

  tagline: {
    marginTop: 3,

    fontSize: 16,

    fontWeight: "500",

    color: COLORS.gold,
  },

  textSection: {
    width: "100%",

    alignItems: "center",

    marginTop: 30,
  },

  title: {
    fontSize: 39,

    lineHeight: 45,

    fontWeight: "800",

    textAlign: "center",

    color: COLORS.greenDark,
  },

  description: {
    maxWidth: 440,

    marginTop: 16,

    fontSize: 18,

    lineHeight: 27,

    textAlign: "center",

    color: COLORS.gray,
  },

  primaryButton: {
    width: "100%",

    maxWidth: 430,

    height: 62,

    marginTop: 36,

    borderRadius: 31,

    backgroundColor: COLORS.green,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    shadowColor: "#000",

    shadowOpacity: 0.15,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  primaryButtonText: {
    fontSize: 19,

    fontWeight: "700",

    color: COLORS.white,

    marginRight: 5,
  },

  loginButton: {
    marginTop: 22,

    paddingVertical: 8,

    paddingHorizontal: 20,

    zIndex: 2,
  },

  loginText: {
    fontSize: 17,

    fontWeight: "600",

    color: COLORS.green,
  },

  leavesBottom: {
    position: "absolute",

    width: "120%",

    height: 150,

    bottom: -25,

    left: "-10%",

    opacity: 0.42,
  },
});
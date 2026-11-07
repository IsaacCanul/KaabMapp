import { StyleSheet } from "react-native";

const GREEN = "#06492E";
const CREAM = "#FCFAF2";
const WHITE = "#FFFFFF";
const BORDER = "#E6E1D5";
const GRAY = "#747A76";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CREAM,
  },

  center: {
    flex: 1,
    backgroundColor: CREAM,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  muted: {
    color: GRAY,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 10,
  },

  errorTitle: {
    color: GREEN,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 15,
  },

  backAction: {
    marginTop: 23,
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 35,
  },

  backActionText: {
    color: WHITE,
    fontWeight: "900",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* ===============================================
     GALERÍA
  =============================================== */

  gallery: {
    height: 290,
    backgroundColor: "#E5F0E1",
    position: "relative",
    overflow: "hidden",
  },

  galleryScroll: {
    flex: 1,
  },

  galleryImage: {
    height: 290,
  },

  noPhoto: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  noPhotoBrand: {
    color: GREEN,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 11,
  },

  noPhotoCaption: {
    color: "#678072",
    fontSize: 11,
    marginTop: 7,
    textAlign: "center",
  },

  /* ===============================================
     BOTONES SUPERIORES
  =============================================== */

  roundIcon: {
    position: "absolute",
    top: 16,
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    zIndex: 5,
  },

  backIcon: {
    left: 15,
  },

  heartIcon: {
    right: 67,
  },

  shareIcon: {
    right: 15,
  },

  /* ===============================================
     CONTADOR
  =============================================== */

  photoCounter: {
    position: "absolute",
    right: 14,
    bottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.58)",
    zIndex: 5,
  },

  photoCounterText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "800",
  },

  /* ===============================================
     PUNTOS DE GALERÍA
  =============================================== */

  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    zIndex: 6,
  },

  dotTouch: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: WHITE,
  },

  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E8AE24",
  },

  /* ===============================================
     INFORMACIÓN GENERAL
  =============================================== */

  body: {
    backgroundColor: CREAM,
    marginTop: -17,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 25,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  title: {
    flex: 1,
    color: GREEN,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },

  location: {
    flex: 1,
    color: GRAY,
    fontSize: 13,
  },

  /* ===============================================
     ESTADO Y ESPECIES
  =============================================== */

  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },

  statusBadge: {
    minHeight: 32,
    borderRadius: 17,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  softBadge: {
    minHeight: 32,
    maxWidth: "76%",
    borderRadius: 17,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  softBadgeText: {
    flexShrink: 1,
    color: GREEN,
    fontSize: 10,
    fontWeight: "800",
  },

  /* ===============================================
     RESPONSABLE
  =============================================== */

  ownerCard: {
    marginTop: 17,
    padding: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EAF4EA",
    alignItems: "center",
    justifyContent: "center",
  },

  ownerContent: {
    flex: 1,
  },

  ownerName: {
    color: "#15261F",
    fontSize: 13,
    fontWeight: "900",
  },

  ownerSub: {
    color: GRAY,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  /* ===============================================
     SECCIONES
  =============================================== */

  sectionTitle: {
    color: GREEN,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 9,
  },

  description: {
    color: GRAY,
    fontSize: 13,
    lineHeight: 20,
  },

  reference: {
    marginTop: 12,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#EDF6EF",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  referenceText: {
    flex: 1,
    color: "#476C5A",
    fontSize: 12,
    lineHeight: 17,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 22,
  },

  /* ===============================================
     TARJETAS DE ESPECIES
  =============================================== */

  speciesCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
  },

  speciesIcon: {
    width: 52,
    height: 65,
    borderRadius: 12,
    backgroundColor: "#EAF4EA",
    alignItems: "center",
    justifyContent: "center",
  },

  speciesMain: {
    flex: 1,
    minWidth: 0,
  },

  speciesName: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "900",
  },

  scientific: {
    color: GRAY,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2,
  },

  countsRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 10,
  },

  countBox: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 7,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: "#F5F7F3",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  countTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  countLabel: {
    color: "#66746D",
    fontSize: 9,
    lineHeight: 12,
  },

  countValue: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },

  /* ===============================================
     SERVICIOS
  =============================================== */

  services: {
    flexDirection: "row",
    gap: 8,
  },

  service: {
    flex: 1,
    minHeight: 43,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#F3F1E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  serviceActive: {
    backgroundColor: "#EAF4EA",
    borderColor: "#B8D7C4",
  },

  serviceText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "800",
  },

  /* ===============================================
     PRODUCTOS Y PUNTO DE VENTA
  =============================================== */

  emptyBlock: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  emptyBlockText: {
    flex: 1,
    color: GRAY,
    fontSize: 12,
    lineHeight: 18,
  },

  /* ===============================================
     MENSAJES
  =============================================== */

  warning: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF4D8",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  warningText: {
    flex: 1,
    color: "#9B6500",
    fontSize: 11,
    lineHeight: 16,
  },

  /* ===============================================
     BOTONES INFERIORES
  =============================================== */

  actions: {
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    minHeight: 75,
    padding: 10,
    flexDirection: "row",
    gap: 8,
  },

  actionOutline: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  actionSolid: {
    flex: 1.15,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  outlineText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
  },

  solidText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },

  disabledAction: {
    opacity: 0.58,
  },
});
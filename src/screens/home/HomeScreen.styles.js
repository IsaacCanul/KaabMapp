import { StyleSheet } from "react-native";

const GREEN = "#06492E";
const CREAM = "#FCFAF2";
const WHITE = "#FFFFFF";
const BORDER = "#E6E1D5";
const MUTED = "#747A76";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CREAM,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110,
  },

  /* ===============================================
     HEADER
  =============================================== */

  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },

  heroTitle: {
    color: GREEN,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    marginBottom: 8,
  },

  heroSubtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  /* ===============================================
     SEARCH
  =============================================== */

  searchBar: {
    minHeight: 57,
    paddingLeft: 15,
    paddingRight: 6,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 29,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 53,
    color: "#15261F",
    fontSize: 14,
  },

  filterIconButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ===============================================
     QUICK FILTERS
  =============================================== */

  quickFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 5,
    paddingRight: 14,
    marginBottom: 13,
  },

  chip: {
    minHeight: 43,
    paddingHorizontal: 17,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
  },

  chipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  chipText: {
    color: "#15261F",
    fontSize: 13,
    fontWeight: "800",
  },

  chipTextActive: {
    color: WHITE,
  },

  /* ===============================================
     FILTER PANEL
  =============================================== */

  filtersPanel: {
    backgroundColor: WHITE,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 17,
    marginTop: 8,
    marginBottom: 20,
  },

  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  filtersTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: "900",
  },

  clearText: {
    color: "#B05036",
    fontSize: 12,
    fontWeight: "800",
  },

  filterLabel: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 8,
  },

  dropdownButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#C9D9CD",
    backgroundColor: "#F8FAF7",
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  dropdownDisabled: {
    opacity: 0.55,
    backgroundColor: "#F0F0ED",
  },

  dropdownText: {
    flex: 1,
    color: "#15261F",
    fontSize: 13,
    fontWeight: "700",
  },

  dropdownOptions: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    backgroundColor: WHITE,
    overflow: "hidden",
  },

  dropdownScroll: {
    maxHeight: 180,
  },

  dropdownOption: {
    minHeight: 43,
    paddingHorizontal: 13,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE6",
  },

  optionText: {
    color: "#15261F",
    fontSize: 13,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    marginTop: 9,
  },

  checkboxText: {
    flex: 1,
    color: "#15261F",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  applyButton: {
    minHeight: 50,
    backgroundColor: GREEN,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  applyText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "900",
  },

  /* ===============================================
     MESSAGES
  =============================================== */

  messageBox: {
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#FFF4D8",
    marginBottom: 14,
  },

  messageText: {
    color: "#8B6800",
    fontSize: 12,
    lineHeight: 18,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#FFF0EE",
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    color: "#B42318",
    fontSize: 12,
    lineHeight: 18,
  },

  /* ===============================================
     SECTION HEADER
  =============================================== */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 19,
    marginBottom: 15,
  },

  sectionTitle: {
    flex: 1,
    color: "#15261F",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
  },

  viewAllText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "700",
  },

  /* ===============================================
     MINI MAP
  =============================================== */

  mapContainer: {
    width: "100%",
    height: 205,
    borderRadius: 22,
    backgroundColor: "#E7EDE7",
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },

  /* ===============================================
     LOADING
  =============================================== */

  loadingBox: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 13,
  },

  /* ===============================================
     EMPTY
  =============================================== */

  emptyBox: {
    minHeight: 190,
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: GREEN,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
  },

  emptyText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 7,
  },

  /* ===============================================
     MELIPONARIO CARD
  =============================================== */

  meliponarioCard: {
    width: "100%",
    minHeight: 145,
    flexDirection: "row",
    backgroundColor: WHITE,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E6E7DF",
    overflow: "hidden",
    marginBottom: 13,
  },

  /* ===============================================
     CARD IMAGE
  =============================================== */

  cardImageWrap: {
    width: "38%",
    minHeight: 145,
    backgroundColor: "#EAF4EA",
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: "100%",
  },

  cardImagePlaceholder: {
    flex: 1,
    minHeight: 145,
    backgroundColor: "#EAF3ED",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ===============================================
     CARD TEXT
  =============================================== */

  cardContent: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 13,
    paddingTop: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
  },

  cardTitle: {
    color: "#15261F",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },

  cardLocationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 6,
  },

  cardLocation: {
    flex: 1,
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
  },

  cardDescription: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },

  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    minHeight: 23,
  },

  cardStatus: {
    backgroundColor: "#FFF1D5",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 13,
  },

  cardStatusText: {
    color: "#956500",
    fontSize: 10,
    fontWeight: "800",
  },
});
import { StyleSheet } from "react-native";
import { COLORS } from "../../theme/colors";

export const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
    gap: 14,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.gray,
    marginBottom: 8,
  },

  label: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primaryDark,
    marginBottom: 4,
  },

  input: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    fontSize: 16,
    color: COLORS.text,
  },

  textArea: {
    minHeight: 140,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.text,
  },

  infoText: {
    color: COLORS.gray,
    fontSize: 15,
    lineHeight: 24,
  },

  infoStrong: {
    marginTop: 8,
    color: COLORS.primaryDark,
    fontSize: 17,
    fontWeight: "900",
  },

  responsableCard: {
    backgroundColor: "#E8EFE8",
    borderRadius: 22,
    padding: 18,
  },

  responsableLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },

  responsableName: {
    fontSize: 18,
    color: COLORS.primaryDark,
    fontWeight: "900",
    marginBottom: 8,
  },

  responsableHelp: {
    fontSize: 14,
    color: COLORS.gray,
  },

  helpText: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: -8,
    marginBottom: 2,
  },

  ofertaList: {
    gap: 10,
  },

  ofertaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 64,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  ofertaCardActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },

  ofertaTextBox: {
    flex: 1,
  },

  ofertaTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primaryDark,
  },

  ofertaHelp: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.gray,
  },

  ofertaTextActive: {
    color: COLORS.white,
  },

  imagesGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  uploadCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#AFC7B2",
    backgroundColor: "#F5F3EC",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },

  uploadTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primaryDark,
    textAlign: "center",
  },

  uploadSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "center",
  },

  imageCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  imagePreview: {
    width: "100%",
    height: "100%",
  },

  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
});
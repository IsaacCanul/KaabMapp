import { StyleSheet } from "react-native";
import { COLORS } from "./colors";
import { LAYOUT } from "./layout";
import { Button } from "react-native-web";

export const commonStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingHorizontal: LAYOUT.screenPadding, paddingTop: 12, paddingBottom: 28, width: "100%", maxWidth: LAYOUT.maxContentWidth, alignSelf: "center" },
  card: { backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 14 },
  sectionTitle: { color: COLORS.primaryDark, fontSize: 18, fontWeight: "900", marginBottom: 10 },
  muted: { color: COLORS.gray, fontSize: 13, lineHeight: 19 },
  back: {
  width: 42, 
  height: 42, 
  borderRadius: 21, 
  backgroundColor: COLORS.white, 
  alignItems: "center", 
  justifyContent: "center", 
  borderWidth: 1, 
  borderColor: COLORS.border, 
  marginBottom: 12,
  
  // Agrega estas dos propiedades:
  zIndex: 10,      // Lo trae al frente en iOS
  elevation: 10,   // Lo trae al frente en Android
},
});


export const CONTAINERTERM = {
  // Actualiza o agrega estos estilos
termsContainer: {
  flexDirection: 'row', // Esto es lo que pone el texto al lado de la casilla
  alignItems: 'flex-start', // Alinea la casilla con la primera línea de texto
  marginTop: 10,
},
checkboxWrapper: {
  marginRight: 10, // Da el espacio entre la casilla y el texto
  // Si necesitas un área táctil más grande para que sea fácil de presionar:
  padding: 5, 
  marginLeft: -5,
},
linkText: {
  color: '#006442', 
  fontWeight: 'bold',
  textDecorationLine: 'underline',
},
termsText: {
  color: '#666',
  fontSize: 14,
  flexShrink: 1, // MUY IMPORTANTE: evita que el texto se salga de la pantalla y lo obliga a saltar de línea
  paddingTop: 5, // Ajusta esto para que el texto se vea centrado con la casilla
},

ButtonCrear:{
  marginTop: 20
}
}
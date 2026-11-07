import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../../components/PrimaryButton";
import { COLORS } from "../../theme/colors";

export default function AuthRequiredScreen({ navigation, route }) {
  const nextRoute = route.params?.nextRoute;
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.iconWrap}><Ionicons name="person-circle-outline" size={56} color={COLORS.primary} /></View>
        <Text style={styles.title}>Inicia sesión para continuar</Text>
        <Text style={styles.text}>Puedes seguir explorando KaabMap sin una cuenta. Para utilizar esta función necesitas iniciar sesión o crear una cuenta.</Text>
        <PrimaryButton title="Iniciar sesión" onPress={() => navigation.replace("Login", { nextRoute })} />
        <PrimaryButton title="Crear cuenta" outline style={{ marginTop: 10 }} onPress={() => navigation.replace("Register", { nextRoute })} />
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()}><Text style={styles.link}>Seguir explorando</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'rgba(15,30,24,0.35)',justifyContent:'flex-end'},
  sheet:{backgroundColor:COLORS.cream,borderTopLeftRadius:28,borderTopRightRadius:28,padding:24,paddingBottom:30},
  handle:{width:48,height:5,borderRadius:3,backgroundColor:'#C8CBC6',alignSelf:'center',marginBottom:20},
  iconWrap:{alignSelf:'center',width:84,height:84,borderRadius:42,backgroundColor:COLORS.primarySoft,alignItems:'center',justifyContent:'center',marginBottom:14},
  title:{textAlign:'center',fontSize:24,fontWeight:'900',color:COLORS.primaryDark},
  text:{textAlign:'center',color:COLORS.gray,lineHeight:21,marginTop:10,marginBottom:22},
  linkBtn:{paddingVertical:17,alignItems:'center'},
  link:{color:COLORS.primary,fontWeight:'800'}
});

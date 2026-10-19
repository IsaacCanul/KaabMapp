import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppLogo from "../../components/AppLogo";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../theme/colors";

const Row = ({ icon, label, onPress, danger = false }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={[styles.rowIcon, danger && { backgroundColor: COLORS.errorSoft }]}><Ionicons name={icon} size={19} color={danger ? COLORS.error : COLORS.primary} /></View>
    <Text style={[styles.rowText, danger && { color: COLORS.error }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={COLORS.gray2} />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.guest}>
          <AppLogo />
          <View style={styles.guestIcon}><Ionicons name="person-outline" size={50} color={COLORS.primary} /></View>
          <Text style={styles.guestTitle}>Tu espacio en KaabMap</Text>
          <Text style={styles.guestText}>Puedes explorar sin cuenta. Inicia sesión cuando quieras registrar meliponarios o administrar información.</Text>
          <PrimaryButton title="Iniciar sesión" onPress={()=>navigation.navigate("Login")} style={{width:'100%'}}/>
          <PrimaryButton title="Crear cuenta" outline onPress={()=>navigation.navigate("Register")} style={{width:'100%',marginTop:10}}/>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.header}><AppLogo compact/><TouchableOpacity><Ionicons name="settings-outline" size={22} color={COLORS.primary}/></TouchableOpacity></View>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.nombre?.[0]}{user.apellidos?.[0]}</Text></View>
          <Text style={styles.name}>{user.nombre} {user.apellidos}</Text>
          <Text style={styles.meta}>{user.email}</Text>
          <Text style={styles.meta}>{user.telefono}</Text>
          <View style={styles.roleBadge}><Ionicons name="leaf-outline" size={14} color={COLORS.primary}/><Text style={styles.roleText}>{user.rol}</Text></View>
          <Text style={styles.institution}>{user.institucion}</Text>
        </View>
        <Row icon="create-outline" label="Editar perfil" />
        {user.rol === "Productor" ? <><Row icon="home-outline" label="Mis meliponarios" onPress={()=>navigation.navigate("MyMeliponarios")}/><Row icon="cube-outline" label="Mis productos" onPress={()=>navigation.navigate("Products")}/></> : null}
        {user.rol === "Campo" ? <Row icon="clipboard-outline" label="Inspecciones" onPress={()=>navigation.navigate("Inspections")}/> : null}
        <Row icon="help-circle-outline" label="Ayuda y soporte" />
        <Row icon="log-out-outline" label="Cerrar sesión" danger onPress={logout}/>
      </View>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:COLORS.cream},content:{padding:18,maxWidth:560,width:'100%',alignSelf:'center'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},guest:{padding:24,alignItems:'center',justifyContent:'center',flex:1,maxWidth:520,width:'100%',alignSelf:'center'},guestIcon:{width:100,height:100,borderRadius:50,backgroundColor:COLORS.primarySoft,alignItems:'center',justifyContent:'center',marginTop:35},guestTitle:{fontSize:25,fontWeight:'900',color:COLORS.primaryDark,marginTop:18},guestText:{color:COLORS.gray,textAlign:'center',lineHeight:21,marginTop:8,marginBottom:24},profileCard:{alignItems:'center',backgroundColor:COLORS.white,borderRadius:22,borderWidth:1,borderColor:COLORS.border,padding:18,marginBottom:14},avatar:{width:76,height:76,borderRadius:38,backgroundColor:COLORS.honeySoft,alignItems:'center',justifyContent:'center'},avatarText:{fontSize:24,fontWeight:'900',color:COLORS.primaryDark},name:{fontSize:22,fontWeight:'900',color:COLORS.primaryDark,marginTop:10},meta:{color:COLORS.gray,fontSize:12,marginTop:3},roleBadge:{flexDirection:'row',alignItems:'center',backgroundColor:COLORS.primarySoft,borderRadius:14,paddingHorizontal:10,paddingVertical:6,marginTop:10},roleText:{color:COLORS.primary,fontWeight:'800',fontSize:11,marginLeft:5},institution:{color:COLORS.gray,fontSize:11,marginTop:7},row:{height:56,borderRadius:16,backgroundColor:COLORS.white,borderWidth:1,borderColor:COLORS.border,flexDirection:'row',alignItems:'center',paddingHorizontal:12,marginBottom:9},rowIcon:{width:34,height:34,borderRadius:17,backgroundColor:COLORS.primarySoft,alignItems:'center',justifyContent:'center',marginRight:10},rowText:{flex:1,color:COLORS.text,fontWeight:'700',fontSize:13}
});

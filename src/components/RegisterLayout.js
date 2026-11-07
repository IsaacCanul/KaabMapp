import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppLogo from "./AppLogo";
import Stepper from "./Stepper";
import { COLORS } from "../theme/colors";

export default function RegisterLayout({ navigation, step, title, subtitle, children }) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={22} color={COLORS.primaryDark}/></TouchableOpacity>
          <AppLogo compact />
          <View style={{width:42}} />
        </View>
        <Stepper current={step} />
        <Text style={styles.appTitle}>Registrar meliponario</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:COLORS.cream},content:{padding:18,paddingBottom:34,maxWidth:620,width:'100%',alignSelf:'center'},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:18},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.white,alignItems:'center',justifyContent:'center'},appTitle:{color:COLORS.primaryDark,fontSize:28,fontWeight:'900'},title:{color:COLORS.gray,fontSize:22,fontWeight:'700',marginTop:2},subtitle:{color:COLORS.gray,lineHeight:20,marginTop:8,marginBottom:18}
});

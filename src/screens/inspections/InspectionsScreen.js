import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FilterChip from "../../components/FilterChip";
import { INSPECTIONS } from "../../data/mockData";
import { COLORS } from "../../theme/colors";

export default function InspectionsScreen({ navigation }) {
  const [filter,setFilter]=useState('Pendientes');
  const data=INSPECTIONS.filter(i=>filter==='Todas'||i.estado===filter.replace('Pendientes','Pendiente').replace('Completadas','Completada'));
  return <SafeAreaView style={styles.screen} edges={["top"]}><FlatList data={data} keyExtractor={i=>String(i.id)} contentContainerStyle={styles.content} ListHeaderComponent={<><View style={styles.header}><TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons name="chevron-back" size={24} color={COLORS.primaryDark}/></TouchableOpacity><Text style={styles.title}>Inspecciones asignadas</Text></View><Text style={styles.subtitle}>Consulta y captura visitas técnicas de campo.</Text><View style={styles.filters}>{['Pendientes','En proceso','Todas'].map(f=><FilterChip key={f} label={f} active={filter===f} onPress={()=>setFilter(f)}/>)}</View></>} renderItem={({item})=><View style={styles.card}><View style={styles.icon}><Ionicons name="clipboard-outline" size={24} color={COLORS.primary}/></View><View style={{flex:1}}><Text style={styles.name}>{item.nombre}</Text><Text style={styles.meta}>{item.municipio}</Text><Text style={styles.meta}>{item.fecha}</Text><Text style={styles.status}>{item.estado}</Text></View><TouchableOpacity style={styles.start} onPress={()=>navigation.navigate('InspectionForm',{inspection:item})}><Text style={styles.startText}>Iniciar</Text></TouchableOpacity></View>} /></SafeAreaView>
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:COLORS.cream},content:{padding:18},header:{flexDirection:'row',alignItems:'center'},title:{color:COLORS.primaryDark,fontSize:24,fontWeight:'900',marginLeft:8},subtitle:{color:COLORS.gray,marginTop:6,marginBottom:14},filters:{flexDirection:'row',marginBottom:18},card:{flexDirection:'row',alignItems:'center',backgroundColor:COLORS.white,borderWidth:1,borderColor:COLORS.border,borderRadius:17,padding:13,marginBottom:10},icon:{width:48,height:48,borderRadius:15,backgroundColor:COLORS.primarySoft,alignItems:'center',justifyContent:'center',marginRight:11},name:{color:COLORS.primaryDark,fontWeight:'900'},meta:{color:COLORS.gray,fontSize:11,marginTop:2},status:{color:COLORS.warningText,fontSize:10,fontWeight:'800',marginTop:5},start:{borderWidth:1,borderColor:COLORS.primary,borderRadius:12,paddingHorizontal:12,paddingVertical:8},startText:{color:COLORS.primary,fontSize:11,fontWeight:'900'}});

import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FilterChip from "../../components/FilterChip";
import FormInput from "../../components/FormInput";
import InfoBox from "../../components/InfoBox";
import PrimaryButton from "../../components/PrimaryButton";
import { COLORS } from "../../theme/colors";

export default function InspectionFormScreen({navigation,route}){
 const inspection=route.params?.inspection;
 const [general,setGeneral]=useState('Bueno');
 const [seals,setSeals]=useState(['Propóleo']);
 const [feeding,setFeeding]=useState('Flores nativas');
 const [notes,setNotes]=useState('');
 const toggle=(v)=>setSeals(seals.includes(v)?seals.filter(x=>x!==v):[...seals,v]);
 return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons name="chevron-back" size={24} color={COLORS.primaryDark}/></TouchableOpacity><View><Text style={styles.title}>Inspección de meliponario</Text><Text style={styles.meta}>{inspection?.nombre || 'Meliponario'} · {inspection?.municipio || 'Yucatán'}</Text></View></View><InfoBox>Este formulario está optimizado para trabajo de campo. Los campos finales deben ajustarse al protocolo técnico institucional.</InfoBox><Text style={styles.label}>Estado general</Text><View style={styles.wrap}>{['Bueno','Regular','Malo'].map(v=><FilterChip key={v} label={v} active={general===v} onPress={()=>setGeneral(v)}/>)}</View><Text style={styles.label}>Métodos de sellado</Text><View style={styles.wrap}>{['Propóleo','Plastilina','Acetato','Cartón','Otro'].map(v=><FilterChip key={v} label={v} active={seals.includes(v)} onPress={()=>toggle(v)}/>)}</View><Text style={styles.label}>Alimentación</Text><View style={styles.wrap}>{['Flores nativas','Alimentación suplementaria','No aplica'].map(v=><FilterChip key={v} label={v} active={feeding===v} onPress={()=>setFeeding(v)}/>)}</View><FormInput label="Observaciones" value={notes} onChangeText={setNotes} placeholder="Escribe observaciones técnicas..." multiline/><View style={styles.photo}><Ionicons name="camera-outline" size={30} color={COLORS.primary}/><Text style={styles.photoText}>Agregar evidencias fotográficas</Text></View><PrimaryButton title="Guardar inspección" onPress={()=>navigation.goBack()}/><PrimaryButton title="Finalizar inspección" outline style={{marginTop:10}} onPress={()=>navigation.goBack()}/></ScrollView></SafeAreaView>
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:COLORS.cream},content:{padding:18,paddingBottom:35,maxWidth:560,width:'100%',alignSelf:'center'},header:{flexDirection:'row',alignItems:'center',marginBottom:14},title:{color:COLORS.primaryDark,fontSize:22,fontWeight:'900',marginLeft:8},meta:{color:COLORS.gray,fontSize:11,marginLeft:8,marginTop:3},label:{color:COLORS.primaryDark,fontSize:15,fontWeight:'900',marginTop:8,marginBottom:8},wrap:{flexDirection:'row',flexWrap:'wrap',marginBottom:8},photo:{height:110,borderWidth:1.5,borderStyle:'dashed',borderColor:'#B9C8B9',borderRadius:16,alignItems:'center',justifyContent:'center',marginBottom:18},photoText:{color:COLORS.primary,fontWeight:'800',marginTop:5}});

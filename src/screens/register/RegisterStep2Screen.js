import React, { useState } from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../../components/PrimaryButton";
import RegisterLayout from "../../components/RegisterLayout";
import InfoBox from "../../components/InfoBox";
import FilterChip from "../../components/FilterChip";
import { useMeliponarioDraft } from "../../context/MeliponarioDraftContext";
import { COLORS } from "../../theme/colors";

const TEMP=['< 20 °C','20–24 °C','25–28 °C','29–32 °C','> 32 °C'];

export default function RegisterStep2Screen({ navigation }) {
  const {draft,updateDraft}=useMeliponarioDraft();
  const [temp,setTemp]=useState(draft.temperatura);
  const next=()=>{ updateDraft({municipio:'Izamal',localidad:'Izamal, Yucatán',temperatura:temp}); navigation.navigate('RegisterStep3'); };
  return <RegisterLayout navigation={navigation} step={2} title="Ubicación y condiciones" subtitle="Selecciona la ubicación y registra las condiciones generales del sitio.">
    <ImageBackground source={require('../../../assets/map-yucatan.jpg')} style={styles.map} imageStyle={styles.mapImage}>
      <View style={styles.pin}><Ionicons name="location" size={30} color={COLORS.white}/></View>
    </ImageBackground>
    <View style={styles.buttons}><PrimaryButton title="Usar mi ubicación" icon="locate-outline" style={{flex:1,marginRight:6}}/><PrimaryButton title="Seleccionar en mapa" icon="map-outline" outline style={{flex:1,marginLeft:6}}/></View>
    <View style={styles.locationCard}><View><Text style={styles.small}>Municipio</Text><Text style={styles.value}>Izamal</Text></View><View><Text style={styles.small}>Localidad</Text><Text style={styles.value}>Izamal, Yucatán</Text></View></View>
    <InfoBox warning>Solo se pueden registrar meliponarios dentro del estado de Yucatán.</InfoBox>
    <Text style={styles.section}>Temperatura del sitio</Text>
    <Text style={styles.help}>Selecciona el rango de temperatura promedio.</Text>
    <View style={styles.tempWrap}>{TEMP.map(t=><FilterChip key={t} label={t} active={temp===t} onPress={()=>setTemp(t)}/>)}</View>
    <PrimaryButton title="Continuar" onPress={next}/>
  </RegisterLayout>;
}

const styles=StyleSheet.create({map:{height:250,borderRadius:20,overflow:'hidden',alignItems:'center',justifyContent:'center',marginBottom:12},mapImage:{borderRadius:20},pin:{width:50,height:50,borderRadius:25,backgroundColor:COLORS.primary,alignItems:'center',justifyContent:'center',borderWidth:3,borderColor:COLORS.white},buttons:{flexDirection:'row',marginBottom:12},locationCard:{flexDirection:'row',justifyContent:'space-between',backgroundColor:COLORS.white,borderWidth:1,borderColor:COLORS.border,borderRadius:16,padding:14,marginBottom:12},small:{color:COLORS.gray,fontSize:11},value:{color:COLORS.primaryDark,fontWeight:'900',marginTop:3},section:{fontSize:18,fontWeight:'900',color:COLORS.primaryDark,marginTop:4},help:{color:COLORS.gray,fontSize:12,marginTop:4,marginBottom:10},tempWrap:{flexDirection:'row',flexWrap:'wrap',marginBottom:16}});

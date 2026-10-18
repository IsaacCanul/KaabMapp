import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RegisterLayout from "../../components/RegisterLayout";
import PrimaryButton from "../../components/PrimaryButton";
import FilterChip from "../../components/FilterChip";
import { useMeliponarioDraft } from "../../context/MeliponarioDraftContext";
import { COLORS } from "../../theme/colors";

const GROUPS = [
  { key: 'estructura', title: 'Tipo de estructura', values: ['Palapa','En casa','Sombra/malla','Bajo árboles','Bodega','Otro'] },
  { key: 'material', title: 'Material principal', values: ['Madera','Palma','Metal','Mixto','Otro'] },
  { key: 'cubierta', title: 'Protección / cubierta', values: ['A cielo abierto','Con techo','Malla sombra','Cubierta vegetal','Otro'] },
];

export default function RegisterStep4Screen({ navigation }) {
  const {draft,updateDraft}=useMeliponarioDraft();
  const [form,setForm]=useState({estructura:draft.estructura,material:draft.material,cubierta:draft.cubierta});
  const [caracteristicas,setCaracteristicas]=useState(draft.caracteristicas || []);
  const [infra,setInfra]=useState(draft.infraestructura || []);

  const toggle=(list,setter,value)=>setter(list.includes(value)?list.filter(v=>v!==value):[...list,value]);
  const next=()=>{updateDraft({...form,caracteristicas,infraestructura:infra});navigation.navigate('RegisterStep5');};

  return <RegisterLayout navigation={navigation} step={4} title="Estructura y características" subtitle="Describe cómo está conformado el sitio usando opciones rápidas.">
    {GROUPS.map(g=><View key={g.key} style={styles.card}><Text style={styles.heading}>{g.title}</Text><View style={styles.wrap}>{g.values.map(v=><FilterChip key={v} label={v} active={form[g.key]===v} onPress={()=>setForm({...form,[g.key]:v})}/>)}</View></View>)}
    <View style={styles.card}><Text style={styles.heading}>Características del sitio</Text><View style={styles.wrap}>{['Rodeado de vegetación','Con flores cercanas','Cerca de fuente de agua','Zona rural','Exposición al sol','Otra'].map(v=><FilterChip key={v} label={v} active={caracteristicas.includes(v)} onPress={()=>toggle(caracteristicas,setCaracteristicas,v)}/>)}</View></View>
    <View style={styles.card}><Text style={styles.heading}>Infraestructura básica</Text><View style={styles.wrap}>{['Agua','Electricidad','Internet','Acceso vehicular'].map(v=><FilterChip key={v} label={v} active={infra.includes(v)} onPress={()=>toggle(infra,setInfra,v)}/>)}</View></View>
    <PrimaryButton title="Continuar" onPress={next}/>
  </RegisterLayout>;
}

const styles=StyleSheet.create({card:{backgroundColor:COLORS.white,borderRadius:18,borderWidth:1,borderColor:COLORS.border,padding:14,marginBottom:12},heading:{color:COLORS.primaryDark,fontSize:16,fontWeight:'900',marginBottom:10},wrap:{flexDirection:'row',flexWrap:'wrap'}});

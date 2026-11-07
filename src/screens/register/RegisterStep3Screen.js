import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RegisterLayout from "../../components/RegisterLayout";
import InfoBox from "../../components/InfoBox";
import HiveCounter from "../../components/HiveCounter";
import PrimaryButton from "../../components/PrimaryButton";
import { SPECIES_CATALOG } from "../../data/mockData";
import { useMeliponarioDraft } from "../../context/MeliponarioDraftContext";
import { COLORS } from "../../theme/colors";

export default function RegisterStep3Screen({ navigation }) {
  const {draft,updateDraft}=useMeliponarioDraft();
  const [selected,setSelected]=useState(draft.especies);

  const isSelected=(id)=>selected.some(s=>s.id===id);
  const add=(species)=>{
    if(isSelected(species.id)) return;
    setSelected([...selected,{...species,cajas:0,jobones:0}]);
  };
  const remove=(id)=>setSelected(selected.filter(s=>s.id!==id));
  const updateCount=(id,key,value)=>setSelected(selected.map(s=>s.id===id?{...s,[key]:value}:s));
  const next=()=>{ if(!selected.length) return; updateDraft({especies:selected}); navigation.navigate('RegisterStep4'); };

  return <RegisterLayout navigation={navigation} step={3} title="Especies y colmenas" subtitle="Selecciona especies del catálogo oficial y registra las colmenas por tipo.">
    <InfoBox title="Catálogo administrado desde la web">La app móvil solo permite seleccionar especies ya registradas desde el panel web de KaabMap.</InfoBox>
    <InfoBox title="Colmenas y colonias">En esta versión, cada colmena registrada representa una colonia. Colmena es la estructura física; colonia es el grupo de abejas que vive dentro.</InfoBox>

    {selected.length ? <Text style={styles.heading}>Especies seleccionadas ({selected.length})</Text> : null}
    {selected.map(s=><View key={s.id} style={styles.selectedCard}>
      <Image source={s.imagen} style={styles.image}/>
      <View style={{flex:1}}>
        <View style={styles.titleRow}><View style={{flex:1}}><Text style={styles.name}>{s.nombre}</Text><Text style={styles.scientific}>{s.cientifico}</Text><Text style={styles.maya}>{s.maya} · Origen: {s.origen}</Text></View><TouchableOpacity onPress={()=>remove(s.id)}><Ionicons name="trash-outline" size={20} color={COLORS.gray}/></TouchableOpacity></View>
        <View style={styles.counters}><HiveCounter label="Cajas racionales" value={s.cajas} onChange={v=>updateCount(s.id,'cajas',v)}/><View style={{width:8}}/><HiveCounter label="Jobones" icon="ellipse-outline" value={s.jobones} onChange={v=>updateCount(s.id,'jobones',v)}/></View>
      </View>
    </View>)}

    <Text style={styles.heading}>Especies disponibles</Text>
    {SPECIES_CATALOG.filter(s=>!isSelected(s.id)).map(s=><View key={s.id} style={styles.catalogCard}>
      <Image source={s.imagen} style={styles.catalogImage}/>
      <View style={{flex:1}}><Text style={styles.name}>{s.nombre}</Text><Text style={styles.scientific}>{s.cientifico}</Text><Text style={styles.maya}>{s.maya} · {s.origen}</Text></View>
      <TouchableOpacity style={styles.selectBtn} onPress={()=>add(s)}><Ionicons name="add-circle-outline" size={19} color={COLORS.primary}/><Text style={styles.selectText}>Seleccionar</Text></TouchableOpacity>
    </View>)}
    <PrimaryButton title="Continuar" disabled={!selected.length} onPress={next}/>
  </RegisterLayout>;
}

const styles=StyleSheet.create({heading:{color:COLORS.primaryDark,fontSize:18,fontWeight:'900',marginBottom:10,marginTop:5},selectedCard:{flexDirection:'row',backgroundColor:COLORS.white,borderRadius:18,borderWidth:1,borderColor:COLORS.border,padding:10,marginBottom:11},image:{width:105,height:125,borderRadius:14,marginRight:11},titleRow:{flexDirection:'row'},name:{color:COLORS.primaryDark,fontWeight:'900',fontSize:14},scientific:{color:COLORS.gray,fontSize:11,fontStyle:'italic',marginTop:2},maya:{color:COLORS.gray,fontSize:10,marginTop:4},counters:{flexDirection:'row',marginTop:10},catalogCard:{flexDirection:'row',alignItems:'center',backgroundColor:COLORS.white,borderWidth:1,borderColor:COLORS.border,borderRadius:16,padding:9,marginBottom:9},catalogImage:{width:72,height:58,borderRadius:12,marginRight:10},selectBtn:{flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:COLORS.border,borderRadius:12,paddingHorizontal:9,paddingVertical:7},selectText:{color:COLORS.primary,fontSize:10,fontWeight:'800',marginLeft:4}});

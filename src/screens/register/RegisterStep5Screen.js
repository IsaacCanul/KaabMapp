import React from "react";
import { StyleSheet, Text, View } from "react-native";
import RegisterLayout from "../../components/RegisterLayout";
import PrimaryButton from "../../components/PrimaryButton";
import InfoBox from "../../components/InfoBox";
import { useMeliponarioDraft } from "../../context/MeliponarioDraftContext";
import { COLORS } from "../../theme/colors";

const Row=({label,value})=><View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || '—'}</Text></View>;

export default function RegisterStep5Screen({ navigation }) {
  const {draft,resetDraft}=useMeliponarioDraft();
  const send=()=>{ resetDraft(); navigation.reset({index:1,routes:[{name:'MainTabs'},{name:'MyMeliponarios'}]}); };
  return <RegisterLayout navigation={navigation} step={5} title="Confirmar registro" subtitle="Revisa la información antes de enviarla.">
    <View style={styles.card}><Text style={styles.heading}>Información general</Text><Row label="Nombre" value={draft.nombre || `Meliponario de ${draft.responsable}`}/><Row label="Responsable" value={draft.responsable}/><Row label="Descripción" value={draft.descripcion}/></View>
    <View style={styles.card}><Text style={styles.heading}>Ubicación y temperatura</Text><Row label="Municipio" value={draft.municipio}/><Row label="Localidad" value={draft.localidad}/><Row label="Temperatura" value={draft.temperatura}/></View>
    <View style={styles.card}><Text style={styles.heading}>Especies y colmenas</Text>{draft.especies.length?draft.especies.map(s=><View key={s.id} style={styles.species}><Text style={styles.speciesName}>{s.nombre}</Text><Text style={styles.small}>{s.cajas} cajas racionales · {s.jobones} jobones · total {s.cajas+s.jobones} colmenas</Text></View>):<Text style={styles.small}>Sin especies seleccionadas.</Text>}</View>
    <View style={styles.card}><Text style={styles.heading}>Estructura</Text><Row label="Tipo" value={draft.estructura}/><Row label="Material" value={draft.material}/><Row label="Cubierta" value={draft.cubierta}/><Row label="Características" value={(draft.caracteristicas||[]).join(', ')}/></View>
    <InfoBox warning>Después de enviar el registro, el meliponario quedará Pendiente hasta que sea validado mediante una inspección.</InfoBox>
    <PrimaryButton title="Enviar registro" onPress={send}/>
  </RegisterLayout>;
}

const styles=StyleSheet.create({card:{backgroundColor:COLORS.white,borderRadius:18,borderWidth:1,borderColor:COLORS.border,padding:15,marginBottom:12},heading:{color:COLORS.primaryDark,fontSize:17,fontWeight:'900',marginBottom:9},row:{flexDirection:'row',paddingVertical:5},label:{width:110,color:COLORS.gray,fontSize:11},value:{flex:1,color:COLORS.text,fontSize:11,fontWeight:'700'},species:{paddingVertical:7,borderBottomWidth:1,borderBottomColor:COLORS.border},speciesName:{color:COLORS.primaryDark,fontWeight:'900',fontSize:13},small:{color:COLORS.gray,fontSize:11,marginTop:2,lineHeight:16}});

import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import RegisterLayout from "../../components/RegisterLayout";
import InfoBox from "../../components/InfoBox";
import { useMeliponarioDraft } from "../../context/MeliponarioDraftContext";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../theme/colors";

export default function RegisterStep1Screen({ navigation }) {
  const { draft, updateDraft } = useMeliponarioDraft();
  const { user } = useAuth();
  const [nombre,setNombre]=useState(draft.nombre);
  const [descripcion,setDescripcion]=useState(draft.descripcion);
  const responsable = user ? `${user.nombre} ${user.apellidos}` : draft.responsable || "Propietario";

  const next=()=>{ updateDraft({nombre,responsable,descripcion}); navigation.navigate('RegisterStep2'); };

  return <RegisterLayout navigation={navigation} step={1} title="Información general" subtitle="Comienza con los datos básicos del meliponario.">
    <FormInput label="Nombre del meliponario" value={nombre} onChangeText={setNombre} placeholder="Ej. Meliponario Xunán Kab" />
    <InfoBox>Si lo dejas vacío, KaabMap utilizará “Meliponario de {responsable}”.</InfoBox>
    <View style={styles.owner}><Text style={styles.ownerLabel}>Responsable</Text><Text style={styles.ownerName}>{responsable}</Text><Text style={styles.ownerMeta}>Se obtiene de la cuenta del usuario.</Text></View>
    <FormInput label="Descripción corta" value={descripcion} onChangeText={setDescripcion} placeholder="Cuéntanos sobre el meliponario..." multiline />
    <View style={styles.upload}><Text style={styles.uploadTitle}>Foto principal</Text><Text style={styles.uploadText}>La carga real de imágenes se conectará posteriormente a la API.</Text></View>
    <PrimaryButton title="Continuar" onPress={next} />
  </RegisterLayout>;
}

const styles=StyleSheet.create({owner:{backgroundColor:COLORS.primarySoft2,borderRadius:16,padding:14,marginBottom:14},ownerLabel:{fontSize:11,color:COLORS.gray},ownerName:{fontSize:16,fontWeight:'900',color:COLORS.primaryDark,marginTop:3},ownerMeta:{fontSize:11,color:COLORS.gray,marginTop:3},upload:{borderWidth:1.5,borderStyle:'dashed',borderColor:'#B9C8B9',borderRadius:16,padding:24,alignItems:'center',marginBottom:18},uploadTitle:{color:COLORS.primaryDark,fontWeight:'900'},uploadText:{color:COLORS.gray,fontSize:11,textAlign:'center',marginTop:5}});

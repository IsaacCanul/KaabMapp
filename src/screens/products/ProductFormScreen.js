import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FilterChip from "../../components/FilterChip";
import FormInput from "../../components/FormInput";
import InfoBox from "../../components/InfoBox";
import PrimaryButton from "../../components/PrimaryButton";
import { COLORS } from "../../theme/colors";

const PRODUCTS=['Miel','Polen','Propóleo','Jabón','Crema','Gotero','Otro'];
const PRESENTATIONS=['250 ml','500 ml','Gotero','Frasco','Botella','Barra','Otra'];

export default function ProductFormScreen({navigation,route}){
 const existing=route.params?.product;
 const [product,setProduct]=useState(existing?.nombre || 'Miel');
 const [presentation,setPresentation]=useState(existing?.presentacion || '250 ml');
 const [availability,setAvailability]=useState(existing?.disponibilidad || 'Disponible');
 const [point,setPoint]=useState('En el meliponario');
 const [externalName,setExternalName]=useState('');
 return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons name="chevron-back" size={24} color={COLORS.primaryDark}/></TouchableOpacity><Text style={styles.title}>{existing?'Editar producto':'Agregar producto'}</Text></View><InfoBox>Solo se muestra información de disponibilidad y punto de venta. No se registran precios, pagos ni carrito.</InfoBox><Text style={styles.label}>Producto</Text><View style={styles.wrap}>{PRODUCTS.map(v=><FilterChip key={v} label={v} active={product===v} onPress={()=>setProduct(v)}/>)}</View><Text style={styles.label}>Presentación</Text><View style={styles.wrap}>{PRESENTATIONS.map(v=><FilterChip key={v} label={v} active={presentation===v} onPress={()=>setPresentation(v)}/>)}</View><Text style={styles.label}>Disponibilidad</Text><View style={styles.wrap}>{['Disponible','Temporalmente no disponible'].map(v=><FilterChip key={v} label={v} active={availability===v} onPress={()=>setAvailability(v)}/>)}</View><Text style={styles.label}>Punto de venta</Text><View style={styles.wrap}>{['En el meliponario','Punto de venta externo'].map(v=><FilterChip key={v} label={v} active={point===v} onPress={()=>setPoint(v)}/>)}</View>{point==='Punto de venta externo'?<FormInput label="Nombre del punto de venta" value={externalName} onChangeText={setExternalName} placeholder="Ej. Mercado municipal"/>:null}<View style={styles.photo}><Ionicons name="image-outline" size={30} color={COLORS.primary}/><Text style={styles.photoText}>Agregar fotografía</Text></View><PrimaryButton title="Guardar producto" onPress={()=>navigation.goBack()}/></ScrollView></SafeAreaView>
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:COLORS.cream},content:{padding:18,paddingBottom:35,maxWidth:560,width:'100%',alignSelf:'center'},header:{flexDirection:'row',alignItems:'center',marginBottom:14},title:{color:COLORS.primaryDark,fontSize:24,fontWeight:'900',marginLeft:8},label:{color:COLORS.primaryDark,fontSize:15,fontWeight:'900',marginTop:5,marginBottom:8},wrap:{flexDirection:'row',flexWrap:'wrap',marginBottom:12},photo:{height:110,borderWidth:1.5,borderStyle:'dashed',borderColor:'#B9C8B9',borderRadius:16,alignItems:'center',justifyContent:'center',marginBottom:18},photoText:{color:COLORS.primary,fontWeight:'800',marginTop:5}});

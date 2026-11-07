import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../../components/PrimaryButton";
import { PRODUCTS } from "../../data/mockData";
import { COLORS } from "../../theme/colors";

export default function ProductsScreen({ navigation }) {
  return <SafeAreaView style={styles.screen} edges={["top"]}>
    <FlatList data={PRODUCTS} keyExtractor={i=>String(i.id)} contentContainerStyle={styles.content} ListHeaderComponent={<><View style={styles.header}><TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons name="chevron-back" size={24} color={COLORS.primaryDark}/></TouchableOpacity><Text style={styles.title}>Productos disponibles</Text></View><Text style={styles.subtitle}>Administra los productos que deseas mostrar. KaabMap no procesa ventas ni pagos.</Text></>} renderItem={({item})=><View style={styles.card}><View style={styles.icon}><Ionicons name="cube-outline" size={24} color={COLORS.honey}/></View><View style={{flex:1}}><Text style={styles.name}>{item.nombre}</Text><Text style={styles.meta}>{item.presentacion}</Text><Text style={[styles.status,item.disponibilidad!=='Disponible'&&styles.statusOff]}>{item.disponibilidad}</Text></View><TouchableOpacity onPress={()=>navigation.navigate('ProductForm',{product:item})}><Ionicons name="create-outline" size={21} color={COLORS.primary}/></TouchableOpacity></View>} ListFooterComponent={<PrimaryButton title="Agregar producto" icon="add-outline" onPress={()=>navigation.navigate('ProductForm')}/>}/>
  </SafeAreaView>;
}

const styles=StyleSheet.create({screen:{flex:1,backgroundColor:COLORS.cream},content:{padding:18,paddingBottom:30},header:{flexDirection:'row',alignItems:'center',marginBottom:6},title:{color:COLORS.primaryDark,fontSize:24,fontWeight:'900',marginLeft:8},subtitle:{color:COLORS.gray,lineHeight:19,marginBottom:16},card:{flexDirection:'row',alignItems:'center',backgroundColor:COLORS.white,borderWidth:1,borderColor:COLORS.border,borderRadius:17,padding:13,marginBottom:10},icon:{width:48,height:48,borderRadius:14,backgroundColor:COLORS.honeySoft,alignItems:'center',justifyContent:'center',marginRight:11},name:{color:COLORS.primaryDark,fontWeight:'900'},meta:{color:COLORS.gray,fontSize:11,marginTop:2},status:{color:COLORS.successText,backgroundColor:COLORS.success,alignSelf:'flex-start',paddingHorizontal:7,paddingVertical:4,borderRadius:10,fontSize:9,fontWeight:'800',marginTop:6},statusOff:{color:COLORS.error,backgroundColor:COLORS.errorSoft}});

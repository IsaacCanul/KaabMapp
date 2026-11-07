import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FilterChip from "../../components/FilterChip";
import MeliponarioCard from "../../components/MeliponarioCard";
import PrimaryButton from "../../components/PrimaryButton";
import { MELIPONARIOS } from "../../data/mockData";
import { COLORS } from "../../theme/colors";

export default function MyMeliponariosScreen({ navigation }) {
  const [filter, setFilter] = useState("Todos");
  const data = MELIPONARIOS.filter((m) => filter === "Todos" || m.estado === filter.slice(0, -1));

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <MeliponarioCard item={item} onPress={() => navigation.navigate("MeliponarioDetail", { id: item.id })} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={24} color={COLORS.primaryDark} /></TouchableOpacity>
              <Text style={styles.title}>Mis meliponarios</Text>
            </View>
            <Text style={styles.subtitle}>Administra tus registros y consulta su estado.</Text>
            <View style={styles.filters}>
              {['Todos','Activos','Pendientes'].map((f) => <FilterChip key={f} label={f} active={filter===f} onPress={()=>setFilter(f)} />)}
            </View>
          </>
        }
        ListFooterComponent={<PrimaryButton title="Registrar meliponario" icon="add-outline" onPress={() => navigation.navigate("RegisterStep1")} style={{ marginTop: 4 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:COLORS.cream},
  content:{padding:18,paddingBottom:30},
  header:{flexDirection:'row',alignItems:'center',marginBottom:5},
  title:{color:COLORS.primaryDark,fontSize:25,fontWeight:'900',marginLeft:10},
  subtitle:{color:COLORS.gray,marginBottom:14},
  filters:{flexDirection:'row',marginBottom:18}
});

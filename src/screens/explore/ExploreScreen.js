import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MeliponarioCard from "../../components/MeliponarioCard";
import { MELIPONARIOS } from "../../data/mockData";
import { COLORS } from "../../theme/colors";

export default function ExploreScreen({ navigation }) {
  const [q, setQ] = useState("");
  const data = useMemo(() => {
    const term = q.trim().toLowerCase();
    return MELIPONARIOS.filter((m) => !term || `${m.nombre} ${m.municipio} ${m.especies.join(" ")}`.toLowerCase().includes(term));
  }, [q]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <MeliponarioCard item={item} onPress={() => navigation.navigate("MeliponarioDetail", { id: item.id })} />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Explorar</Text>
            <Text style={styles.subtitle}>Busca por meliponario, municipio o especie.</Text>
            <View style={styles.search}>
              <Ionicons name="search-outline" size={20} color={COLORS.primary} />
              <TextInput value={q} onChangeText={setQ} placeholder="Buscar..." placeholderTextColor={COLORS.gray2} style={styles.input} />
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: 18, paddingBottom: 40 },
  title: { color: COLORS.primaryDark, fontSize: 30, fontWeight: "900" },
  subtitle: { color: COLORS.gray, marginTop: 6, marginBottom: 16 },
  search: { height: 50, borderRadius: 15, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, marginBottom: 20 },
  input: { flex: 1, marginLeft: 8, color: COLORS.text },
});

import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppLogo from "../../components/AppLogo";
import FilterChip from "../../components/FilterChip";
import MeliponarioCard from "../../components/MeliponarioCard";
import { MELIPONARIOS } from "../../data/mockData";
import { COLORS } from "../../theme/colors";
import { commonStyles } from "../../theme/commonStyles";

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Cerca de mí");

  const data = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MELIPONARIOS.filter((item) => {
      const bySearch = !q || `${item.nombre} ${item.municipio} ${item.especies.join(" ")}`.toLowerCase().includes(q);
      const byFilter = filter === "Con productos" ? item.productos : filter === "Activos" ? item.estado === "Activo" : true;
      return bySearch && byFilter;
    });
  }, [search, filter]);

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top"]}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MeliponarioCard item={item} onPress={() => navigation.navigate("MeliponarioDetail", { id: item.id })} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <AppLogo compact />
              <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
                <Ionicons name="person-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.eyebrow}>EXPLORA LA RUTA DE LA MIEL</Text>
            <Text style={styles.hero}>Descubre la vida que florece{"\n"}en Yucatán.</Text>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color={COLORS.primary} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                  placeholder="¿Dónde quieres explorar?"
                  placeholderTextColor={COLORS.gray2}
                />
              </View>
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="options-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {[
                ["Cerca de mí", "location-outline"],
                ["Especies", "leaf-outline"],
                ["Con productos", "cube-outline"],
                ["Activos", "checkmark-circle-outline"],
              ].map(([label, icon]) => (
                <FilterChip key={label} label={label} icon={icon} active={filter === label} onPress={() => setFilter(label)} />
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meliponarios cercanos</Text>
              <Text style={styles.seeAll}>Ver todos</Text>
            </View>
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>No encontramos meliponarios con esos filtros.</Text>}
      />

      <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate("Map")}>
        <Ionicons name="map-outline" size={18} color={COLORS.white} />
        <Text style={styles.mapText}>Mapa</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 90 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 26 },
  profileButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primarySoft },
  eyebrow: { color: COLORS.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 7 },
  hero: { color: COLORS.primaryDark, fontSize: 30, lineHeight: 34, fontWeight: "900", marginBottom: 24 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchBox: { flex: 1, height: 52, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 14 },
  searchInput: { flex: 1, marginLeft: 9, color: COLORS.text, fontSize: 14 },
  filterButton: { width: 52, height: 52, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginLeft: 9 },
  filters: { paddingVertical: 13 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: COLORS.primaryDark, fontSize: 18, fontWeight: "900" },
  seeAll: { color: COLORS.primary, fontSize: 12, fontWeight: "800" },
  mapButton: { position: "absolute", bottom: 12, alignSelf: "center", backgroundColor: COLORS.primary, borderRadius: 24, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, height: 46, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  mapText: { color: COLORS.white, fontWeight: "800", marginLeft: 7 },
  empty: { color: COLORS.gray, textAlign: "center", paddingVertical: 30 },
});

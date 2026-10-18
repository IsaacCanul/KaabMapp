import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../../components/PrimaryButton";
import StatusBadge from "../../components/StatusBadge";
import { MELIPONARIOS, PRODUCTS, SPECIES_CATALOG } from "../../data/mockData";
import { COLORS } from "../../theme/colors";
import { commonStyles } from "../../theme/commonStyles";

export default function MeliponarioDetailScreen({ navigation, route }) {
  const meliponario =
  route.params?.meliponario ??
  MELIPONARIOS.find(
    (m) =>
      String(m.id) === String(route.params?.id)
  );

const species = meliponario
  ? SPECIES_CATALOG.filter(
      (s) => meliponario.especies.includes(s.nombre)
    )
  : [];

  if (!meliponario) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAF8F1",
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: "#06492E",
          textAlign: "center",
        }}
      >
        No se encontró el meliponario seleccionado.
      </Text>
    </View>
  );
}
  return (
    <SafeAreaView style={commonStyles.screen} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heroWrap}>
          <Image source={meliponario.imagen} style={styles.hero} />
          <TouchableOpacity style={[styles.circleBtn, { left: 14 }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.circleBtn, { right: 14 }]}>
            <Ionicons name="share-outline" size={21} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{meliponario.nombre}</Text>
              <Text style={styles.location}>{meliponario.municipio} · {meliponario.distancia} km</Text>
            </View>
            <StatusBadge status={meliponario.estado} />
          </View>

          <View style={commonStyles.card}>
            <Text style={styles.ownerLabel}>Responsable</Text>
            <Text style={styles.owner}>{meliponario.responsable}</Text>
            <Text style={styles.description}>{meliponario.descripcion}</Text>
            <View style={styles.metaGrid}>
              <View style={styles.metaBox}>
                <Ionicons name="home-outline" size={20} color={COLORS.primary} />
                <Text style={styles.metaLabel}>Estructura</Text>
                <Text style={styles.metaValue}>{meliponario.estructura}</Text>
              </View>
              <View style={styles.metaBox}>
                <Ionicons name="cube-outline" size={20} color={COLORS.honey} />
                <Text style={styles.metaLabel}>Colmenas</Text>
                <Text style={styles.metaValue}>{meliponario.colmenas}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Especies registradas</Text>
          {species.length ? species.map((item) => (
            <View key={item.id} style={styles.speciesCard}>
              <Image source={item.imagen} style={styles.speciesImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.speciesName}>{item.nombre}</Text>
                <Text style={styles.scientific}>{item.cientifico}</Text>
                <View style={styles.mayaRow}>
                  <Text style={styles.maya}>{item.maya}</Text>
                  <TouchableOpacity style={styles.audioBtn}><Ionicons name="volume-medium" size={16} color={COLORS.primary} /></TouchableOpacity>
                </View>
                <Text style={styles.origin}>Origen: {item.origen}</Text>
              </View>
            </View>
          )) : <Text style={styles.empty}>No hay especies detalladas en el mock.</Text>}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos disponibles</Text>
            <Text style={styles.link}>Ver todos</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PRODUCTS.slice(0, 2).map((p) => (
              <View key={p.id} style={styles.productCard}>
                <View style={styles.productIcon}><Ionicons name="cube-outline" size={24} color={COLORS.honey} /></View>
                <Text style={styles.productName}>{p.nombre}</Text>
                <Text style={styles.productPresentation}>{p.presentacion}</Text>
                <Text style={[styles.productAvailability, p.disponibilidad !== "Disponible" && styles.unavailable]}>{p.disponibilidad}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={[commonStyles.card, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Punto de venta</Text>
            <View style={styles.pointRow}>
              <Ionicons name="storefront-outline" size={24} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.pointTitle}>Meliponario {meliponario.nombre.replace("Meliponario ", "")}</Text>
                <Text style={styles.pointText}>{meliponario.municipio}</Text>
              </View>
              <TouchableOpacity style={styles.smallOutline}><Text style={styles.smallOutlineText}>Ver ubicación</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton title="Cómo llegar" icon="navigate-outline" outline style={{ flex: 1, marginRight: 8 }} />
            <PrimaryButton title="Contactar productor" icon="chatbubble-outline" style={{ flex: 1 }} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 30 },
  heroWrap: { height: 275, position: "relative" },
  hero: { width: "100%", height: "100%" },
  circleBtn: { position: "absolute", top: 14, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center" },
  body: { padding: 18, marginTop: -18, backgroundColor: COLORS.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  title: { color: COLORS.primaryDark, fontSize: 25, fontWeight: "900" },
  location: { color: COLORS.gray, marginTop: 4 },
  ownerLabel: { color: COLORS.gray, fontSize: 11, fontWeight: "700" },
  owner: { color: COLORS.primaryDark, fontSize: 16, fontWeight: "900", marginTop: 2 },
  description: { color: COLORS.gray, fontSize: 13, lineHeight: 20, marginTop: 10 },
  metaGrid: { flexDirection: "row", marginTop: 14 },
  metaBox: { flex: 1, backgroundColor: COLORS.primarySoft2, borderRadius: 14, padding: 12, marginRight: 8 },
  metaLabel: { color: COLORS.gray, fontSize: 10, marginTop: 5 },
  metaValue: { color: COLORS.text, fontWeight: "800", fontSize: 12, marginTop: 2 },
  sectionTitle: { color: COLORS.primaryDark, fontSize: 18, fontWeight: "900", marginBottom: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  link: { color: COLORS.primary, fontSize: 12, fontWeight: "800" },
  speciesCard: { flexDirection: "row", backgroundColor: COLORS.white, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 10, marginBottom: 10 },
  speciesImage: { width: 88, height: 88, borderRadius: 14, marginRight: 12 },
  speciesName: { color: COLORS.primaryDark, fontWeight: "900", fontSize: 15 },
  scientific: { color: COLORS.gray, fontStyle: "italic", fontSize: 12, marginTop: 2 },
  mayaRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  maya: { color: COLORS.text, fontSize: 13 },
  audioBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primarySoft, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  origin: { color: COLORS.primary, fontSize: 10, fontWeight: "700", marginTop: 5 },
  productCard: { width: 160, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 12, marginRight: 10 },
  productIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.honeySoft, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  productName: { color: COLORS.primaryDark, fontWeight: "900", fontSize: 13 },
  productPresentation: { color: COLORS.gray, fontSize: 11, marginTop: 3 },
  productAvailability: { color: COLORS.successText, backgroundColor: COLORS.success, alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, fontSize: 9, fontWeight: "800", marginTop: 8 },
  unavailable: { color: COLORS.error, backgroundColor: COLORS.errorSoft },
  pointRow: { flexDirection: "row", alignItems: "center" },
  pointTitle: { color: COLORS.text, fontWeight: "800", fontSize: 13 },
  pointText: { color: COLORS.gray, fontSize: 11, marginTop: 2 },
  smallOutline: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  smallOutlineText: { color: COLORS.primary, fontSize: 10, fontWeight: "800" },
  actions: { flexDirection: "row", marginTop: 2 },
  empty: { color: COLORS.gray, marginBottom: 12 },
});

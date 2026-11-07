import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import RegisterLayout from "../../components/RegisterLayout";
import PrimaryButton from "../../components/PrimaryButton";
import InfoBox from "../../components/InfoBox";
import { useMeliponarioDraft } from "../../context/MeliponarioDraftContext";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../theme/colors";
import { styles } from "./RegisterStep1Screen.styles";

const MAX_IMAGES = 3;

// Lo que ofrece el meliponario. Define el color del marcador
// y permite mostrarlo en el mapa público una vez aprobado.
const OFERTAS = [
  {
    value: "visitas",
    label: "Visitas",
    help: "Recibe visitantes o recorridos.",
    icon: "walk-outline",
  },
  {
    value: "miel",
    label: "Venta de miel",
    help: "Vende miel u otros productos.",
    icon: "flask-outline",
  },
  {
    value: "ambos",
    label: "Ambas",
    help: "Recibe visitas y vende miel.",
    icon: "star-outline",
  },
];

function ofertaDesdeDraft(draft) {
  const miel = Boolean(draft?.ofreceVentaMiel);
  const visitas = Boolean(draft?.ofreceVisitas);

  if (miel && visitas) return "ambos";
  if (miel) return "miel";
  if (visitas) return "visitas";

  return null;
}

function aviso(titulo, mensaje) {
  if (Platform.OS === "web") {
    globalThis.alert?.(`${titulo}\n\n${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

function normalizarFoto(foto) {
  if (typeof foto === "string") {
    const nombre = foto.toLowerCase();

    return {
      uri: foto,
      mimeType:
        nombre.includes("image/png") ||
        nombre.endsWith(".png")
          ? "image/png"
          : nombre.includes("image/webp") ||
              nombre.endsWith(".webp")
            ? "image/webp"
            : "image/jpeg",
    };
  }

  return foto;
}

export default function RegisterStep1Screen({ navigation }) {
  const { draft, updateDraft } = useMeliponarioDraft();
  const { profile, perfil, user } = useAuth();

  const authProfile = profile || perfil || null;

  const responsableNombre = useMemo(() => {
    const nombre =
      authProfile?.nombre?.trim?.() || "";

    const apellidos =
      authProfile?.apellidos?.trim?.() || "";

    const nombreCompleto = `${nombre} ${apellidos}`.trim();

    if (nombreCompleto) return nombreCompleto;

    const metaNombre =
      user?.user_metadata?.nombre || "";

    const metaApellidos =
      user?.user_metadata?.apellidos || "";

    return (
      `${metaNombre} ${metaApellidos}`.trim() ||
      "Usuario"
    );
  }, [authProfile, user]);

  const [nombre, setNombre] = useState(
    draft?.nombre || ""
  );

  const [descripcion, setDescripcion] = useState(
    draft?.descripcion || ""
  );

  const [imagenes, setImagenes] = useState(
    (
      Array.isArray(draft?.imagenes)
        ? draft.imagenes
        : []
    ).map(normalizarFoto)
  );

  const [oferta, setOferta] = useState(
    ofertaDesdeDraft(draft)
  );

  const suggestedName =
    `Meliponario de ${responsableNombre}`;

  const pickImage = async () => {
    if (imagenes.length >= MAX_IMAGES) {
      aviso(
        "Límite alcanzado",
        "Solo puedes seleccionar tres fotografías."
      );
      return;
    }

    try {
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        aviso(
          "Permiso requerido",
          "Se requiere acceso a tus fotografías."
        );
        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.8,
          aspect: [4, 3],
        });

      if (resultado.canceled) return;

      const asset = resultado.assets?.[0];

      if (!asset?.uri) return;

      const nueva = {
        uri: asset.uri,
        mimeType: asset.mimeType || "image/jpeg",
        fileName: asset.fileName || null,
        descripcion: null,
      };

      setImagenes((anteriores) =>
        [...anteriores, nueva].slice(0, MAX_IMAGES)
      );
    } catch (error) {
      aviso(
        "Fotografía",
        error?.message ||
          "No se pudo seleccionar la imagen."
      );
    }
  };

  const removeImage = (index) => {
    const foto = imagenes[index];

    if (foto?.remoteId || foto?.ruta_storage) {
      aviso(
        "Imagen almacenada en Supabase",
        "La eliminación de una fotografía remota requiere la función autorizada del backend. No se quitará solo del formulario."
      );
      return;
    }

    setImagenes((anteriores) =>
      anteriores.filter((_, i) => i !== index)
    );
  };

  const handleNext = () => {
    if (!oferta) {
      aviso(
        "Falta un dato",
        "Elige si el meliponario es para visitas, venta de miel o ambas."
      );
      return;
    }

    updateDraft({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      imagenes,
      responsableNombre,
      ofreceVentaMiel:
        oferta === "miel" || oferta === "ambos",
      ofreceVisitas:
        oferta === "visitas" || oferta === "ambos",
    });

    navigation.navigate("RegisterStep2");
  };

  return (
    <RegisterLayout
      navigation={navigation}
      step={1}
      title="Registrar meliponario"
      subtitle="Información general"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.description}>
          Comienza con los datos básicos del meliponario.
        </Text>

        <Text style={styles.label}>
          Nombre del meliponario
        </Text>

        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Meliponario Xunán Kab"
          placeholderTextColor={COLORS.gray}
          style={styles.input}
        />

        <InfoBox>
          <Text style={styles.infoText}>
            Si lo dejas vacío, KaabMap utilizará:
          </Text>

          <Text style={styles.infoStrong}>
            “{suggestedName}”
          </Text>
        </InfoBox>

        <View style={styles.responsableCard}>
          <Text style={styles.responsableLabel}>
            Responsable
          </Text>

          <Text style={styles.responsableName}>
            {responsableNombre}
          </Text>

          <Text style={styles.responsableHelp}>
            Se obtiene de la cuenta del usuario.
          </Text>
        </View>

        <Text style={styles.label}>
          Descripción corta
        </Text>

        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Cuéntanos sobre el meliponario..."
          placeholderTextColor={COLORS.gray}
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />

        <Text style={styles.label}>
          ¿Para qué es tu meliponario?
        </Text>

        <Text style={styles.helpText}>
          Al ser aprobado, aparecerá en el mapa público
          con esta categoría.
        </Text>

        <View
          style={styles.ofertaList}
          accessibilityRole="radiogroup"
        >
          {OFERTAS.map((opcion) => {
            const activa = oferta === opcion.value;

            return (
              <TouchableOpacity
                key={opcion.value}
                style={[
                  styles.ofertaCard,
                  activa && styles.ofertaCardActive,
                ]}
                onPress={() => setOferta(opcion.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: activa }}
                accessibilityLabel={opcion.label}
              >
                <Ionicons
                  name={opcion.icon}
                  size={22}
                  color={
                    activa
                      ? COLORS.white
                      : COLORS.primaryDark
                  }
                />

                <View style={styles.ofertaTextBox}>
                  <Text
                    style={[
                      styles.ofertaTitle,
                      activa && styles.ofertaTextActive,
                    ]}
                  >
                    {opcion.label}
                  </Text>

                  <Text
                    style={[
                      styles.ofertaHelp,
                      activa && styles.ofertaTextActive,
                    ]}
                  >
                    {opcion.help}
                  </Text>
                </View>

                <Ionicons
                  name={
                    activa
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={20}
                  color={
                    activa
                      ? COLORS.white
                      : COLORS.gray
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>
          Fotos del meliponario
        </Text>

        <Text style={styles.helpText}>
          Puedes seleccionar hasta 3 imágenes.
          Se subirán al guardar el borrador.
          
          Debes cargar al menos 1 imagen.
        </Text>

        <View style={styles.imagesGrid}>
          {Array.from({ length: MAX_IMAGES }).map(
            (_, index) => {
              const foto = imagenes[index];
              const uri = foto?.uri;

              if (uri) {
                return (
                  <View
                    key={index}
                    style={styles.imageCard}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.imagePreview}
                    />

                    <TouchableOpacity
                      style={styles.removeButton}
                      accessibilityLabel={
                        `Quitar fotografía ${index + 1}`
                      }
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.uploadCard}
                  onPress={pickImage}
                >
                  <Ionicons
                    name="image-outline"
                    size={28}
                    color={COLORS.primaryDark}
                  />

                  <Text style={styles.uploadTitle}>
                    Agregar foto
                  </Text>

                  <Text style={styles.uploadSubtitle}>
                    {index + 1} de {MAX_IMAGES}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        <PrimaryButton
          title="Continuar"
          onPress={handleNext}
        />
      </ScrollView>
    </RegisterLayout>
  );
}
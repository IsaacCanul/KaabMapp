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
import { MAX_FOTOS, MIN_FOTOS } from "../../config/fotos";

const MAX_IMAGES = MAX_FOTOS;

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
    // Al editar un aprobado, el responsable es el dueño del meliponario
    // (puede editarlo el trabajador de campo que lo aprobó).
    if (draft?.modoEdicion === "aprobado" && draft?.responsableNombre) {
      return draft.responsableNombre;
    }

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
  }, [authProfile, user, draft?.modoEdicion, draft?.responsableNombre]);

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
        `Puedes agregar hasta ${MAX_IMAGES} fotografías.`
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

  // Descripción breve y opcional de cada foto nueva.
  const describirFoto = (index, texto) => {
    setImagenes((anteriores) =>
      anteriores.map((foto, i) =>
        i === index ? { ...foto, descripcion: texto } : foto
      )
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

    if (imagenes.length < MIN_FOTOS) {
      aviso(
        "Faltan fotografías",
        `Agrega al menos ${MIN_FOTOS} fotografías del meliponario ` +
        `(llevas ${imagenes.length}).`
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
      title={draft?.modoEdicion === "aprobado" ? "Editar meliponario" : "Registrar meliponario"}
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
          Agrega de {MIN_FOTOS} a {MAX_IMAGES} fotografías. A cada una le
          puedes poner una descripción breve (opcional). Se subirán al
          guardar.
        </Text>

        <Text
          style={[
            styles.photoCounter,
            imagenes.length >= MIN_FOTOS && styles.photoCounterOk,
          ]}
        >
          {imagenes.length} de {MAX_IMAGES} fotos
          {imagenes.length < MIN_FOTOS
            ? MIN_FOTOS - imagenes.length === 1
              ? " · falta 1 obligatoria"
              : ` · faltan ${MIN_FOTOS - imagenes.length} obligatorias`
            : " · listo"}
        </Text>

        {/* Una fila por foto: miniatura + descripción opcional. */}
        <View style={styles.photoList}>
          {imagenes.map((foto, index) => {
            const remota = Boolean(foto?.remoteId || foto?.ruta_storage);

            return (
              <View key={`${index}-${foto?.uri}`} style={styles.photoRow}>
                <Image
                  source={{ uri: foto?.uri }}
                  style={styles.photoThumb}
                  accessibilityLabel={`Fotografía ${index + 1}`}
                />

                <View style={styles.photoInfo}>
                  <Text style={styles.photoLabel}>
                    Foto {index + 1}
                    {index < MIN_FOTOS ? " · obligatoria" : ""}
                  </Text>

                  {remota ? (
                    <Text style={styles.photoSaved}>
                      {foto?.descripcion
                        ? foto.descripcion
                        : "Ya guardada, sin descripción."}
                    </Text>
                  ) : (
                    <TextInput
                      value={foto?.descripcion ?? ""}
                      onChangeText={(texto) => describirFoto(index, texto)}
                      placeholder="Descripción breve (opcional)"
                      placeholderTextColor={COLORS.gray}
                      maxLength={120}
                      style={styles.photoInput}
                      accessibilityLabel={`Descripción de la foto ${index + 1}`}
                    />
                  )}
                </View>

                <TouchableOpacity
                  style={styles.photoRemove}
                  accessibilityLabel={`Quitar fotografía ${index + 1}`}
                  onPress={() => removeImage(index)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={20} color="#B42318" />
                </TouchableOpacity>
              </View>
            );
          })}

          {imagenes.length < MAX_IMAGES && (
            <TouchableOpacity
              style={styles.uploadRow}
              onPress={pickImage}
              accessibilityRole="button"
            >
              <Ionicons
                name="add-circle-outline"
                size={26}
                color={COLORS.primaryDark}
              />

              <View>
                <Text style={styles.uploadTitle}>
                  Agregar foto
                </Text>

                <Text style={styles.uploadSubtitle}>
                  {imagenes.length < MIN_FOTOS
                    ? "Obligatoria"
                    : `Opcional · puedes agregar ${MAX_IMAGES - imagenes.length} más`}
                </Text>
              </View>
            </TouchableOpacity>
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
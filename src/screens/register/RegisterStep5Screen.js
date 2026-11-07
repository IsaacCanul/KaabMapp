import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import RegisterLayout
  from "../../components/RegisterLayout";

import {
  useMeliponarioDraft,
} from "../../context/MeliponarioDraftContext";

import {
  guardarBorradorRemoto,
} from "../../services/guardarBorradorRemoto";


const C = {
  dark: "#06492E",
  green: "#075A3D",
  gray: "#747A76",
  white: "#FFFFFF",
  border: "#E6E1D5",
  red: "#B42318",
};


function aviso(title, message) {
  if (Platform.OS === "web") {
    globalThis.alert?.(
      `${title}\n\n${message}`
    );
  } else {
    Alert.alert(title, message);
  }
}


function Dato({
  label,
  value,
}) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>
        {label}
      </Text>

      <Text style={styles.dataValue}>
        {String(value ?? "—") || "—"}
      </Text>
    </View>
  );
}


export default function RegisterStep5Screen({
  navigation,
}) {
  const {
    draft,
    resetDraft,
    updateDraft,
  } = useMeliponarioDraft();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [uploadedCount, setUploadedCount] =
    useState(0);

  const nombreFinal = String(
    draft.nombre ||
    (
      draft.responsableNombre
        ? `Meliponario de ${draft.responsableNombre}`
        : ""
    )
  ).trim();

  const especies =
    Array.isArray(draft.especies)
      ? draft.especies
      : [];

  const fotos =
    Array.isArray(draft.imagenes)
      ? draft.imagenes
      : [];

  const hasCoordinates =
    draft.latitude != null &&
    draft.longitude != null;


  /* =========================================
     GUARDAR BORRADOR Y FOTOGRAFÍAS
  ========================================= */

  const handleGuardarBorrador = async () => {
    if (loading) {
      return;
    }

    if (!draft.autorizacionPublicacion) {
      setError(
        "Para publicar tu meliponario debes autorizar que se muestren " +
        "su ubicación exacta y tu teléfono de contacto."
      );
      return;
    }

    setLoading(true);
    setError("");
    setUploadedCount(0);

    try {
      const formulario = {
        ...draft,
        nombre: nombreFinal,
      };

      await guardarBorradorRemoto(
        formulario,
        {
          onSavedId: (id) => {
            updateDraft({
              meliponarioId: id,
            });
          },

          onPhotosProgress: (imagenes) => {
            updateDraft({
              imagenes,
            });

            setUploadedCount(
              imagenes.filter(
                (foto) =>
                  Boolean(foto?.remoteId)
              ).length
            );
          },
        }
      );

      aviso(
        "Borrador guardado",
        "El meliponario quedó guardado en Supabase. " +
        "Las fotografías seleccionadas se subieron a Storage.\n\n" +
        "Todavía NO se ha enviado a revisión."
      );

      resetDraft();

      navigation.navigate(
        "MyMeliponarios"
      );
    } catch (err) {
      /*
       * NO limpiar el formulario.
       *
       * Si el backend ya devolvió el ID,
       * queda guardado en el contexto para
       * que se pueda reintentar sin crear
       * un segundo meliponario.
       */
      setError(
        err?.message ??
        "No se pudo guardar el borrador o subir las fotografías."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <RegisterLayout
      navigation={navigation}
      step={4}
      title="Registrar meliponario"
      subtitle="Confirmar borrador"
    >
      <Text style={styles.intro}>
        Revisa tus datos. Puedes guardarlos
        como borrador y modificarlos antes
        de enviarlos a revisión.
      </Text>

      {/* INFORMACIÓN GENERAL */}

      <View style={styles.card}>
        <Text style={styles.section}>
          Información general
        </Text>

        <Dato
          label="Nombre"
          value={nombreFinal}
        />

        <Dato
          label="Responsable"
          value={draft.responsableNombre}
        />

        <Dato
          label="Descripción"
          value={draft.descripcion}
        />

        <Dato
          label="Ofrece"
          value={
            draft.ofreceVentaMiel && draft.ofreceVisitas
              ? "Visitas y venta de miel"
              : draft.ofreceVentaMiel
                ? "Venta de miel"
                : draft.ofreceVisitas
                  ? "Visitas"
                  : "Sin elegir"
          }
        />

        <Dato
          label="Fotografías"
          value={`${fotos.length} de 3`}
        />
      </View>

      {/* UBICACIÓN */}

      <View style={styles.card}>
        <Text style={styles.section}>
          Ubicación
        </Text>

        <Dato
          label="Municipio"
          value={draft.municipio}
        />

        <Dato
          label="Localidad"
          value={draft.localidad}
        />

        <Dato
          label="Coordenadas"
          value={
            hasCoordinates
              ? `${Number(
                  draft.latitude
                ).toFixed(6)}, ${Number(
                  draft.longitude
                ).toFixed(6)}`
              : "Sin seleccionar"
          }
        />
      </View>

      {/* ESPECIES */}

      <View style={styles.card}>
        <Text style={styles.section}>
          Especies y alojamientos
        </Text>

        {especies.length === 0 ? (
          <Text style={styles.muted}>
            No hay especies declaradas.
          </Text>
        ) : (
          especies.map((item, i) => (
            <View
              key={String(
                item.especieId ??
                item.id ??
                i
              )}
              style={styles.species}
            >
              <Text style={styles.speciesName}>
                {item.nombre ??
                  item.cientifico ??
                  "Especie"}
              </Text>

              <Text style={styles.muted}>
                Cajas tecnificadas:{" "}
                {Number(
                  item.cajasTecnificadas ??
                  item.cantidad_cajas ??
                  0
                )}

                {" · "}

                Jobones:{" "}
                {Number(
                  item.jobones ??
                  item.cantidad_jobones ??
                  0
                )}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* INFORMACIÓN DE SUBIDA */}

      <View style={styles.info}>
        <Ionicons
          name="cloud-upload-outline"
          size={23}
          color={C.green}
        />

        <Text style={styles.infoText}>
          Las fotografías se subirán
          directamente a Supabase Storage.

          {"\n\n"}

          Necesitas conexión a Internet.
          El borrador no se enviará
          automáticamente a revisión.
        </Text>
      </View>

      {/* AUTORIZACIÓN DE PUBLICACIÓN */}

      <TouchableOpacity
        style={[
          styles.consent,
          draft.autorizacionPublicacion &&
            styles.consentActive,
        ]}
        onPress={() => {
          updateDraft({
            autorizacionPublicacion:
              !draft.autorizacionPublicacion,
          });
          setError("");
        }}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: Boolean(
            draft.autorizacionPublicacion
          ),
        }}
      >
        <Ionicons
          name={
            draft.autorizacionPublicacion
              ? "checkbox"
              : "square-outline"
          }
          size={26}
          color={C.green}
        />

        <View style={styles.consentTextBox}>
          <Text style={styles.consentTitle}>
            Autorizo publicar mi meliponario
          </Text>

          <Text style={styles.consentText}>
            Al ser aprobado, cualquier persona, con o
            sin cuenta, podrá ver su ubicación exacta
            en el mapa y mi número de teléfono de
            contacto.
          </Text>
        </View>
      </TouchableOpacity>

      {loading && fotos.length > 0 && (
        <Text style={styles.progressText}>
          Fotografías confirmadas:{" "}
          {uploadedCount} de {fotos.length}
        </Text>
      )}

      {/* ERROR */}

      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={C.red}
          />

          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      {/* BOTÓN */}

      <TouchableOpacity
        style={[
          styles.button,
          loading && {
            opacity: 0.6,
          },
        ]}
        disabled={loading}
        onPress={handleGuardarBorrador}
      >
        {loading ? (
          <ActivityIndicator
            color={C.white}
          />
        ) : (
          <Ionicons
            name="save-outline"
            size={22}
            color={C.white}
          />
        )}

        <Text style={styles.buttonText}>
          {loading
            ? "Guardando en Supabase..."
            : "Guardar borrador"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Después podrás seleccionar
        «Enviar a revisión» desde
        Mis registros.
      </Text>
    </RegisterLayout>
  );
}


const styles = StyleSheet.create({
  consent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 20,
    backgroundColor: C.white,
    padding: 16,
    marginBottom: 16,
  },

  consentActive: {
    borderColor: C.green,
    backgroundColor: "#EEF5EF",
  },

  consentTextBox: {
    flex: 1,
  },

  consentTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: C.dark,
  },

  consentText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: C.gray,
  },

  intro: {
    color: C.gray,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 18,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    padding: 18,
    marginBottom: 14,
  },

  section: {
    fontSize: 18,
    fontWeight: "900",
    color: C.dark,
    marginBottom: 8,
  },

  dataRow: {
    paddingVertical: 9,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  dataLabel: {
    flex: 0.44,
    color: C.gray,
    fontSize: 12,
  },

  dataValue: {
    flex: 0.56,
    color: C.dark,
    fontSize: 13,
    fontWeight: "700",
  },

  species: {
    paddingVertical: 9,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderColor: C.border,
  },

  speciesName: {
    color: C.dark,
    fontSize: 15,
    fontWeight: "800",
  },

  muted: {
    color: C.gray,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  info: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#EEF6EF",
    padding: 16,
    marginBottom: 15,
  },

  infoText: {
    flex: 1,
    color: "#496253",
    fontSize: 13,
    lineHeight: 20,
  },

  errorBox: {
    flexDirection: "row",
    backgroundColor: "#FFF0F0",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },

  errorText: {
    flex: 1,
    color: C.red,
    fontSize: 13,
    lineHeight: 20,
  },

  progressText: {
    color: C.green,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
  },

  button: {
    backgroundColor: C.green,
    minHeight: 60,
    borderRadius: 16,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: C.white,
    fontSize: 17,
    fontWeight: "900",
  },

  note: {
    color: C.gray,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    paddingVertical: 14,
  },
});
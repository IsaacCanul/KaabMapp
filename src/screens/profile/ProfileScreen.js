
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useFocusEffect,
} from "@react-navigation/native";

import * as ImagePicker
  from "expo-image-picker";

import * as ImageManipulator
  from "expo-image-manipulator";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  getMyProfileRequest,
  updateMyProfileRequest,
} from "../../services/profileApi";

import {
  getStoredProfilePhoto,
  saveProfilePhoto,
} from "../../services/profilePhotoStorage";

import {
  styles,
} from "./ProfileScreen.styles";

import {
  COLORS,
} from "../../theme/colors";


/* =========================================
   CONFIGURACIÓN DE ROLES
========================================= */

const ROL_TRABAJADOR_CAMPO = 4;


/* =========================================
   PERFIL VACÍO
========================================= */

const EMPTY_PROFILE = {
  nombre: "",
  apellidos: "",
  correo: "",
  telefono: "",
  ubicacion: "",
  foto: null,
};


/* =========================================
   MOSTRAR AVISOS
========================================= */

function aviso(titulo, mensaje) {
  if (Platform.OS === "web") {
    globalThis.alert?.(
      `${titulo}\n\n${mensaje}`
    );
  } else {
    Alert.alert(titulo, mensaje);
  }
}


/* =========================================
   MOSTRAR CONFIRMACIÓN
========================================= */

function confirmar(titulo, mensaje) {
  if (Platform.OS === "web") {
    return Promise.resolve(
      Boolean(
        globalThis.confirm?.(
          `${titulo}\n\n${mensaje}`
        )
      )
    );
  }

  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => resolve(false),
      }
    );
  });
}


/* =========================================
   IDENTIFICAR TRABAJADOR
========================================= */

function esRolTrabajador(rolId, rolNombre) {
  if (Number(rolId) === ROL_TRABAJADOR_CAMPO) {
    return true;
  }

  const nombre = String(
    rolNombre ?? ""
  )
    .toLowerCase()
    .trim()
    .replace(/_/g, " ");

  return [
    "trabajador",
    "trabajador de campo",
    "field worker",
  ].includes(nombre);
}


/* =========================================
   PANTALLA PERFIL
========================================= */

export default function ProfileScreen({
  navigation,
}) {
  const {
    user,
    perfil,
    profile: perfilContexto,
    logout,
    refreshProfile,
  } = useAuth();

  const [profile, setProfile] = useState(
    EMPTY_PROFILE
  );

  const [
    originalProfile,
    setOriginalProfile,
  ] = useState(
    EMPTY_PROFILE
  );

  const [
    rolServidor,
    setRolServidor,
  ] = useState(null);

  const [
    nombreRolServidor,
    setNombreRolServidor,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [isEditing, setIsEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [error, setError] =
    useState("");


  /* =========================================
     DETECTAR ROL REAL
  ========================================= */

  const rolId =
    perfil?.rol_id ??
    perfilContexto?.rol_id ??
    rolServidor ??
    user?.app_metadata?.rol_id ??
    null;

  const rolNombre =
    perfil?.rol?.nombre ??
    perfil?.rol_nombre ??
    perfilContexto?.rol?.nombre ??
    perfilContexto?.rol_nombre ??
    nombreRolServidor ??
    "";

  const isFieldWorker = esRolTrabajador(
    rolId,
    rolNombre
  );


  /* =========================================
     CARGAR PERFIL
  ========================================= */

  const loadProfile = useCallback(
    async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          serverProfile,
          storedPhoto,
        ] = await Promise.all([
          getMyProfileRequest(),
          getStoredProfilePhoto(user.id),
        ]);

        const loaded = {
          nombre:
            serverProfile?.nombre ?? "",

          apellidos:
            serverProfile?.apellidos ?? "",

          correo:
            serverProfile?.correo ??
            user?.email ??
            "",

          telefono:
            serverProfile?.telefono ?? "",

          ubicacion:
            serverProfile?.ubicacion ?? "",

          foto:
            storedPhoto ?? null,
        };

        setProfile(loaded);
        setOriginalProfile(loaded);

        // Respaldo del rol cuando todavía
        // no se encuentra en AuthContext.
        setRolServidor(
          serverProfile?.rol_id ??
          serverProfile?.role_id ??
          serverProfile?.rol?.id ??
          null
        );

        setNombreRolServidor(
          serverProfile?.rol?.nombre ??
          serverProfile?.rol_nombre ??
          ""
        );

      } catch (err) {
        console.error(
          "ERROR CARGANDO PERFIL:",
          err
        );

        setError(
          err?.message ??
          "No se pudo cargar tu perfil."
        );
      } finally {
        setLoading(false);
      }
    },
    [user?.id, user?.email]
  );


  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );


  /* =========================================
     NOMBRE COMPLETO
  ========================================= */

  const fullName = useMemo(
    () =>
      [
        profile.nombre,
        profile.apellidos,
      ]
        .filter(Boolean)
        .join(" "),
    [
      profile.nombre,
      profile.apellidos,
    ]
  );


  /* =========================================
     CAMBIAR DATOS
  ========================================= */

  const handleChange = (key, value) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };


  /* =========================================
     FOTO DE PERFIL
  ========================================= */

  const handlePickImage = async () => {
    if (
      !user?.id ||
      uploadingPhoto
    ) {
      return;
    }

    try {
      setUploadingPhoto(true);

      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          aviso(
            "Permiso requerido",
            "Necesitamos permiso para acceder a tus fotografías."
          );

          return;
        }
      }

      const result =
        await ImagePicker
          .launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.75,
          });

      if (
        result.canceled ||
        !result.assets?.length
      ) {
        return;
      }

      const asset = result.assets[0];

      const processed =
        await ImageManipulator.manipulateAsync(
          asset.uri,
          [
            {
              resize: {
                width: 512,
                height: 512,
              },
            },
          ],
          {
            compress: 0.7,
            format:
              ImageManipulator.SaveFormat.JPEG,
            base64: Platform.OS === "web",
          }
        );

      const persistentPhoto =
        await saveProfilePhoto(
          user.id,
          {
            uri: processed.uri,
            base64:
              processed.base64 ?? null,
            mimeType: "image/jpeg",
          }
        );

      setProfile((current) => ({
        ...current,
        foto: persistentPhoto,
      }));

      setOriginalProfile((current) => ({
        ...current,
        foto: persistentPhoto,
      }));

      aviso(
        "Foto actualizada",
        "Tu foto de perfil quedó guardada."
      );
    } catch (err) {
      console.error(
        "ERROR FOTO PERFIL:",
        err
      );

      aviso(
        "Error",
        err?.message ??
        "No se pudo guardar la fotografía."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };


  /* =========================================
     ACTIVAR EDICIÓN
  ========================================= */

  const handleToggleEdit = () => {
    setError("");
    setIsEditing(true);
  };


  /* =========================================
     CANCELAR EDICIÓN
  ========================================= */

  const handleCancel = () => {
    setProfile(originalProfile);
    setError("");
    setIsEditing(false);
  };


  /* =========================================
     GUARDAR PERFIL
  ========================================= */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result =
        await updateMyProfileRequest({
          nombre:
            profile.nombre,

          apellidos:
            profile.apellidos,

          correo:
            profile.correo,

          telefono:
            profile.telefono,

          ubicacion:
            profile.ubicacion,
        });

      const updated = {
        ...profile,

        nombre:
          result.nombre ??
          profile.nombre,

        apellidos:
          result.apellidos ??
          profile.apellidos,

        telefono:
          result.telefono ??
          profile.telefono,

        correo:
          result.correo ??
          profile.correo,

        ubicacion:
          result.ubicacion ??
          profile.ubicacion,
      };

      setProfile(updated);
      setOriginalProfile(updated);

      if (
        typeof refreshProfile === "function"
      ) {
        await refreshProfile();
      }

      setIsEditing(false);

      aviso(
        "Perfil actualizado",
        result.emailChanged
          ? "Tus datos se guardaron. Revisa tu correo para confirmar el cambio."
          : "Tus datos se guardaron correctamente."
      );
    } catch (err) {
      console.error(
        "ERROR GUARDANDO PERFIL:",
        err
      );

      setError(
        err?.message ??
        "No se pudieron guardar los cambios."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =========================================
     IR A MIS INSPECCIONES
  ========================================= */

  const irAMisInspecciones = () => {
    const tabs = navigation.getParent();

    const rutas =
      tabs?.getState?.()?.routeNames ?? [];

    if (
      rutas.includes("Mis inspecciones")
    ) {
      tabs.navigate("Mis inspecciones");
    } else {
      aviso(
        "Navegación",
        "No se encontró la pestaña Mis inspecciones."
      );
    }
  };


  /* =========================================
     IR A MIS MELIPONARIOS
  ========================================= */

  const irAMisMeliponarios = () => {
    if (isFieldWorker) {
      return;
    }

    navigation.getParent()?.navigate(
      "Mis registros",
      {
        screen: "MyMeliponarios",
      }
    );
  };


  /* =========================================
     CERRAR SESIÓN
  ========================================= */

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    const ok = await confirmar(
      "Cerrar sesión",
      "¿Deseas cerrar tu sesión?"
    );

    if (!ok) {
      return;
    }

    try {
      setLoggingOut(true);
      await logout();
    } catch (err) {
      console.error(
        "ERROR CERRANDO SESIÓN:",
        err
      );

      aviso(
        "Error",
        "No se pudo cerrar la sesión."
      );
    } finally {
      setLoggingOut(false);
    }
  };


  /* =========================================
     RENDERIZAR CAMPOS
  ========================================= */

  const renderField = ({
    label,
    value,
    keyName,
    keyboardType = "default",
    autoCapitalize = "sentences",
    editable = true,
  }) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      {isEditing && editable ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) =>
            handleChange(keyName, text)
          }
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholder={
            `Ingresa ${label.toLowerCase()}`
          }
          placeholderTextColor={
            COLORS.gray
          }
        />
      ) : (
        <Text style={styles.fieldValue}>
          {value || "—"}
        </Text>
      )}
    </View>
  );


  /* =========================================
     CARGANDO
  ========================================= */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingScreen}
        edges={["top"]}
      >
        <ActivityIndicator
          size="large"
          color={COLORS.primaryDark}
        />

        <Text style={styles.loadingText}>
          Cargando perfil...
        </Text>
      </SafeAreaView>
    );
  }


  /* =========================================
     PANTALLA
  ========================================= */

  return (
    // El área segura evita que el contenido quede debajo de la
    // barra de estado del teléfono (hora, batería, notch).
    <SafeAreaView
      style={styles.screen}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ===================================
            CABECERA DEL PERFIL
        =================================== */}

        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={handlePickImage}
              disabled={uploadingPhoto}
              activeOpacity={0.85}
            >
              {profile.foto ? (
                <Image
                  source={{
                    uri: profile.foto,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={
                    styles.avatarPlaceholder
                  }
                >
                  <Text style={styles.initials}>
                    {(
                      profile.nombre?.[0] ??
                      ""
                    ).toUpperCase()}

                    {(
                      profile.apellidos?.[0] ??
                      ""
                    ).toUpperCase()}
                  </Text>
                </View>
              )}

              <View
                style={
                  styles.avatarEditBadge
                }
              >
                {uploadingPhoto ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={16}
                    color={COLORS.white}
                  />
                )}
              </View>
            </TouchableOpacity>

            <View
              style={styles.headerTextWrap}
            >
              <Text style={styles.nameText}>
                {fullName ||
                  "Sin nombre"}
              </Text>

              <Text
                style={styles.subtitleText}
              >
                {profile.ubicacion ||
                  "Yucatán"}
              </Text>

              {/* TIPO DE CUENTA */}

              {isFieldWorker && (
                <Text
                  style={{
                    color: "#075A3D",
                    fontSize: 12,
                    fontWeight: "800",
                    marginTop: 6,
                  }}
                >
                  Trabajador de campo
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.photoButton,
              uploadingPhoto &&
                styles.buttonDisabled,
            ]}
            onPress={handlePickImage}
            disabled={uploadingPhoto}
            activeOpacity={0.85}
          >
            <Ionicons
              name="image-outline"
              size={18}
              color={
                COLORS.primaryDark
              }
            />

            <Text
              style={
                styles.photoButtonText
              }
            >
              {uploadingPhoto
                ? "Guardando foto..."
                : profile.foto
                  ? "Cambiar foto de perfil"
                  : "Subir foto de perfil"}
            </Text>
          </TouchableOpacity>
        </View>


        {/* ===================================
            ERRORES
        =================================== */}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#B42318"
            />

            <Text
              style={styles.errorText}
            >
              {error}
            </Text>
          </View>
        )}


        {/* ===================================
            DATOS PERSONALES
        =================================== */}

        <View style={styles.infoCard}>
          {renderField({
            label: "Nombre",
            value: profile.nombre,
            keyName: "nombre",
          })}

          {renderField({
            label: "Apellidos",
            value: profile.apellidos,
            keyName: "apellidos",
          })}

          {renderField({
            label: "Correo",
            value: profile.correo,
            keyName: "correo",
            keyboardType:
              "email-address",
            autoCapitalize: "none",
          })}

          {renderField({
            label: "Teléfono",
            value: profile.telefono,
            keyName: "telefono",
            keyboardType:
              "phone-pad",
          })}

          {renderField({
            label: "Ubicación",
            value: profile.ubicacion,
            keyName: "ubicacion",
          })}
        </View>


        {/* ===================================
            EDITAR PERFIL
        =================================== */}

        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={
              handleToggleEdit
            }
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={
                COLORS.primaryDark
              }
            />

            <Text
              style={
                styles.editButtonText
              }
            >
              Editar perfil
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={
              styles.editActionsRow
            }
          >
            <TouchableOpacity
              style={
                styles.cancelButton
              }
              onPress={handleCancel}
              disabled={saving}
            >
              <Text
                style={
                  styles.cancelButtonText
                }
              >
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator
                  color={
                    COLORS.white
                  }
                />
              ) : (
                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Guardar cambios
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}


        {/* ===================================
            HERRAMIENTAS SEGÚN EL ROL
        =================================== */}

        {isFieldWorker ? (
          <>
            {/* SOLO TRABAJADOR DE CAMPO */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Herramientas de trabajador de campo
            </Text>

            <View
              style={styles.toolsCard}
            >
              <TouchableOpacity
                style={
                  styles.toolRow
                }
                onPress={
                  irAMisInspecciones
                }
              >
                <View
                  style={
                    styles.toolIconBox
                  }
                >
                  <Ionicons
                    name="clipboard-outline"
                    size={22}
                    color={
                      COLORS.primaryDark
                    }
                  />
                </View>

                <View
                  style={
                    styles.toolTextWrap
                  }
                >
                  <Text
                    style={
                      styles.toolTitle
                    }
                  >
                    Mis inspecciones
                  </Text>

                  <Text
                    style={
                      styles.toolSubtitle
                    }
                  >
                    Consultar visitas técnicas asignadas
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={
                    COLORS.primaryDark
                  }
                />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* HERRAMIENTAS DEL PRODUCTOR */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Herramientas de productor
            </Text>

            <View
              style={styles.toolsCard}
            >
              {/* MIS MELIPONARIOS */}

              <TouchableOpacity
                style={
                  styles.toolRow
                }
                onPress={
                  irAMisMeliponarios
                }
              >
                <View
                  style={
                    styles.toolIconBox
                  }
                >
                  <Ionicons
                    name="home-outline"
                    size={22}
                    color={
                      COLORS.primaryDark
                    }
                  />
                </View>

                <View
                  style={
                    styles.toolTextWrap
                  }
                >
                  <Text
                    style={
                      styles.toolTitle
                    }
                  >
                    Mis meliponarios
                  </Text>

                  <Text
                    style={
                      styles.toolSubtitle
                    }
                  >
                    Ver y administrar registros
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={
                    COLORS.primaryDark
                  }
                />
              </TouchableOpacity>


              {/* ADMINISTRAR PRODUCTOS */}

              <TouchableOpacity
                style={
                  styles.toolRow
                }
                onPress={() =>
                  navigation.navigate(
                    "Products"
                  )
                }
              >
                <View
                  style={
                    styles.toolIconBox
                  }
                >
                  <Ionicons
                    name="cube-outline"
                    size={22}
                    color={
                      COLORS.primaryDark
                    }
                  />
                </View>

                <View
                  style={
                    styles.toolTextWrap
                  }
                >
                  <Text
                    style={
                      styles.toolTitle
                    }
                  >
                    Administrar productos
                  </Text>

                  <Text
                    style={
                      styles.toolSubtitle
                    }
                  >
                    Gestiona tus productos
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={
                    COLORS.primaryDark
                  }
                />
              </TouchableOpacity>
            </View>
          </>
        )}


        {/* ===================================
            CERRAR SESIÓN
        =================================== */}

        <TouchableOpacity
          style={[
            styles.logoutButton,
            loggingOut &&
              styles.buttonDisabled,
          ]}
          onPress={
            handleLogout
          }
          disabled={
            loggingOut
          }
        >
          {loggingOut ? (
            <ActivityIndicator
              color="#C83A2A"
            />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#C83A2A"
              />

              <Text
                style={
                  styles.logoutText
                }
              >
                Cerrar sesión
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

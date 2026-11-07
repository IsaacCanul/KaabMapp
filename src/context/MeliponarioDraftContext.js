import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const Context = createContext(null);

const initialDraft = () => ({
  meliponarioId: null,
  localJobId: null,

  nombre: "",
  descripcion: "",
  responsableNombre: "",
  imagenes: [],

  municipioId: null,
  municipio: "",
  localidadId: null,
  localidad: "",

  latitude: null,
  longitude: null,
  locationAccuracy: null,
  locationSource: null,

  especies: [],

  referenciaUbicacion: "",
  observacionesCliente: "",

  // Consentimiento para publicar ubicación exacta y teléfono.
  autorizacionPublicacion: false,
  autorizacionUbicacionExacta: false,
  ofreceVentaMiel: false,
  ofreceVisitas: false,
});

export function MeliponarioDraftProvider({
  children,
}) {
  const [draft, setDraft] = useState(initialDraft);

  const value = useMemo(
    () => ({
      draft,

      updateDraft: (patch) => {
        setDraft((old) => ({
          ...old,
          ...patch,
        }));
      },

      replaceDraft: (data) => {
        setDraft({
          ...initialDraft(),
          ...data,
        });
      },

      resetDraft: () => {
        setDraft(initialDraft());
      },
    }),
    [draft]
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export function useMeliponarioDraft() {
  const ctx = useContext(Context);

  if (!ctx) {
    throw new Error(
      "useMeliponarioDraft debe usarse dentro de MeliponarioDraftProvider."
    );
  }

  return ctx;
}
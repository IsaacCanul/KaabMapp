import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const initialDraft = {
  // PASO 1 - Información general
  nombre: "",
  responsable: "",
  descripcion: "",

  // PASO 2 - Ubicación
  municipio: "",
  localidad: "",

  latitude: null,
  longitude: null,

  temperatura: "25–28 °C",

  // PASO 3 - Especies
  especies: [],

  // PASO 4 - Servicios / venta
  tipoOferta: "",

  vendeMiel: false,

  visitable: false,

  vendeProductosColmena: false,

  categoriasProducto: [],

  // Punto de venta
  puntoVentaEnMeliponario: true,

  puntoVentaNombre: "",

  puntoVentaDireccion: "",

  puntoVenta: null,
};

const MeliponarioDraftContext =
  createContext(null);

export function MeliponarioDraftProvider({
  children,
}) {
  const [draft, setDraft] =
    useState(initialDraft);

  // Actualiza solamente las propiedades
  // que recibe.
  const updateDraft = (partial) => {
    setDraft((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  // Limpia todo el formulario.
  const resetDraft = () => {
    setDraft({
      ...initialDraft,

      especies: [],

      categoriasProducto: [],
    });
  };

  const value = useMemo(
    () => ({
      draft,
      updateDraft,
      resetDraft,
    }),
    [draft]
  );

  return (
    <MeliponarioDraftContext.Provider
      value={value}
    >
      {children}
    </MeliponarioDraftContext.Provider>
  );
}

export function useMeliponarioDraft() {
  const context =
    useContext(MeliponarioDraftContext);

  if (!context) {
    throw new Error(
      "useMeliponarioDraft debe usarse dentro de MeliponarioDraftProvider"
    );
  }

  return context;
}
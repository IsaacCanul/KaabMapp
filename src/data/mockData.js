// Datos de respaldo para desarrollar sin API.
// Los campos coinciden con el modelo mostrado por el panel web del proyecto.
export const mockMeliponarios = [
  {
    id: 1,
    nombre: "Meliponario Valladolid",
    municipio: "Valladolid",
    localidad: "Valladolid",
    descripcion: "Meliponario de demostración dedicado a la conservación de abejas nativas sin aguijón.",
    referenciaUbicacion: "Zona urbana de Valladolid, Yucatán",
    latitude: 20.6896,
    longitude: -88.2018,
    tipoOferta: "visitas",
    estado: "Activo",
    especies: ["Melipona beecheii"],
    productosDisponibles: [],
  },
  {
    id: 2,
    nombre: "Meliponario Mérida",
    municipio: "Mérida",
    localidad: "Mérida",
    descripcion: "Registro de demostración con disponibilidad de miel de melipona.",
    referenciaUbicacion: "Referencia pendiente de validar",
    latitude: 20.9671,
    longitude: -89.6237,
    tipoOferta: "miel",
    estado: "Activo",
    especies: ["Melipona beecheii", "Scaptotrigona pectoralis"],
    productosDisponibles: ["Miel de melipona"],
  },
  {
    id: 3,
    nombre: "Meliponario Izamal",
    municipio: "Izamal",
    localidad: "Centro",
    descripcion: "Meliponario con venta de miel y actividades de difusión.",
    referenciaUbicacion: "Centro de Izamal, Yucatán",
    latitude: 20.9314,
    longitude: -89.0189,
    tipoOferta: "ambos",
    estado: "Activo",
    especies: ["Melipona beecheii", "Nannotrigona perilampoides"],
    productosDisponibles: ["Miel de melipona", "Propóleo"],
  },
];

// Alias para pantallas antiguas que todavía importan MELIPONARIOS.
export const MELIPONARIOS = mockMeliponarios;

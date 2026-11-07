// Datos temporales para desarrollo sin API.
// Estos campos deben mantener la misma forma que después entregará el backend.

export const mockMeliponarios = [
  {
    id: 1,

    nombre: "Meliponario Valladolid",
    municipio: "Valladolid",
    localidad: "Valladolid",

    descripcion:
      "Meliponario dedicado a la conservación y difusión de las abejas nativas sin aguijón de Yucatán.",

    referenciaUbicacion:
      "Zona urbana de Valladolid, Yucatán",

    latitude: 20.6896,
    longitude: -88.2018,

    estado: "Activo",
    tipoOferta: "visitas",

    responsable: {
      nombre: "Responsable del meliponario",
      descripcion: "Meliponicultor de Valladolid",
    },

    especies: [
      {
        nombre: "Melipona beecheii",
        nombreMaya: "Xunáan kaab",
        cajasTecnificadas: 8,
        jobones: 4,
      },
    ],

    productosDisponibles: [],

    puntoVenta: null,
  },

  {
    id: 2,

    nombre: "Meliponario Mérida",
    municipio: "Mérida",
    localidad: "Mérida",

    descripcion:
      "Meliponario de demostración dedicado al manejo de abejas nativas y a la producción responsable de miel de melipona.",

    referenciaUbicacion:
      "Referencia pendiente de validar",

    latitude: 20.9671,
    longitude: -89.6237,

    estado: "Activo",
    tipoOferta: "miel",

    responsable: {
      nombre: "Responsable del meliponario",
      descripcion: "Meliponicultor de Mérida",
    },

    especies: [
      {
        nombre: "Melipona beecheii",
        nombreMaya: "Xunáan kaab",
        cajasTecnificadas: 12,
        jobones: 5,
      },
      {
        nombre: "Scaptotrigona pectoralis",
        nombreMaya: null,
        cajasTecnificadas: 6,
        jobones: 2,
      },
    ],

    productosDisponibles: [
      {
        id: 1,
        nombre: "Miel de melipona",
        presentacion: "Frasco",
      },
    ],

    puntoVenta: {
      nombre: "Punto de venta Mérida",
      direccion: "Mérida, Yucatán",
      latitude: 20.9671,
      longitude: -89.6237,
    },
  },

  {
    id: 3,

    nombre: "Meliponario Izamal",
    municipio: "Izamal",
    localidad: "Centro",

    descripcion:
      "Meliponario dedicado a la conservación de las abejas nativas sin aguijón, la difusión de la meliponicultura y la elaboración responsable de productos de la colmena.",

    referenciaUbicacion:
      "Centro de Izamal, Yucatán",

    latitude: 20.9314,
    longitude: -89.0189,

    estado: "Activo",
    tipoOferta: "ambos",

    responsable: {
      nombre: "Responsable del meliponario",
      descripcion: "Meliponicultor de Izamal",
    },

    especies: [
      {
        nombre: "Melipona beecheii",
        nombreMaya: "Xunáan kaab",
        cajasTecnificadas: 24,
        jobones: 12,
      },
      {
        nombre: "Nannotrigona perilampoides",
        nombreMaya: null,
        cajasTecnificadas: 8,
        jobones: 4,
      },
    ],

    productosDisponibles: [
      {
        id: 1,
        nombre: "Miel de melipona",
        presentacion: "Frasco",
      },
      {
        id: 2,
        nombre: "Propóleo",
        presentacion: "Presentación informativa",
      },
      {
        id: 3,
        nombre: "Cera de la colmena",
        presentacion: "Presentación informativa",
      },
    ],

    // Ubicación comercial distinta del meliponario.
    puntoVenta: {
      nombre: "Meliponario Izamal",
      direccion:
        "Centro de Izamal, Yucatán",
      latitude: 20.9314,
      longitude: -89.0189,
    },
  },
];

export const MELIPONARIOS =
  mockMeliponarios;
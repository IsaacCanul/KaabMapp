export const registrarUsuario = async (
  usuario
) => {
  console.log(
    "Datos recibidos por authService:",
    usuario
  );

  return {
    ok: true,

    usuario: {
      id: 1,
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
    },
  };
};

export const validarEmail = (email) => {
  const emailLimpio = email.trim();

  if (emailLimpio === "") {
    return "Debes escribir tu correo";
  }

  if (!emailLimpio.includes("@")) {
    return "El correo debe contener un @";
  }

  const partesEmail =
    emailLimpio.split("@");

  if (partesEmail.length !== 2) {
    return "El correo debe contener solo un @";
  }

  const userEmail =
    partesEmail[0];

  const domainEmail =
    partesEmail[1];

  if (
    userEmail === "" ||
    domainEmail === ""
  ) {
    return "Debes ingresar un correo válido";
  }

  if (!domainEmail.includes(".")) {
    return "El dominio debe contener un punto";
  }

  if (
    domainEmail.startsWith(".") ||
    domainEmail.endsWith(".")
  ) {
    return "El dominio del correo no es válido";
  }

  return "";
};

export const validarPassword = (password) => {
  if (password.trim() === "") {
    return "Debes escribir tu contraseña";
  }

  if (password.length < 6) {
    return "Tu contraseña debe contener al menos 6 caracteres";
  }

  return "";
};

export const validarNombre = (nombre) => {
  const nombreLimpio = nombre.trim();

  if (nombreLimpio === ""){
    return "Debes escribir tu nombre";
  }

  if (nombreLimpio.length < 3){
    return "El nombre debe contener al menos 3 caracteres";
  }

  return "";
}

export const validarApellido = (apellido) => {
  const apellidoLimpio = apellido.trim();

  if (apellidoLimpio === ""){
    return "Debes escribir tu apellido";
  }

  if (apellidoLimpio.length < 3){
    return "El apellido debe contener al menos 3 caracteres";
  }

  return "";
}

export const validarTelefono = (telefono) => {
  const telefonoLimpio = telefono.trim();

  if (telefonoLimpio === "") {
    return "Debes escribir tu teléfono";
  }

  const soloNumeros = /^\d+$/.test(telefonoLimpio);

  if (!soloNumeros) {
    return "El teléfono solo debe contener números";
  }

  if (telefonoLimpio.length !== 10) {
    return "El teléfono debe contener 10 dígitos";
  }

  return "";
};

export const validarConfirmPass = (password, confirmPassword) =>{

  if (confirmPassword.trim() === ""){
    return "Ingresa la contraseña";
  }

  if (confirmPassword !== password){
    return "Las contraseñas no coiciden";
  }

  return "";
}

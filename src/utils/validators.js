export const validarEmail = (
  email
) => {
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

export const validarPassword = (
  password
) => {
  const passwordLimpio =
    password.trim();

  if (passwordLimpio === "") {
    return "Debes escribir tu contraseña";
  }

  if (passwordLimpio.length < 6) {
    return "Tu contraseña debe contener al menos 6 caracteres";
  }

  return "";
};
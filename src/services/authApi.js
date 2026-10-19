import { API_CONFIG } from "../config/apiConfig";
import { apiRequest } from "./apiClient";

// IMPORTANTE:
// Si la API de tu compañero usa nombres diferentes, cambia SOLO estos mapeos.
function mapLoginBody({ email, password }) {
  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

function mapRegisterBody(values) {
  return {
    name: values.nombre.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.telefono.trim() || null,
    password: values.password,
    institution: values.institucionEmpresa.trim() || null,
    user_type: values.tipoUsuario,
  };
}

function unwrap(payload) {
  return payload?.data ?? payload ?? {};
}

export function normalizeAuthResponse(payload) {
  const data = unwrap(payload);
  const session = data?.session ?? payload?.session ?? null;
  const user = data?.user ?? session?.user ?? payload?.user ?? null;

  const accessToken =
    data?.access_token ??
    data?.accessToken ??
    data?.token ??
    session?.access_token ??
    session?.accessToken ??
    null;

  const refreshToken =
    data?.refresh_token ??
    data?.refreshToken ??
    session?.refresh_token ??
    session?.refreshToken ??
    null;

  const requiresVerification = Boolean(
    data?.requires_verification ??
      data?.verification_required ??
      data?.requiresVerification ??
      (!accessToken && user)
  );

  return {
    raw: payload,
    user,
    accessToken,
    refreshToken,
    requiresVerification,
    message: data?.message ?? payload?.message ?? null,
  };
}

export const authApi = {
  async login(values) {
    const payload = await apiRequest(API_CONFIG.endpoints.login, {
      method: "POST",
      auth: false,
      body: mapLoginBody(values),
    });
    return normalizeAuthResponse(payload);
  },

  async register(values) {
    const payload = await apiRequest(API_CONFIG.endpoints.register, {
      method: "POST",
      auth: false,
      body: mapRegisterBody(values),
    });
    return normalizeAuthResponse(payload);
  },

  async verify({ email, phone, channel, code }) {
    const payload = await apiRequest(API_CONFIG.endpoints.verify, {
      method: "POST",
      auth: false,
      body: {
        email: email || null,
        phone: phone || null,
        channel,
        code: code.trim(),
      },
    });
    return normalizeAuthResponse(payload);
  },

  async resendVerification({ email, phone, channel }) {
    return apiRequest(API_CONFIG.endpoints.resendVerification, {
      method: "POST",
      auth: false,
      body: {
        email: email || null,
        phone: phone || null,
        channel,
      },
    });
  },

  async me() {
    const payload = await apiRequest(API_CONFIG.endpoints.me);
    const data = unwrap(payload);
    return data?.user ?? data;
  },

  async logout() {
    try {
      return await apiRequest(API_CONFIG.endpoints.logout, { method: "POST" });
    } catch (error) {
      // Aunque la API falle al cerrar sesión, la sesión local debe limpiarse.
      return null;
    }
  },

  async forgotPassword(email) {
    return apiRequest(API_CONFIG.endpoints.forgotPassword, {
      method: "POST",
      auth: false,
      body: { email: email.trim().toLowerCase() },
    });
  },
};

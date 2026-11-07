const trimSlash = (value = "") => String(value).replace(/\/+$/, "");

export const API_CONFIG = {
  baseURL: trimSlash(process.env.EXPO_PUBLIC_API_URL || ""),
  timeoutMs: 20000,
  endpoints: {
    login: process.env.EXPO_PUBLIC_API_LOGIN_PATH || "/auth/login",
    register: process.env.EXPO_PUBLIC_API_REGISTER_PATH || "/auth/register",
    verify: process.env.EXPO_PUBLIC_API_VERIFY_PATH || "/auth/verify",
    resendVerification:
      process.env.EXPO_PUBLIC_API_RESEND_PATH || "/auth/resend-code",
    me: process.env.EXPO_PUBLIC_API_ME_PATH || "/auth/me",
    logout: process.env.EXPO_PUBLIC_API_LOGOUT_PATH || "/auth/logout",
    forgotPassword:
      process.env.EXPO_PUBLIC_API_FORGOT_PASSWORD_PATH || "/auth/forgot-password",
    refresh: process.env.EXPO_PUBLIC_API_REFRESH_PATH || "/auth/refresh",
  },
};

export function assertApiConfigured() {
  if (!API_CONFIG.baseURL) {
    throw new Error(
      "API_NOT_CONFIGURED: agrega EXPO_PUBLIC_API_URL en tu archivo .env"
    );
  }
}

export function buildApiUrl(path) {
  assertApiConfigured();
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_CONFIG.baseURL}${path.startsWith("/") ? path : `/${path}`}`;
}

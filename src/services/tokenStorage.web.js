const ACCESS_TOKEN_KEY = "kaabmap_access_token";
const REFRESH_TOKEN_KEY = "kaabmap_refresh_token";

const storageAvailable = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export async function getStoredTokens() {
  if (!storageAvailable()) return { accessToken: null, refreshToken: null };
  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export async function saveTokens({ accessToken, refreshToken }) {
  if (!storageAvailable()) return;

  if (accessToken) window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  else window.localStorage.removeItem(ACCESS_TOKEN_KEY);

  if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

import { API_CONFIG, buildApiUrl } from "../config/apiConfig";
import { getStoredTokens } from "./tokenStorage";

function createApiError(message, status, data) {
  const error = new Error(message || "Ocurrió un error al comunicarse con el servidor.");
  error.status = status;
  error.data = data;
  return error;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest(
  path,
  { method = "GET", body, headers = {}, auth = true } = {}
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const tokens = auth ? await getStoredTokens() : {};
    const requestHeaders = {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(tokens?.accessToken
        ? { Authorization: `Bearer ${tokens.accessToken}` }
        : {}),
      ...headers,
    };

    const response = await fetch(buildApiUrl(path), {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // Si el backend usa cookies HTTP-only en web, esto permite enviarlas.
      credentials: "include",
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?.detail ||
        `Error ${response.status}`;
      throw createApiError(message, response.status, data);
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "La API tardó demasiado en responder. Inténtalo de nuevo.",
        408,
        null
      );
    }

    if (error?.message?.startsWith("API_NOT_CONFIGURED")) throw error;
    if (error?.status) throw error;

    throw createApiError(
      "No fue posible conectarse con la API. Revisa la URL, tu red y que el servidor esté encendido.",
      0,
      error
    );
  } finally {
    clearTimeout(timeout);
  }
}

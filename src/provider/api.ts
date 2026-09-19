export const API_URL = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as {
        error?: string | { message?: string };
        message?: string;
      };
      const bodyMessage =
        typeof body.error === "string"
          ? body.error
          : body.error?.message ?? body.message;
      message = bodyMessage ?? message;
    } catch {
      // Keep the HTTP status message when the API has no JSON error body.
    }

    if (response.status === 401) {
      message = "El email o la contraseña no son correctos.";
    } else if (response.status === 403 && !message.startsWith("Affiliate")) {
      message = "No tienes permisos para acceder a este portal.";
    } else if (response.status >= 500) {
      message = "Ha ocurrido un error en el servidor. Inténtalo de nuevo más tarde.";
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

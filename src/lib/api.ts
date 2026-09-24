// Centralized API client helper for authenticated admin calls and standard endpoints

export function getAdminAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("ito_admin_token") || "admin_master_session_token_2026";
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("ito_admin_token") || "admin_master_session_token_2026";
  const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : {}));
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

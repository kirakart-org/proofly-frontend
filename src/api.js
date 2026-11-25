const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(method, path, body, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  } else if (isFormData) {
    headers.delete("Content-Type");
  }

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("token")
      : null;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...options,
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    },
  );
  const responseText = await response.text();
  let responseData = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          throw new ApiError("The API returned invalid JSON.", response.status, responseText);
        }
        responseData = responseText;
      } else {
        responseData = responseText;
      }
    }
  }

  if (!response.ok) {
    const details = responseData?.detail ?? responseData?.errors ?? responseData;
    const message =
      responseData?.message ??
      (typeof details === "string" ? details : JSON.stringify(details)) ??
      response.statusText;
    throw new ApiError(message || `Request failed with status ${response.status}.`, response.status, details);
  }

  return responseData;
}

export const api = {
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, body, options) => request("POST", path, body, options),
  put: (path, body, options) => request("PUT", path, body, options),
  patch: (path, body, options) => request("PATCH", path, body, options),
  delete: (path, options) => request("DELETE", path, undefined, options),
};

export default api;

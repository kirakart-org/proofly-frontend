export class ApiError extends Error {
  status: number;
  details: unknown;
}

type RequestOptions = Omit<RequestInit, "body" | "method">;

type ApiClient = {
  get(path: string, options?: RequestOptions): Promise<unknown>;
  post(path: string, body?: unknown, options?: RequestOptions): Promise<unknown>;
  put(path: string, body?: unknown, options?: RequestOptions): Promise<unknown>;
  patch(path: string, body?: unknown, options?: RequestOptions): Promise<unknown>;
  delete(path: string, options?: RequestOptions): Promise<unknown>;
};

export const api: ApiClient;
export default api;

import { env } from "@/config";
import type { ApiErrorPayload } from "@/types";
import { HttpError } from "./errors";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

function buildUrl(
  baseUrl: string,
  path: string,
  params?: RequestOptions["params"],
): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function createHttpClient(baseUrl: string = env.apiUrl) {
  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, body, headers, ...init } = options;
    const url = buildUrl(baseUrl, path, params);

    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await parseJsonSafe(response);

    if (!response.ok) {
      const payload: ApiErrorPayload =
        typeof data === "object" && data !== null && "message" in data
          ? (data as ApiErrorPayload)
          : { message: response.statusText || "HTTP request failed" };

      throw new HttpError(response.status, payload);
    }

    return data as T;
  }

  return {
    get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "PATCH", body }),
    delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "DELETE" }),
  };
}

export const httpClient = createHttpClient();

import { afterEach, describe, expect, it, vi } from "vitest";

import { createHttpClient, HttpError, httpClient } from "@/services/http";

function jsonResponse(
  body: unknown,
  init: { status?: number; statusText?: string } = {},
): Response {
  const text = body === undefined ? "" : JSON.stringify(body);
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: init.statusText ?? "",
    text: async () => text,
  } as unknown as Response;
}

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

describe("createHttpClient", () => {
  it("builds the URL from base + path and normalizes a trailing slash", async () => {
    const client = createHttpClient("http://api.test/v1/");
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await client.get("/users");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/v1/users");
  });

  it("prepends a slash when the path is not rooted", async () => {
    const client = createHttpClient("http://api.test/v1");
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await client.get("users");

    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/v1/users");
  });

  it("appends query params and skips undefined values", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await client.get("/users", {
      params: { page: 2, active: true, q: "ana", missing: undefined },
    });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("active")).toBe("true");
    expect(url.searchParams.get("q")).toBe("ana");
    expect(url.searchParams.has("missing")).toBe(false);
  });

  it("sends JSON headers and a serialized body on POST", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 1 }));

    await client.post("/users", { name: "ana" });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "ana" }));
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it("omits the body on GET requests", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await client.get("/users");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
  });

  it("allows callers to override default headers", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await client.get("/users", { headers: { "X-Token": "abc" } });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Token"]).toBe("abc");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("returns parsed JSON on success", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 7, name: "ana" }));

    await expect(client.get("/users/7")).resolves.toEqual({
      id: 7,
      name: "ana",
    });
  });

  it("returns undefined for an empty response body", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, { status: 204 }));

    await expect(client.delete("/users/7")).resolves.toBeUndefined();
  });

  it("returns the raw text when the body is not valid JSON", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "",
      text: async () => "plain-text",
    } as unknown as Response);

    await expect(client.get("/ping")).resolves.toBe("plain-text");
  });
});

describe("HttpError handling", () => {
  it("throws HttpError with status, message, code and details from the payload", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          message: "Validation failed",
          code: "VALIDATION",
          details: { email: ["is required"] },
        },
        { status: 422, statusText: "Unprocessable Entity" },
      ),
    );

    const rejection = client.post("/users", {});
    await expect(rejection).rejects.toBeInstanceOf(HttpError);

    try {
      await rejection;
    } catch (error) {
      const httpError = error as HttpError;
      expect(httpError.name).toBe("HttpError");
      expect(httpError.status).toBe(422);
      expect(httpError.message).toBe("Validation failed");
      expect(httpError.code).toBe("VALIDATION");
      expect(httpError.details).toEqual({ email: ["is required"] });
    }
  });

  it("falls back to the HTTP status text when the payload has no message", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ nope: true }, { status: 500, statusText: "Server Error" }),
    );

    await expect(client.get("/boom")).rejects.toMatchObject({
      name: "HttpError",
      status: 500,
      message: "Server Error",
    });
  });

  it("falls back to a generic message when status text is empty", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce(
      jsonResponse(undefined, { status: 503, statusText: "" }),
    );

    await expect(client.get("/down")).rejects.toMatchObject({
      status: 503,
      message: "HTTP request failed",
    });
  });

  it("treats non-object error bodies as generic failures", async () => {
    const client = createHttpClient("http://api.test");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      text: async () => "oops",
    } as unknown as Response);

    await expect(client.get("/bad")).rejects.toMatchObject({
      status: 400,
      message: "Bad Request",
    });
  });
});

describe("httpClient default instance", () => {
  it("exposes the CRUD helpers", () => {
    expect(typeof httpClient.get).toBe("function");
    expect(typeof httpClient.post).toBe("function");
    expect(typeof httpClient.put).toBe("function");
    expect(typeof httpClient.patch).toBe("function");
    expect(typeof httpClient.delete).toBe("function");
  });

  it("uses the configured API base URL", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    await httpClient.get("/health");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:4000/api/health",
    );
  });
});

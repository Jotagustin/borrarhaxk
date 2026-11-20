import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AuthServiceError,
  authService,
  getSession,
  login,
  logout,
  register,
} from "@/modules/auth";
import type {
  AuthSession,
  LoginCredentials,
  RegisterPayload,
} from "@/modules/auth";
import { AUTH_ENDPOINTS } from "@/modules/auth";

/**
 * The auth service builds on the shared typed http client, which is built on
 * global fetch. Mock fetch (not the client) so the service + client + error
 * mapping all participate in the test.
 */
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

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

const session: AuthSession = {
  user: {
    id: "u_1",
    name: "Ana",
    email: "ana@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresAt: "2026-01-01T01:00:00.000Z",
};

const credentials: LoginCredentials = {
  email: "ana@example.com",
  password: "secret123",
};

const payload: RegisterPayload = {
  name: "Ana",
  email: "ana@example.com",
  password: "secret123",
};

function calledUrl(call: number): string {
  return String(fetchMock.mock.calls[call][0]);
}

afterEach(() => {
  fetchMock.mockReset();
});

describe("login", () => {
  it("POSTs the credentials to the login endpoint and returns the session", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ session }));

    await expect(login(credentials)).resolves.toEqual(session);

    expect(calledUrl(0)).toContain(AUTH_ENDPOINTS.login);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify(credentials));
  });

  it("maps an HttpError into an AuthServiceError with normalized fields", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
          details: { email: ["not found"] },
        },
        { status: 401, statusText: "Unauthorized" },
      ),
    );

    const rejection = login(credentials);
    await expect(rejection).rejects.toBeInstanceOf(AuthServiceError);

    try {
      await rejection;
    } catch (error) {
      const serviceError = error as AuthServiceError;
      expect(serviceError.name).toBe("AuthServiceError");
      expect(serviceError.message).toBe("Invalid credentials");
      expect(serviceError.error).toEqual({
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
        details: { email: ["not found"] },
      });
    }
  });

  it("falls back to the status text when the error body has no message", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ nope: true }, { status: 500, statusText: "Server Error" }),
    );

    await expect(login(credentials)).rejects.toMatchObject({
      name: "AuthServiceError",
      error: { message: "Server Error" },
    });
  });

  it("normalizes network failures into a generic AuthServiceError", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    await expect(login(credentials)).rejects.toMatchObject({
      name: "AuthServiceError",
      error: { message: "network down" },
    });
  });

  it("normalizes unknown throwables into a stable message", async () => {
    fetchMock.mockRejectedValueOnce("boom");

    await expect(login(credentials)).rejects.toMatchObject({
      name: "AuthServiceError",
      error: { message: "Unexpected authentication error" },
    });
  });
});

describe("register", () => {
  it("POSTs the payload to the register endpoint and returns the session", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ session }));

    await expect(register(payload)).resolves.toEqual(session);

    expect(calledUrl(0)).toContain(AUTH_ENDPOINTS.register);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify(payload));
  });

  it("maps a 409 conflict into an AuthServiceError", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: "Email already used", code: "CONFLICT" },
        { status: 409, statusText: "Conflict" },
      ),
    );

    await expect(register(payload)).rejects.toMatchObject({
      name: "AuthServiceError",
      error: { message: "Email already used", code: "CONFLICT" },
    });
  });
});

describe("logout", () => {
  it("POSTs to the logout endpoint and resolves with void", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(undefined, { status: 204 }));

    await expect(logout()).resolves.toBeUndefined();

    expect(calledUrl(0)).toContain(AUTH_ENDPOINTS.logout);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
  });

  it("maps failures into an AuthServiceError", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "Nope" }, { status: 500, statusText: "Server Error" }),
    );

    await expect(logout()).rejects.toBeInstanceOf(AuthServiceError);
  });
});

describe("getSession", () => {
  it("GETs the session endpoint and returns the session", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ session }));

    await expect(getSession()).resolves.toEqual(session);

    expect(calledUrl(0)).toContain(AUTH_ENDPOINTS.session);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("GET");
  });

  it("returns null when there is no active session", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ session: null }));

    await expect(getSession()).resolves.toBeNull();
  });

  it("maps failures into an AuthServiceError", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: "Forbidden" }, { status: 403, statusText: "Forbidden" }),
    );

    await expect(getSession()).rejects.toMatchObject({
      name: "AuthServiceError",
      error: { message: "Forbidden" },
    });
  });
});

describe("authService aggregation", () => {
  it("exposes every operation", () => {
    expect(authService.login).toBe(login);
    expect(authService.register).toBe(register);
    expect(authService.logout).toBe(logout);
    expect(authService.getSession).toBe(getSession);
  });
});

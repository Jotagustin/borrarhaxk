import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/config/routes";
import { LoginForm, RegisterForm, useAuth } from "@/modules/auth";
import type { UseAuthResult } from "@/modules/auth";

/**
 * The forms call `useRouter()` from next/navigation, which requires a mounted
 * App Router. Mock it; assert navigation through the shared spies below.
 */
const routerPush = vi.hoisted(() => vi.fn());
const routerRefresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
}));

/**
 * Mock the auth hook by its internal module path. Everything else in
 * `@/modules/auth` (the real LoginForm/RegisterForm) stays real.
 */
vi.mock("@/modules/auth/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

function buildAuthResult(overrides: Partial<UseAuthResult> = {}): UseAuthResult {
  return {
    user: null,
    session: null,
    loading: false,
    error: null,
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    refreshSession: vi.fn().mockResolvedValue(null),
    clearError: vi.fn(),
    ...overrides,
  };
}

afterEach(() => {
  useAuthMock.mockReset();
  routerPush.mockReset();
  routerRefresh.mockReset();
});

describe("LoginForm (integration, useAuth mocked)", () => {
  it("renders email and password fields", () => {
    useAuthMock.mockReturnValue(buildAuthResult());
    render(<LoginForm />);

    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("marks the fields as required (native validation contract)", () => {
    useAuthMock.mockReturnValue(buildAuthResult());
    render(<LoginForm />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeRequired();
    expect(screen.getByLabelText(/contraseña/i)).toBeRequired();
  });

  it("submits the typed credentials through useAuth.login", async () => {
    const user = userEvent.setup();
    const auth = buildAuthResult();
    useAuthMock.mockReturnValue(auth);
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secret123");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() =>
      expect(auth.login).toHaveBeenCalledWith({
        email: "ana@example.com",
        password: "secret123",
      }),
    );
  });

  it("clears any previous error before submitting", async () => {
    const user = userEvent.setup();
    const auth = buildAuthResult();
    useAuthMock.mockReturnValue(auth);
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(auth.clearError).toHaveBeenCalledTimes(1);
  });

  it("navigates to the dashboard after a successful login", async () => {
    const user = userEvent.setup();
    const auth = buildAuthResult();
    useAuthMock.mockReturnValue(auth);
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secret123");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() =>
      expect(routerPush).toHaveBeenCalledWith(ROUTES.dashboard.root),
    );
    expect(routerRefresh).toHaveBeenCalled();
  });

  it("reflects the loading state on the submit control", () => {
    useAuthMock.mockReturnValue(buildAuthResult({ loading: true }));
    render(<LoginForm />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/ingresando/i);
  });

  it("renders the error message from useAuth state as an alert", () => {
    useAuthMock.mockReturnValue(
      buildAuthResult({ error: { message: "Invalid credentials" } }),
    );
    render(<LoginForm />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Invalid credentials");
  });

  it("links to the register route", () => {
    useAuthMock.mockReturnValue(buildAuthResult());
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: /crear cuenta/i })).toHaveAttribute(
      "href",
      ROUTES.auth.register,
    );
  });
});

describe("RegisterForm (integration, useAuth mocked)", () => {
  it("renders name, email and password fields", () => {
    useAuthMock.mockReturnValue(buildAuthResult());
    render(<RegisterForm />);

    expect(screen.getByLabelText(/nombre/i)).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("marks every field as required (native validation contract)", () => {
    useAuthMock.mockReturnValue(buildAuthResult());
    render(<RegisterForm />);

    expect(screen.getByLabelText(/nombre/i)).toBeRequired();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeRequired();
    expect(screen.getByLabelText(/contraseña/i)).toBeRequired();
  });

  it("submits the typed payload through useAuth.register", async () => {
    const user = userEvent.setup();
    const auth = buildAuthResult();
    useAuthMock.mockReturnValue(auth);
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nombre/i), "Ana");
    await user.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secret123");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() =>
      expect(auth.register).toHaveBeenCalledWith({
        name: "Ana",
        email: "ana@example.com",
        password: "secret123",
      }),
    );
  });

  it("clears any previous error before submitting", async () => {
    const user = userEvent.setup();
    const auth = buildAuthResult();
    useAuthMock.mockReturnValue(auth);
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(auth.clearError).toHaveBeenCalledTimes(1);
  });

  it("navigates to the dashboard after a successful registration", async () => {
    const user = userEvent.setup();
    const auth = buildAuthResult();
    useAuthMock.mockReturnValue(auth);
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nombre/i), "Ana");
    await user.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secret123");
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() =>
      expect(routerPush).toHaveBeenCalledWith(ROUTES.dashboard.root),
    );
    expect(routerRefresh).toHaveBeenCalled();
  });

  it("reflects the loading state on the submit control", () => {
    useAuthMock.mockReturnValue(buildAuthResult({ loading: true }));
    render(<RegisterForm />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/creando cuenta/i);
  });

  it("renders the error message from useAuth state as an alert", () => {
    useAuthMock.mockReturnValue(
      buildAuthResult({ error: { message: "Email already used" } }),
    );
    render(<RegisterForm />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Email already used");
  });

  it("links to the login route", () => {
    useAuthMock.mockReturnValue(buildAuthResult());
    render(<RegisterForm />);

    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute(
      "href",
      ROUTES.auth.login,
    );
  });
});

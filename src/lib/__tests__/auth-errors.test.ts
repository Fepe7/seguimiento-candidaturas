import { describe, expect, it } from "vitest";
import { authErrorMessage, GENERIC_AUTH_ERROR, validateCredentials } from "../auth-errors";

describe("authErrorMessage", () => {
  it("traduce los códigos conocidos", () => {
    expect(authErrorMessage("auth/invalid-credential")).toBe("El email o la contraseña no son correctos.");
    expect(authErrorMessage("auth/email-already-in-use")).toBe("Ya existe una cuenta con ese email.");
    expect(authErrorMessage("auth/invalid-email")).toBe("El email no es válido.");
    expect(authErrorMessage("auth/too-many-requests")).toContain("Demasiados intentos");
    expect(authErrorMessage("auth/weak-password")).toContain("demasiado débil");
    expect(authErrorMessage("auth/operation-not-allowed")).toBe(
      "El inicio de sesión con email no está activado en Firebase.",
    );
  });
  it("usa el mensaje genérico con códigos desconocidos o vacíos", () => {
    expect(authErrorMessage("auth/algo-raro")).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage(undefined)).toBe(GENERIC_AUTH_ERROR);
    expect(authErrorMessage("")).toBe(GENERIC_AUTH_ERROR);
  });
});

describe("validateCredentials", () => {
  it("acepta un email y una contraseña correctos", () => {
    expect(validateCredentials(" ana@correo.es ", "123456")).toEqual({});
  });
  it("exige email y contraseña", () => {
    expect(validateCredentials("", "")).toEqual({
      email: "El email es obligatorio.",
      password: "La contraseña es obligatoria.",
    });
  });
  it("rechaza un email mal formado y una contraseña de 5 caracteres", () => {
    const errors = validateCredentials("ana@correo", "12345");
    expect(errors.email).toBe("El email no es válido.");
    expect(errors.password).toBe("La contraseña debe tener al menos 6 caracteres.");
  });
});

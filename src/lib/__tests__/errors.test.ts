import { describe, expect, it } from "vitest";
import { ApplicationValidationError, errorCode, firestoreErrorMessage } from "../errors";

describe("errorCode", () => {
  it("extrae el código de un error con code", () => {
    expect(errorCode({ code: "auth/invalid-email" })).toBe("auth/invalid-email");
  });
  it("devuelve undefined si no hay código de texto", () => {
    expect(errorCode(new Error("x"))).toBeUndefined();
    expect(errorCode(null)).toBeUndefined();
    expect(errorCode({ code: 5 })).toBeUndefined();
  });
});

describe("firestoreErrorMessage", () => {
  it("traduce códigos de Firestore conocidos", () => {
    expect(firestoreErrorMessage({ code: "permission-denied" }, "fallo")).toContain("permiso");
  });
  it("muestra el mensaje de un error de validación propio", () => {
    expect(
      firestoreErrorMessage(new ApplicationValidationError("La empresa es obligatoria."), "fallo"),
    ).toBe("La empresa es obligatoria.");
  });
  it("usa el mensaje de reserva con errores desconocidos, en inglés o vacíos", () => {
    expect(firestoreErrorMessage({ code: "internal" }, "fallo")).toBe("fallo");
    expect(firestoreErrorMessage(new Error("Network failed"), "fallo")).toBe("fallo");
    expect(firestoreErrorMessage(undefined, "fallo")).toBe("fallo");
  });
});

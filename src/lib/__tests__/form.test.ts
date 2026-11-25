import { describe, expect, it, vi } from "vitest";

vi.mock("../firebase", () => ({ auth: vi.fn(), db: vi.fn() }));

import type { Application } from "../applications";
import { applicationToForm, EMPTY_FORM, formatDate, formToInput, todayISO } from "../form";

describe("todayISO", () => {
  it("devuelve la fecha local en formato AAAA-MM-DD", () => {
    expect(todayISO(new Date(2026, 10, 25, 15, 30))).toBe("2026-11-25");
  });
  it("rellena con ceros mes y día y respeta la medianoche local", () => {
    expect(todayISO(new Date(2026, 0, 5, 0, 0, 0))).toBe("2026-01-05");
    expect(todayISO(new Date(2026, 11, 31, 23, 59, 59))).toBe("2026-12-31");
  });
});

describe("formToInput", () => {
  it("convierte los valores del formulario en ApplicationInput", () => {
    const input = formToInput({ ...EMPTY_FORM, company: "Acme", role: "Dev", followUp: "2026-12-01" });
    expect(input).toEqual({
      company: "Acme",
      role: "Dev",
      location: "",
      status: "pendiente",
      link: "",
      notes: "",
      followUp: "2026-12-01",
    });
  });
  it("convierte una fecha vacía en null", () => {
    expect(formToInput(EMPTY_FORM).followUp).toBeNull();
    expect(formToInput({ ...EMPTY_FORM, followUp: "  " }).followUp).toBeNull();
  });
});

describe("applicationToForm", () => {
  const app: Application = {
    id: "1",
    company: "Acme",
    role: "Dev",
    location: "Valencia",
    status: "entrevista",
    link: "https://acme.com",
    notes: "Llamar",
    followUp: "2026-12-01",
    createdAt: 1,
    updatedAt: 2,
  };
  it("copia los campos editables", () => {
    expect(applicationToForm(app)).toEqual({
      company: "Acme",
      role: "Dev",
      location: "Valencia",
      status: "entrevista",
      link: "https://acme.com",
      notes: "Llamar",
      followUp: "2026-12-01",
    });
  });
  it("convierte un followUp null en cadena vacía", () => {
    expect(applicationToForm({ ...app, followUp: null }).followUp).toBe("");
  });
});

describe("formatDate", () => {
  it("muestra la fecha como DD/MM/AAAA", () => {
    expect(formatDate("2026-11-05")).toBe("05/11/2026");
  });
  it("devuelve el texto tal cual si no es una fecha AAAA-MM-DD", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate("mañana")).toBe("mañana");
  });
});

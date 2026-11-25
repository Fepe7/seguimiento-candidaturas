import { describe, expect, it, vi } from "vitest";

vi.mock("../firebase", () => ({ auth: vi.fn(), db: vi.fn() }));

import {
  isApplicationStatus,
  isValidDate,
  normalizeApplication,
  STATUS_LABELS,
  validateApplication,
  type ApplicationInput,
} from "../applications";

const base: ApplicationInput = {
  company: "Acme",
  role: "Desarrollador Backend",
  location: "Valencia",
  status: "enviada",
  link: "https://acme.com/empleo",
  notes: "",
  followUp: "2026-12-01",
};

describe("STATUS_LABELS", () => {
  it("tiene una etiqueta en español para cada estado", () => {
    expect(STATUS_LABELS.pendiente).toBe("Pendiente de enviar");
    expect(Object.keys(STATUS_LABELS)).toHaveLength(5);
  });
});

describe("isApplicationStatus", () => {
  it("acepta un estado válido", () => {
    expect(isApplicationStatus("oferta")).toBe(true);
  });
  it("rechaza valores desconocidos o vacíos", () => {
    expect(isApplicationStatus("")).toBe(false);
    expect(isApplicationStatus("todas")).toBe(false);
    expect(isApplicationStatus(3)).toBe(false);
  });
});

describe("isValidDate", () => {
  it("acepta una fecha correcta", () => {
    expect(isValidDate("2026-11-25")).toBe(true);
    expect(isValidDate("2024-02-29")).toBe(true);
  });
  it("rechaza fechas imposibles o mal formadas", () => {
    expect(isValidDate("2025-02-29")).toBe(false);
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("25/11/2026")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });
});

describe("normalizeApplication", () => {
  it("recorta los espacios de los textos", () => {
    const result = normalizeApplication({
      ...base,
      company: "  Acme  ",
      role: " Dev ",
      location: " Valencia ",
      link: " https://a.com ",
      notes: " hola ",
    });
    expect(result).toEqual({
      ...base,
      company: "Acme",
      role: "Dev",
      location: "Valencia",
      link: "https://a.com",
      notes: "hola",
    });
  });
  it("convierte un followUp vacío en null y conserva null", () => {
    expect(normalizeApplication({ ...base, followUp: "   " }).followUp).toBeNull();
    expect(normalizeApplication({ ...base, followUp: null }).followUp).toBeNull();
  });
});

describe("validateApplication", () => {
  it("acepta una candidatura correcta", () => {
    expect(validateApplication(base)).toEqual({ valid: true, errors: {} });
  });

  it("acepta campos opcionales vacíos y followUp null", () => {
    const result = validateApplication({ ...base, location: "", link: "", notes: "", followUp: null });
    expect(result.valid).toBe(true);
  });

  it("exige empresa y puesto aunque solo tengan espacios", () => {
    const result = validateApplication({ ...base, company: "   ", role: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.company).toBe("La empresa es obligatoria.");
    expect(result.errors.role).toBe("El puesto es obligatorio.");
  });

  it("respeta los límites exactos de longitud", () => {
    const ok = validateApplication({
      ...base,
      company: "a".repeat(100),
      role: "a".repeat(120),
      location: "a".repeat(100),
      link: "https://" + "a".repeat(492),
      notes: "a".repeat(2000),
    });
    expect(ok.valid).toBe(true);

    const tooLong = validateApplication({
      ...base,
      company: "a".repeat(101),
      role: "a".repeat(121),
      location: "a".repeat(101),
      link: "https://" + "a".repeat(493),
      notes: "a".repeat(2001),
    });
    expect(tooLong.valid).toBe(false);
    expect(Object.keys(tooLong.errors).sort()).toEqual(
      ["company", "link", "location", "notes", "role"].sort(),
    );
  });

  it("no cuenta los espacios de los extremos para el límite", () => {
    expect(validateApplication({ ...base, company: `  ${"a".repeat(100)}  ` }).valid).toBe(true);
  });

  it("rechaza enlaces sin http:// o https://", () => {
    const result = validateApplication({ ...base, link: "acme.com" });
    expect(result.errors.link).toBe("El enlace debe empezar por http:// o https://.");
    expect(validateApplication({ ...base, link: "http://acme.com" }).valid).toBe(true);
  });

  it("rechaza un estado no válido", () => {
    const result = validateApplication({ ...base, status: "otro" as ApplicationInput["status"] });
    expect(result.errors.status).toBe("El estado no es válido.");
  });

  it("rechaza una fecha de seguimiento no válida", () => {
    const result = validateApplication({ ...base, followUp: "2026-02-30" });
    expect(result.valid).toBe(false);
    expect(result.errors.followUp).toBeDefined();
  });
});

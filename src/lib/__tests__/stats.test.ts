import { describe, expect, it, vi } from "vitest";

vi.mock("../firebase", () => ({ auth: vi.fn(), db: vi.fn() }));

import type { Application } from "../applications";
import {
  countByStatus,
  filterApplications,
  isFollowUpOverdue,
  normalizeText,
  sortByFollowUp,
} from "../stats";

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: "1",
    company: "Acme",
    role: "Desarrollador",
    location: "Valencia",
    status: "enviada",
    link: "",
    notes: "",
    followUp: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe("countByStatus", () => {
  it("cuenta las candidaturas de cada estado", () => {
    const apps = [
      makeApp({ status: "enviada" }),
      makeApp({ status: "enviada" }),
      makeApp({ status: "oferta" }),
    ];
    expect(countByStatus(apps)).toEqual({
      pendiente: 0,
      enviada: 2,
      entrevista: 0,
      oferta: 1,
      rechazada: 0,
    });
  });
  it("devuelve todos los estados a 0 con una lista vacía", () => {
    expect(countByStatus([])).toEqual({
      pendiente: 0,
      enviada: 0,
      entrevista: 0,
      oferta: 0,
      rechazada: 0,
    });
  });
});

describe("isFollowUpOverdue", () => {
  const today = "2026-11-25";
  it("es true si la fecha ya pasó y la candidatura sigue abierta", () => {
    expect(isFollowUpOverdue(makeApp({ followUp: "2026-11-24" }), today)).toBe(true);
  });
  it("es false si la fecha es hoy o futura", () => {
    expect(isFollowUpOverdue(makeApp({ followUp: today }), today)).toBe(false);
    expect(isFollowUpOverdue(makeApp({ followUp: "2026-12-01" }), today)).toBe(false);
  });
  it("es false sin fecha de seguimiento", () => {
    expect(isFollowUpOverdue(makeApp({ followUp: null }), today)).toBe(false);
  });
  it("es false con fecha pasada si el estado es oferta o rechazada", () => {
    expect(isFollowUpOverdue(makeApp({ followUp: "2026-01-01", status: "oferta" }), today)).toBe(false);
    expect(isFollowUpOverdue(makeApp({ followUp: "2026-01-01", status: "rechazada" }), today)).toBe(
      false,
    );
  });
});

describe("normalizeText", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(normalizeText("  Málaga ÁVILA ")).toBe("malaga avila");
  });
  it("devuelve cadena vacía con texto vacío", () => {
    expect(normalizeText("")).toBe("");
  });
});

describe("filterApplications", () => {
  const apps = [
    makeApp({ id: "a", company: "Telefónica", role: "Backend", location: "Madrid", status: "enviada" }),
    makeApp({ id: "b", company: "Acme", role: "Frontend", location: "Málaga", status: "entrevista" }),
    makeApp({ id: "c", company: "Globex", role: "AI Engineer", location: "Remoto", status: "rechazada" }),
  ];
  const ids = (list: Application[]) => list.map((a) => a.id);

  it("filtra por estado", () => {
    expect(ids(filterApplications(apps, { status: "entrevista", query: "" }))).toEqual(["b"]);
  });
  it("busca sin distinguir mayúsculas ni tildes en empresa, puesto y ubicación", () => {
    expect(ids(filterApplications(apps, { status: "todas", query: "TELEFONICA" }))).toEqual(["a"]);
    expect(ids(filterApplications(apps, { status: "todas", query: "malaga" }))).toEqual(["b"]);
    expect(ids(filterApplications(apps, { status: "todas", query: "engineer" }))).toEqual(["c"]);
  });
  it("combina estado y búsqueda", () => {
    expect(filterApplications(apps, { status: "enviada", query: "acme" })).toEqual([]);
  });
  it("devuelve todas con estado 'todas' y búsqueda vacía o solo espacios", () => {
    expect(ids(filterApplications(apps, { status: "todas", query: "   " }))).toEqual(["a", "b", "c"]);
  });
  it("devuelve una lista vacía si no hay candidaturas", () => {
    expect(filterApplications([], { status: "todas", query: "x" })).toEqual([]);
  });
});

describe("sortByFollowUp", () => {
  it("pone primero las que tienen seguimiento, de más antigua a más reciente", () => {
    const apps = [
      makeApp({ id: "sin", followUp: null }),
      makeApp({ id: "dic", followUp: "2026-12-10" }),
      makeApp({ id: "nov", followUp: "2026-11-01" }),
    ];
    expect(sortByFollowUp(apps).map((a) => a.id)).toEqual(["nov", "dic", "sin"]);
  });
  it("no modifica la lista original", () => {
    const apps = [makeApp({ id: "x", followUp: null }), makeApp({ id: "y", followUp: "2026-01-01" })];
    sortByFollowUp(apps);
    expect(apps.map((a) => a.id)).toEqual(["x", "y"]);
  });
  it("devuelve una lista vacía con una lista vacía", () => {
    expect(sortByFollowUp([])).toEqual([]);
  });
});

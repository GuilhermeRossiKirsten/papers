import { describe, it, expect } from "vitest";
import { getTurmaStatus } from "./turma-status";
import type { SessaoDTO } from "./types";

const s = (inicio: string): SessaoDTO => ({ id: inicio, titulo: "", inicio, duracaoMin: 60, linkAoVivo: "", gravacaoUrl: "" });
const now = new Date("2026-11-10T12:00:00Z");

describe("getTurmaStatus", () => {
  it("sem sessões = em breve", () => expect(getTurmaStatus([], now)).toBe("em-breve"));
  it("todas futuras = em breve", () => expect(getTurmaStatus([s("2026-11-11T00:00:00Z")], now)).toBe("em-breve"));
  it("misto = em andamento", () =>
    expect(getTurmaStatus([s("2026-11-01T00:00:00Z"), s("2026-11-11T00:00:00Z")], now)).toBe("em-andamento"));
  it("todas passadas = encerrada", () => expect(getTurmaStatus([s("2026-11-01T00:00:00Z")], now)).toBe("encerrada"));
});

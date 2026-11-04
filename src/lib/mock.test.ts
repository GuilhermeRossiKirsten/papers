import { describe, it, expect } from "vitest";
import { mockTurmas } from "./mock";
import { getTurmaStatus } from "./turma-status";
import { getSessionState } from "./session-state";

describe("mockTurmas", () => {
  const now = new Date("2026-11-03T21:00:00Z");
  const turmas = mockTurmas(now);
  const dto = (t: (typeof turmas)[number]) => t.sessoes.map((s) => ({ ...s, inicio: s.inicio.toISOString() }));

  it("cria 3 turmas publicadas e marcadas como mock", () => {
    expect(turmas).toHaveLength(3);
    expect(turmas.every((t) => t.publicada && t.mock)).toBe(true);
  });
  it("uma tem sessão ao vivo agora", () => {
    expect(turmas.some((t) => t.sessoes.some((s) => getSessionState(s.inicio, s.duracaoMin, now) === "aovivo"))).toBe(true);
  });
  it("cobre em breve, em andamento e encerrada", () => {
    expect(new Set(turmas.map((t) => getTurmaStatus(dto(t), now)))).toEqual(new Set(["em-breve", "em-andamento", "encerrada"]));
  });
});

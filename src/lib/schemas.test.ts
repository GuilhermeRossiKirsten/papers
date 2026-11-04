import { describe, it, expect } from "vitest";
import { slugify, turmaInputSchema } from "./schemas";

describe("slugify", () => {
  it("gera slug", () => expect(slugify("Attention Is All You Need!")).toBe("attention-is-all-you-need"));
  it("remove acentos", () => expect(slugify("Redes Neurais: Introdução")).toBe("redes-neurais-introducao"));
});

describe("turmaInputSchema", () => {
  const base = {
    titulo: "Turma 1",
    descricao: "",
    publicada: true,
    paper: { titulo: "Paper", autores: "A. B.", origem: "externo", url: "https://arxiv.org/abs/1706.03762" },
    sessoes: [{ titulo: "", inicio: "2026-11-10T22:00:00.000Z", duracaoMin: 90, linkAoVivo: "", gravacaoUrl: "" }],
  };
  it("aceita turma válida", () => expect(turmaInputSchema.safeParse(base).success).toBe(true));
  it("rejeita url inválida", () => {
    const r = turmaInputSchema.safeParse({ ...base, paper: { ...base.paper, url: "javascript:alert(1)" } });
    expect(r.success).toBe(false);
  });
  it("rejeita título vazio", () => expect(turmaInputSchema.safeParse({ ...base, titulo: " " }).success).toBe(false));
});

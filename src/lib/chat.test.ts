import { describe, it, expect } from "vitest";
import { INTERVALO_MIN_MS, LIMITE_TEXTO, limparTexto, podeApagar, podeEnviar } from "./chat";

describe("limparTexto", () => {
  it("remove espaços nas pontas", () => expect(limparTexto("  oi  ")).toBe("oi"));
  it("rejeita vazio", () => expect(limparTexto("   \n ")).toBeNull());
  it("rejeita acima do limite", () => expect(limparTexto("a".repeat(LIMITE_TEXTO + 1))).toBeNull());
  it("aceita no limite", () => expect(limparTexto("a".repeat(LIMITE_TEXTO))).toHaveLength(1000));
  it("limita quebras de linha seguidas", () => expect(limparTexto("a\n\n\n\n\nb")).toBe("a\n\nb"));
});

describe("podeApagar", () => {
  const msg = { githubId: "1" };
  it("autor pode", () => expect(podeApagar(msg, { githubId: "1", isAdmin: false })).toBe(true));
  it("admin pode", () => expect(podeApagar(msg, { githubId: "2", isAdmin: true })).toBe(true));
  it("outro usuário não pode", () => expect(podeApagar(msg, { githubId: "2", isAdmin: false })).toBe(false));
  it("visitante não pode", () => expect(podeApagar(msg, null)).toBe(false));
});

describe("podeEnviar", () => {
  const now = new Date("2026-11-03T21:00:00Z");
  it("sem mensagem anterior", () => expect(podeEnviar(null, now)).toBe(true));
  it("bloqueia antes do intervalo", () => expect(podeEnviar(new Date(now.getTime() - INTERVALO_MIN_MS + 1), now)).toBe(false));
  it("libera após o intervalo", () => expect(podeEnviar(new Date(now.getTime() - INTERVALO_MIN_MS), now)).toBe(true));
});

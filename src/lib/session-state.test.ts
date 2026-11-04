import { describe, it, expect } from "vitest";
import { getSessionState, formatCountdown } from "./session-state";

const inicio = new Date("2026-11-10T22:00:00Z");
const min = 60_000;

describe("getSessionState", () => {
  it("antes do início", () => {
    expect(getSessionState(inicio, 90, new Date(inicio.getTime() - 1))).toBe("antes");
  });
  it("no instante do início é ao vivo", () => {
    expect(getSessionState(inicio, 90, inicio)).toBe("aovivo");
  });
  it("durante é ao vivo", () => {
    expect(getSessionState(inicio, 90, new Date(inicio.getTime() + 89 * min))).toBe("aovivo");
  });
  it("no fim exato é depois", () => {
    expect(getSessionState(inicio, 90, new Date(inicio.getTime() + 90 * min))).toBe("depois");
  });
});

describe("formatCountdown", () => {
  const h = 60 * min;
  const d = 24 * h;
  it("dias", () => expect(formatCountdown(5 * d + 3 * h)).toBe("faltam 5 dias e 3h"));
  it("um dia", () => expect(formatCountdown(d + 2 * h)).toBe("falta 1 dia e 2h"));
  it("dias exatos", () => expect(formatCountdown(2 * d + 10 * min)).toBe("faltam 2 dias"));
  it("quase dois dias", () => expect(formatCountdown(2 * d - 1000)).toBe("falta 1 dia e 23h"));
  it("horas e minutos", () => expect(formatCountdown(3 * h + 20 * min + 10_000)).toBe("faltam 3h 20min"));
  it("minutos", () => expect(formatCountdown(45 * min + 5_000)).toBe("faltam 45min"));
  it("menos de um minuto", () => expect(formatCountdown(30_000)).toBe("começa em instantes"));
});

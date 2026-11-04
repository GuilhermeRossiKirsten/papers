import { describe, it, expect } from "vitest";
import { isoToSaoPauloInput, saoPauloInputToIso } from "./tz";

describe("fuso de São Paulo", () => {
  it("converte input local para ISO UTC", () => {
    expect(saoPauloInputToIso("2026-11-10T19:00")).toBe("2026-11-10T22:00:00.000Z");
  });
  it("converte ISO UTC para input local", () => {
    expect(isoToSaoPauloInput("2026-11-10T22:00:00.000Z")).toBe("2026-11-10T19:00");
  });
  it("ida e volta", () => {
    expect(isoToSaoPauloInput(saoPauloInputToIso("2027-01-01T00:30"))).toBe("2027-01-01T00:30");
  });
  it("input inválido vira string vazia", () => expect(saoPauloInputToIso("")).toBe(""));
});

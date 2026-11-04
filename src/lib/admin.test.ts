import { describe, it, expect } from "vitest";
import { isAdminLogin } from "./admin";

describe("isAdminLogin", () => {
  const env = " GuiRossi , outra-pessoa,, ";
  it("ignora maiúsculas e espaços", () => {
    expect(isAdminLogin("guirossi", env)).toBe(true);
    expect(isAdminLogin("OUTRA-PESSOA", env)).toBe(true);
  });
  it("rejeita quem não está na lista", () => expect(isAdminLogin("intruso", env)).toBe(false));
  it("rejeita vazio/undefined", () => {
    expect(isAdminLogin("", env)).toBe(false);
    expect(isAdminLogin(undefined, env)).toBe(false);
    expect(isAdminLogin("guirossi", "")).toBe(false);
  });
});

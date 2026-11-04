import { describe, it, expect } from "vitest";
import { mesclarMensagens } from "./chat-merge";

const m = (id: string) => ({ id, githubId: "1", login: "a", avatarUrl: "", texto: id, criadoEm: "" });
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe("mesclarMensagens", () => {
  it("mantém antigas fora da janela e substitui a janela recente", () => {
    const atual = [m("01"), m("02"), m("03"), m("04")];
    // poll trouxe a janela a partir de 03: 04 foi apagada, 05 é nova
    expect(ids(mesclarMensagens(atual, [m("03"), m("05")]))).toEqual(["01", "02", "03", "05"]);
  });
  it("poll vazio limpa tudo", () => expect(mesclarMensagens([m("01")], [])).toEqual([]));
  it("adiciona página antiga sem duplicar", () => {
    expect(ids(mesclarMensagens([m("02"), m("03")], [m("01"), m("02")], "antigas"))).toEqual(["01", "02", "03"]);
  });
});

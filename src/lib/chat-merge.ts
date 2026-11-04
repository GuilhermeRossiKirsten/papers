import type { MensagemDTO } from "./chat";

/**
 * Junta mensagens já exibidas com uma resposta do servidor. IDs (ObjectId hex) crescem com o tempo.
 * - "recentes": a resposta é a janela mais recente; ela substitui tudo a partir do seu primeiro id
 *   (assim mensagens apagadas somem) e o que é mais antigo que a janela é mantido.
 * - "antigas": a resposta é uma página anterior; só é acrescentada.
 */
export function mesclarMensagens(
  atual: MensagemDTO[],
  resposta: MensagemDTO[],
  modo: "recentes" | "antigas" = "recentes",
): MensagemDTO[] {
  if (modo === "recentes") {
    if (resposta.length === 0) return [];
    const inicio = resposta[0].id;
    return [...atual.filter((x) => x.id < inicio), ...resposta];
  }
  const vistos = new Set(atual.map((x) => x.id));
  return [...resposta.filter((x) => !vistos.has(x.id)), ...atual].sort((a, b) => (a.id < b.id ? -1 : 1));
}

export const LIMITE_TEXTO = 1000;
export const INTERVALO_MIN_MS = 3000;
export const PAGINA = 100;

/** Normaliza o texto da mensagem; retorna null se for vazio ou longo demais. */
export function limparTexto(texto: string): string | null {
  const t = texto.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!t || t.length > LIMITE_TEXTO) return null;
  return t;
}

export function podeApagar(msg: { githubId: string }, user: { githubId: string; isAdmin: boolean } | null): boolean {
  if (!user) return false;
  return user.isAdmin || user.githubId === msg.githubId;
}

/** Anti-spam: no máximo uma mensagem a cada INTERVALO_MIN_MS por pessoa. */
export function podeEnviar(ultima: Date | null, now: Date): boolean {
  return !ultima || now.getTime() - ultima.getTime() >= INTERVALO_MIN_MS;
}

export type MensagemDTO = {
  id: string;
  githubId: string;
  login: string;
  avatarUrl: string;
  texto: string;
  criadoEm: string;
};

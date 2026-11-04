import { getSessionState } from "./session-state";
import type { TurmaDTO } from "./types";

export type LiveCandidate = {
  turmaTitulo: string;
  turmaSlug: string;
  sessaoTitulo: string;
  inicio: string;
  duracaoMin: number;
  linkAoVivo: string;
};

/**
 * Sessões que ainda não terminaram e começam nas próximas 24h.
 * O banner decide no navegador, a cada segundo, se alguma está ao vivo.
 */
export function liveCandidates(turmas: TurmaDTO[], now: Date): LiveCandidate[] {
  const limite = now.getTime() + 24 * 3_600_000;
  return turmas.flatMap((t) =>
    t.sessoes.flatMap((s, i) => {
      const ini = new Date(s.inicio);
      if (getSessionState(ini, s.duracaoMin, now) === "depois" || ini.getTime() > limite) return [];
      return [
        {
          turmaTitulo: t.titulo,
          turmaSlug: t.slug,
          sessaoTitulo: s.titulo || `Sessão ${i + 1}`,
          inicio: s.inicio,
          duracaoMin: s.duracaoMin,
          linkAoVivo: s.linkAoVivo,
        },
      ];
    }),
  );
}

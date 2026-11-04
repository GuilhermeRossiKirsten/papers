import { getSessionState } from "./session-state";
import type { SessaoDTO, TurmaStatus } from "./types";

export function getTurmaStatus(sessoes: SessaoDTO[], now: Date): TurmaStatus {
  if (sessoes.length === 0) return "em-breve";
  const estados = sessoes.map((s) => getSessionState(new Date(s.inicio), s.duracaoMin, now));
  if (estados.every((e) => e === "depois")) return "encerrada";
  if (estados.every((e) => e === "antes")) return "em-breve";
  return "em-andamento";
}

export const STATUS_LABEL: Record<TurmaStatus, string> = {
  "em-breve": "Em breve",
  "em-andamento": "Em andamento",
  encerrada: "Encerrada",
};

export function proximaSessao(sessoes: SessaoDTO[], now: Date): SessaoDTO | undefined {
  return sessoes.find((s) => getSessionState(new Date(s.inicio), s.duracaoMin, now) !== "depois");
}

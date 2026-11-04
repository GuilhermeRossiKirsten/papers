export type SessionState = "antes" | "aovivo" | "depois";

export function getSessionState(inicio: Date, duracaoMin: number, now: Date): SessionState {
  const start = inicio.getTime();
  const end = start + duracaoMin * 60_000;
  const t = now.getTime();
  if (t < start) return "antes";
  if (t < end) return "aovivo";
  return "depois";
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  if (totalMin < 1) return "começa em instantes";
  const dias = Math.floor(ms / 86_400_000);
  if (dias >= 1) {
    const horas = Math.floor((ms % 86_400_000) / 3_600_000);
    const base = dias === 1 ? "falta 1 dia" : `faltam ${dias} dias`;
    return horas > 0 ? `${base} e ${horas}h` : base;
  }
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `faltam ${h}h ${m}min` : `faltam ${m}min`;
}

export const TIMEZONE = "America/Sao_Paulo";

export function formatDataHora(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

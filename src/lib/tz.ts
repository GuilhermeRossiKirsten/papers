// O Brasil não tem horário de verão desde 2019: America/Sao_Paulo é UTC-3 fixo.
const OFFSET = "-03:00";
const OFFSET_MS = 3 * 3_600_000;

/** "2026-11-10T19:00" (horário de São Paulo, vindo de <input type="datetime-local">) -> ISO UTC. */
export function saoPauloInputToIso(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return "";
  const d = new Date(`${value}:00${OFFSET}`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** ISO UTC -> "2026-11-10T19:00" no horário de São Paulo. */
export function isoToSaoPauloInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - OFFSET_MS).toISOString().slice(0, 16);
}

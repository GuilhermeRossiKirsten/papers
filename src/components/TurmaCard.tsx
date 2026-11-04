import Link from "next/link";
import { formatDataHora } from "@/lib/session-state";
import { getTurmaStatus, proximaSessao, STATUS_LABEL } from "@/lib/turma-status";
import type { TurmaDTO } from "@/lib/types";

/** Linha de lista (sem caixa) — pensada para toque no celular: área clicável inteira. */
export function TurmaCard({ turma, now, inscritos }: { turma: TurmaDTO; now: Date; inscritos?: number }) {
  const status = getTurmaStatus(turma.sessoes, now);
  const prox = proximaSessao(turma.sessoes, now);
  const meta = [
    prox ? formatDataHora(new Date(prox.inicio)) : `${turma.sessoes.length} ${turma.sessoes.length === 1 ? "sessão" : "sessões"}`,
    inscritos !== undefined ? `${inscritos} inscrito${inscritos === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  return (
    <Link href={`/turmas/${turma.slug}`} className="group block border-b border-linha py-5 active:bg-marca-claro">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-medium leading-snug group-hover:underline group-hover:underline-offset-4">{turma.titulo}</h3>
          <p className="mt-1 truncate text-sm text-grafite">{turma.paper.titulo}</p>
          <p className="mt-2 text-xs text-grafite">{meta.join(" · ")}</p>
        </div>
        <span className="shrink-0 pt-0.5 text-xs text-grafite">
          {!turma.publicada ? "Rascunho" : STATUS_LABEL[status]}
        </span>
      </div>
    </Link>
  );
}

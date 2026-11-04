import Link from "next/link";
import { formatDataHora } from "@/lib/session-state";
import { getTurmaStatus, proximaSessao, STATUS_LABEL } from "@/lib/turma-status";
import type { TurmaDTO } from "@/lib/types";

export function TurmaCard({ turma, now, inscritos }: { turma: TurmaDTO; now: Date; inscritos?: number }) {
  const status = getTurmaStatus(turma.sessoes, now);
  const prox = proximaSessao(turma.sessoes, now);
  return (
    <Link
      href={`/turmas/${turma.slug}`}
      className="group flex flex-col rounded-xl border border-linha bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between text-xs">
        <span
          className={
            status === "encerrada"
              ? "rounded-full bg-stone-100 px-2 py-0.5 text-grafite"
              : "rounded-full bg-marca-claro px-2 py-0.5 font-semibold text-marca"
          }
        >
          {STATUS_LABEL[status]}
        </span>
        {!turma.publicada && <span className="rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">Rascunho</span>}
      </div>
      <h3 className="font-serif text-xl font-semibold leading-snug group-hover:text-marca">{turma.titulo}</h3>
      <p className="mt-1 text-sm italic text-grafite">
        “{turma.paper.titulo}”{turma.paper.autores && ` — ${turma.paper.autores}`}
      </p>
      <div className="mt-auto pt-4 text-sm text-grafite">
        {prox ? (
          <p>Próxima sessão: {formatDataHora(new Date(prox.inicio))}</p>
        ) : (
          <p>
            {turma.sessoes.length} {turma.sessoes.length === 1 ? "sessão" : "sessões"}
          </p>
        )}
        {inscritos !== undefined && (
          <p>
            {inscritos} inscrito{inscritos === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </Link>
  );
}

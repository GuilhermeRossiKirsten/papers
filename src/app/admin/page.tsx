import type { Metadata } from "next";
import Link from "next/link";
import { formatDataHora } from "@/lib/session-state";
import { getTurmaStatus, proximaSessao, STATUS_LABEL } from "@/lib/turma-status";
import { countInscritos, listTurmas } from "@/lib/turmas";
import { criarMock, removerMock } from "./actions";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const now = new Date();
  const turmas = await listTurmas({ incluirRascunhos: true });
  const contagem = await countInscritos(turmas.map((t) => t.id));
  const temMock = turmas.some((t) => t.mock);

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Admin</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/admin/turmas/nova"
          className="flex min-h-12 items-center justify-center rounded-full bg-marca px-6 text-sm font-medium text-white hover:bg-orange-900"
        >
          Nova turma
        </Link>
        <form action={criarMock}>
          <button
            title="Cria 3 turmas de exemplo (ao vivo, em breve e encerrada) para visualizar a interface"
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-dashed border-linha px-6 text-sm text-grafite hover:border-tinta hover:text-tinta sm:w-auto"
          >
            Mock
          </button>
        </form>
        {temMock && (
          <form action={removerMock}>
            <button className="min-h-12 w-full px-2 text-sm text-grafite hover:text-aovivo sm:w-auto">Remover mocks</button>
          </form>
        )}
      </div>

      <ul className="mt-10 border-t border-linha">
        {turmas.length === 0 && <li className="py-6 text-grafite">Nenhuma turma ainda. Crie a primeira.</li>}
        {turmas.map((t) => {
          const prox = proximaSessao(t.sessoes, now);
          const meta = [
            t.publicada ? STATUS_LABEL[getTurmaStatus(t.sessoes, now)] : "Rascunho",
            prox ? formatDataHora(new Date(prox.inicio)) : null,
            `${contagem[t.id] ?? 0} inscritos`,
          ].filter(Boolean);
          return (
            <li key={t.id} className="flex items-center justify-between gap-4 border-b border-linha py-4">
              <Link href={`/admin/turmas/${t.id}`} className="min-w-0 flex-1 py-1">
                <p className="truncate font-medium">{t.titulo}</p>
                <p className="mt-1 text-xs text-grafite">{meta.join(" · ")}</p>
              </Link>
              <Link href={`/turmas/${t.slug}`} className="shrink-0 px-2 py-3 text-sm text-grafite hover:text-tinta">
                Ver
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-8 text-sm leading-relaxed text-grafite">
        Para adicionar ou remover admins, edite a variável <code className="text-tinta">ADMIN_GITHUB_LOGINS</code> na Vercel e faça um novo deploy.
      </p>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { formatDataHora } from "@/lib/session-state";
import { getTurmaStatus, proximaSessao, STATUS_LABEL } from "@/lib/turma-status";
import { countInscritos, listTurmas } from "@/lib/turmas";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const now = new Date();
  const turmas = await listTurmas({ incluirRascunhos: true });
  const contagem = await countInscritos(turmas.map((t) => t.id));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl font-semibold">Painel admin</h1>
        <Link href="/admin/turmas/nova" className="rounded-lg bg-marca px-4 py-2 font-semibold text-white hover:bg-orange-900">
          + Nova turma
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-linha bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-linha bg-stone-50 text-grafite">
            <tr>
              <th className="p-3">Turma</th>
              <th className="p-3">Status</th>
              <th className="p-3">Próxima sessão</th>
              <th className="p-3">Inscritos</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {turmas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-grafite">
                  Nenhuma turma ainda. Crie a primeira!
                </td>
              </tr>
            )}
            {turmas.map((t) => {
              const prox = proximaSessao(t.sessoes, now);
              return (
                <tr key={t.id} className="border-b border-linha last:border-0">
                  <td className="p-3">
                    <p className="font-semibold">{t.titulo}</p>
                    <p className="text-xs text-grafite">/{t.slug}</p>
                  </td>
                  <td className="p-3">
                    {t.publicada ? STATUS_LABEL[getTurmaStatus(t.sessoes, now)] : <span className="text-yellow-700">Rascunho</span>}
                  </td>
                  <td className="p-3">{prox ? formatDataHora(new Date(prox.inicio)) : "—"}</td>
                  <td className="p-3">{contagem[t.id] ?? 0}</td>
                  <td className="space-x-3 p-3 text-right whitespace-nowrap">
                    <Link href={`/turmas/${t.slug}`} className="text-grafite hover:underline">
                      ver
                    </Link>
                    <Link href={`/admin/turmas/${t.id}`} className="font-semibold text-marca hover:underline">
                      editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm text-grafite">
        Para adicionar ou remover admins, edite a variável <code>ADMIN_GITHUB_LOGINS</code> na Vercel e faça um novo deploy.
      </p>
    </>
  );
}

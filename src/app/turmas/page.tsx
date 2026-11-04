import type { Metadata } from "next";
import { TurmaCard } from "@/components/TurmaCard";
import { getTurmaStatus } from "@/lib/turma-status";
import { listTurmas } from "@/lib/turmas";
import type { TurmaDTO } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Turmas" };

function Lista({ turmas, now, vazio }: { turmas: TurmaDTO[]; now: Date; vazio: string }) {
  if (turmas.length === 0) return <p className="border-t border-linha py-6 text-grafite">{vazio}</p>;
  return (
    <ul className="border-t border-linha">
      {turmas.map((t) => (
        <li key={t.id}>
          <TurmaCard turma={t} now={now} />
        </li>
      ))}
    </ul>
  );
}

export default async function TurmasPage() {
  const now = new Date();
  const turmas = await listTurmas();
  const abertas = turmas.filter((t) => getTurmaStatus(t.sessoes, now) !== "encerrada");
  const encerradas = turmas.filter((t) => getTurmaStatus(t.sessoes, now) === "encerrada");

  return (
    <div className="pt-6 sm:pt-12">
      <h1 className="text-3xl font-semibold tracking-tight">Turmas</h1>

      <section className="mt-10">
        <h2 className="mb-2 text-sm font-medium text-grafite">Abertas</h2>
        <Lista turmas={abertas} now={now} vazio="Nenhuma turma aberta no momento." />
      </section>

      <section id="arquivo" className="mt-14 scroll-mt-6">
        <h2 className="mb-2 text-sm font-medium text-grafite">Arquivo</h2>
        <Lista turmas={encerradas} now={now} vazio="Ainda não há turmas encerradas." />
      </section>
    </div>
  );
}

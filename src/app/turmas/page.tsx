import type { Metadata } from "next";
import { TurmaCard } from "@/components/TurmaCard";
import { getTurmaStatus } from "@/lib/turma-status";
import { listTurmas } from "@/lib/turmas";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Turmas" };

export default async function TurmasPage() {
  const now = new Date();
  const turmas = await listTurmas();
  const abertas = turmas.filter((t) => getTurmaStatus(t.sessoes, now) !== "encerrada");
  const encerradas = turmas.filter((t) => getTurmaStatus(t.sessoes, now) === "encerrada");

  return (
    <div className="py-12">
      <h1 className="font-serif text-4xl font-semibold">Turmas</h1>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-2xl font-semibold">Em breve e em andamento</h2>
        {abertas.length === 0 ? (
          <p className="text-grafite">Nenhuma turma aberta no momento.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {abertas.map((t) => (
              <TurmaCard key={t.id} turma={t} now={now} />
            ))}
          </div>
        )}
      </section>

      <section id="arquivo" className="mt-14 scroll-mt-24">
        <h2 className="mb-1 font-serif text-2xl font-semibold">Arquivo</h2>
        <p className="mb-4 text-grafite">Turmas encerradas, com o paper debatido e as gravações.</p>
        {encerradas.length === 0 ? (
          <p className="text-grafite">Ainda não há turmas encerradas.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {encerradas.map((t) => (
              <TurmaCard key={t.id} turma={t} now={now} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

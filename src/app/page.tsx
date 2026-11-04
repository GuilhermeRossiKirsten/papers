import Link from "next/link";
import { LiveBanner } from "@/components/LiveBanner";
import { TurmaCard } from "@/components/TurmaCard";
import { sobre } from "@/content/sobre";
import { liveCandidates } from "@/lib/live";
import { getTurmaStatus } from "@/lib/turma-status";
import { countInscritos, listTurmas } from "@/lib/turmas";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const turmas = await listTurmas();
  const abertas = turmas.filter((t) => getTurmaStatus(t.sessoes, now) !== "encerrada");
  const encerradas = turmas.filter((t) => getTurmaStatus(t.sessoes, now) === "encerrada");
  const contagem = await countInscritos(abertas.map((t) => t.id));

  return (
    <>
      <LiveBanner candidatas={liveCandidates(turmas, now)} serverNow={now.toISOString()} />

      <section className="py-16 sm:py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-marca">Clube de leitura de papers</p>
        <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          {sobre.slogan}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-grafite">{sobre.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/turmas" className="rounded-lg bg-marca px-5 py-3 font-semibold text-white hover:bg-orange-900">
            Ver turmas
          </Link>
          {encerradas.length > 0 && (
            <Link href="/turmas#arquivo" className="rounded-lg border border-tinta px-5 py-3 font-semibold hover:bg-tinta hover:text-papel">
              Assistir gravações
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-6 border-y border-linha py-12 sm:grid-cols-3">
        {sobre.passos.map((p, i) => (
          <div key={p.titulo}>
            <span className="font-serif text-4xl text-marca">{i + 1}.</span>
            <h2 className="mt-2 font-serif text-xl font-semibold">{p.titulo}</h2>
            <p className="mt-1 text-grafite">{p.texto}</p>
          </div>
        ))}
      </section>

      <section className="py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-3xl font-semibold">Próximas turmas</h2>
          <Link href="/turmas" className="text-sm text-marca hover:underline">
            todas as turmas →
          </Link>
        </div>
        {abertas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-linha p-8 text-center text-grafite">
            Nenhuma turma aberta no momento. Volte em breve!
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {abertas.map((t) => (
              <TurmaCard key={t.id} turma={t} now={now} inscritos={contagem[t.id] ?? 0} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

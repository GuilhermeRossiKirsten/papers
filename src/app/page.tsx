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
  const contagem = await countInscritos(abertas.map((t) => t.id));

  return (
    <>
      <LiveBanner candidatas={liveCandidates(turmas, now)} serverNow={now.toISOString()} />

      <section className="py-16 sm:py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-marca">{sobre.nome}</p>
        <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          {sobre.slogan}
        </h1>
        <div className="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-grafite">
          {sobre.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <blockquote className="mt-8 max-w-2xl border-l-4 border-marca pl-5 font-serif text-2xl italic leading-snug">
          {sobre.destaque}
        </blockquote>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/turmas" className="rounded-lg bg-marca px-5 py-3 font-semibold text-white hover:bg-orange-900">
            {sobre.ctaTurmas}
          </Link>
          <Link href="/turmas#arquivo" className="rounded-lg border border-tinta px-5 py-3 font-semibold hover:bg-tinta hover:text-papel">
            {sobre.ctaArquivo}
          </Link>
        </div>
      </section>

      <section className="border-y border-linha py-14">
        <h2 className="mb-8 font-serif text-3xl font-semibold">{sobre.passosTitulo}</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {sobre.passos.map((p, i) => (
            <div key={p.titulo}>
              <span className="font-serif text-4xl text-marca">{String(i + 1).padStart(2, "0")}.</span>
              <h3 className="mt-2 font-serif text-xl font-semibold">{p.titulo}</h3>
              <p className="mt-2 leading-relaxed text-grafite">{p.texto}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-lg text-grafite">{sobre.passosFechamento}</p>
        <p className="mt-6 font-serif text-xl font-semibold">{sobre.lema}</p>
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

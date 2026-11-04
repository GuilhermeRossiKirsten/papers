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
  const [primeiro, ...resto] = sobre.intro;

  return (
    <>
      <LiveBanner candidatas={liveCandidates(turmas, now)} serverNow={now.toISOString()} />

      <section className="pt-10 pb-16 sm:pt-20 sm:pb-24">
        <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight sm:text-5xl">{sobre.slogan}</h1>
        <p className="mt-6 text-base leading-relaxed text-grafite sm:text-lg">{primeiro}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/turmas"
            className="flex min-h-12 items-center justify-center rounded-full bg-tinta px-6 text-sm font-medium text-white hover:opacity-85"
          >
            {sobre.ctaTurmas}
          </Link>
          <Link
            href="/turmas#arquivo"
            className="flex min-h-12 items-center justify-center rounded-full border border-linha px-6 text-sm font-medium hover:border-tinta"
          >
            {sobre.ctaArquivo}
          </Link>
        </div>
      </section>

      <section className="pb-16">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-grafite">Próximas turmas</h2>
          <Link href="/turmas" className="py-2 text-sm text-grafite hover:text-tinta">
            Ver todas
          </Link>
        </div>
        {abertas.length === 0 ? (
          <p className="border-t border-linha py-8 text-grafite">Nenhuma turma aberta no momento. Volte em breve.</p>
        ) : (
          <ul className="border-t border-linha">
            {abertas.map((t) => (
              <li key={t.id}>
                <TurmaCard turma={t} now={now} inscritos={contagem[t.id] ?? 0} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-5 border-t border-linha py-16 text-base leading-relaxed text-grafite sm:text-lg">
        {resto.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="pt-4 text-xl font-medium leading-snug text-tinta sm:text-2xl">{sobre.destaque}</p>
      </section>

      <section className="border-t border-linha py-16">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{sobre.passosTitulo}</h2>
        <ol className="mt-8 space-y-8">
          {sobre.passos.map((p, i) => (
            <li key={p.titulo} className="grid grid-cols-[2.5rem_1fr] gap-2">
              <span className="text-sm tabular-nums text-grafite">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-medium">{p.titulo}</h3>
                <p className="mt-1 leading-relaxed text-grafite">{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 leading-relaxed text-grafite">{sobre.passosFechamento}</p>
      </section>
    </>
  );
}

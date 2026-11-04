import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, signIn } from "@/auth";
import { GitHubButton } from "@/components/GitHubButton";
import { LiveBanner } from "@/components/LiveBanner";
import { SessaoCard } from "@/components/SessaoCard";
import { liveCandidates } from "@/lib/live";
import { getTurmaStatus, STATUS_LABEL } from "@/lib/turma-status";
import { getTurmaBySlug, listInscritos } from "@/lib/turmas";
import { cancelarInscricao, inscrever } from "./actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const turma = await getTurmaBySlug(slug);
  return { title: turma?.titulo ?? "Turma" };
}

export default async function TurmaPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const user = session?.user;
  const turma = await getTurmaBySlug(slug, { incluirRascunhos: !!user?.isAdmin });
  if (!turma) notFound();

  const now = new Date();
  const inscritos = await listInscritos(turma.id);
  const inscrito = !!user && inscritos.some((i) => i.githubId === user.githubId);
  const status = getTurmaStatus(turma.sessoes, now);

  return (
    <div className="py-10">
      <Link href="/turmas" className="text-sm text-grafite hover:text-marca">
        ← Turmas
      </Link>

      <LiveBanner candidatas={liveCandidates([turma], now)} serverNow={now.toISOString()} />

      <header className="mt-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-marca-claro px-2 py-0.5 font-semibold text-marca">{STATUS_LABEL[status]}</span>
          {!turma.publicada && <span className="rounded bg-yellow-100 px-2 py-0.5 text-yellow-800">Rascunho</span>}
          {user?.isAdmin && (
            <Link href={`/admin/turmas/${turma.id}`} className="text-grafite underline">
              editar
            </Link>
          )}
        </div>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{turma.titulo}</h1>
        {turma.descricao && <p className="mt-4 max-w-3xl whitespace-pre-line text-lg text-grafite">{turma.descricao}</p>}
      </header>

      <section className="mt-8 rounded-xl border border-linha bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-grafite">
          {turma.paper.origem === "proprio" ? "Paper do clube" : "Paper"}
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">{turma.paper.titulo}</h2>
        {turma.paper.autores && <p className="text-grafite">{turma.paper.autores}</p>}
        <a
          href={turma.paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-semibold text-marca hover:underline"
        >
          Ler o paper ↗
        </a>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <section>
          <h2 className="mb-4 font-serif text-2xl font-semibold">Sessões</h2>
          {turma.sessoes.length === 0 ? (
            <p className="text-grafite">As datas serão divulgadas em breve.</p>
          ) : (
            <div className="space-y-4">
              {turma.sessoes.map((s, i) => (
                <SessaoCard key={s.id} sessao={s} numero={i + 1} serverNow={now.toISOString()} />
              ))}
            </div>
          )}
        </section>

        <aside>
          <h2 className="mb-4 font-serif text-2xl font-semibold">Inscritos ({inscritos.length})</h2>
          {status !== "encerrada" &&
            (user ? (
              <form action={inscrito ? cancelarInscricao : inscrever}>
                <input type="hidden" name="turmaId" value={turma.id} />
                <input type="hidden" name="slug" value={turma.slug} />
                {inscrito ? (
                  <button className="w-full rounded-lg border border-linha px-4 py-2 text-sm text-grafite hover:border-tinta">
                    ✓ Inscrito · cancelar
                  </button>
                ) : (
                  <button className="w-full rounded-lg bg-marca px-4 py-2 font-semibold text-white hover:bg-orange-900">
                    Quero participar
                  </button>
                )}
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: `/turmas/${slug}` });
                }}
              >
                <GitHubButton className="w-full justify-center py-2">Entre para se inscrever</GitHubButton>
              </form>
            ))}
          <ul className="mt-4 flex flex-wrap gap-2">
            {inscritos.map((i) => (
              <li key={i.githubId}>
                <a href={`https://github.com/${i.login}`} target="_blank" rel="noopener noreferrer" title={i.nome || i.login}>
                  <img src={i.avatarUrl} alt={i.login} className="h-10 w-10 rounded-full border border-linha" />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

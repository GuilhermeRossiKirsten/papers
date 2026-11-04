import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Chat } from "@/components/Chat";
import { GitHubButton } from "@/components/GitHubButton";
import { LiveBanner } from "@/components/LiveBanner";
import { SessaoCard } from "@/components/SessaoCard";
import { liveCandidates } from "@/lib/live";
import { listMensagens } from "@/lib/mensagens";
import { getTurmaStatus, STATUS_LABEL } from "@/lib/turma-status";
import { getTurmaBySlug, listInscritos, parseObjectId } from "@/lib/turmas";
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
  const chat = await listMensagens(parseObjectId(turma.id)!);

  const entrar = (rotulo: string, className = "") => (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: `/turmas/${slug}` });
      }}
    >
      <GitHubButton className={className}>{rotulo}</GitHubButton>
    </form>
  );

  // Ordem muda por tamanho de tela (flex + order):
  // celular: título → inscrição → sessões → chat → paper → descrição → inscritos
  // desktop: título → descrição → paper → inscrição/inscritos → sessões → chat
  return (
    <div className="flex flex-col pt-2 sm:pt-6">
      {/* No celular a sessão ao vivo já aparece no topo da lista; o banner fica só no desktop. */}
      <div className="hidden sm:block">
        <LiveBanner candidatas={liveCandidates([turma], now)} serverNow={now.toISOString()} />
      </div>

      <header className="order-1">
        <Link href="/turmas" className="inline-block py-2 text-sm text-grafite hover:text-tinta">
          ← Turmas
        </Link>
        <p className="mt-4 flex flex-wrap gap-x-3 text-xs text-grafite">
          <span>{STATUS_LABEL[status]}</span>
          {!turma.publicada && <span>Rascunho</span>}
          {user?.isAdmin && (
            <Link href={`/admin/turmas/${turma.id}`} className="underline underline-offset-4 hover:text-tinta">
              Editar
            </Link>
          )}
        </p>
        <h1 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">{turma.titulo}</h1>
      </header>

      {turma.descricao && (
        <p className="order-6 mt-10 whitespace-pre-line leading-relaxed text-grafite sm:order-2 sm:mt-5 sm:text-lg">
          {turma.descricao}
        </p>
      )}

      <section className="order-5 mt-10 border-t border-linha pt-6 sm:order-3 sm:mt-10">
        <h2 className="text-sm font-medium text-grafite">{turma.paper.origem === "proprio" ? "Paper autoral" : "Paper"}</h2>
        <p className="mt-2 font-medium">{turma.paper.titulo}</p>
        {turma.paper.autores && <p className="text-sm text-grafite">{turma.paper.autores}</p>}
        <a
          href={turma.paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block py-1 text-sm underline underline-offset-4 hover:text-grafite"
        >
          Ler o paper ↗
        </a>
      </section>

      {status !== "encerrada" && (
        <div className="order-2 mt-6 sm:order-4 sm:mt-8">
          {user ? (
            <form action={inscrito ? cancelarInscricao : inscrever}>
              <input type="hidden" name="turmaId" value={turma.id} />
              <input type="hidden" name="slug" value={turma.slug} />
              {inscrito ? (
                <button className="flex min-h-12 w-full items-center justify-center rounded-full border border-linha px-6 text-sm text-grafite hover:border-tinta sm:w-auto">
                  Inscrito · cancelar
                </button>
              ) : (
                <button className="flex min-h-12 w-full items-center justify-center rounded-full bg-tinta px-6 text-sm font-medium text-white hover:opacity-85 sm:w-auto">
                  Quero participar
                </button>
              )}
            </form>
          ) : (
            entrar("Entre para se inscrever", "min-h-12 w-full sm:w-auto")
          )}
        </div>
      )}

      <section className="order-7 mt-10 border-t border-linha pt-6 sm:order-4 sm:mt-6 sm:border-0 sm:pt-0">
        <h2 className="text-sm font-medium text-grafite sm:sr-only">Inscritos ({inscritos.length})</h2>
        {inscritos.length > 0 ? (
          <div className="mt-3 flex items-center gap-3">
            <ul className="flex flex-wrap -space-x-2">
              {inscritos.slice(0, 24).map((i) => (
                <li key={i.githubId}>
                  <a href={`https://github.com/${i.login}`} target="_blank" rel="noopener noreferrer" title={`@${i.login}`}>
                    <img src={i.avatarUrl} alt={`@${i.login}`} className="h-8 w-8 rounded-full border-2 border-papel" />
                  </a>
                </li>
              ))}
            </ul>
            <span className="text-sm text-grafite">
              {inscritos.length} inscrito{inscritos.length === 1 ? "" : "s"}
            </span>
          </div>
        ) : (
          <p className="mt-3 text-sm text-grafite">Ninguém inscrito ainda.</p>
        )}
      </section>

      <section className="order-3 mt-10 sm:order-5 sm:mt-14">
        <h2 className="mb-2 text-sm font-medium text-grafite">Sessões</h2>
        {turma.sessoes.length === 0 ? (
          <p className="border-t border-linha py-6 text-grafite">As datas serão divulgadas em breve.</p>
        ) : (
          <ul className="flex flex-col border-t border-linha">
            {turma.sessoes.map((s, i) => (
              <SessaoCard key={s.id} sessao={s} numero={i + 1} serverNow={now.toISOString()} />
            ))}
          </ul>
        )}
      </section>

      <div className="order-4 sm:order-6">
        <Chat
          turmaId={turma.id}
          usuario={user ? { githubId: user.githubId, login: user.login, isAdmin: user.isAdmin } : null}
          iniciais={chat.mensagens}
          temMaisInicial={chat.temMais}
          entrar={entrar("Entrar com GitHub")}
        />
      </div>
    </div>
  );
}

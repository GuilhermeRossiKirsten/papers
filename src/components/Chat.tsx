"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { apagarMensagem, enviarMensagem } from "@/app/turmas/[slug]/chat-actions";
import { LIMITE_TEXTO, podeApagar, type MensagemDTO } from "@/lib/chat";
import { mesclarMensagens } from "@/lib/chat-merge";
import { TIMEZONE } from "@/lib/session-state";

const POLL_MS = 4000;

type Usuario = { githubId: string; login: string; isAdmin: boolean } | null;

const fmtHora = new Intl.DateTimeFormat("pt-BR", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit" });
const fmtDia = new Intl.DateTimeFormat("pt-BR", { timeZone: TIMEZONE, day: "2-digit", month: "2-digit" });

function quando(iso: string) {
  const d = new Date(iso);
  const hoje = fmtDia.format(new Date()) === fmtDia.format(d);
  return hoje ? fmtHora.format(d) : `${fmtDia.format(d)} ${fmtHora.format(d)}`;
}

export function Chat({
  turmaId,
  usuario,
  iniciais,
  temMaisInicial,
  entrar,
}: {
  turmaId: string;
  usuario: Usuario;
  iniciais: MensagemDTO[];
  temMaisInicial: boolean;
  /** Botão de login (renderizado no servidor) para visitantes. */
  entrar: React.ReactNode;
}) {
  const [mensagens, setMensagens] = useState(iniciais);
  const [temMais, setTemMais] = useState(temMaisInicial);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, startEnviar] = useTransition();
  const [carregandoAntigas, setCarregandoAntigas] = useState(false);
  const lista = useRef<HTMLDivElement>(null);
  const colarNoFim = useRef(true);
  const preservarAltura = useRef<number | null>(null);

  const buscarRecentes = useCallback(async () => {
    try {
      const r = await fetch(`/api/turmas/${turmaId}/mensagens`, { cache: "no-store" });
      if (!r.ok) return;
      const data: { mensagens: MensagemDTO[] } = await r.json();
      setMensagens((atual) => mesclarMensagens(atual, data.mensagens));
    } catch {
      /* rede instável: tenta de novo no próximo ciclo */
    }
  }, [turmaId]);

  // Atualiza a cada POLL_MS enquanto a aba estiver visível.
  useEffect(() => {
    const tick = () => {
      if (!document.hidden) buscarRecentes();
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [buscarRecentes]);

  // Rola para o fim quando chegam mensagens (se a pessoa já estava no fim); mantém a posição ao carregar antigas.
  useLayoutEffect(() => {
    const el = lista.current;
    if (!el) return;
    if (preservarAltura.current !== null) {
      el.scrollTop = el.scrollHeight - preservarAltura.current;
      preservarAltura.current = null;
    } else if (colarNoFim.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [mensagens]);

  function aoRolar() {
    const el = lista.current;
    if (el) colarNoFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }

  async function carregarAntigas() {
    if (!mensagens.length) return;
    setCarregandoAntigas(true);
    try {
      const r = await fetch(`/api/turmas/${turmaId}/mensagens?antes=${mensagens[0].id}`, { cache: "no-store" });
      if (r.ok) {
        const data: { mensagens: MensagemDTO[]; temMais: boolean } = await r.json();
        const el = lista.current;
        preservarAltura.current = el ? el.scrollHeight - el.scrollTop : null;
        setMensagens((atual) => mesclarMensagens(atual, data.mensagens, "antigas"));
        setTemMais(data.temMais);
      }
    } finally {
      setCarregandoAntigas(false);
    }
  }

  function enviar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!texto.trim() || enviando) return;
    setErro("");
    startEnviar(async () => {
      const r = await enviarMensagem(turmaId, texto);
      if (!r.ok) return setErro(r.erro);
      setTexto("");
      colarNoFim.current = true;
      if (r.data) setMensagens((atual) => [...atual, r.data!]);
    });
  }

  async function apagar(id: string) {
    const anterior = mensagens;
    setMensagens((atual) => atual.filter((m) => m.id !== id));
    const r = await apagarMensagem(id);
    if (!r.ok) {
      setMensagens(anterior);
      setErro(r.erro);
    }
  }

  return (
    <section className="mt-12 rounded-xl border border-linha bg-white">
      <header className="flex items-baseline justify-between border-b border-linha px-5 py-4">
        <h2 className="font-serif text-2xl font-semibold">Discussão da turma</h2>
        <span className="text-xs text-grafite">atualiza automaticamente</span>
      </header>

      <div ref={lista} onScroll={aoRolar} className="h-[28rem] space-y-4 overflow-y-auto px-5 py-4">
        {temMais && (
          <div className="text-center">
            <button onClick={carregarAntigas} disabled={carregandoAntigas} className="text-sm text-marca hover:underline disabled:opacity-50">
              {carregandoAntigas ? "carregando…" : "ver mensagens mais antigas"}
            </button>
          </div>
        )}
        {mensagens.length === 0 && (
          <p className="py-16 text-center text-grafite">Ninguém comentou ainda. Compartilhe a primeira ideia!</p>
        )}
        {mensagens.map((m) => (
          <article key={m.id} className="group flex gap-3">
            {m.avatarUrl ? (
              <img src={m.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full border border-linha" />
            ) : (
              <span className="h-9 w-9 shrink-0 rounded-full bg-linha" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 text-sm">
                <a href={`https://github.com/${m.login}`} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                  @{m.login}
                </a>
                <time dateTime={m.criadoEm} className="text-xs text-grafite" suppressHydrationWarning>
                  {quando(m.criadoEm)}
                </time>
                {podeApagar(m, usuario) && (
                  <button
                    onClick={() => apagar(m.id)}
                    className="ml-auto text-xs text-grafite opacity-0 hover:text-red-700 focus:opacity-100 group-hover:opacity-100"
                  >
                    apagar
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{m.texto}</p>
            </div>
          </article>
        ))}
      </div>

      <footer className="border-t border-linha p-4">
        {usuario ? (
          <form onSubmit={enviar}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              maxLength={LIMITE_TEXTO}
              rows={2}
              placeholder="Compartilhe uma ideia, dúvida ou interpretação… (Enter envia, Shift+Enter quebra linha)"
              className="w-full resize-none rounded-md border border-linha px-3 py-2 text-sm focus:border-marca focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-grafite">
                {erro ? <span className="text-red-700">{erro}</span> : `${texto.length}/${LIMITE_TEXTO}`}
              </span>
              <button
                disabled={enviando || !texto.trim()}
                className="rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white hover:bg-orange-900 disabled:opacity-50"
              >
                {enviando ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-grafite">Entre com sua conta do GitHub para participar da discussão.</p>
            {entrar}
          </div>
        )}
      </footer>
    </section>
  );
}

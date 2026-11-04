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
    <section className="mt-10 sm:mt-14">
      <h2 className="mb-3 font-serif text-xl font-semibold">Discussão da turma</h2>

      <div ref={lista} onScroll={aoRolar} className="h-[55vh] max-h-[32rem] min-h-64 space-y-5 overflow-y-auto overscroll-contain border-y border-linha py-5 sm:h-[28rem]">
        {temMais && (
          <div className="text-center">
            <button onClick={carregarAntigas} disabled={carregandoAntigas} className="py-2 text-sm text-grafite underline underline-offset-4 hover:text-tinta disabled:opacity-50">
              {carregandoAntigas ? "carregando…" : "Ver mensagens anteriores"}
            </button>
          </div>
        )}
        {mensagens.length === 0 && (
          <p className="py-16 text-center text-sm text-grafite">Nenhuma mensagem ainda. Compartilhe a primeira ideia.</p>
        )}
        {mensagens.map((m) => (
          <article key={m.id} className="group flex gap-3">
            {m.avatarUrl ? (
              <img src={m.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full" />
            ) : (
              <span className="h-8 w-8 shrink-0 rounded-full bg-linha" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 text-sm">
                <a href={`https://github.com/${m.login}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                  @{m.login}
                </a>
                <time dateTime={m.criadoEm} className="text-xs text-grafite" suppressHydrationWarning>
                  {quando(m.criadoEm)}
                </time>
                {podeApagar(m, usuario) && (
                  <button
                    onClick={() => apagar(m.id)}
                    className="-my-2 ml-auto px-2 py-2 text-xs text-grafite hover:text-aovivo focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    apagar
                  </button>
                )}
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words leading-relaxed">{m.texto}</p>
            </div>
          </article>
        ))}
      </div>

      <footer className="pt-4">
        {usuario ? (
          <form onSubmit={enviar}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
                  e.preventDefault();
                  enviar();
                }
              }}
              maxLength={LIMITE_TEXTO}
              rows={2}
              placeholder="Compartilhe uma ideia, dúvida ou interpretação…"
              className="w-full resize-none rounded-2xl border border-linha px-4 py-3 text-base focus:border-tinta focus:outline-none sm:text-sm"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-grafite">
                {erro ? <span className="text-aovivo">{erro}</span> : texto.length > LIMITE_TEXTO * 0.8 ? `${texto.length}/${LIMITE_TEXTO}` : ""}
              </span>
              <button
                disabled={enviando || !texto.trim()}
                className="flex min-h-11 items-center rounded-full bg-marca px-5 text-sm font-medium text-white hover:bg-orange-900 disabled:opacity-30"
              >
                {enviando ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-grafite">Entre com sua conta do GitHub para participar da discussão.</p>
            {entrar}
          </div>
        )}
      </footer>
    </section>
  );
}

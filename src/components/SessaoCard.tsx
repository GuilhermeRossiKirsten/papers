"use client";
import { formatCountdown, formatDataHora, getSessionState } from "@/lib/session-state";
import type { SessaoDTO } from "@/lib/types";
import { useNow } from "./useNow";

export function SessaoCard({ sessao, numero, serverNow }: { sessao: SessaoDTO; numero: number; serverNow: string }) {
  const now = useNow(serverNow);
  const inicio = new Date(sessao.inicio);
  const estado = getSessionState(inicio, sessao.duracaoMin, now);
  const titulo = sessao.titulo || `Sessão ${numero}`;

  if (estado === "aovivo") {
    return (
      <article className="rounded-xl border-2 border-aovivo bg-white p-5 shadow-lg shadow-red-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="pulso inline-flex items-center gap-2 rounded-full bg-aovivo px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <span className="h-2 w-2 rounded-full bg-white" /> Ao vivo
            </span>
            <h3 className="mt-2 font-serif text-xl font-semibold">{titulo}</h3>
            <p className="text-sm text-grafite">Começou {formatDataHora(inicio)}</p>
          </div>
          {sessao.linkAoVivo ? (
            <a
              href={sessao.linkAoVivo}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-aovivo px-6 py-3 text-lg font-bold text-white hover:bg-red-700"
            >
              ▶ Comece agora
            </a>
          ) : (
            <span className="text-sm text-grafite">O link será publicado em instantes</span>
          )}
        </div>
      </article>
    );
  }

  if (estado === "antes") {
    return (
      <article className="rounded-xl border border-linha bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-semibold">{titulo}</h3>
            <p className="text-sm text-grafite">
              {formatDataHora(inicio)} · {sessao.duracaoMin} min
            </p>
            {sessao.linkAoVivo && (
              <a
                href={sessao.linkAoVivo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-grafite underline"
              >
                link da sessão
              </a>
            )}
          </div>
          <span className="rounded-lg bg-marca-claro px-4 py-2 text-sm font-semibold tabular-nums text-marca">
            ⏳ {formatCountdown(inicio.getTime() - now.getTime())}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-linha bg-white/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-semibold">{titulo}</h3>
          <p className="text-sm text-grafite">Aconteceu {formatDataHora(inicio)}</p>
        </div>
        {sessao.gravacaoUrl ? (
          <a
            href={sessao.gravacaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-tinta px-4 py-2 text-sm font-semibold hover:bg-tinta hover:text-papel"
          >
            🎬 Assistir gravação
          </a>
        ) : (
          <span className="text-sm italic text-grafite">gravação em breve</span>
        )}
      </div>
    </article>
  );
}

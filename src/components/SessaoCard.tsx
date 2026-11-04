"use client";
import { formatCountdown, formatDataHora, getSessionState } from "@/lib/session-state";
import type { SessaoDTO } from "@/lib/types";
import { useNow } from "./useNow";

const botao = "flex min-h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium sm:w-auto";

export function SessaoCard({ sessao, numero, serverNow }: { sessao: SessaoDTO; numero: number; serverNow: string }) {
  const now = useNow(serverNow);
  const inicio = new Date(sessao.inicio);
  const estado = getSessionState(inicio, sessao.duracaoMin, now);
  const titulo = sessao.titulo || `Sessão ${numero}`;

  let linha: React.ReactNode;
  let acao: React.ReactNode = null;

  if (estado === "aovivo") {
    linha = (
      <span className="inline-flex items-center gap-1.5 font-medium text-aovivo">
        <span className="pulso h-1.5 w-1.5 rounded-full bg-aovivo" /> Ao vivo
      </span>
    );
    acao = sessao.linkAoVivo ? (
      <a href={sessao.linkAoVivo} target="_blank" rel="noopener noreferrer" className={`${botao} bg-aovivo text-white hover:opacity-90`}>
        Comece agora
      </a>
    ) : (
      <span className="text-sm text-grafite">O link será publicado em instantes</span>
    );
  } else if (estado === "antes") {
    linha = (
      <>
        <span>{formatDataHora(inicio)}</span>
        <span className="text-tinta">{formatCountdown(inicio.getTime() - now.getTime())}</span>
      </>
    );
    acao = sessao.linkAoVivo ? (
      <a href={sessao.linkAoVivo} target="_blank" rel="noopener noreferrer" className="py-2 text-sm text-grafite underline underline-offset-4 hover:text-tinta">
        Link da sessão
      </a>
    ) : null;
  } else {
    linha = <span>{formatDataHora(inicio)}</span>;
    acao = sessao.gravacaoUrl ? (
      <a href={sessao.gravacaoUrl} target="_blank" rel="noopener noreferrer" className={`${botao} border border-linha hover:border-tinta`}>
        Assistir gravação
      </a>
    ) : (
      <span className="text-sm text-grafite">Gravação em breve</span>
    );
  }

  return (
    <li className={`border-b border-linha py-5 ${estado === "depois" ? "text-grafite max-sm:order-last" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className={`font-medium ${estado === "depois" ? "" : "text-tinta"}`}>{titulo}</h3>
          <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-grafite">{linha}</p>
        </div>
        {acao}
      </div>
    </li>
  );
}

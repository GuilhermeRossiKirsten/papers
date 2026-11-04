"use client";
import Link from "next/link";
import { getSessionState } from "@/lib/session-state";
import type { LiveCandidate } from "@/lib/live";
import { useNow } from "./useNow";

/**
 * Destaque quando há sessão ao vivo. No celular vira uma barra fixa no rodapé da tela
 * (sempre ao alcance do polegar); no desktop fica no topo do conteúdo.
 */
export function LiveBanner({ candidatas, serverNow }: { candidatas: LiveCandidate[]; serverNow: string }) {
  const now = useNow(serverNow);
  const viva = candidatas.find((c) => getSessionState(new Date(c.inicio), c.duracaoMin, now) === "aovivo");
  if (!viva) return null;
  return (
    <div className="barra-aovivo fixed inset-x-0 bottom-0 z-30 border-t border-linha bg-papel/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mt-2 sm:mb-6 sm:rounded-2xl sm:border sm:p-4">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <span className="pulso h-2 w-2 shrink-0 rounded-full bg-aovivo" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-aovivo">Ao vivo agora</p>
          <Link href={`/turmas/${viva.turmaSlug}`} className="block truncate text-sm font-medium hover:underline">
            {viva.turmaTitulo} · {viva.sessaoTitulo}
          </Link>
        </div>
        {viva.linkAoVivo && (
          <a
            href={viva.linkAoVivo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 shrink-0 items-center rounded-full bg-aovivo px-5 text-sm font-medium text-white hover:opacity-90"
          >
            Comece agora
          </a>
        )}
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { getSessionState } from "@/lib/session-state";
import type { LiveCandidate } from "@/lib/live";
import { useNow } from "./useNow";

/** Destaque no topo quando alguma das sessões candidatas está ao vivo (recalculado a cada segundo). */
export function LiveBanner({ candidatas, serverNow }: { candidatas: LiveCandidate[]; serverNow: string }) {
  const now = useNow(serverNow);
  const viva = candidatas.find((c) => getSessionState(new Date(c.inicio), c.duracaoMin, now) === "aovivo");
  if (!viva) return null;
  return (
    <div className="my-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-aovivo p-5 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <span className="pulso inline-flex h-3 w-3 rounded-full bg-white" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest">Ao vivo agora</p>
          <p className="font-serif text-lg font-semibold">
            <Link href={`/turmas/${viva.turmaSlug}`} className="hover:underline">
              {viva.turmaTitulo}
            </Link>
            <span className="font-normal"> — {viva.sessaoTitulo}</span>
          </p>
        </div>
      </div>
      {viva.linkAoVivo && (
        <a
          href={viva.linkAoVivo}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-white px-6 py-3 text-lg font-bold text-aovivo hover:bg-red-50"
        >
          ▶ Comece agora
        </a>
      )}
    </div>
  );
}

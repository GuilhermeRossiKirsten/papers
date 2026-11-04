"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { excluirTurma, salvarTurma } from "@/app/admin/actions";
import { isoToSaoPauloInput, saoPauloInputToIso } from "@/lib/tz";
import type { TurmaDTO } from "@/lib/types";

type SessaoForm = { key: string; id?: string; titulo: string; inicioLocal: string; duracaoMin: number; linkAoVivo: string; gravacaoUrl: string };

const input = "w-full rounded-md border border-linha bg-white px-3 py-2 text-sm focus:border-marca focus:outline-none";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wider text-grafite";

let contador = 0;
const novaChave = () => `nova-${++contador}`;

export function TurmaForm({ turma }: { turma?: TurmaDTO }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const [titulo, setTitulo] = useState(turma?.titulo ?? "");
  const [descricao, setDescricao] = useState(turma?.descricao ?? "");
  const [publicada, setPublicada] = useState(turma?.publicada ?? false);
  const [paper, setPaper] = useState(turma?.paper ?? { titulo: "", autores: "", origem: "externo" as const, url: "" });
  const [sessoes, setSessoes] = useState<SessaoForm[]>(
    turma?.sessoes.map((s) => ({
      key: s.id,
      id: s.id,
      titulo: s.titulo,
      inicioLocal: isoToSaoPauloInput(s.inicio),
      duracaoMin: s.duracaoMin,
      linkAoVivo: s.linkAoVivo,
      gravacaoUrl: s.gravacaoUrl,
    })) ?? [],
  );

  const setSessao = (key: string, patch: Partial<SessaoForm>) =>
    setSessoes((ss) => ss.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  function adicionarSessao() {
    setSessoes((ss) => [
      ...ss,
      { key: novaChave(), titulo: "", inicioLocal: "", duracaoMin: 90, linkAoVivo: "", gravacaoUrl: "" },
    ]);
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setMsg("");
    const semData = sessoes.findIndex((s) => !saoPauloInputToIso(s.inicioLocal));
    if (semData >= 0) {
      setErro(`Sessão ${semData + 1}: informe data e hora.`);
      return;
    }
    const payload = {
      titulo,
      descricao,
      publicada,
      paper,
      sessoes: sessoes.map((s) => ({
        id: s.id,
        titulo: s.titulo,
        inicio: saoPauloInputToIso(s.inicioLocal),
        duracaoMin: Number(s.duracaoMin),
        linkAoVivo: s.linkAoVivo,
        gravacaoUrl: s.gravacaoUrl,
      })),
    };
    startTransition(async () => {
      const r = await salvarTurma(turma?.id ?? null, payload);
      if (!r.ok) return setErro(r.erro);
      if (!turma) router.push(`/admin/turmas/${r.id}`);
      else {
        setMsg("Salvo!");
        router.refresh();
      }
    });
  }

  function excluir() {
    if (!turma) return;
    if (!confirmarExclusao) return setConfirmarExclusao(true);
    startTransition(async () => {
      const r = await excluirTurma(turma.id);
      if ("erro" in r) return setErro(r.erro);
      router.push("/admin");
    });
  }

  return (
    <form onSubmit={salvar} className="space-y-8">
      <fieldset className="space-y-4 rounded-xl border border-linha bg-white p-6">
        <legend className="px-2 font-serif text-lg font-semibold">Turma</legend>
        <div>
          <label className={label} htmlFor="titulo">Título</label>
          <input id="titulo" className={input} value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>
        <div>
          <label className={label} htmlFor="descricao">Descrição</label>
          <textarea id="descricao" rows={4} className={input} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={publicada} onChange={(e) => setPublicada(e.target.checked)} />
          Publicada (visível para todos). Desmarcado = rascunho, só admins veem.
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-linha bg-white p-6">
        <legend className="px-2 font-serif text-lg font-semibold">Paper</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="ptitulo">Título do paper</label>
            <input id="ptitulo" className={input} value={paper.titulo} onChange={(e) => setPaper({ ...paper, titulo: e.target.value })} required />
          </div>
          <div>
            <label className={label} htmlFor="pautores">Autores</label>
            <input id="pautores" className={input} value={paper.autores} onChange={(e) => setPaper({ ...paper, autores: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="porigem">Origem</label>
            <select
              id="porigem"
              className={input}
              value={paper.origem}
              onChange={(e) => setPaper({ ...paper, origem: e.target.value as "externo" | "proprio" })}
            >
              <option value="externo">Externo (arXiv, DOI, site…)</option>
              <option value="proprio">Autoria própria (PDF no GitHub)</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="purl">Link do paper</label>
            <input
              id="purl"
              type="url"
              className={input}
              placeholder={paper.origem === "proprio" ? "https://github.com/openpapers/papers/blob/main/x.pdf" : "https://arxiv.org/abs/..."}
              value={paper.url}
              onChange={(e) => setPaper({ ...paper, url: e.target.value })}
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-linha bg-white p-6">
        <legend className="px-2 font-serif text-lg font-semibold">Sessões ao vivo</legend>
        <p className="text-xs text-grafite">Horários no fuso de Brasília (America/Sao_Paulo).</p>
        {sessoes.map((s, i) => (
          <div key={s.key} className="rounded-lg border border-linha p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold">Sessão {i + 1}</span>
              <button
                type="button"
                className="text-xs text-red-700 hover:underline"
                onClick={() => setSessoes((ss) => ss.filter((x) => x.key !== s.key))}
              >
                remover
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label}>Título (opcional)</label>
                <input className={input} value={s.titulo} placeholder={`Sessão ${i + 1}`} onChange={(e) => setSessao(s.key, { titulo: e.target.value })} />
              </div>
              <div className="grid grid-cols-[1fr_100px] gap-3">
                <div>
                  <label className={label}>Data e hora</label>
                  <input type="datetime-local" className={input} value={s.inicioLocal} onChange={(e) => setSessao(s.key, { inicioLocal: e.target.value })} required />
                </div>
                <div>
                  <label className={label}>Duração (min)</label>
                  <input type="number" min={5} className={input} value={s.duracaoMin} onChange={(e) => setSessao(s.key, { duracaoMin: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className={label}>Link ao vivo</label>
                <input type="url" className={input} placeholder="https://meet.google.com/..." value={s.linkAoVivo} onChange={(e) => setSessao(s.key, { linkAoVivo: e.target.value })} />
              </div>
              <div>
                <label className={label}>Gravação</label>
                <input type="url" className={input} placeholder="https://youtube.com/..." value={s.gravacaoUrl} onChange={(e) => setSessao(s.key, { gravacaoUrl: e.target.value })} />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={adicionarSessao} className="rounded-md border border-dashed border-grafite px-4 py-2 text-sm hover:border-marca hover:text-marca">
          + Adicionar sessão
        </button>
      </fieldset>

      {erro && <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
      {msg && <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{msg}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button disabled={pending} className="rounded-lg bg-marca px-6 py-3 font-semibold text-white hover:bg-orange-900 disabled:opacity-50">
          {pending ? "Salvando…" : turma ? "Salvar alterações" : "Criar turma"}
        </button>
        {turma && (
          <button type="button" onClick={excluir} disabled={pending} className="text-sm text-red-700 hover:underline">
            {confirmarExclusao ? "Clique de novo para confirmar a exclusão" : "Excluir turma"}
          </button>
        )}
      </div>
    </form>
  );
}

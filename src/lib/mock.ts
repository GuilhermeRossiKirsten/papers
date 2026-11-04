import { randomUUID } from "node:crypto";
import type { Paper, Sessao } from "./types";

export type MockTurma = {
  titulo: string;
  descricao: string;
  publicada: boolean;
  mock: true;
  paper: Paper;
  sessoes: Sessao[];
};

const MIN = 60_000;
const DIA = 86_400_000;

/** 3 turmas de exemplo que cobrem todos os estados da interface, relativas a `now`. */
export function mockTurmas(now: Date): MockTurma[] {
  const t = now.getTime();
  const sessao = (offset: number, extra: Partial<Sessao> = {}): Sessao => ({
    id: randomUUID(),
    titulo: "",
    inicio: new Date(t + offset),
    duracaoMin: 90,
    linkAoVivo: "https://meet.google.com/",
    gravacaoUrl: "",
    ...extra,
  });

  return [
    {
      titulo: "[Mock] Transformers do zero",
      descricao: "Turma de exemplo em andamento: uma sessão gravada, uma AO VIVO agora e uma futura.",
      publicada: true,
      mock: true,
      paper: { titulo: "Attention Is All You Need", autores: "Vaswani et al.", origem: "externo", url: "https://arxiv.org/abs/1706.03762" },
      sessoes: [
        sessao(-2 * DIA, { titulo: "Parte 1: Contexto", gravacaoUrl: "https://www.youtube.com/" }),
        sessao(-15 * MIN, { titulo: "Parte 2: Multi-head attention" }),
        sessao(2 * DIA + 3 * 3_600_000, { titulo: "Parte 3: Resultados" }),
      ],
    },
    {
      titulo: "[Mock] Redes residuais",
      descricao: "Turma de exemplo que ainda vai começar, com contagem regressiva.",
      publicada: true,
      mock: true,
      paper: { titulo: "Deep Residual Learning for Image Recognition", autores: "He et al.", origem: "externo", url: "https://arxiv.org/abs/1512.03385" },
      sessoes: [sessao(5 * DIA), sessao(7 * DIA)],
    },
    {
      titulo: "[Mock] Nosso primeiro paper",
      descricao: "Turma de exemplo encerrada, com paper de autoria própria e gravações no arquivo.",
      publicada: true,
      mock: true,
      paper: { titulo: "Um estudo do OpenPapers", autores: "Comunidade OpenPapers", origem: "proprio", url: "https://github.com/" },
      sessoes: [
        sessao(-20 * DIA, { gravacaoUrl: "https://www.youtube.com/" }),
        sessao(-18 * DIA), // sem gravação: mostra "gravação em breve"
      ],
    },
  ];
}

import type { ObjectId } from "mongodb";

export type Sessao = {
  id: string;
  titulo: string;
  inicio: Date;
  duracaoMin: number;
  linkAoVivo: string;
  gravacaoUrl: string;
};

export type Paper = {
  titulo: string;
  autores: string;
  origem: "externo" | "proprio";
  url: string;
};

export type TurmaDoc = {
  _id: ObjectId;
  slug: string;
  titulo: string;
  descricao: string;
  publicada: boolean;
  /** Turma de exemplo criada pelo botão "Mock" do admin. */
  mock?: boolean;
  paper: Paper;
  sessoes: Sessao[];
  criadoEm: Date;
  atualizadoEm: Date;
};

export type InscricaoDoc = {
  _id: ObjectId;
  turmaId: ObjectId;
  githubId: string;
  login: string;
  nome: string;
  avatarUrl: string;
  criadoEm: Date;
};

/** Versões serializáveis (passadas para componentes cliente). */
export type SessaoDTO = Omit<Sessao, "inicio"> & { inicio: string };
export type TurmaDTO = Omit<TurmaDoc, "_id" | "sessoes" | "criadoEm" | "atualizadoEm"> & {
  id: string;
  sessoes: SessaoDTO[];
};
export type InscritoDTO = { githubId: string; login: string; nome: string; avatarUrl: string };

export type TurmaStatus = "em-breve" | "em-andamento" | "encerrada";

import "server-only";
import { ObjectId } from "mongodb";
import { PAGINA, type MensagemDTO } from "./chat";
import { getDb } from "./db";

export type MensagemDoc = {
  _id: ObjectId;
  turmaId: ObjectId;
  githubId: string;
  login: string;
  avatarUrl: string;
  texto: string;
  criadoEm: Date;
};

export async function mensagensCol() {
  return (await getDb()).collection<MensagemDoc>("mensagens");
}

function toDTO(m: MensagemDoc): MensagemDTO {
  return {
    id: m._id.toHexString(),
    githubId: m.githubId,
    login: m.login,
    avatarUrl: m.avatarUrl,
    texto: m.texto,
    criadoEm: m.criadoEm.toISOString(),
  };
}

/**
 * Mensagens da turma em ordem cronológica (mais antiga primeiro).
 * Sem `antes`: as PAGINA mais recentes. Com `antes`: a página anterior a essa mensagem.
 */
export async function listMensagens(
  turmaId: ObjectId,
  antes?: ObjectId,
): Promise<{ mensagens: MensagemDTO[]; temMais: boolean }> {
  const filtro = antes ? { turmaId, _id: { $lt: antes } } : { turmaId };
  const docs = await (await mensagensCol())
    .find(filtro)
    .sort({ _id: -1 })
    .limit(PAGINA + 1)
    .toArray();
  const temMais = docs.length > PAGINA;
  return { mensagens: docs.slice(0, PAGINA).reverse().map(toDTO), temMais };
}

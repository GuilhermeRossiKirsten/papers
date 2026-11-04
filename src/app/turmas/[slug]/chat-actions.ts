"use server";
import { ObjectId } from "mongodb";
import { limparTexto, LIMITE_TEXTO, podeApagar, podeEnviar, type MensagemDTO } from "@/lib/chat";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { mensagensCol } from "@/lib/mensagens";
import { parseObjectId } from "@/lib/turmas";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

export async function enviarMensagem(turmaIdStr: string, texto: string): Promise<Resultado<MensagemDTO>> {
  const user = await requireUser();
  const turmaId = parseObjectId(turmaIdStr);
  if (!turmaId) return { ok: false, erro: "Turma inválida." };

  const limpo = limparTexto(String(texto ?? ""));
  if (!limpo) return { ok: false, erro: `A mensagem precisa ter entre 1 e ${LIMITE_TEXTO} caracteres.` };

  const turma = await (await getDb()).collection("turmas").findOne({ _id: turmaId }, { projection: { publicada: 1 } });
  if (!turma || (!turma.publicada && !user.isAdmin)) return { ok: false, erro: "Turma não encontrada." };

  const col = await mensagensCol();
  const agora = new Date();
  const ultima = await col.findOne({ githubId: user.githubId }, { sort: { _id: -1 }, projection: { criadoEm: 1 } });
  if (!podeEnviar(ultima?.criadoEm ?? null, agora)) return { ok: false, erro: "Calma! Espere alguns segundos entre mensagens." };

  const doc = { _id: new ObjectId(), turmaId, githubId: user.githubId, login: user.login, avatarUrl: user.image ?? "", texto: limpo, criadoEm: agora };
  await col.insertOne(doc);
  const insertedId = doc._id;
  return {
    ok: true,
    data: { id: insertedId.toHexString(), githubId: doc.githubId, login: doc.login, avatarUrl: doc.avatarUrl, texto: limpo, criadoEm: agora.toISOString() },
  };
}

export async function apagarMensagem(idStr: string): Promise<Resultado> {
  const user = await requireUser();
  const id = parseObjectId(idStr);
  if (!id) return { ok: false, erro: "Mensagem inválida." };
  const col = await mensagensCol();
  const msg = await col.findOne({ _id: id }, { projection: { githubId: 1 } });
  if (!msg) return { ok: true };
  if (!podeApagar(msg, user)) return { ok: false, erro: "Você não pode apagar esta mensagem." };
  await col.deleteOne({ _id: id });
  return { ok: true };
}

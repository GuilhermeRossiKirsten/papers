import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "./db";
import type { InscricaoDoc, InscritoDTO, TurmaDoc, TurmaDTO } from "./types";

async function turmasCol() {
  return (await getDb()).collection<TurmaDoc>("turmas");
}
async function inscricoesCol() {
  return (await getDb()).collection<InscricaoDoc>("inscricoes");
}

export function toDTO(t: TurmaDoc): TurmaDTO {
  return {
    id: t._id.toHexString(),
    slug: t.slug,
    titulo: t.titulo,
    descricao: t.descricao,
    publicada: t.publicada,
    paper: { ...t.paper },
    sessoes: [...t.sessoes]
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
      .map((s) => ({ ...s, inicio: s.inicio.toISOString() })),
  };
}

export function parseObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) && /^[a-f0-9]{24}$/i.test(id) ? new ObjectId(id) : null;
}

export async function listTurmas({ incluirRascunhos = false } = {}): Promise<TurmaDTO[]> {
  const col = await turmasCol();
  const docs = await col
    .find(incluirRascunhos ? {} : { publicada: true })
    .sort({ criadoEm: -1 })
    .toArray();
  return docs.map(toDTO);
}

export async function getTurmaBySlug(slug: string, { incluirRascunhos = false } = {}): Promise<TurmaDTO | null> {
  const col = await turmasCol();
  const doc = await col.findOne(incluirRascunhos ? { slug } : { slug, publicada: true });
  return doc ? toDTO(doc) : null;
}

export async function getTurmaById(id: string): Promise<TurmaDTO | null> {
  const oid = parseObjectId(id);
  if (!oid) return null;
  const doc = await (await turmasCol()).findOne({ _id: oid });
  return doc ? toDTO(doc) : null;
}

export async function listInscritos(turmaId: string): Promise<InscritoDTO[]> {
  const oid = parseObjectId(turmaId);
  if (!oid) return [];
  const docs = await (await inscricoesCol()).find({ turmaId: oid }).sort({ criadoEm: 1 }).toArray();
  return docs.map(({ githubId, login, nome, avatarUrl }) => ({ githubId, login, nome, avatarUrl }));
}

export async function countInscritos(turmaIds: string[]): Promise<Record<string, number>> {
  const oids = turmaIds.map(parseObjectId).filter((x): x is ObjectId => !!x);
  const rows = await (await inscricoesCol())
    .aggregate<{ _id: ObjectId; n: number }>([
      { $match: { turmaId: { $in: oids } } },
      { $group: { _id: "$turmaId", n: { $sum: 1 } } },
    ])
    .toArray();
  return Object.fromEntries(rows.map((r) => [r._id.toHexString(), r.n]));
}

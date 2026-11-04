"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { slugify, turmaInputSchema } from "@/lib/schemas";
import { parseObjectId } from "@/lib/turmas";
import type { TurmaDoc } from "@/lib/types";

export type SalvarResultado = { ok: true; id: string; slug: string } | { ok: false; erro: string };

async function slugDisponivel(base: string): Promise<string> {
  const col = (await getDb()).collection<TurmaDoc>("turmas");
  const raiz = base || "turma";
  for (let n = 1; ; n++) {
    const slug = n === 1 ? raiz : `${raiz}-${n}`;
    if (!(await col.findOne({ slug }, { projection: { _id: 1 } }))) return slug;
  }
}

export async function salvarTurma(id: string | null, input: unknown): Promise<SalvarResultado> {
  await requireAdmin();
  const parsed = turmaInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  const data = parsed.data;
  const col = (await getDb()).collection<TurmaDoc>("turmas");
  const sessoes = data.sessoes.map((s) => ({
    id: s.id || randomUUID(),
    titulo: s.titulo,
    inicio: new Date(s.inicio),
    duracaoMin: s.duracaoMin,
    linkAoVivo: s.linkAoVivo,
    gravacaoUrl: s.gravacaoUrl,
  }));
  const campos = {
    titulo: data.titulo,
    descricao: data.descricao,
    publicada: data.publicada,
    paper: data.paper,
    sessoes,
    atualizadoEm: new Date(),
  };

  if (id) {
    const oid = parseObjectId(id);
    if (!oid) return { ok: false, erro: "Turma inválida." };
    const res = await col.findOneAndUpdate({ _id: oid }, { $set: campos }, { returnDocument: "after" });
    if (!res) return { ok: false, erro: "Turma não encontrada." };
    revalidatePath("/", "layout");
    return { ok: true, id, slug: res.slug };
  }

  const slug = await slugDisponivel(slugify(data.titulo));
  const { insertedId } = await col.insertOne({ ...campos, slug, criadoEm: new Date() } as TurmaDoc);
  revalidatePath("/", "layout");
  return { ok: true, id: insertedId.toHexString(), slug };
}

export async function excluirTurma(id: string): Promise<SalvarResultado | { ok: true }> {
  await requireAdmin();
  const oid = parseObjectId(id);
  if (!oid) return { ok: false, erro: "Turma inválida." };
  const db = await getDb();
  await db.collection("turmas").deleteOne({ _id: oid });
  await db.collection("inscricoes").deleteMany({ turmaId: oid });
  revalidatePath("/", "layout");
  return { ok: true };
}

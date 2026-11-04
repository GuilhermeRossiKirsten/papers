"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { parseObjectId } from "@/lib/turmas";

function lerForm(form: FormData) {
  const turmaId = parseObjectId(String(form.get("turmaId") ?? ""));
  if (!turmaId) throw new Error("Turma inválida.");
  return { turmaId };
}

export async function inscrever(form: FormData) {
  const user = await requireUser();
  const { turmaId } = lerForm(form);
  const db = await getDb();
  const turma = await db.collection("turmas").findOne({ _id: turmaId, publicada: true }, { projection: { slug: 1 } });
  if (!turma) throw new Error("Turma não encontrada.");

  // Upsert + índice único: inscrever duas vezes não duplica.
  await db.collection("inscricoes").updateOne(
    { turmaId, githubId: user.githubId },
    {
      $set: { login: user.login, nome: user.name ?? "", avatarUrl: user.image ?? "" },
      $setOnInsert: { criadoEm: new Date() },
    },
    { upsert: true },
  );
  revalidatePath(`/turmas/${turma.slug}`);
}

export async function cancelarInscricao(form: FormData) {
  const user = await requireUser();
  const { turmaId } = lerForm(form);
  const db = await getDb();
  await db.collection("inscricoes").deleteOne({ turmaId, githubId: user.githubId });
  const turma = await db.collection("turmas").findOne({ _id: turmaId }, { projection: { slug: 1 } });
  if (turma) revalidatePath(`/turmas/${turma.slug}`);
}

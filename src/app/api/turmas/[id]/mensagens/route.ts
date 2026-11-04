import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { listMensagens } from "@/lib/mensagens";
import { parseObjectId } from "@/lib/turmas";

export const dynamic = "force-dynamic";

/** Leitura pública das mensagens de uma turma. `?antes=<id>` pagina para mensagens mais antigas. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const turmaId = parseObjectId(id);
  if (!turmaId) return NextResponse.json({ erro: "Turma inválida." }, { status: 404 });

  const turma = await (await getDb()).collection("turmas").findOne({ _id: turmaId }, { projection: { publicada: 1 } });
  if (!turma || (!turma.publicada && !(await auth())?.user?.isAdmin)) {
    return NextResponse.json({ erro: "Turma não encontrada." }, { status: 404 });
  }

  const antesParam = new URL(req.url).searchParams.get("antes");
  const antes = antesParam ? parseObjectId(antesParam) : undefined;
  if (antesParam && !antes) return NextResponse.json({ erro: "Cursor inválido." }, { status: 400 });

  const data = await listMensagens(turmaId, antes ?? undefined);
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

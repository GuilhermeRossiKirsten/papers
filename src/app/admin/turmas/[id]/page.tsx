import Link from "next/link";
import { notFound } from "next/navigation";
import { TurmaForm } from "@/components/admin/TurmaForm";
import { getTurmaById, listInscritos } from "@/lib/turmas";

export default async function EditarTurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const turma = await getTurmaById(id);
  if (!turma) notFound();
  const inscritos = await listInscritos(turma.id);

  return (
    <>
      <Link href="/admin" className="inline-block py-2 text-sm text-grafite hover:text-tinta">
        ← Painel
      </Link>
      <div className="mb-8 mt-4 flex flex-wrap items-baseline justify-between gap-x-4">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Editar turma</h1>
        <Link href={`/turmas/${turma.slug}`} className="py-2 text-sm text-grafite underline underline-offset-4 hover:text-tinta">
          ver página pública →
        </Link>
      </div>
      <div className="flex flex-col gap-12">
        <TurmaForm key={JSON.stringify(turma)} turma={turma} />
        <aside>
          <h2 className="mb-3 border-t border-linha pt-8 text-sm font-medium">Inscritos ({inscritos.length})</h2>
          <ul className="space-y-2 text-sm">
            {inscritos.map((i) => (
              <li key={i.githubId} className="flex items-center gap-2">
                <img src={i.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
                <a href={`https://github.com/${i.login}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  @{i.login}
                </a>
                {i.nome && <span className="text-grafite">· {i.nome}</span>}
              </li>
            ))}
            {inscritos.length === 0 && <li className="text-grafite">Ninguém ainda.</li>}
          </ul>
        </aside>
      </div>
    </>
  );
}

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
      <Link href="/admin" className="text-sm text-grafite hover:text-marca">
        ← Painel
      </Link>
      <div className="mb-8 mt-2 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-serif text-4xl font-semibold">Editar turma</h1>
        <Link href={`/turmas/${turma.slug}`} className="text-sm text-marca hover:underline">
          ver página pública →
        </Link>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
        <TurmaForm key={JSON.stringify(turma)} turma={turma} />
        <aside>
          <h2 className="mb-3 font-serif text-xl font-semibold">Inscritos ({inscritos.length})</h2>
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

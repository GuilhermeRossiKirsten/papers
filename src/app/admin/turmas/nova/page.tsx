import Link from "next/link";
import { TurmaForm } from "@/components/admin/TurmaForm";

export default function NovaTurmaPage() {
  return (
    <>
      <Link href="/admin" className="text-sm text-grafite hover:text-marca">
        ← Painel
      </Link>
      <h1 className="mb-8 mt-2 font-serif text-4xl font-semibold">Nova turma</h1>
      <TurmaForm />
    </>
  );
}

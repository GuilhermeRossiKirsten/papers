import Link from "next/link";
import { TurmaForm } from "@/components/admin/TurmaForm";

export default function NovaTurmaPage() {
  return (
    <>
      <Link href="/admin" className="inline-block py-2 text-sm text-grafite hover:text-tinta">
        ← Painel
      </Link>
      <h1 className="font-serif mb-8 mt-4 text-3xl font-semibold tracking-tight">Nova turma</h1>
      <TurmaForm />
    </>
  );
}

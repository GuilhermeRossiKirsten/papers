import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-5xl font-semibold tracking-tight">404</p>
      <p className="mt-4 text-grafite">Essa página não existe (ou ainda está em rascunho).</p>
      <Link href="/" className="mt-6 inline-block py-2 underline underline-offset-4">
        Voltar ao início
      </Link>
    </div>
  );
}

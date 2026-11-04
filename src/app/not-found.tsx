import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-serif text-6xl">404</p>
      <p className="mt-4 text-grafite">Essa página não existe (ou ainda está em rascunho).</p>
      <Link href="/" className="mt-6 inline-block text-marca hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}

import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { sobre } from "@/content/sobre";
import { GitHubButton } from "./GitHubButton";

export async function Header() {
  const session = await auth();
  const user = session?.user;
  return (
    <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-5 sm:px-6 sm:py-8">
      <Link href="/" className="py-2 font-semibold tracking-tight">
        {sobre.nome}
      </Link>
      <nav className="flex items-center gap-4 text-sm text-grafite sm:gap-6">
        <Link href="/turmas" className="py-2 hover:text-tinta">
          Turmas
        </Link>
        {user?.isAdmin && (
          <Link href="/admin" className="py-2 hover:text-tinta">
            Admin
          </Link>
        )}
        {user ? (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="flex items-center gap-3"
          >
            {user.image && <img src={user.image} alt={`@${user.login}`} title={`@${user.login}`} className="h-6 w-6 rounded-full" />}
            <button className="hover:text-tinta">Sair</button>
          </form>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <GitHubButton>Entrar</GitHubButton>
          </form>
        )}
      </nav>
    </header>
  );
}

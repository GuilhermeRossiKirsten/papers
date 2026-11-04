import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { sobre } from "@/content/sobre";
import { GitHubButton } from "./GitHubButton";

export async function Header() {
  const session = await auth();
  const user = session?.user;
  return (
    <header className="sticky top-0 z-20 border-b border-linha bg-papel/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          📄 {sobre.nome}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/turmas" className="hover:text-marca">
            Turmas
          </Link>
          {user?.isAdmin && (
            <Link href="/admin" className="rounded bg-tinta px-2 py-1 text-papel hover:bg-marca">
              Admin
            </Link>
          )}
          {user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
              className="flex items-center gap-2"
            >
              {user.image && <img src={user.image} alt="" className="h-7 w-7 rounded-full" />}
              <span className="hidden text-grafite sm:inline">@{user.login}</span>
              <button className="text-grafite underline-offset-2 hover:underline">Sair</button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <GitHubButton>Entrar com GitHub</GitHubButton>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}

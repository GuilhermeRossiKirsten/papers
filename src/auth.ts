import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAdminLogin } from "@/lib/admin";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login: string;
      githubId: string;
      isAdmin: boolean;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.login = String(profile.login ?? "");
        token.githubId = String(profile.id ?? "");
      }
      return token;
    },
    session({ session, token }) {
      const login = typeof token.login === "string" ? token.login : "";
      session.user.login = login;
      session.user.githubId = typeof token.githubId === "string" ? token.githubId : "";
      // Recalculado a cada requisição: mudar ADMIN_GITHUB_LOGINS vale sem relogar.
      session.user.isAdmin = isAdminLogin(login);
      return session;
    },
  },
});

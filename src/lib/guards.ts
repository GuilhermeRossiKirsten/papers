import "server-only";
import { auth } from "@/auth";

export class AuthError extends Error {}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.githubId) throw new AuthError("Faça login com o GitHub.");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user.isAdmin) throw new AuthError("Acesso restrito a administradores.");
  return user;
}

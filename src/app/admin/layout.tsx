import { notFound } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Não revela que a rota existe para quem não é admin.
  if (!session?.user?.isAdmin) notFound();
  return <div className="py-10">{children}</div>;
}

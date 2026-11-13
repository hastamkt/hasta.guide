import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

// Admin = allowlist por email (ADMIN_EMAIL no .env). Sem sistema de roles.
export function isAdminEmail(email: string | undefined | null) {
  const admin = process.env.ADMIN_EMAIL;
  return !!admin && !!email && email.toLowerCase() === admin.toLowerCase();
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) redirect("/login");
  return session!;
}

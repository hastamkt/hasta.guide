import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import fs from "fs";
import path from "path";

// Categorias liberadas pra quem não pagou (demonstração) — chave "parte-numero",
// igual ao DATA_BY_KEY já usado dentro do catalogo.html.
const FREE_CATEGORIES = ["chatgpt-1", "chatgpt-11"];

const FILE = path.join(process.cwd(), "src/content/catalogo.html");

export async function GET() {
  const session = await getServerSession(authOptions);
  let paid = false;
  let favorites: string[] = [];

  if (session?.user?.email) {
    if (isAdminEmail(session.user.email)) {
      paid = true;
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!paid) {
      paid = user?.subscriptionStatus === "active" || user?.subscriptionStatus === "vip";
    }
    if (user) {
      const favs = await prisma.favorite.findMany({ where: { userId: user.id }, select: { commandId: true } });
      favorites = favs.map((f) => f.commandId);
    }
  }

  const html = fs.readFileSync(FILE, "utf8");
  const accessScript = `window.__ACCESS__ = ${JSON.stringify({ paid, free: FREE_CATEGORIES, loggedIn: !!session, favorites })};\n`;
  const withAccess = html.replace("<script>", "<script>\n" + accessScript);

  return new Response(withAccess, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

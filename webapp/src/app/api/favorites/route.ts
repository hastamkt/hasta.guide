import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ favorites: [] });
  const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, select: { commandId: true } });
  return NextResponse.json({ favorites: favorites.map((f) => f.commandId) });
}

// Alterna: se já é favorito, remove; senão, adiciona. Devolve o novo estado.
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Faça login pra favoritar." }, { status: 401 });

  const { commandId } = await req.json();
  if (!commandId || typeof commandId !== "string") {
    return NextResponse.json({ error: "commandId obrigatório." }, { status: 400 });
  }

  const existing = await prisma.favorite.findUnique({ where: { userId_commandId: { userId: user.id, commandId } } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId: user.id, commandId } });
  return NextResponse.json({ favorited: true });
}

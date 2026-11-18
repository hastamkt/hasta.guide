import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { category, text } = await req.json();
  if (!category || typeof category !== "string" || !text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Categoria e texto são obrigatórios." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  await prisma.suggestion.create({
    data: { category, text: text.trim(), userEmail: session?.user?.email ?? null },
  });

  return NextResponse.json({ ok: true });
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function createAffiliate(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  if (!name) return;
  await prisma.affiliate.create({ data: { name, contact: contact || null } });
  revalidatePath("/admin/afiliados");
  revalidatePath("/admin/cupons");
}

export async function createCoupon(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const percentOff = Number(formData.get("percentOff") ?? 0);
  const commissionPercent = Number(formData.get("commissionPercent") ?? 0);
  const affiliateId = String(formData.get("affiliateId") ?? "") || null;
  const freeNoCard = formData.get("freeNoCard") === "on";
  if (!code) return;
  await prisma.coupon.create({
    data: { code, percentOff, commissionPercent, affiliateId, freeNoCard },
  });
  revalidatePath("/admin/cupons");
  revalidatePath("/admin/relatorio");
}

export async function toggleCoupon(couponId: string, active: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id: couponId }, data: { active } });
  revalidatePath("/admin/cupons");
  revalidatePath("/admin/relatorio");
}

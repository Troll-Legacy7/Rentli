"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { upgradeRequestSchema } from "@/lib/validations/upgrade";
import { revalidatePath } from "next/cache";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function requestUpgrade(formData: FormData): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  // Check if already PRO
  const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { plan: true } });
  if (dbUser?.plan === "PRO") {
    return { success: false, error: "You are already on the Pro plan" };
  }

  // Check for existing pending request
  const existing = await db.upgradeRequest.findFirst({
    where: { landlordId: user.id, status: "PENDING" },
  });
  if (existing) {
    return { success: false, error: "You already have a pending upgrade request" };
  }

  const raw = {
    referenceText: formData.get("referenceText") as string,
    note: (formData.get("note") as string) || undefined,
  };

  const parsed = upgradeRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const request = await db.upgradeRequest.create({
    data: {
      landlordId: user.id,
      requestedPlan: "PRO",
      referenceText: parsed.data.referenceText,
      note: parsed.data.note || null,
      status: "PENDING",
    },
  });

  revalidatePath("/landlord/upgrade");
  revalidatePath("/landlord/settings");
  return { success: true, id: request.id };
}

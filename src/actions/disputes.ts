"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { createDisputeSchema, resolveDisputeSchema } from "@/lib/validations/dispute";
import { revalidatePath } from "next/cache";
import { sendWhatsApp } from "@/lib/whatsapp";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function createDispute(formData: FormData): Promise<ActionResult> {
  const user = await requireRole("TENANT");

  const raw = {
    unitId: formData.get("unitId") as string,
    paymentId: (formData.get("paymentId") as string) || undefined,
    receiptId: (formData.get("receiptId") as string) || undefined,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
  };

  const parsed = createDisputeSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Find active tenancy for this tenant and unit
  const tenancy = await db.tenancy.findFirst({
    where: { tenantId: user.id, unitId: parsed.data.unitId, status: "ACTIVE" },
  });
  if (!tenancy) {
    return { success: false, error: "No active lease found for this unit" };
  }

  const dispute = await db.dispute.create({
    data: {
      tenantId: user.id,
      landlordId: tenancy.landlordId,
      propertyId: tenancy.propertyId,
      unitId: tenancy.unitId,
      paymentId: parsed.data.paymentId || null,
      receiptId: parsed.data.receiptId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "OPEN",
    },
  });

  revalidatePath("/tenant/disputes");
  revalidatePath("/landlord/disputes");

  // Notify the property manager that a dispute has been filed
  const landlord = await db.user.findUnique({
    where: { id: tenancy.landlordId },
    select: { phoneOrEmail: true },
  });
  if (landlord) {
    void sendWhatsApp({
      recipientId: tenancy.landlordId,
      phoneOrEmail: landlord.phoneOrEmail,
      event: "DISPUTE_FILED",
      templateName: "rentli_dispute_filed",
      params: [user.name, parsed.data.title],
    });
  }

  return { success: true, id: dispute.id };
}

export async function updateDisputeStatus(
  disputeId: string,
  status: "IN_PROGRESS"
): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const dispute = await db.dispute.findFirst({
    where: { id: disputeId, landlordId: user.id, status: "OPEN" },
  });
  if (!dispute) return { success: false, error: "Open dispute not found" };

  await db.dispute.update({
    where: { id: disputeId },
    data: { status },
  });

  revalidatePath("/landlord/disputes");
  revalidatePath(`/landlord/disputes/${disputeId}`);
  revalidatePath("/tenant/disputes");
  return { success: true };
}

export async function resolveDispute(formData: FormData): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const raw = {
    disputeId: formData.get("disputeId") as string,
    resolutionNote: formData.get("resolutionNote") as string,
    status: formData.get("status") as string,
  };

  const parsed = resolveDisputeSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const dispute = await db.dispute.findFirst({
    where: {
      id: parsed.data.disputeId,
      landlordId: user.id,
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
  });
  if (!dispute) return { success: false, error: "Active dispute not found" };

  await db.dispute.update({
    where: { id: parsed.data.disputeId },
    data: {
      status: parsed.data.status,
      resolutionNote: parsed.data.resolutionNote,
    },
  });

  revalidatePath("/landlord/disputes");
  revalidatePath(`/landlord/disputes/${parsed.data.disputeId}`);
  revalidatePath("/tenant/disputes");

  // Notify the tenant that their dispute has been resolved
  const tenant = await db.user.findUnique({
    where: { id: dispute.tenantId },
    select: { phoneOrEmail: true },
  });
  if (tenant) {
    void sendWhatsApp({
      recipientId: dispute.tenantId,
      phoneOrEmail: tenant.phoneOrEmail,
      event: "DISPUTE_RESOLVED",
      templateName: "rentli_dispute_resolved",
      params: [dispute.title, parsed.data.resolutionNote],
    });
  }

  return { success: true };
}

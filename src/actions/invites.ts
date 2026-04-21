"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { createInviteSchema } from "@/lib/validations/invite";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { sendWhatsApp } from "@/lib/whatsapp";

type ActionResult = { success: boolean; error?: string; token?: string; id?: string };

export async function createInvite(formData: FormData): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const raw = {
    propertyId: formData.get("propertyId") as string,
    unitId: (formData.get("unitId") as string) || undefined,
  };

  const parsed = createInviteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Verify property ownership
  const property = await db.property.findFirst({
    where: { id: parsed.data.propertyId, landlordId: user.id },
  });
  if (!property) return { success: false, error: "Property not found" };

  // Verify unit belongs to property if specified
  if (parsed.data.unitId) {
    const unit = await db.unit.findFirst({
      where: { id: parsed.data.unitId, propertyId: property.id },
    });
    if (!unit) return { success: false, error: "Unit not found" };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await db.invite.create({
    data: {
      landlordId: user.id,
      propertyId: parsed.data.propertyId,
      unitId: parsed.data.unitId || null,
      token,
      expiresAt,
    },
  });

  revalidatePath("/landlord/invites");

  // Notify the property manager via WhatsApp with the invite link they can forward
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${token}`;
  void sendWhatsApp({
    recipientId: user.id,
    phoneOrEmail: user.email, // session maps phoneOrEmail → email field
    event: "INVITE_CREATED",
    templateName: "rentli_invite_created",
    params: [user.name, inviteUrl],
  });

  return { success: true, token, id: invite.id };
}

export async function acceptInvite(
  token: string,
  tenantId: string
): Promise<ActionResult> {
  const invite = await db.invite.findUnique({ where: { token } });

  if (!invite) return { success: false, error: "Invalid invite link" };
  if (invite.usedAt) return { success: false, error: "This invite has already been used" };
  if (invite.expiresAt < new Date()) return { success: false, error: "This invite has expired" };

  // Verify tenant exists
  const tenant = await db.user.findFirst({
    where: { id: tenantId, role: "TENANT" },
  });
  if (!tenant) return { success: false, error: "Tenant not found" };

  // Check tenant doesn't already have an active tenancy
  const existingTenancy = await db.tenancy.findFirst({
    where: { tenantId, status: "ACTIVE" },
  });
  if (existingTenancy) {
    return { success: false, error: "Tenant already has an active lease. End the current lease first." };
  }

  // Get property details for defaults
  const property = await db.property.findUnique({
    where: { id: invite.propertyId },
  });
  if (!property) return { success: false, error: "Property not found" };

  // If invite has a unitId, use that; otherwise tenant must be assigned later
  if (!invite.unitId) {
    return { success: false, error: "This invite does not specify a unit" };
  }

  // Check unit is vacant
  const unit = await db.unit.findFirst({
    where: { id: invite.unitId, propertyId: property.id },
  });
  if (!unit) return { success: false, error: "Unit not found" };
  if (unit.occupancyStatus === "OCCUPIED") {
    return { success: false, error: "This unit is already occupied" };
  }

  const rent = unit.rentOverride ?? property.defaultRent;
  const now = new Date();
  const leaseStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const leaseEnd = new Date(now.getFullYear() + 1, now.getMonth(), 1);

  // Create tenancy and update unit + invite in a transaction
  await db.$transaction([
    db.tenancy.create({
      data: {
        tenantId,
        landlordId: invite.landlordId,
        propertyId: property.id,
        unitId: invite.unitId,
        leaseStart,
        leaseEnd,
        monthlyRent: rent,
        dueDay: property.dueDay,
        currency: property.currency,
        status: "ACTIVE",
      },
    }),
    db.unit.update({
      where: { id: invite.unitId },
      data: { occupancyStatus: "OCCUPIED" },
    }),
    db.invite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    }),
  ]);

  revalidatePath("/landlord/invites");
  revalidatePath("/landlord/tenants");
  revalidatePath("/landlord/properties");
  revalidatePath("/landlord");
  return { success: true };
}

export async function deleteInvite(id: string): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const invite = await db.invite.findFirst({
    where: { id, landlordId: user.id },
  });
  if (!invite) return { success: false, error: "Invite not found" };
  if (invite.usedAt) return { success: false, error: "Cannot delete a used invite" };

  await db.invite.delete({ where: { id } });

  revalidatePath("/landlord/invites");
  return { success: true };
}

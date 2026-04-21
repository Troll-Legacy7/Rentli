"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { createTenancySchema } from "@/lib/validations/tenancy";
import { revalidatePath } from "next/cache";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function createTenancy(formData: FormData): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const raw = {
    tenantId: formData.get("tenantId") as string,
    propertyId: formData.get("propertyId") as string,
    unitId: formData.get("unitId") as string,
    leaseStart: formData.get("leaseStart") as string,
    leaseEnd: formData.get("leaseEnd") as string,
    monthlyRent: formData.get("monthlyRent"),
    dueDay: formData.get("dueDay"),
    currency: formData.get("currency") || "ZMW",
  };

  const parsed = createTenancySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Verify property ownership
  const property = await db.property.findFirst({
    where: { id: parsed.data.propertyId, landlordId: user.id },
  });
  if (!property) return { success: false, error: "Property not found" };

  // Verify unit belongs to property and is vacant
  const unit = await db.unit.findFirst({
    where: { id: parsed.data.unitId, propertyId: property.id },
  });
  if (!unit) return { success: false, error: "Unit not found" };
  if (unit.occupancyStatus === "OCCUPIED") {
    return { success: false, error: "Unit is already occupied" };
  }

  // Verify tenant exists and doesn't have an active tenancy
  const tenant = await db.user.findFirst({
    where: { id: parsed.data.tenantId, role: "TENANT" },
  });
  if (!tenant) return { success: false, error: "Tenant not found" };

  const existingTenancy = await db.tenancy.findFirst({
    where: { tenantId: parsed.data.tenantId, status: "ACTIVE" },
  });
  if (existingTenancy) {
    return { success: false, error: "Tenant already has an active lease" };
  }

  // Validate dates
  if (parsed.data.leaseEnd <= parsed.data.leaseStart) {
    return { success: false, error: "Lease end must be after lease start" };
  }

  const [tenancy] = await db.$transaction([
    db.tenancy.create({
      data: {
        tenantId: parsed.data.tenantId,
        landlordId: user.id,
        propertyId: property.id,
        unitId: unit.id,
        leaseStart: parsed.data.leaseStart,
        leaseEnd: parsed.data.leaseEnd,
        monthlyRent: parsed.data.monthlyRent,
        dueDay: parsed.data.dueDay,
        currency: parsed.data.currency,
        status: "ACTIVE",
      },
    }),
    db.unit.update({
      where: { id: unit.id },
      data: { occupancyStatus: "OCCUPIED" },
    }),
  ]);

  revalidatePath("/landlord/tenants");
  revalidatePath("/landlord/leases");
  revalidatePath(`/landlord/properties/${property.id}`);
  revalidatePath("/landlord");
  return { success: true, id: tenancy.id };
}

export async function endTenancy(tenancyId: string): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const tenancy = await db.tenancy.findFirst({
    where: { id: tenancyId, landlordId: user.id, status: "ACTIVE" },
  });
  if (!tenancy) return { success: false, error: "Active tenancy not found" };

  if (tenancy.balanceOwing > 0) {
    return {
      success: false,
      error: `Cannot end lease with outstanding balance of ${tenancy.balanceOwing}. Settle balance first.`,
    };
  }

  await db.$transaction([
    db.tenancy.update({
      where: { id: tenancyId },
      data: { status: "ENDED" },
    }),
    db.unit.update({
      where: { id: tenancy.unitId },
      data: { occupancyStatus: "VACANT" },
    }),
  ]);

  revalidatePath("/landlord/tenants");
  revalidatePath("/landlord/leases");
  revalidatePath(`/landlord/properties/${tenancy.propertyId}`);
  revalidatePath("/landlord");
  revalidatePath("/tenant/lease");
  return { success: true };
}

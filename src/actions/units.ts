"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { checkPlanLimit } from "@/lib/plan-limits";
import { createUnitSchema, updateUnitSchema } from "@/lib/validations/unit";
import { revalidatePath } from "next/cache";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function createUnit(propertyId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const property = await db.property.findFirst({
    where: { id: propertyId, landlordId: user.id },
  });
  if (!property) return { success: false, error: "Property not found" };

  const planCheck = await checkPlanLimit(user.id, "units");
  if (!planCheck.allowed) {
    return { success: false, error: planCheck.message };
  }

  const raw = {
    label: formData.get("label") as string,
    rentOverride: formData.get("rentOverride") ? Number(formData.get("rentOverride")) : null,
  };

  const parsed = createUnitSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const unit = await db.unit.create({
    data: {
      propertyId,
      label: parsed.data.label,
      rentOverride: parsed.data.rentOverride ?? null,
    },
  });

  revalidatePath(`/landlord/properties/${propertyId}`);
  revalidatePath("/landlord");
  return { success: true, id: unit.id };
}

export async function updateUnit(id: string, formData: FormData): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const unit = await db.unit.findFirst({
    where: { id, property: { landlordId: user.id } },
    include: { property: true },
  });
  if (!unit) return { success: false, error: "Unit not found" };

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "rentOverride") {
      raw[key] = value ? Number(value) : null;
    } else if (value !== "") {
      raw[key] = value;
    }
  }

  const parsed = updateUnitSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await db.unit.update({
    where: { id },
    data: {
      ...parsed.data,
      rentOverride: parsed.data.rentOverride ?? null,
    },
  });

  revalidatePath(`/landlord/properties/${unit.propertyId}`);
  revalidatePath(`/landlord/properties/${unit.propertyId}/units/${id}`);
  return { success: true, id };
}

export async function deleteUnit(id: string): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const unit = await db.unit.findFirst({
    where: { id, property: { landlordId: user.id } },
    include: {
      tenancies: { where: { status: "ACTIVE" } },
      property: true,
    },
  });

  if (!unit) return { success: false, error: "Unit not found" };
  if (unit.tenancies.length > 0) {
    return { success: false, error: "Cannot delete unit with active tenancies" };
  }

  await db.unit.delete({ where: { id } });

  revalidatePath(`/landlord/properties/${unit.propertyId}`);
  revalidatePath("/landlord");
  return { success: true };
}

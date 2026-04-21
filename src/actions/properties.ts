"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { checkPlanLimit } from "@/lib/plan-limits";
import { createPropertySchema, updatePropertySchema } from "@/lib/validations/property";
import { revalidatePath } from "next/cache";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function createProperty(formData: FormData): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const planCheck = await checkPlanLimit(user.id, "properties");
  if (!planCheck.allowed) {
    return { success: false, error: planCheck.message };
  }

  const raw = {
    label: formData.get("label") as string,
    area: formData.get("area") as string,
    defaultRent: formData.get("defaultRent"),
    dueDay: formData.get("dueDay"),
    currency: formData.get("currency") || "ZMW",
  };

  const parsed = createPropertySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const property = await db.property.create({
    data: {
      ...parsed.data,
      landlordId: user.id,
    },
  });

  revalidatePath("/landlord/properties");
  revalidatePath("/landlord");
  return { success: true, id: property.id };
}

export async function updateProperty(id: string, formData: FormData): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const property = await db.property.findFirst({
    where: { id, landlordId: user.id },
  });
  if (!property) return { success: false, error: "Property not found" };

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value !== "") raw[key] = value;
  }

  const parsed = updatePropertySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await db.property.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(`/landlord/properties/${id}`);
  revalidatePath("/landlord/properties");
  revalidatePath("/landlord");
  return { success: true, id };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const property = await db.property.findFirst({
    where: { id, landlordId: user.id },
    include: { tenancies: { where: { status: "ACTIVE" } } },
  });

  if (!property) return { success: false, error: "Property not found" };
  if (property.tenancies.length > 0) {
    return { success: false, error: "Cannot delete property with active tenancies" };
  }

  await db.property.delete({ where: { id } });

  revalidatePath("/landlord/properties");
  revalidatePath("/landlord");
  return { success: true };
}

"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { logPaymentSchema } from "@/lib/validations/payment";
import { generateReceiptNumber } from "@/lib/receipt-number";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { sendWhatsApp } from "@/lib/whatsapp";

type ActionResult = { success: boolean; error?: string; id?: string };

export async function logPayment(formData: FormData): Promise<ActionResult> {
  const user = await requireRole("TENANT");

  const raw = {
    unitId: formData.get("unitId") as string,
    amount: formData.get("amount"),
    method: formData.get("method") as string,
    referenceNote: (formData.get("referenceNote") as string) || undefined,
    paidOn: formData.get("paidOn") as string,
  };

  const parsed = logPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Find active tenancy for this tenant and unit
  const tenancy = await db.tenancy.findFirst({
    where: { tenantId: user.id, unitId: parsed.data.unitId, status: "ACTIVE" },
    include: { property: true },
  });
  if (!tenancy) {
    return { success: false, error: "No active lease found for this unit" };
  }

  const receiptNumber = await generateReceiptNumber();
  const publicToken = randomBytes(16).toString("hex");

  const payment = await db.payment.create({
    data: {
      tenantId: user.id,
      landlordId: tenancy.landlordId,
      propertyId: tenancy.propertyId,
      unitId: tenancy.unitId,
      amount: parsed.data.amount,
      currency: tenancy.currency,
      method: parsed.data.method,
      referenceNote: parsed.data.referenceNote || null,
      paidOn: parsed.data.paidOn,
      status: "PENDING",
      receipt: {
        create: {
          receiptNumber,
          publicToken,
          status: "ISSUED",
        },
      },
    },
  });

  revalidatePath("/tenant/payments");
  revalidatePath("/landlord/payments");
  revalidatePath("/landlord");

  // Notify the property manager that a payment has been logged
  const landlord = await db.user.findUnique({
    where: { id: tenancy.landlordId },
    select: { phoneOrEmail: true },
  });
  if (landlord) {
    void sendWhatsApp({
      recipientId: tenancy.landlordId,
      phoneOrEmail: landlord.phoneOrEmail,
      event: "PAYMENT_LOGGED",
      templateName: "rentli_payment_logged",
      params: [user.name, parsed.data.amount.toString(), tenancy.currency, tenancy.property.label],
    });
  }

  return { success: true, id: payment.id };
}

export async function confirmPayment(paymentId: string): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const payment = await db.payment.findFirst({
    where: { id: paymentId, landlordId: user.id, status: "PENDING" },
    include: { receipt: true },
  });
  if (!payment) return { success: false, error: "Pending payment not found" };

  await db.$transaction([
    db.payment.update({
      where: { id: paymentId },
      data: { status: "CONFIRMED" },
    }),
    ...(payment.receipt
      ? [
          db.receipt.update({
            where: { id: payment.receipt.id },
            data: { status: "CONFIRMED", confirmedAt: new Date() },
          }),
        ]
      : []),
    db.tenancy.updateMany({
      where: {
        tenantId: payment.tenantId,
        unitId: payment.unitId,
        status: "ACTIVE",
      },
      data: {
        balanceOwing: { decrement: payment.amount },
      },
    }),
  ]);

  revalidatePath("/landlord/payments");
  revalidatePath(`/landlord/payments/${paymentId}`);
  revalidatePath("/landlord/tenants");
  revalidatePath("/landlord");
  revalidatePath("/tenant/payments");
  revalidatePath("/tenant/lease");

  // Notify the tenant that their payment has been confirmed
  const tenant = await db.user.findUnique({
    where: { id: payment.tenantId },
    select: { phoneOrEmail: true },
  });
  if (tenant) {
    void sendWhatsApp({
      recipientId: payment.tenantId,
      phoneOrEmail: tenant.phoneOrEmail,
      event: "PAYMENT_CONFIRMED",
      templateName: "rentli_payment_confirmed",
      params: [payment.amount.toString(), payment.currency],
    });
  }

  return { success: true };
}

export async function disputePayment(
  paymentId: string,
  note: string
): Promise<ActionResult> {
  const user = await requireRole("LANDLORD");

  const payment = await db.payment.findFirst({
    where: { id: paymentId, landlordId: user.id, status: "PENDING" },
    include: { receipt: true },
  });
  if (!payment) return { success: false, error: "Pending payment not found" };

  await db.$transaction([
    db.payment.update({
      where: { id: paymentId },
      data: { status: "DISPUTED" },
    }),
    ...(payment.receipt
      ? [
          db.receipt.update({
            where: { id: payment.receipt.id },
            data: { status: "DISPUTED", disputeNote: note },
          }),
        ]
      : []),
  ]);

  revalidatePath("/landlord/payments");
  revalidatePath(`/landlord/payments/${paymentId}`);
  revalidatePath("/tenant/payments");

  // Notify the tenant that their payment has been disputed
  const tenant = await db.user.findUnique({
    where: { id: payment.tenantId },
    select: { phoneOrEmail: true },
  });
  if (tenant) {
    void sendWhatsApp({
      recipientId: payment.tenantId,
      phoneOrEmail: tenant.phoneOrEmail,
      event: "PAYMENT_DISPUTED",
      templateName: "rentli_payment_disputed",
      params: [payment.amount.toString(), payment.currency, note],
    });
  }

  return { success: true };
}

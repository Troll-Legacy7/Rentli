import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { BackButton } from "@/components/shared/back-button";

export default async function LandlordReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("LANDLORD");

  const receipt = await db.receipt.findFirst({
    where: { id, payment: { landlordId: user.id } },
    include: {
      payment: {
        include: { tenant: true, property: true, unit: true },
      },
    },
  });

  if (!receipt) notFound();

  const { payment } = receipt;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton href={`/landlord/payments/${payment.id}`} label="Payment" />

      <div className="text-center space-y-2">
        <MaterialIcon name="receipt_long" className="text-primary text-4xl" />
        <h1 className="text-2xl font-bold font-headline tracking-tight">Receipt</h1>
        <p className="text-on-surface-variant text-sm font-mono">{receipt.receiptNumber}</p>
      </div>

      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-6">
        <div className="text-center border-b border-white/5 pb-4">
          <p className="text-3xl font-bold font-headline">{formatCurrency(payment.amount, payment.currency)}</p>
          <p className={`text-sm font-bold mt-1 ${
            receipt.status === "CONFIRMED" ? "text-primary" : receipt.status === "DISPUTED" ? "text-error" : "text-on-surface-variant"
          }`}>
            {receipt.status === "CONFIRMED" ? "Confirmed" : receipt.status === "DISPUTED" ? "Disputed" : "Pending"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Tenant</span>
            <span className="font-medium">{payment.tenant.name}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Contact</span>
            <span className="font-medium">{payment.tenant.phoneOrEmail}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Property</span>
            <span className="font-medium">{payment.property.label}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Unit</span>
            <span className="font-medium">{payment.unit.label}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Method</span>
            <span className="font-medium">{payment.method}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Date Paid</span>
            <span className="font-medium">{new Date(payment.paidOn).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Issued</span>
            <span className="font-medium">{new Date(receipt.createdAt).toLocaleDateString()}</span>
          </div>
          {receipt.confirmedAt && (
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Confirmed</span>
              <span className="font-medium">{new Date(receipt.confirmedAt).toLocaleDateString()}</span>
            </div>
          )}
          {payment.referenceNote && (
            <div className="col-span-2">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Reference</span>
              <span className="font-medium">{payment.referenceNote}</span>
            </div>
          )}
        </div>

        {receipt.disputeNote && (
          <div className="bg-error/5 border border-error/10 rounded-xl p-4">
            <p className="text-[10px] text-error uppercase tracking-widest font-bold mb-1">Dispute Note</p>
            <p className="text-sm">{receipt.disputeNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}

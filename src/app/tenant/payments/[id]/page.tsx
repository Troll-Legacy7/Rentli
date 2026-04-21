import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { BackButton } from "@/components/shared/back-button";

export default async function TenantPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("TENANT");

  const payment = await db.payment.findFirst({
    where: { id, tenantId: user.id },
    include: { property: true, unit: true, receipt: true, landlord: true },
  });

  if (!payment) notFound();

  const statusConfig = {
    PENDING: { icon: "schedule", color: "text-on-surface-variant", bg: "bg-surface-5", label: "Pending Confirmation" },
    CONFIRMED: { icon: "check_circle", color: "text-primary", bg: "bg-primary/10", label: "Confirmed" },
    DISPUTED: { icon: "error", color: "text-error", bg: "bg-error/10", label: "Disputed" },
  }[payment.status] || { icon: "schedule", color: "text-on-surface-variant", bg: "bg-surface-5", label: payment.status };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton href="/tenant/payments" label="Payments" />

      {/* Status Header */}
      <div className="text-center space-y-3">
        <div className={`w-16 h-16 rounded-2xl ${statusConfig.bg} flex items-center justify-center mx-auto`}>
          <MaterialIcon name={statusConfig.icon} className={`${statusConfig.color} text-3xl`} />
        </div>
        <div>
          <p className="text-2xl font-bold font-headline">{formatCurrency(payment.amount, payment.currency)}</p>
          <p className={`text-sm font-bold ${statusConfig.color}`}>{statusConfig.label}</p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold font-headline">Payment Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
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
          {payment.referenceNote && (
            <div className="col-span-2">
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Reference</span>
              <span className="font-medium">{payment.referenceNote}</span>
            </div>
          )}
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Property Manager</span>
            <span className="font-medium">{payment.landlord.name}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Submitted</span>
            <span className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Receipt */}
      {payment.receipt && (
        <Link
          href={`/tenant/receipts/${payment.receipt.id}`}
          className="bg-surface-4 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-surface-5 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MaterialIcon name="receipt_long" className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">Receipt {payment.receipt.receiptNumber}</p>
              <p className="text-[10px] text-on-surface-variant">
                {payment.receipt.status === "CONFIRMED" ? "Confirmed" : payment.receipt.status === "DISPUTED" ? "Disputed" : "Issued"}
              </p>
            </div>
          </div>
          <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
        </Link>
      )}

      {/* Dispute Note */}
      {payment.status === "DISPUTED" && payment.receipt?.disputeNote && (
        <div className="bg-error/5 border border-error/10 rounded-2xl p-5">
          <p className="text-[10px] text-error uppercase tracking-widest font-bold mb-2">Dispute Reason</p>
          <p className="text-sm text-on-surface">{payment.receipt.disputeNote}</p>
        </div>
      )}
    </div>
  );
}

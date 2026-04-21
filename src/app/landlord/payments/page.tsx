import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function LandlordPaymentsPage() {
  const user = await requireRole("LANDLORD");

  const payments = await db.payment.findMany({
    where: { landlordId: user.id },
    include: { tenant: true, property: true, unit: true },
    orderBy: { paidOn: "desc" },
  });

  const pending = payments.filter((p) => p.status === "PENDING");
  const confirmed = payments.filter((p) => p.status === "CONFIRMED");
  const disputed = payments.filter((p) => p.status === "DISPUTED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-headline tracking-tight">Payments</h1>

      {/* Summary */}
      {payments.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-4 border border-white/5 rounded-2xl p-5 text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Pending</p>
            <p className="text-xl font-bold font-headline text-on-surface-variant">{pending.length}</p>
          </div>
          <div className="bg-surface-4 border border-white/5 rounded-2xl p-5 text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Confirmed</p>
            <p className="text-xl font-bold font-headline text-primary">{confirmed.length}</p>
          </div>
          <div className="bg-surface-4 border border-white/5 rounded-2xl p-5 text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Disputed</p>
            <p className="text-xl font-bold font-headline text-error">{disputed.length}</p>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <EmptyState
          icon="payments"
          title="No payments yet"
          description="Payments will appear here when tenants log them."
        />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">
                Needs Attention ({pending.length})
              </h3>
              <div className="grid gap-3">
                {pending.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            </div>
          )}

          {confirmed.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Confirmed</h3>
              <div className="grid gap-3">
                {confirmed.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            </div>
          )}

          {disputed.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Disputed</h3>
              <div className="grid gap-3">
                {disputed.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentCard({ payment }: {
  payment: {
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    paidOn: Date;
    tenant: { name: string };
    property: { label: string };
    unit: { label: string };
  };
}) {
  const statusStyles = {
    PENDING: { icon: "schedule", color: "text-on-surface-variant", bg: "bg-surface-5", badge: "bg-surface-5 text-on-surface-variant" },
    CONFIRMED: { icon: "check_circle", color: "text-primary", bg: "bg-primary/10", badge: "bg-primary/10 text-primary" },
    DISPUTED: { icon: "error", color: "text-error", bg: "bg-error/10", badge: "bg-error/10 text-error" },
  }[payment.status] || { icon: "schedule", color: "text-on-surface-variant", bg: "bg-surface-5", badge: "bg-surface-5 text-on-surface-variant" };

  return (
    <Link
      href={`/landlord/payments/${payment.id}`}
      className="bg-surface-4 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-surface-5 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusStyles.bg}`}>
          <MaterialIcon name={statusStyles.icon} className={statusStyles.color} />
        </div>
        <div>
          <p className="text-sm font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
          <p className="text-[10px] text-on-surface-variant">
            {payment.tenant.name} &bull; {payment.property.label} &bull; {payment.unit.label}
          </p>
          <p className="text-[10px] text-on-surface-muted">
            {payment.method} &bull; {new Date(payment.paidOn).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusStyles.badge}`}>
          {payment.status}
        </span>
        <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
      </div>
    </Link>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function TenantPaymentsPage() {
  const user = await requireRole("TENANT");

  const payments = await db.payment.findMany({
    where: { tenantId: user.id },
    include: { property: true, unit: true, receipt: true },
    orderBy: { paidOn: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Payments</h1>
        <Link
          href="/tenant/payments/new"
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <MaterialIcon name="add" className="text-lg" />
          Log Payment
        </Link>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon="account_balance_wallet"
          title="No payments yet"
          description="Log a payment to notify your property manager and get a receipt."
          actionLabel="Log Payment"
          actionHref="/tenant/payments/new"
        />
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Link
              key={payment.id}
              href={`/tenant/payments/${payment.id}`}
              className="bg-surface-4 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-surface-5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  payment.status === "CONFIRMED"
                    ? "bg-primary/10"
                    : payment.status === "DISPUTED"
                    ? "bg-error/10"
                    : "bg-surface-5"
                }`}>
                  <MaterialIcon
                    name={
                      payment.status === "CONFIRMED"
                        ? "check_circle"
                        : payment.status === "DISPUTED"
                        ? "error"
                        : "schedule"
                    }
                    className={
                      payment.status === "CONFIRMED"
                        ? "text-primary"
                        : payment.status === "DISPUTED"
                        ? "text-error"
                        : "text-on-surface-variant"
                    }
                  />
                </div>
                <div>
                  <p className="text-sm font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {payment.property.label} &bull; {payment.unit.label} &bull; {new Date(payment.paidOn).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  payment.status === "CONFIRMED"
                    ? "bg-primary/10 text-primary"
                    : payment.status === "DISPUTED"
                    ? "bg-error/10 text-error"
                    : "bg-surface-5 text-on-surface-variant"
                }`}>
                  {payment.status}
                </span>
                <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

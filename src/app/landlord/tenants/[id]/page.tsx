import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { BackButton } from "@/components/shared/back-button";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: tenantId } = await params;
  const user = await requireRole("LANDLORD");

  const tenant = await db.user.findFirst({
    where: { id: tenantId, role: "TENANT" },
  });
  if (!tenant) notFound();

  const tenancies = await db.tenancy.findMany({
    where: { tenantId, landlordId: user.id },
    include: { property: true, unit: true },
    orderBy: { createdAt: "desc" },
  });

  if (tenancies.length === 0) notFound();

  const activeTenancy = tenancies.find((t) => t.status === "ACTIVE");
  const pastTenancies = tenancies.filter((t) => t.status !== "ACTIVE");

  const payments = await db.payment.findMany({
    where: { tenantId, landlordId: user.id },
    include: { property: true, unit: true },
    orderBy: { paidOn: "desc" },
    take: 10,
  });

  const totalPaid = payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton href="/landlord/tenants" label="Tenants" />

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">
            {tenant.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">{tenant.name}</h1>
          <p className="text-on-surface-variant text-sm">{tenant.phoneOrEmail}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTenancy && (
          <>
            <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Current Unit</p>
              <p className="text-lg font-bold font-headline">{activeTenancy.unit.label}</p>
              <p className="text-[10px] text-on-surface-muted">{activeTenancy.property.label}</p>
            </div>
            <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Monthly Rent</p>
              <p className="text-xl font-bold font-headline">
                {formatCurrency(activeTenancy.monthlyRent, activeTenancy.currency)}
              </p>
            </div>
            <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Balance Owing</p>
              <p className={`text-xl font-bold font-headline ${activeTenancy.balanceOwing > 0 ? "text-error" : "text-primary"}`}>
                {formatCurrency(activeTenancy.balanceOwing, activeTenancy.currency)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Active Lease */}
      {activeTenancy && (
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-bold font-headline mb-4">Active Lease</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Start</span>
              <span className="font-medium">{new Date(activeTenancy.leaseStart).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">End</span>
              <span className="font-medium">{new Date(activeTenancy.leaseEnd).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Due Day</span>
              <span className="font-medium">Day {activeTenancy.dueDay}</span>
            </div>
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Status</span>
              <span className="font-medium text-primary">{activeTenancy.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Total Paid */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Paid (Confirmed)</p>
        <p className="text-xl font-bold font-headline">
          {formatCurrency(totalPaid, activeTenancy?.currency || "ZMW")}
        </p>
      </div>

      {/* Recent Payments */}
      <div>
        <h3 className="text-lg font-bold font-headline mb-4">Recent Payments</h3>
        {payments.length === 0 ? (
          <p className="text-on-surface-variant text-sm bg-surface-4 rounded-2xl p-6 text-center">No payments recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-surface-3 border border-white/5 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    payment.status === "CONFIRMED" ? "bg-primary/10" : "bg-surface-5"
                  }`}>
                    <MaterialIcon
                      name={payment.status === "CONFIRMED" ? "check_circle" : "schedule"}
                      className={payment.status === "CONFIRMED" ? "text-primary text-lg" : "text-on-surface-variant text-lg"}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {payment.property.label} &bull; {new Date(payment.paidOn).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase ${
                  payment.status === "CONFIRMED" ? "text-primary" : payment.status === "DISPUTED" ? "text-error" : "text-on-surface-variant"
                }`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Tenancies */}
      {pastTenancies.length > 0 && (
        <div>
          <h3 className="text-lg font-bold font-headline mb-4">Past Leases</h3>
          <div className="space-y-3">
            {pastTenancies.map((tenancy) => (
              <div key={tenancy.id} className="bg-surface-3 border border-white/5 rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold">{tenancy.property.label} — {tenancy.unit.label}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {new Date(tenancy.leaseStart).toLocaleDateString()} — {new Date(tenancy.leaseEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">{tenancy.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { BackButton } from "@/components/shared/back-button";

export default async function LeaseHistoryPage() {
  const user = await requireRole("TENANT");

  const tenancies = await db.tenancy.findMany({
    where: { tenantId: user.id },
    include: {
      property: true,
      unit: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const active = tenancies.find((t) => t.status === "ACTIVE");
  const past = tenancies.filter((t) => t.status !== "ACTIVE");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton href="/tenant/lease" label="Lease" />
      <h1 className="text-2xl font-bold font-headline tracking-tight">Lease History</h1>

      {tenancies.length === 0 ? (
        <p className="text-on-surface-variant text-sm bg-surface-4 rounded-2xl p-6 text-center">
          No lease history.
        </p>
      ) : (
        <div className="space-y-3">
          {active && (
            <div className="bg-surface-4 border border-primary/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MaterialIcon name="description" className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{active.property.label}</p>
                    <p className="text-[10px] text-on-surface-variant">{active.unit.label}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                  ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Rent</span>
                  <span className="font-medium">{formatCurrency(active.monthlyRent, active.currency)}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Start</span>
                  <span className="font-medium">{new Date(active.leaseStart).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">End</span>
                  <span className="font-medium">{new Date(active.leaseEnd).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {past.map((tenancy) => (
            <div key={tenancy.id} className="bg-surface-4 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-5 flex items-center justify-center">
                    <MaterialIcon name="history" className="text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{tenancy.property.label}</p>
                    <p className="text-[10px] text-on-surface-variant">{tenancy.unit.label}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-5 text-on-surface-variant">
                  {tenancy.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Rent</span>
                  <span className="font-medium">{formatCurrency(tenancy.monthlyRent, tenancy.currency)}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Start</span>
                  <span className="font-medium">{new Date(tenancy.leaseStart).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">End</span>
                  <span className="font-medium">{new Date(tenancy.leaseEnd).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

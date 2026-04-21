import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function LeasesPage() {
  const user = await requireRole("LANDLORD");

  const tenancies = await db.tenancy.findMany({
    where: { landlordId: user.id },
    include: {
      tenant: true,
      property: true,
      unit: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const active = tenancies.filter((t) => t.status === "ACTIVE");
  const ended = tenancies.filter((t) => t.status !== "ACTIVE");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-headline tracking-tight">Leases</h1>

      {tenancies.length === 0 ? (
        <EmptyState
          icon="description"
          title="No leases yet"
          description="Leases are created when tenants accept invites or when you assign them to units."
          actionLabel="Invite Tenant"
          actionHref="/landlord/invites/new"
        />
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Active Leases</h3>
              <div className="grid gap-3">
                {active.map((tenancy) => (
                  <LeaseCard key={tenancy.id} tenancy={tenancy} />
                ))}
              </div>
            </div>
          )}

          {ended.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Past Leases</h3>
              <div className="grid gap-3">
                {ended.map((tenancy) => (
                  <LeaseCard key={tenancy.id} tenancy={tenancy} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LeaseCard({ tenancy }: {
  tenancy: {
    id: string;
    status: string;
    leaseStart: Date;
    leaseEnd: Date;
    monthlyRent: number;
    currency: string;
    balanceOwing: number;
    tenant: { name: string };
    property: { label: string };
    unit: { label: string };
  };
}) {
  const isActive = tenancy.status === "ACTIVE";

  return (
    <Link
      href={`/landlord/leases/${tenancy.id}`}
      className="bg-surface-4 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-surface-5 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive ? "bg-primary/10" : "bg-surface-5"
        }`}>
          <MaterialIcon
            name={isActive ? "description" : "history"}
            className={isActive ? "text-primary" : "text-on-surface-variant"}
          />
        </div>
        <div>
          <p className="font-bold text-sm">{tenancy.tenant.name}</p>
          <p className="text-[10px] text-on-surface-variant">
            {tenancy.property.label} &bull; {tenancy.unit.label} &bull; {formatCurrency(tenancy.monthlyRent, tenancy.currency)}/mo
          </p>
          <p className="text-[10px] text-on-surface-muted">
            {new Date(tenancy.leaseStart).toLocaleDateString()} — {new Date(tenancy.leaseEnd).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isActive && tenancy.balanceOwing > 0 && (
          <span className="text-[10px] font-bold text-error">
            {formatCurrency(tenancy.balanceOwing, tenancy.currency)} owing
          </span>
        )}
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
          isActive ? "bg-primary/10 text-primary" : "bg-surface-5 text-on-surface-variant"
        }`}>
          {tenancy.status}
        </span>
        <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
      </div>
    </Link>
  );
}

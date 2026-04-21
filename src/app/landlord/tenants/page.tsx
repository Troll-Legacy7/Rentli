import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function TenantsPage() {
  const user = await requireRole("LANDLORD");

  const tenancies = await db.tenancy.findMany({
    where: { landlordId: user.id, status: "ACTIVE" },
    include: {
      tenant: true,
      property: true,
      unit: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Tenants</h1>
        <Link
          href="/landlord/invites/new"
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <MaterialIcon name="person_add" className="text-lg" />
          Invite Tenant
        </Link>
      </div>

      {tenancies.length === 0 ? (
        <EmptyState
          icon="group"
          title="No active tenants"
          description="Invite tenants to your properties to start managing leases."
          actionLabel="Invite Tenant"
          actionHref="/landlord/invites/new"
        />
      ) : (
        <div className="grid gap-3">
          {tenancies.map((tenancy) => (
            <Link
              key={tenancy.id}
              href={`/landlord/tenants/${tenancy.tenant.id}`}
              className="bg-surface-4 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-surface-5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {tenancy.tenant.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm">{tenancy.tenant.name}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {tenancy.property.label} &bull; {tenancy.unit.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(tenancy.monthlyRent, tenancy.currency)}</p>
                  {tenancy.balanceOwing > 0 && (
                    <p className="text-[10px] text-error font-bold">
                      {formatCurrency(tenancy.balanceOwing, tenancy.currency)} owing
                    </p>
                  )}
                </div>
                <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

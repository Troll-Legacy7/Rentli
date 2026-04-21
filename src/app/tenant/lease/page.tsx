import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function TenantLeasePage() {
  const user = await requireRole("TENANT");

  const tenancy = await db.tenancy.findFirst({
    where: { tenantId: user.id, status: "ACTIVE" },
    include: {
      property: true,
      unit: true,
      landlord: true,
    },
  });

  if (!tenancy) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-headline tracking-tight">My Lease</h1>
        <EmptyState
          icon="description"
          title="No active lease"
          description="You don't have an active lease. Ask your property manager for an invite link to get started."
        />
        <Link
          href="/tenant/lease/history"
          className="block text-center text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          View past leases
        </Link>
      </div>
    );
  }

  const now = new Date();
  const leaseStart = new Date(tenancy.leaseStart);
  const leaseEnd = new Date(tenancy.leaseEnd);
  const totalDays = Math.max(1, (leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, (now.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  const monthsRemaining = Math.max(0, Math.ceil((leaseEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline tracking-tight">My Lease</h1>
        <Link
          href="/tenant/lease/history"
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          History
        </Link>
      </div>

      {/* Property Info */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MaterialIcon name="apartment" className="text-primary text-2xl" />
          </div>
          <div>
            <p className="font-bold font-headline">{tenancy.property.label}</p>
            <p className="text-sm text-on-surface-variant">{tenancy.unit.label}</p>
          </div>
        </div>
        <div className="text-sm text-on-surface-variant">
          <p>Property Manager: {tenancy.landlord.name}</p>
        </div>
      </div>

      {/* Lease Progress */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold font-headline">Lease Progress</h3>
          <span className="text-sm font-bold text-primary">{progressPercent}%</span>
        </div>
        <div className="w-full bg-surface-5 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant">
          <span>{leaseStart.toLocaleDateString()}</span>
          <span>{leaseEnd.toLocaleDateString()}</span>
        </div>
        <p className="text-center text-sm text-on-surface-variant mt-3">
          {monthsRemaining} month{monthsRemaining !== 1 ? "s" : ""} remaining
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Monthly Rent</p>
          <p className="text-xl font-bold font-headline">{formatCurrency(tenancy.monthlyRent, tenancy.currency)}</p>
        </div>
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Balance Owing</p>
          <p className={`text-xl font-bold font-headline ${tenancy.balanceOwing > 0 ? "text-error" : "text-primary"}`}>
            {formatCurrency(tenancy.balanceOwing, tenancy.currency)}
          </p>
        </div>
      </div>

      {/* Lease Details */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold font-headline mb-4">Lease Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Start Date</span>
            <span className="font-medium">{leaseStart.toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">End Date</span>
            <span className="font-medium">{leaseEnd.toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Due Day</span>
            <span className="font-medium">Day {tenancy.dueDay} of each month</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Currency</span>
            <span className="font-medium">{tenancy.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

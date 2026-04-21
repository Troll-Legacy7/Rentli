import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { BackButton } from "@/components/shared/back-button";
import { EndTenancyButton } from "./end-tenancy-button";

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("LANDLORD");

  const tenancy = await db.tenancy.findFirst({
    where: { id, landlordId: user.id },
    include: {
      tenant: true,
      property: true,
      unit: true,
    },
  });

  if (!tenancy) notFound();

  const payments = await db.payment.findMany({
    where: {
      tenantId: tenancy.tenantId,
      landlordId: user.id,
      unitId: tenancy.unitId,
    },
    orderBy: { paidOn: "desc" },
    take: 10,
  });

  const totalPaid = payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + p.amount, 0);

  const now = new Date();
  const leaseStart = new Date(tenancy.leaseStart);
  const leaseEnd = new Date(tenancy.leaseEnd);
  const totalDays = Math.max(1, (leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, (now.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton href="/landlord/leases" label="Leases" />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            {tenancy.tenant.name}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {tenancy.property.label} &bull; {tenancy.unit.label}
          </p>
        </div>
        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
          tenancy.status === "ACTIVE"
            ? "bg-primary/10 text-primary"
            : "bg-surface-5 text-on-surface-variant"
        }`}>
          {tenancy.status}
        </span>
      </div>

      {/* Lease Progress */}
      {tenancy.status === "ACTIVE" && (
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold font-headline">Lease Progress</h3>
            <span className="text-[10px] text-on-surface-variant">{progressPercent}%</span>
          </div>
          <div className="w-full bg-surface-5 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant">
            <span>{leaseStart.toLocaleDateString()}</span>
            <span>{leaseEnd.toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Monthly Rent</p>
          <p className="text-xl font-bold font-headline">{formatCurrency(tenancy.monthlyRent, tenancy.currency)}</p>
        </div>
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Due Day</p>
          <p className="text-xl font-bold font-headline">Day {tenancy.dueDay}</p>
        </div>
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Paid</p>
          <p className="text-xl font-bold font-headline">{formatCurrency(totalPaid, tenancy.currency)}</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Start</span>
            <span className="font-medium">{leaseStart.toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">End</span>
            <span className="font-medium">{leaseEnd.toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Currency</span>
            <span className="font-medium">{tenancy.currency}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Contact</span>
            <span className="font-medium">{tenancy.tenant.phoneOrEmail}</span>
          </div>
        </div>
      </div>

      {/* End Lease Action */}
      {tenancy.status === "ACTIVE" && (
        <EndTenancyButton tenancyId={tenancy.id} hasBalance={tenancy.balanceOwing > 0} />
      )}

      {/* Payment History */}
      {payments.length > 0 && (
        <div>
          <h3 className="text-lg font-bold font-headline mb-4">Payment History</h3>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-surface-3 border border-white/5 rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {payment.method} &bull; {new Date(payment.paidOn).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase ${
                  payment.status === "CONFIRMED" ? "text-primary" : payment.status === "DISPUTED" ? "text-error" : "text-on-surface-variant"
                }`}>
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

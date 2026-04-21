import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { BackButton } from "@/components/shared/back-button";

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { id: propertyId, unitId } = await params;
  const user = await requireRole("LANDLORD");

  const unit = await db.unit.findFirst({
    where: { id: unitId, propertyId, property: { landlordId: user.id } },
    include: {
      property: true,
      tenancies: {
        orderBy: { createdAt: "desc" },
        include: { tenant: true },
      },
      payments: {
        orderBy: { paidOn: "desc" },
        take: 10,
        include: { tenant: true, receipt: true },
      },
    },
  });

  if (!unit) notFound();

  const activeTenancy = unit.tenancies.find((t) => t.status === "ACTIVE");
  const rent = unit.rentOverride ?? unit.property.defaultRent;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton href={`/landlord/properties/${propertyId}`} label={unit.property.label} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">{unit.label}</h1>
          <p className="text-on-surface-variant text-sm">{unit.property.label}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
          unit.occupancyStatus === "OCCUPIED"
            ? "bg-primary/10 text-primary"
            : "bg-surface-5 text-on-surface-variant"
        }`}>
          {unit.occupancyStatus}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Monthly Rent</p>
          <p className="text-xl font-bold font-headline">{formatCurrency(rent, unit.property.currency)}</p>
          {unit.rentOverride !== null && (
            <p className="text-[10px] text-on-surface-muted mt-1">Override applied</p>
          )}
        </div>
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Current Tenant</p>
          <p className="text-lg font-bold font-headline">
            {activeTenancy ? activeTenancy.tenant.name : "—"}
          </p>
        </div>
        {activeTenancy && (
          <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Balance Owing</p>
            <p className={`text-xl font-bold font-headline ${activeTenancy.balanceOwing > 0 ? "text-error" : "text-primary"}`}>
              {formatCurrency(activeTenancy.balanceOwing, unit.property.currency)}
            </p>
          </div>
        )}
      </div>

      {/* Active Tenancy */}
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

      {/* Payment History */}
      <div>
        <h3 className="text-lg font-bold font-headline mb-4">Recent Payments</h3>
        {unit.payments.length === 0 ? (
          <p className="text-on-surface-variant text-sm bg-surface-4 rounded-2xl p-6 text-center">No payments recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {unit.payments.map((payment) => (
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
                      {payment.tenant.name} &bull; {new Date(payment.paidOn).toLocaleDateString()}
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
    </div>
  );
}

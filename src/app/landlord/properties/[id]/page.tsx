import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { BackButton } from "@/components/shared/back-button";
import { EmptyState } from "@/components/shared/empty-state";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("LANDLORD");

  const property = await db.property.findFirst({
    where: { id, landlordId: user.id },
    include: {
      units: {
        include: {
          tenancies: {
            where: { status: "ACTIVE" },
            include: { tenant: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 5 },
      tenancies: { where: { status: "ACTIVE" } },
    },
  });

  if (!property) notFound();

  const totalUnits = property.units.length;
  const occupiedUnits = property.units.filter((u) => u.occupancyStatus === "OCCUPIED").length;
  const totalCollected = property.payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton href="/landlord/properties" label="Properties" />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">{property.label}</h1>
          {property.area && <p className="text-on-surface-variant text-sm">{property.area}</p>}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/landlord/properties/${id}/units/new`}
            className="bg-primary text-black font-bold px-4 py-2 rounded-full text-sm flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all"
          >
            <MaterialIcon name="add" className="text-lg" />
            Add Unit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Default Rent</p>
          <p className="text-xl font-bold font-headline">{formatCurrency(property.defaultRent, property.currency)}</p>
        </div>
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Units</p>
          <p className="text-xl font-bold font-headline">{totalUnits}</p>
        </div>
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Occupied</p>
          <p className="text-xl font-bold font-headline text-primary">{occupiedUnits}</p>
        </div>
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Collected</p>
          <p className="text-xl font-bold font-headline">{formatCurrency(totalCollected, property.currency)}</p>
        </div>
      </div>

      {/* Property Info */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold font-headline mb-4">Property Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Due Day</span>
            <span className="font-medium">Day {property.dueDay} of each month</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Currency</span>
            <span className="font-medium">{property.currency}</span>
          </div>
        </div>
      </div>

      {/* Units */}
      <div>
        <h3 className="text-lg font-bold font-headline mb-4">Units</h3>
        {property.units.length === 0 ? (
          <EmptyState
            icon="meeting_room"
            title="No units yet"
            description="Add units to this property to start managing tenants."
            actionLabel="Add Unit"
            actionHref={`/landlord/properties/${id}/units/new`}
          />
        ) : (
          <div className="grid gap-3">
            {property.units.map((unit) => {
              const activeTenancy = unit.tenancies[0];
              const rent = unit.rentOverride ?? property.defaultRent;

              return (
                <Link
                  key={unit.id}
                  href={`/landlord/properties/${id}/units/${unit.id}`}
                  className="bg-surface-3 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-surface-5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      unit.occupancyStatus === "OCCUPIED" ? "bg-primary/10" : "bg-surface-5"
                    }`}>
                      <MaterialIcon
                        name={unit.occupancyStatus === "OCCUPIED" ? "person" : "meeting_room"}
                        className={unit.occupancyStatus === "OCCUPIED" ? "text-primary" : "text-on-surface-variant"}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{unit.label}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {activeTenancy ? activeTenancy.tenant.name : "Vacant"} &bull; {formatCurrency(rent, property.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      unit.occupancyStatus === "OCCUPIED"
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-5 text-on-surface-variant"
                    }`}>
                      {unit.occupancyStatus}
                    </span>
                    <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

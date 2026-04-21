import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function PropertiesPage() {
  const user = await requireRole("LANDLORD");

  const properties = await db.property.findMany({
    where: { landlordId: user.id },
    include: {
      units: true,
      tenancies: { where: { status: "ACTIVE" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Properties</h1>
        <Link
          href="/landlord/properties/new"
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <MaterialIcon name="add" className="text-lg" />
          Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon="domain_add"
          title="No properties yet"
          description="Add your first property to start managing units and tenants."
          actionLabel="Add Property"
          actionHref="/landlord/properties/new"
        />
      ) : (
        <div className="grid gap-4">
          {properties.map((property) => {
            const totalUnits = property.units.length;
            const occupiedUnits = property.units.filter((u) => u.occupancyStatus === "OCCUPIED").length;
            const vacantUnits = totalUnits - occupiedUnits;
            const activeTenants = property.tenancies.length;

            return (
              <Link
                key={property.id}
                href={`/landlord/properties/${property.id}`}
                className="bg-surface-4 border border-white/5 rounded-2xl p-6 hover:bg-surface-5 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline font-bold text-lg">{property.label}</h3>
                    {property.area && (
                      <p className="text-on-surface-variant text-sm">{property.area}</p>
                    )}
                  </div>
                  <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
                </div>
                <div className="mt-4 flex gap-6 text-sm">
                  <div>
                    <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Units</span>
                    <span className="font-bold">{totalUnits}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Occupied</span>
                    <span className="font-bold text-primary">{occupiedUnits}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Vacant</span>
                    <span className="font-bold">{vacantUnits}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Rent</span>
                    <span className="font-bold">{formatCurrency(property.defaultRent, property.currency)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

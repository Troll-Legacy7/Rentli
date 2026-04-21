import Link from "next/link";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { MaterialIcon } from "@/components/layout/icon";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import type { ChartBar } from "@/types";

export default async function LandlordDashboard() {
  const user = await requireRole("LANDLORD");

  // Fetch all data in parallel
  const [properties, tenancies, payments, disputes] = await Promise.all([
    db.property.findMany({
      where: { landlordId: user.id },
      include: { units: true },
    }),
    db.tenancy.findMany({
      where: { landlordId: user.id, status: "ACTIVE" },
      include: { tenant: true, property: true, unit: true },
    }),
    db.payment.findMany({
      where: { landlordId: user.id },
      orderBy: { paidOn: "desc" },
      include: { tenant: true, property: true, unit: true },
      take: 10,
    }),
    db.dispute.count({
      where: { landlordId: user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
  ]);

  // Calculate stats
  const allUnits = properties.flatMap((p) => p.units);
  const totalUnits = allUnits.length;
  const occupiedUnits = allUnits.filter((u) => u.occupancyStatus === "OCCUPIED").length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const confirmedPayments = payments.filter((p) => p.status === "CONFIRMED");
  const totalCollected = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter((p) => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0);

  const expectedRent = tenancies.reduce((sum, t) => sum + t.monthlyRent, 0);
  const outstandingBalance = tenancies.reduce((sum, t) => sum + t.balanceOwing, 0);

  const overdueTenants = tenancies
    .filter((t) => t.balanceOwing > 0)
    .sort((a, b) => b.balanceOwing - a.balanceOwing);

  const targetProgress = expectedRent > 0 ? Math.round((totalCollected / expectedRent) * 1000) / 10 : 0;

  const currency = tenancies[0]?.currency || properties[0]?.currency || "ZMW";

  // Build chart bars from last 4 months of payments
  const chartBars: ChartBar[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthPayments = confirmedPayments.filter((p) => {
      const pd = new Date(p.paidOn);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
    });
    const total = monthPayments.reduce((s, p) => s + p.amount, 0);
    const maxRent = expectedRent || 1;
    chartBars.push({
      value: Math.min(100, Math.round((total / maxRent) * 100)),
      label: total >= 1000 ? `${(total / 1000).toFixed(1)}K` : String(total),
      highlighted: i === 0,
      striped: i !== 0,
      direction: i === 0 ? "up" : undefined,
    });
  }

  const sparkValues = chartBars.map((b) => b.value);

  // Recent payments for table
  const recentPayments = payments.slice(0, 5);

  // Featured property = property with most units
  const featuredProperty = properties.sort((a, b) => b.units.length - a.units.length)[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight px-1 lg:hidden">Portfolio Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hero: Total Collected */}
        <section className="lg:col-span-7 bg-surface-4 rounded-3xl p-7 lg:p-8 border border-white/5 relative overflow-hidden min-h-[280px] lg:min-h-[320px] flex flex-col justify-between">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--color-primary),_transparent_70%)]" />
          <div className="relative z-10">
            <p className="text-on-surface-variant text-sm font-medium font-label">
              <span className="lg:hidden">Total Collected</span>
              <span className="hidden lg:inline text-xs uppercase tracking-widest">Liquid Revenue</span>
            </p>
            <h2 className="text-4xl lg:text-6xl font-extrabold mt-1 font-headline">
              <span className="lg:hidden">{formatCurrency(totalCollected, currency)}</span>
              <span className="hidden lg:inline text-primary">{formatCurrency(totalCollected, currency)}</span>
            </h2>
            <p className="hidden lg:block mt-2 text-secondary-text/60 max-w-xs">
              Realized monthly collection from active portfolio assets.
            </p>
          </div>

          {/* Mobile: growth + bar chart */}
          <div className="lg:hidden relative z-10">
            <div className="flex items-center gap-2 mt-4">
              <span className="text-primary font-bold">{properties.length} Properties</span>
              <span className="text-on-surface-variant text-xs">&bull; {totalUnits} Units</span>
            </div>
            <div className="mt-8 h-32">
              <BarChart bars={chartBars} className="h-full" />
            </div>
          </div>

          {/* Desktop: sub-stats + sparkline */}
          <div className="hidden lg:flex items-end justify-between relative z-10">
            <div className="flex gap-4">
              <div className="bg-surface-3 px-4 py-3 rounded-2xl">
                <span className="block text-[10px] text-on-surface-variant font-label uppercase">Pending</span>
                <span className="text-xl font-headline font-bold">{formatCurrency(pendingAmount, currency)}</span>
              </div>
              <div className="bg-surface-3 px-4 py-3 rounded-2xl">
                <span className="block text-[10px] text-on-surface-variant font-label uppercase">Expected</span>
                <span className="text-xl font-headline font-bold">{formatCurrency(expectedRent, currency)}</span>
              </div>
            </div>
            <Sparkline values={sparkValues.length >= 2 ? sparkValues : [0, 0]} className="h-24 w-48" />
          </div>

          {/* Mobile: expected rent footer */}
          <div className="lg:hidden mt-8 pt-6 border-t border-white/5 flex justify-between items-end relative z-10">
            <div>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Expected Rent</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(expectedRent, currency)}</p>
            </div>
            <Link href="/landlord/payments" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black">
              <MaterialIcon name="arrow_outward" className="text-xl" />
            </Link>
          </div>
        </section>

        {/* Forecasted Yield (Desktop) */}
        <section className="hidden lg:flex lg:col-span-5 bg-surface-3 rounded-3xl p-8 flex-col justify-between border border-white/5">
          <div>
            <div className="flex justify-between items-start">
              <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Forecasted Yield</span>
              {disputes > 0 && (
                <Link href="/landlord/disputes" className="flex items-center gap-1 bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold">
                  <MaterialIcon name="gavel" className="text-sm" />
                  {disputes} Open
                </Link>
              )}
            </div>
            <h3 className="font-headline text-4xl font-bold text-secondary-text mt-4 tracking-tight">
              {formatCurrency(expectedRent, currency)}
            </h3>
            <p className="mt-2 text-on-surface-variant text-sm">Projected revenue based on 100% occupancy targets.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/15">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-label text-on-surface-variant">Target Progress</span>
              <span className="text-sm font-headline font-bold text-primary">{targetProgress}%</span>
            </div>
            <div className="w-full bg-surface-0 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, targetProgress)}%` }} />
            </div>
          </div>
        </section>

        {/* Outstanding (Mobile) */}
        <section className="lg:hidden bg-surface-4 rounded-3xl p-7 border border-white/5 flex justify-between items-center">
          <div>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mb-1">Outstanding</p>
            <h3 className="text-3xl font-bold">{formatCurrency(outstandingBalance, currency)}</h3>
          </div>
          <Link href="/landlord/payments" className="bg-white text-black text-sm font-bold px-6 py-3 rounded-2xl hover:bg-white/90 active:scale-95 transition-all">
            View All
          </Link>
        </section>

        {/* Occupancy Donut */}
        <section className="lg:col-span-4 bg-surface-4 lg:bg-surface-3 rounded-3xl p-7 lg:p-8 border border-white/5 flex flex-col items-center">
          <h4 className="text-lg font-bold mb-8 self-start lg:hidden">Occupancy Rate</h4>
          <span className="hidden lg:block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-6">Asset Health</span>
          <DonutChart percentage={occupancyRate} label={`${occupancyRate}%`} sublabel="Occupied" />
          <div className="mt-8 lg:mt-6 flex gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-on-surface-variant font-medium">{occupiedUnits} Units</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-surface-5" />
              <span className="text-xs text-on-surface-variant font-medium">{totalUnits - occupiedUnits} Vacant</span>
            </div>
          </div>
          <p className="hidden lg:block mt-4 text-sm text-secondary-text/60">
            {occupiedUnits} of {totalUnits} units currently tenanted.
          </p>
        </section>

        {/* Overdue / Arrears Watch */}
        <section className="lg:col-span-4 bg-surface-4 lg:bg-surface-0 rounded-3xl p-7 lg:p-8 border border-white/5">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h4 className="text-lg font-bold lg:hidden">Overdue</h4>
            <span className="hidden lg:block font-label text-xs uppercase tracking-widest text-on-surface-variant">Arrears Watch</span>
            {overdueTenants.length > 0 && (
              <span className="text-[10px] bg-error/20 text-error px-2 py-0.5 rounded font-bold border border-error/20 lg:hidden">
                PRIORITY
              </span>
            )}
            {overdueTenants.length > 0 && <MaterialIcon name="warning" className="hidden lg:block text-error" />}
          </div>

          {overdueTenants.length === 0 ? (
            <p className="text-on-surface-variant text-sm text-center py-8">All tenants are up to date.</p>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {overdueTenants.slice(0, 3).map((tenancy) => (
                <Link
                  key={tenancy.id}
                  href={`/landlord/tenants/${tenancy.tenant.id}`}
                  className="flex items-center justify-between p-4 bg-surface-0 lg:bg-transparent rounded-2xl lg:rounded-none border border-white/5 lg:border-0 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-on-surface-variant font-bold text-sm">
                      {tenancy.tenant.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{tenancy.tenant.name}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {tenancy.unit.label} &bull; {tenancy.property.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary lg:text-error">{formatCurrency(tenancy.balanceOwing, tenancy.currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Desktop: total + link */}
          <div className="hidden lg:flex flex-col items-center gap-4 mt-10 bg-surface-3 p-6 rounded-2xl">
            <div className="text-center">
              <span className="block text-[10px] text-on-surface-variant font-label uppercase">Total Outstanding</span>
              <span className="text-2xl font-headline font-extrabold">{formatCurrency(outstandingBalance, currency)}</span>
            </div>
            <Link href="/landlord/payments" className="w-full bg-error text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 text-center">
              View Payments
            </Link>
          </div>
        </section>

        {/* Featured Property (Desktop) */}
        {featuredProperty && (
          <Link href={`/landlord/properties/${featuredProperty.id}`} className="hidden lg:block lg:col-span-4 bg-surface-3 rounded-3xl overflow-hidden group">
            <div className="h-48 relative bg-surface-5">
              <div className="absolute inset-0 bg-gradient-to-t from-surface-3 to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-sm uppercase mb-2 inline-block">
                  {featuredProperty.units.filter((u) => u.occupancyStatus === "OCCUPIED").length}/{featuredProperty.units.length} Occupied
                </span>
                <h4 className="font-headline font-bold">{featuredProperty.label}</h4>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between text-xs font-label text-on-surface-variant mb-4">
                <span>{featuredProperty.units.length} Units</span>
                <span>{featuredProperty.area || "—"}</span>
              </div>
              <div className="w-full border border-outline-variant/20 text-secondary-text py-3 rounded-xl text-xs font-semibold text-center hover:bg-surface-bright transition-colors">
                View Property
              </div>
            </div>
          </Link>
        )}

        {/* Recent Activity / Payments */}
        <section className="lg:col-span-12 bg-surface-4 lg:bg-surface-0 rounded-3xl p-7 lg:p-8 border border-white/5">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h4 className="text-lg font-bold lg:text-xl font-headline">
              <span className="lg:hidden">Recent Activity</span>
              <span className="hidden lg:inline">Recent Payments</span>
            </h4>
            <Link href="/landlord/payments" className="text-primary text-xs font-bold uppercase tracking-widest">
              <span className="lg:hidden">View All</span>
              <span className="hidden lg:inline">See All Activity</span>
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-on-surface-variant text-sm text-center py-8">No payments recorded yet.</p>
          ) : (
            <>
              {/* Mobile: simple list */}
              <div className="space-y-4 lg:hidden">
                {recentPayments.slice(0, 3).map((payment) => (
                  <Link key={payment.id} href={`/landlord/payments/${payment.id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      payment.status === "CONFIRMED" ? "bg-primary/10" : "bg-surface-5"
                    }`}>
                      <MaterialIcon
                        name={payment.status === "CONFIRMED" ? "check_circle" : "schedule"}
                        className={payment.status === "CONFIRMED" ? "text-primary text-lg" : "text-on-surface-variant text-lg"}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
                      <p className="text-[10px] text-on-surface-variant">{payment.tenant.name} &bull; {payment.unit.label}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${
                      payment.status === "CONFIRMED" ? "text-primary" : "text-on-surface-variant"
                    }`}>
                      {payment.status}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
                      <th className="pb-4 font-medium">Tenant &amp; Property</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Method</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="group hover:bg-surface-3 transition-colors">
                        <td className="py-5">
                          <Link href={`/landlord/payments/${payment.id}`} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-5 flex items-center justify-center">
                              <MaterialIcon name="home" className="text-primary text-lg" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{payment.tenant.name}</p>
                              <p className="text-[10px] text-on-surface-variant">{payment.property.label} &bull; {payment.unit.label}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-5 text-sm text-on-surface-variant">{new Date(payment.paidOn).toLocaleDateString()}</td>
                        <td className="py-5">
                          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <MaterialIcon name="account_balance" className="text-base" />
                            {payment.method}
                          </div>
                        </td>
                        <td className="py-5">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            payment.status === "CONFIRMED"
                              ? "bg-primary/10 text-primary"
                              : payment.status === "DISPUTED"
                              ? "bg-error/10 text-error"
                              : "bg-surface-5 text-on-surface-variant"
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-5 text-right font-headline font-bold">{formatCurrency(payment.amount, payment.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

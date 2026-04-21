import Link from "next/link";
import { BarChart } from "@/components/charts/bar-chart";
import { MaterialIcon } from "@/components/layout/icon";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { formatCurrency } from "@/lib/currency";
import type { ChartBar } from "@/types";

export default async function TenantDashboard() {
  const user = await requireRole("TENANT");

  const tenancy = await db.tenancy.findFirst({
    where: { tenantId: user.id, status: "ACTIVE" },
    include: { property: true, unit: true, landlord: true },
  });

  const payments = await db.payment.findMany({
    where: { tenantId: user.id },
    orderBy: { paidOn: "desc" },
    take: 10,
  });

  // Compute lease progress
  const now = new Date();
  let progressPercent = 0;
  let monthsRemaining = 0;
  let leaseStart = now;
  let leaseEnd = now;

  if (tenancy) {
    leaseStart = new Date(tenancy.leaseStart);
    leaseEnd = new Date(tenancy.leaseEnd);
    const totalDays = Math.max(1, (leaseEnd.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(0, (now.getTime() - leaseStart.getTime()) / (1000 * 60 * 60 * 24));
    progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
    monthsRemaining = Math.max(0, Math.ceil((leaseEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  }

  const currency = tenancy?.currency || "ZMW";
  const monthlyRent = tenancy?.monthlyRent || 0;
  const balance = tenancy?.balanceOwing || 0;

  // Previous confirmed payment
  const lastConfirmed = payments.find((p) => p.status === "CONFIRMED");

  // Build chart bars from last 4 months
  const chartBars: ChartBar[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthPayments = payments.filter((p) => {
      const pd = new Date(p.paidOn);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear() && p.status === "CONFIRMED";
    });
    const total = monthPayments.reduce((s, p) => s + p.amount, 0);
    const maxRent = monthlyRent || 1;
    chartBars.push({
      value: Math.min(100, Math.round((total / maxRent) * 100)),
      label: formatCurrency(total, currency),
      highlighted: i === 0,
      striped: i !== 0,
      direction: i === 0 ? "up" : undefined,
    });
  }

  // Due date for current month
  const dueDay = tenancy?.dueDay || 1;
  const dueDateStr = new Date(now.getFullYear(), now.getMonth(), dueDay).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (!tenancy) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-4 border border-white/5 rounded-3xl p-8 text-center space-y-4">
          <MaterialIcon name="home" className="text-primary text-4xl" />
          <h2 className="text-xl font-bold font-headline">Welcome to Rentli</h2>
          <p className="text-on-surface-variant text-sm">You don&apos;t have an active lease yet. Ask your property manager for an invite link to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hero: Rent Overview */}
        <section className="lg:col-span-7 bg-surface-0 border border-outline/20 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-primary to-transparent" />
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-on-surface-variant text-xs font-medium mb-1 lg:hidden">Total Rent Amount</p>
                <p className="hidden lg:block font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Next Payment Due</p>
                <h2 className="hidden lg:block font-headline font-bold text-4xl mt-1">{dueDateStr}</h2>
                <div className="flex items-baseline gap-1 lg:mt-4">
                  <span className="text-5xl lg:text-6xl font-extrabold tracking-tighter font-headline lg:text-primary">
                    {formatCurrency(monthlyRent, currency)}
                  </span>
                  <span className="text-on-surface-variant text-sm font-medium">/mo</span>
                </div>
              </div>
              <div className="bg-surface-5 lg:bg-primary/10 px-4 py-2 rounded-full border border-outline/30 lg:border-primary/20">
                <span className="text-xs font-bold text-on-surface/80 lg:text-primary lg:font-label lg:text-[10px] lg:uppercase lg:tracking-wider">
                  Day {dueDay}
                  <span className="hidden lg:inline"> — Monthly</span>
                </span>
              </div>
            </div>

            <div className="h-48">
              <BarChart bars={chartBars} className="h-full" />
            </div>

            <Link
              href="/tenant/payments/new"
              className="w-full py-5 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">Log Payment</span>
              <MaterialIcon name="arrow_forward" className="font-bold" />
            </Link>
          </div>
        </section>

        {/* Desktop Side Cards */}
        <div className="hidden lg:grid lg:col-span-5 grid-rows-2 gap-6">
          <div className="bg-surface-0 rounded-3xl p-6 flex flex-col justify-center border border-outline/20">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium mb-1">Current Balance</p>
            <p className="font-headline font-bold text-3xl">{formatCurrency(balance, currency)}</p>
            <div className="flex items-center gap-2 mt-2">
              <MaterialIcon name={balance <= 0 ? "check_circle" : "warning"} className={`text-sm ${balance <= 0 ? "text-primary" : "text-error"}`} />
              <span className="text-on-surface-variant text-xs font-label">
                {balance <= 0 ? "Account up to date" : "Outstanding balance"}
              </span>
            </div>
          </div>
          <div className="bg-surface-3 rounded-3xl p-6 flex flex-col justify-center border border-outline/20">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium mb-1">Previous Payment</p>
            <div className="flex justify-between items-baseline">
              <p className="font-headline font-bold text-3xl">
                {lastConfirmed ? formatCurrency(lastConfirmed.amount, lastConfirmed.currency) : "—"}
              </p>
              <p className="font-label text-xs text-on-surface-variant">
                {lastConfirmed ? new Date(lastConfirmed.paidOn).toLocaleDateString("en-US", { month: "short", day: "2-digit" }) : "—"}
              </p>
            </div>
            {lastConfirmed && (
              <div className="mt-2 flex items-center gap-2">
                <MaterialIcon name="receipt_long" className="text-on-surface-variant text-sm" />
                <span className="text-on-surface-variant text-xs font-label">via {lastConfirmed.method}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lease Progress */}
        <section className="lg:col-span-6 bg-surface-0 border border-outline/20 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Lease Progress</h2>
            <div className="flex items-center gap-2">
              <span className="hidden lg:block text-on-surface-variant font-label text-xs">{monthsRemaining} months remaining</span>
              <Link href="/tenant/lease" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-black lg:hidden">
                <MaterialIcon name="north_east" className="text-xl font-bold" />
              </Link>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-on-surface-variant font-medium">Months Spent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-surface-5" />
              <span className="text-xs text-on-surface-variant font-medium">Remaining</span>
            </div>
          </div>

          <div className="relative pt-4">
            <div className="w-full h-24 lg:h-3 bg-surface-5 rounded-3xl lg:rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary stripe-pattern lg:stripe-pattern-none lg:bg-primary rounded-l-3xl lg:rounded-l-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-4">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Started</p>
                <p className="font-bold">{leaseStart.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Ends</p>
                <p className="font-bold">{leaseEnd.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline/20">
            <div className="p-4 bg-surface-5 lg:bg-surface-3 rounded-2xl">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Property</p>
              <p className="font-bold text-sm">{tenancy.property.label}</p>
            </div>
            <div className="p-4 bg-surface-5 lg:bg-surface-3 rounded-2xl">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Unit</p>
              <p className="font-bold text-sm">{tenancy.unit.label}</p>
            </div>
          </div>
        </section>

        {/* Current Property */}
        <section className="lg:col-span-6 relative rounded-[2.5rem] overflow-hidden group aspect-video lg:min-h-[360px] bg-surface-4">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
            <div>
              <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-1 lg:tracking-[0.2em]">
                <span className="lg:hidden">{tenancy.property.label}</span>
                <span className="hidden lg:inline">Current Residence</span>
              </p>
              <h3 className="text-2xl font-bold">
                <span className="lg:hidden">{tenancy.unit.label}</span>
                <span className="hidden lg:inline">{tenancy.property.label}, {tenancy.unit.label}</span>
              </h3>
              {tenancy.property.area && (
                <p className="hidden lg:block text-on-surface-variant text-sm mt-1">{tenancy.property.area}</p>
              )}
            </div>
            <Link href="/tenant/lease" className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/30 transition-all">
              <MaterialIcon name="open_in_new" />
            </Link>
          </div>
        </section>

        {/* Payment History */}
        <section className="lg:col-span-12 space-y-4 lg:space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-bold font-headline">Payment History</h3>
            <Link href="/tenant/payments" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>
          </div>

          {payments.length === 0 ? (
            <p className="text-on-surface-variant text-sm text-center py-8 bg-surface-0 rounded-3xl border border-outline/20">No payments yet.</p>
          ) : (
            <>
              {/* Mobile list */}
              <div className="space-y-3 lg:hidden">
                {payments.slice(0, 4).map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/tenant/payments/${payment.id}`}
                    className="bg-surface-0 border border-outline/20 p-5 rounded-3xl flex items-center justify-between hover:bg-surface-3 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-5 flex items-center justify-center border border-outline/30">
                        <MaterialIcon name="receipt" className="text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-bold">{payment.method}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{new Date(payment.paidOn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(payment.amount, payment.currency)}</p>
                      <div className="flex items-center justify-end gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${payment.status === "CONFIRMED" ? "bg-primary" : payment.status === "DISPUTED" ? "bg-error" : "bg-on-surface-variant"}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${payment.status === "CONFIRMED" ? "text-primary" : payment.status === "DISPUTED" ? "text-error" : "text-on-surface-variant"}`}>{payment.status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block bg-surface-0 rounded-3xl overflow-hidden border border-outline/20">
                <div className="divide-y divide-outline-variant/5">
                  {payments.slice(0, 6).map((payment) => (
                    <Link key={payment.id} href={`/tenant/payments/${payment.id}`} className="p-6 flex items-center justify-between hover:bg-surface-3 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-3 flex items-center justify-center text-primary">
                          <MaterialIcon name="event_available" />
                        </div>
                        <div>
                          <p className="font-bold">{payment.method}</p>
                          <p className="font-label text-xs text-on-surface-variant">{new Date(payment.paidOn).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-headline font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${payment.status === "CONFIRMED" ? "bg-primary" : "bg-on-surface-variant"}`} />
                          <span className={`text-[10px] font-label uppercase tracking-widest font-bold ${payment.status === "CONFIRMED" ? "text-primary" : "text-on-surface-variant"}`}>{payment.status}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

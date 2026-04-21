import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { MaterialIcon } from "@/components/layout/icon";
import { BackButton } from "@/components/shared/back-button";
import { UpgradeForm } from "./upgrade-form";

export default async function UpgradePage() {
  const user = await requireRole("LANDLORD");

  const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { plan: true } });
  const currentPlan = (dbUser?.plan || "FREE") as keyof typeof PLAN_LIMITS;

  const pendingRequest = await db.upgradeRequest.findFirst({
    where: { landlordId: user.id, status: "PENDING" },
  });

  const [propertyCount, unitCount, tenantCount] = await Promise.all([
    db.property.count({ where: { landlordId: user.id } }),
    db.unit.count({ where: { property: { landlordId: user.id } } }),
    db.tenancy.count({ where: { landlordId: user.id, status: "ACTIVE" } }),
  ]);

  const freeLimits = PLAN_LIMITS.FREE;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton href="/landlord/settings" label="Settings" />
      <h1 className="text-2xl font-bold font-headline tracking-tight">Upgrade to Pro</h1>

      {currentPlan === "PRO" ? (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center space-y-2">
          <MaterialIcon name="verified" className="text-primary text-4xl" />
          <h2 className="text-xl font-bold font-headline">You&apos;re on Pro</h2>
          <p className="text-on-surface-variant text-sm">You have unlimited access to all Rentli features.</p>
        </div>
      ) : (
        <>
          {/* Current usage */}
          <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold font-headline">Current Usage (Free Plan)</h3>
            <div className="space-y-3">
              <UsageBar label="Properties" current={propertyCount} max={freeLimits.properties as number} />
              <UsageBar label="Units" current={unitCount} max={freeLimits.units as number} />
              <UsageBar label="Tenants" current={tenantCount} max={freeLimits.tenants as number} />
            </div>
          </div>

          {/* Plan comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MaterialIcon name="token" className="text-on-surface-variant" />
                <h3 className="text-sm font-bold font-headline">Free</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <PlanFeature text={`${freeLimits.properties} Property`} />
                <PlanFeature text={`${freeLimits.units} Units`} />
                <PlanFeature text={`${freeLimits.tenants} Tenants`} />
                <PlanFeature text="Basic dashboard" />
                <PlanFeature text="Payment tracking" />
              </ul>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MaterialIcon name="workspace_premium" className="text-primary" />
                <h3 className="text-sm font-bold font-headline text-primary">Pro</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <PlanFeature text="Unlimited properties" highlight />
                <PlanFeature text="Unlimited units" highlight />
                <PlanFeature text="Unlimited tenants" highlight />
                <PlanFeature text="Advanced analytics" highlight />
                <PlanFeature text="Priority support" highlight />
              </ul>
            </div>
          </div>

          {/* Upgrade form or pending status */}
          {pendingRequest ? (
            <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 text-center space-y-3">
              <MaterialIcon name="hourglass_top" className="text-on-surface-variant text-3xl" />
              <h3 className="font-bold font-headline">Upgrade Request Pending</h3>
              <p className="text-on-surface-variant text-sm">
                Your upgrade request is being reviewed. You&apos;ll be upgraded once payment is confirmed.
              </p>
              <p className="text-[10px] text-on-surface-muted font-mono">
                Reference: {pendingRequest.referenceText}
              </p>
              <p className="text-[10px] text-on-surface-muted">
                Submitted {new Date(pendingRequest.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <UpgradeForm />
          )}
        </>
      )}
    </div>
  );
}

function UsageBar({ label, current, max }: { label: string; current: number; max: number }) {
  const percent = Math.min(100, Math.round((current / max) * 100));
  const atLimit = current >= max;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm">{label}</span>
        <span className={`text-sm font-bold ${atLimit ? "text-error" : ""}`}>
          {current}/{max}
        </span>
      </div>
      <div className="w-full bg-surface-5 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${atLimit ? "bg-error" : "bg-primary"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function PlanFeature({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <MaterialIcon
        name="check"
        className={`text-sm ${highlight ? "text-primary" : "text-on-surface-variant"}`}
      />
      <span className={highlight ? "text-on-surface" : "text-on-surface-variant"}>{text}</span>
    </li>
  );
}

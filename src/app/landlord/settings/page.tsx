import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { ThemeSelector } from "@/components/shared/theme-selector";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { MaterialIcon } from "@/components/layout/icon";

export default async function LandlordSettingsPage() {
  const user = await requireRole("LANDLORD");
  const isPro = user.plan === "PRO";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-headline tracking-tight">Settings</h1>

      {/* Profile */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold font-headline">Profile</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Name</span>
            <span className="font-medium">{user.name}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Contact</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Role</span>
            <span className="font-medium">Property Manager</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Plan</span>
            <span className={`font-bold ${isPro ? "text-primary" : ""}`}>{user.plan || "FREE"}</span>
          </div>
        </div>
      </div>

      {/* Plan / Upgrade */}
      <Link
        href="/landlord/upgrade"
        className={`flex items-center justify-between rounded-2xl p-6 transition-all group ${
          isPro
            ? "bg-primary/5 border border-primary/20"
            : "bg-surface-4 border border-white/5 hover:bg-surface-5"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPro ? "bg-primary/10" : "bg-surface-5"}`}>
            <MaterialIcon name={isPro ? "verified" : "workspace_premium"} className={isPro ? "text-primary" : "text-on-surface-variant"} />
          </div>
          <div>
            <p className="font-bold text-sm">{isPro ? "Pro Plan Active" : "Upgrade to Pro"}</p>
            <p className="text-[10px] text-on-surface-variant">
              {isPro ? "Unlimited properties, units, and tenants" : "Get unlimited access to all features"}
            </p>
          </div>
        </div>
        <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
      </Link>

      {/* Theme */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold font-headline">Appearance</h3>
        <ThemeSelector />
      </div>

      {/* Sign out */}
      <SignOutButton />
    </div>
  );
}

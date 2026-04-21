import { requireRole } from "@/lib/auth-helpers";
import { ThemeSelector } from "@/components/shared/theme-selector";
import { SignOutButton } from "@/components/shared/sign-out-button";

export default async function TenantSettingsPage() {
  const user = await requireRole("TENANT");

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
            <span className="font-medium">Tenant</span>
          </div>
        </div>
      </div>

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

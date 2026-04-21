import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import { TenantDesktopNav } from "./tenant-desktop-nav";
import type { NavItem } from "@/types";

const bottomNavItems: NavItem[] = [
  { icon: "grid_view", label: "Dashboard", href: "/tenant", exact: true },
  { icon: "description", label: "Lease", href: "/tenant/lease" },
  { icon: "account_balance_wallet", label: "Payments", href: "/tenant/payments" },
  { icon: "person", label: "Settings", href: "/tenant/settings" },
];

const desktopNavItems: NavItem[] = [
  { icon: "grid_view", label: "Dashboard", href: "/tenant", exact: true },
  { icon: "description", label: "Lease", href: "/tenant/lease" },
  { icon: "account_balance_wallet", label: "Payments", href: "/tenant/payments" },
  { icon: "gavel", label: "Disputes", href: "/tenant/disputes" },
  { icon: "person", label: "Settings", href: "/tenant/settings" },
];

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCR_J7NRfh-XHID5hguidKdYl9IJqGd5tmjH-Bsmsh8GOXOVcsaAmExOcWYrD8ZmFDrE8ubyzy2Y6ozqBfaigRiF31-qCh-jgnvMBHUm9Fh_Izz4M2Y37eQ132fcxZGSbbBA4f7iDcSLZriZl2M3S0OMZfjOJ64U23NWnlzWWdoxeoIs9K_-0LzIb4s6MxU87LjcDOPLZ4i5yW4DhSmqh0bHxV2wkM0RSnHQCxeNpHJ-Yh9Y_6vkHcakySaFJnrSDU9zqQqw5VmE4jr";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <TopAppBar
        greeting="Hi, Tenant!"
        date={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        avatarUrl={AVATAR_URL}
        variant="tenant"
        className="lg:hidden"
      />

      {/* Desktop header */}
      <TenantDesktopNav items={desktopNavItems} avatarUrl={AVATAR_URL} />

      <main className="pt-24 lg:pt-24 pb-40 lg:pb-8 px-5 lg:px-6 max-w-5xl mx-auto">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNavBar items={bottomNavItems} className="lg:hidden" />
    </div>
  );
}

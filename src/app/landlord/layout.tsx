import { SideNavBar } from "@/components/layout/side-nav-bar";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { DesktopTopBar } from "@/components/layout/desktop-top-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import type { NavItem } from "@/types";

const sideNavItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/landlord", exact: true },
  { icon: "domain", label: "Properties", href: "/landlord/properties" },
  { icon: "payments", label: "Payments", href: "/landlord/payments" },
  { icon: "group", label: "Tenants", href: "/landlord/tenants" },
  { icon: "gavel", label: "Disputes", href: "/landlord/disputes" },
  { icon: "notifications", label: "Notifications", href: "/landlord/notifications" },
  { icon: "settings", label: "Settings", href: "/landlord/settings" },
];

const bottomNavItems: NavItem[] = [
  { icon: "grid_view", label: "Dashboard", href: "/landlord", exact: true },
  { icon: "corporate_fare", label: "Properties", href: "/landlord/properties" },
  { icon: "account_balance_wallet", label: "Payments", href: "/landlord/payments" },
  { icon: "person", label: "Settings", href: "/landlord/settings" },
];

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCps0wWnj0W_31TxT48EdqSbO3F176VJCQY7zvaI5fIhviruN_LZ2t7oqCRpnsmmrtu_wy8aLKFSP9X8nApS14-j7jyEc-Wn2JMqdln8dNL9CNt78tVz4R_vCDzygGdEiig6QSVFkbuW8tIhxZ10kafrWZeC-h2c2tH5aUX1CEksDXtG-PN1y2juBzcpD9aYBL5j9aUBg3yOJ07xOAoBwQ4zLHFhQxYwrazJn62s4GeS7n-LXnd6xtZG_Hgo51XRAPywiUIWQ6aj6eR";

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <SideNavBar items={sideNavItems} className="hidden lg:flex" />

      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile top bar */}
        <TopAppBar
          greeting="Hi, Property Manager!"
          date={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          avatarUrl={AVATAR_URL}
          variant="landlord"
          className="lg:hidden"
        />

        {/* Desktop top bar */}
        <DesktopTopBar
          title="Rentli"
          avatarUrl={AVATAR_URL}
          className="hidden lg:flex"
        />

        <main className="flex-1 pt-24 lg:pt-0 pb-40 lg:pb-8 px-5 lg:px-8">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <BottomNavBar items={bottomNavItems} className="lg:hidden" />
      </div>
    </div>
  );
}

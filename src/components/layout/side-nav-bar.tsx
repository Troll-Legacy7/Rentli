"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./icon";
import type { NavItem } from "@/types";

interface SideNavBarProps {
  items: NavItem[];
  className?: string;
}

export function SideNavBar({ items, className }: SideNavBarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full flex flex-col py-8 px-6 bg-surface-1 w-64 font-headline font-medium text-sm z-50",
        className
      )}
    >
      <div className="mb-12">
        <h1 className="text-2xl font-bold tracking-tighter text-primary">Rentli</h1>
        <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mt-1">
          Property Management
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "text-primary font-bold bg-primary/5 border-r-2 border-primary"
                  : "text-on-surface-variant hover:text-secondary-text hover:bg-surface-0"
              )}
            >
              <MaterialIcon name={item.icon} filled={isActive} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/landlord/properties/new"
        className="mt-auto bg-primary text-on-primary font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
      >
        <MaterialIcon name="add" />
        <span>Add Property</span>
      </Link>
    </aside>
  );
}

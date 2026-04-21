"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./icon";
import type { NavItem } from "@/types";

interface BottomNavBarProps {
  items: NavItem[];
  className?: string;
}

export function BottomNavBar({ items, className }: BottomNavBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 w-full flex justify-around items-center pt-4 pb-8 px-6 bg-bg/80 backdrop-blur-2xl border-t border-white/5 z-50",
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-colors",
              isActive ? "text-primary" : "text-on-surface/40 hover:text-on-surface"
            )}
          >
            <MaterialIcon name={item.icon} filled={isActive || item.filled} className="text-2xl" />
            {isActive && <div className="w-1 h-1 bg-primary rounded-full mt-1.5" />}
          </Link>
        );
      })}
    </nav>
  );
}

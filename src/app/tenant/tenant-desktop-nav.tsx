"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/types";

export function TenantDesktopNav({ items, avatarUrl }: { items: NavItem[]; avatarUrl: string }) {
  const pathname = usePathname();

  return (
    <header className="hidden lg:block fixed top-0 w-full z-50 bg-surface-1/60 backdrop-blur-3xl">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tighter text-primary font-headline">Rentli</h1>
        </div>
        <nav className="flex items-center gap-8">
          {items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-label transition-colors ${
                  isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-on-surface hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-5 overflow-hidden border border-outline/50">
            <img alt="Avatar" className="w-full h-full object-cover" src={avatarUrl} />
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/layout/icon";

const themes = [
  { value: "light", label: "Light", icon: "light_mode" },
  { value: "dark", label: "Dark", icon: "dark_mode" },
  { value: "system", label: "System", icon: "monitor" },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => (
          <div key={t.value} className="h-20 bg-surface-4 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border transition-all active:scale-95 ${
            theme === t.value
              ? "bg-primary/10 border-primary text-primary"
              : "bg-surface-4 border-white/5 text-on-surface-variant hover:bg-surface-5"
          }`}
        >
          <MaterialIcon name={t.icon} className="text-2xl" />
          <span className="text-xs font-bold">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

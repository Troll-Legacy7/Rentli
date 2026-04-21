"use client";

import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/layout/icon";

export function BackButton({ href, label = "Back" }: { href?: string; label?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-sm transition-colors mb-4"
    >
      <MaterialIcon name="arrow_back" className="text-lg" />
      <span>{label}</span>
    </button>
  );
}

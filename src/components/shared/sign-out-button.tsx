"use client";

import { signOut } from "next-auth/react";
import { MaterialIcon } from "@/components/layout/icon";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full py-4 bg-surface-4 border border-white/5 text-error font-bold rounded-2xl hover:bg-error/10 active:scale-95 transition-all flex items-center justify-center gap-2"
    >
      <MaterialIcon name="logout" />
      Sign Out
    </button>
  );
}

import Link from "next/link";
import { MaterialIcon } from "@/components/layout/icon";

export function PlanLimitBanner({ message }: { message: string }) {
  return (
    <div className="bg-error/5 border border-error/10 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
        <MaterialIcon name="lock" className="text-error" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-error mb-1">Plan Limit Reached</p>
        <p className="text-sm text-on-surface-variant">{message}</p>
        <Link
          href="/landlord/upgrade"
          className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-primary hover:underline"
        >
          <MaterialIcon name="workspace_premium" className="text-lg" />
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}

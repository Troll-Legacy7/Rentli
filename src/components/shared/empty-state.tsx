import { MaterialIcon } from "@/components/layout/icon";
import Link from "next/link";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-4 flex items-center justify-center mb-4">
        <MaterialIcon name={icon} className="text-3xl text-on-surface-variant" />
      </div>
      <h3 className="font-headline font-bold text-lg mb-1">{title}</h3>
      <p className="text-on-surface-variant text-sm max-w-xs">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 bg-primary text-black font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

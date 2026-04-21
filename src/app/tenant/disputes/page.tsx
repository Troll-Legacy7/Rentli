import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function TenantDisputesPage() {
  const user = await requireRole("TENANT");

  const disputes = await db.dispute.findMany({
    where: { tenantId: user.id },
    include: { property: true, unit: true },
    orderBy: { createdAt: "desc" },
  });

  const open = disputes.filter((d) => d.status === "OPEN" || d.status === "IN_PROGRESS");
  const closed = disputes.filter((d) => d.status === "RESOLVED" || d.status === "CLOSED");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Disputes</h1>
        <Link
          href="/tenant/disputes/new"
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <MaterialIcon name="add" className="text-lg" />
          New Dispute
        </Link>
      </div>

      {disputes.length === 0 ? (
        <EmptyState
          icon="gavel"
          title="No disputes"
          description="If you have an issue with a payment or your lease, you can raise a dispute here."
          actionLabel="Raise Dispute"
          actionHref="/tenant/disputes/new"
        />
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Open</h3>
              <div className="grid gap-3">
                {open.map((dispute) => (
                  <DisputeCard key={dispute.id} dispute={dispute} role="tenant" />
                ))}
              </div>
            </div>
          )}

          {closed.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Resolved</h3>
              <div className="grid gap-3">
                {closed.map((dispute) => (
                  <DisputeCard key={dispute.id} dispute={dispute} role="tenant" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DisputeCard({ dispute, role }: {
  dispute: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    property: { label: string };
    unit: { label: string };
  };
  role: "tenant" | "landlord";
}) {
  const statusConfig: Record<string, { icon: string; color: string; bg: string }> = {
    OPEN: { icon: "error_outline", color: "text-error", bg: "bg-error/10" },
    IN_PROGRESS: { icon: "pending", color: "text-on-surface-variant", bg: "bg-surface-5" },
    RESOLVED: { icon: "check_circle", color: "text-primary", bg: "bg-primary/10" },
    CLOSED: { icon: "cancel", color: "text-on-surface-variant", bg: "bg-surface-5" },
  };

  const config = statusConfig[dispute.status] || statusConfig.OPEN;

  return (
    <Link
      href={`/${role}/disputes/${dispute.id}`}
      className="bg-surface-4 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-surface-5 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
          <MaterialIcon name={config.icon} className={config.color} />
        </div>
        <div>
          <p className="text-sm font-bold">{dispute.title}</p>
          <p className="text-[10px] text-on-surface-variant">
            {dispute.property.label} &bull; {dispute.unit.label} &bull; {new Date(dispute.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
          {dispute.status.replace("_", " ")}
        </span>
        <MaterialIcon name="chevron_right" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
      </div>
    </Link>
  );
}

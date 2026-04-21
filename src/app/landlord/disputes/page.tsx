import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function LandlordDisputesPage() {
  const user = await requireRole("LANDLORD");

  const disputes = await db.dispute.findMany({
    where: { landlordId: user.id },
    include: { tenant: true, property: true, unit: true },
    orderBy: { createdAt: "desc" },
  });

  const open = disputes.filter((d) => d.status === "OPEN");
  const inProgress = disputes.filter((d) => d.status === "IN_PROGRESS");
  const resolved = disputes.filter((d) => d.status === "RESOLVED" || d.status === "CLOSED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-headline tracking-tight">Disputes</h1>

      {disputes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-4 border border-white/5 rounded-2xl p-5 text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Open</p>
            <p className="text-xl font-bold font-headline text-error">{open.length}</p>
          </div>
          <div className="bg-surface-4 border border-white/5 rounded-2xl p-5 text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">In Progress</p>
            <p className="text-xl font-bold font-headline text-on-surface-variant">{inProgress.length}</p>
          </div>
          <div className="bg-surface-4 border border-white/5 rounded-2xl p-5 text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Resolved</p>
            <p className="text-xl font-bold font-headline text-primary">{resolved.length}</p>
          </div>
        </div>
      )}

      {disputes.length === 0 ? (
        <EmptyState
          icon="gavel"
          title="No disputes"
          description="Disputes raised by tenants will appear here."
        />
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">
                Needs Attention ({open.length})
              </h3>
              <div className="grid gap-3">
                {open.map((dispute) => (
                  <DisputeCard key={dispute.id} dispute={dispute} />
                ))}
              </div>
            </div>
          )}

          {inProgress.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">In Progress</h3>
              <div className="grid gap-3">
                {inProgress.map((dispute) => (
                  <DisputeCard key={dispute.id} dispute={dispute} />
                ))}
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Resolved</h3>
              <div className="grid gap-3">
                {resolved.map((dispute) => (
                  <DisputeCard key={dispute.id} dispute={dispute} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DisputeCard({ dispute }: {
  dispute: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    tenant: { name: string };
    property: { label: string };
    unit: { label: string };
  };
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
      href={`/landlord/disputes/${dispute.id}`}
      className="bg-surface-4 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-surface-5 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
          <MaterialIcon name={config.icon} className={config.color} />
        </div>
        <div>
          <p className="text-sm font-bold">{dispute.title}</p>
          <p className="text-[10px] text-on-surface-variant">
            {dispute.tenant.name} &bull; {dispute.property.label} &bull; {dispute.unit.label}
          </p>
          <p className="text-[10px] text-on-surface-muted">{new Date(dispute.createdAt).toLocaleDateString()}</p>
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

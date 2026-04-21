import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { MaterialIcon } from "@/components/layout/icon";
import { BackButton } from "@/components/shared/back-button";
import { DisputeActions } from "./dispute-actions";

export default async function LandlordDisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("LANDLORD");

  const dispute = await db.dispute.findFirst({
    where: { id, landlordId: user.id },
    include: { tenant: true, property: true, unit: true },
  });

  if (!dispute) notFound();

  const statusConfig: Record<string, { icon: string; color: string; bg: string; label: string }> = {
    OPEN: { icon: "error_outline", color: "text-error", bg: "bg-error/10", label: "Open" },
    IN_PROGRESS: { icon: "pending", color: "text-on-surface-variant", bg: "bg-surface-5", label: "In Progress" },
    RESOLVED: { icon: "check_circle", color: "text-primary", bg: "bg-primary/10", label: "Resolved" },
    CLOSED: { icon: "cancel", color: "text-on-surface-variant", bg: "bg-surface-5", label: "Closed" },
  };
  const config = statusConfig[dispute.status] || statusConfig.OPEN;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton href="/landlord/disputes" label="Disputes" />

      {/* Status Header */}
      <div className="text-center space-y-3">
        <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center mx-auto`}>
          <MaterialIcon name={config.icon} className={`${config.color} text-3xl`} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-headline">{dispute.title}</h1>
          <p className={`text-sm font-bold ${config.color}`}>{config.label}</p>
        </div>
      </div>

      {/* Dispute Details */}
      <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
        <div>
          <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block mb-1">Description</span>
          <p className="text-sm text-on-surface whitespace-pre-wrap">{dispute.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Tenant</span>
            <span className="font-medium">{dispute.tenant.name}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Contact</span>
            <span className="font-medium">{dispute.tenant.phoneOrEmail}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Property</span>
            <span className="font-medium">{dispute.property.label}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Unit</span>
            <span className="font-medium">{dispute.unit.label}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Filed On</span>
            <span className="font-medium">{new Date(dispute.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Last Updated</span>
            <span className="font-medium">{new Date(dispute.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {(dispute.status === "OPEN" || dispute.status === "IN_PROGRESS") && (
        <DisputeActions disputeId={dispute.id} status={dispute.status} />
      )}

      {/* Resolution */}
      {dispute.resolutionNote && (
        <div className={`border rounded-2xl p-5 ${
          dispute.status === "RESOLVED" ? "bg-primary/5 border-primary/10" : "bg-surface-4 border-white/5"
        }`}>
          <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${
            dispute.status === "RESOLVED" ? "text-primary" : "text-on-surface-variant"
          }`}>
            Resolution
          </p>
          <p className="text-sm text-on-surface whitespace-pre-wrap">{dispute.resolutionNote}</p>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { MaterialIcon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

export default async function InvitesPage() {
  const user = await requireRole("LANDLORD");

  const invites = await db.invite.findMany({
    where: { landlordId: user.id },
    include: { property: true, unit: true },
    orderBy: { createdAt: "desc" },
  });

  const activeInvites = invites.filter((i) => !i.usedAt && i.expiresAt > new Date());
  const usedInvites = invites.filter((i) => i.usedAt);
  const expiredInvites = invites.filter((i) => !i.usedAt && i.expiresAt <= new Date());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Invites</h1>
        <Link
          href="/landlord/invites/new"
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <MaterialIcon name="add" className="text-lg" />
          New Invite
        </Link>
      </div>

      {invites.length === 0 ? (
        <EmptyState
          icon="mail"
          title="No invites yet"
          description="Create an invite link to onboard tenants to your properties."
          actionLabel="New Invite"
          actionHref="/landlord/invites/new"
        />
      ) : (
        <div className="space-y-6">
          {activeInvites.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Active</h3>
              <div className="grid gap-3">
                {activeInvites.map((invite) => (
                  <InviteCard key={invite.id} invite={invite} status="active" />
                ))}
              </div>
            </div>
          )}

          {usedInvites.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Used</h3>
              <div className="grid gap-3">
                {usedInvites.map((invite) => (
                  <InviteCard key={invite.id} invite={invite} status="used" />
                ))}
              </div>
            </div>
          )}

          {expiredInvites.length > 0 && (
            <div>
              <h3 className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-3">Expired</h3>
              <div className="grid gap-3">
                {expiredInvites.map((invite) => (
                  <InviteCard key={invite.id} invite={invite} status="expired" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InviteCard({
  invite,
  status,
}: {
  invite: {
    id: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
    property: { label: string };
    unit: { label: string } | null;
  };
  status: "active" | "used" | "expired";
}) {
  const statusStyles = {
    active: "bg-primary/10 text-primary",
    used: "bg-surface-5 text-on-surface-variant",
    expired: "bg-error/10 text-error",
  };

  return (
    <div className="bg-surface-4 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          status === "active" ? "bg-primary/10" : "bg-surface-5"
        }`}>
          <MaterialIcon
            name={status === "used" ? "check_circle" : status === "expired" ? "timer_off" : "link"}
            className={status === "active" ? "text-primary" : "text-on-surface-variant"}
          />
        </div>
        <div>
          <p className="font-bold text-sm">{invite.property.label}</p>
          <p className="text-[10px] text-on-surface-variant">
            {invite.unit ? invite.unit.label : "Any unit"} &bull; Expires {new Date(invite.expiresAt).toLocaleDateString()}
          </p>
          {status === "active" && (
            <p className="text-[10px] text-on-surface-muted mt-1 font-mono">
              /invite/{invite.token.slice(0, 12)}...
            </p>
          )}
        </div>
      </div>
      <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${statusStyles[status]}`}>
        {status}
      </span>
    </div>
  );
}

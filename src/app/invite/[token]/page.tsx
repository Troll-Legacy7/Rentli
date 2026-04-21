import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AcceptInviteForm } from "./accept-invite-form";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  const invite = await db.invite.findUnique({
    where: { token },
    include: {
      property: true,
      unit: true,
      landlord: true,
    },
  });

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl mb-4">
            <span className="material-symbols-outlined text-error" style={{ fontSize: 48 }}>error</span>
          </div>
          <h1 className="text-2xl font-bold font-headline">Invalid Invite</h1>
          <p className="text-on-surface-variant text-sm">This invite link is not valid.</p>
        </div>
      </div>
    );
  }

  if (invite.usedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl mb-4">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 48 }}>check_circle</span>
          </div>
          <h1 className="text-2xl font-bold font-headline">Invite Already Used</h1>
          <p className="text-on-surface-variant text-sm">This invite has already been accepted.</p>
        </div>
      </div>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl mb-4">
            <span className="material-symbols-outlined text-error" style={{ fontSize: 48 }}>timer_off</span>
          </div>
          <h1 className="text-2xl font-bold font-headline">Invite Expired</h1>
          <p className="text-on-surface-variant text-sm">This invite has expired. Ask your property manager for a new one.</p>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!session?.user;
  const isTenant = session?.user?.role === "TENANT";

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tighter text-primary font-headline mb-4">Rentli</h1>
          <h2 className="text-xl font-bold font-headline">You&apos;re Invited</h2>
          <p className="text-on-surface-variant text-sm mt-2">
            {invite.landlord.name} has invited you to join a property.
          </p>
        </div>

        <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-3">
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Property</span>
            <span className="font-bold">{invite.property.label}</span>
          </div>
          {invite.property.area && (
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Location</span>
              <span className="text-sm">{invite.property.area}</span>
            </div>
          )}
          {invite.unit && (
            <div>
              <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Unit</span>
              <span className="text-sm">{invite.unit.label}</span>
            </div>
          )}
          <div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-widest block">Expires</span>
            <span className="text-sm">{new Date(invite.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>

        <AcceptInviteForm
          token={token}
          isLoggedIn={isLoggedIn}
          isTenant={isTenant}
          tenantId={isTenant ? session!.user!.id! : undefined}
        />
      </div>
    </div>
  );
}

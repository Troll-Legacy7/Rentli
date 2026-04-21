"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/actions/invites";

export function AcceptInviteForm({
  token,
  isLoggedIn,
  isTenant,
  tenantId,
}: {
  token: string;
  isLoggedIn: boolean;
  isTenant: boolean;
  tenantId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-on-surface-variant">
          Sign in as a tenant to accept this invite.
        </p>
        <a
          href={`/auth/login?redirect=/invite/${token}`}
          className="block w-full py-4 bg-primary text-black font-bold rounded-full text-center hover:opacity-90 active:scale-95 transition-all"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (!isTenant) {
    return (
      <div className="bg-error/5 border border-error/10 rounded-2xl p-4 text-center">
        <p className="text-sm text-error">
          You are logged in as a property manager. Sign in with a tenant account to accept this invite.
        </p>
      </div>
    );
  }

  async function handleAccept() {
    if (!tenantId) return;
    setLoading(true);
    setError("");

    const result = await acceptInvite(token, tenantId);
    if (!result.success) {
      setError(result.error || "Failed to accept invite");
      setLoading(false);
      return;
    }

    router.push("/tenant/lease");
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-xl text-center">{error}</p>
      )}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full py-4 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? "Accepting..." : "Accept Invite"}
      </button>
    </div>
  );
}

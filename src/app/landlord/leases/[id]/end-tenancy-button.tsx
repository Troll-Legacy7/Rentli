"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { endTenancy } from "@/actions/tenancies";

export function EndTenancyButton({ tenancyId, hasBalance }: { tenancyId: string; hasBalance: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function handleEnd() {
    setLoading(true);
    setError("");
    const result = await endTenancy(tenancyId);
    if (!result.success) {
      setError(result.error || "Failed to end lease");
      setLoading(false);
      setConfirming(false);
      return;
    }
    router.push("/landlord/leases");
  }

  if (hasBalance) {
    return (
      <div className="bg-error/5 border border-error/10 rounded-2xl p-4 text-sm text-error">
        Cannot end this lease while there is an outstanding balance. Settle the balance first.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-xl">{error}</p>}

      {confirming ? (
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to end this lease? The unit will be marked as vacant.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleEnd}
              disabled={loading}
              className="flex-1 py-3 bg-error text-white font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? "Ending..." : "Yes, End Lease"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-3 bg-surface-5 text-on-surface font-bold rounded-full hover:opacity-90 active:scale-95 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="w-full py-4 bg-surface-5 text-error font-bold rounded-full hover:bg-error/10 active:scale-95 transition-all text-sm"
        >
          End Lease
        </button>
      )}
    </div>
  );
}

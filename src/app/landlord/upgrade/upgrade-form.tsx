"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestUpgrade } from "@/actions/upgrade";

export function UpgradeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await requestUpgrade(formData);

    if (!result.success) {
      setError(result.error || "Failed to submit request");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-bold font-headline">Request Upgrade</h3>
      <p className="text-on-surface-variant text-sm">
        To upgrade to Pro, make a payment and enter your reference below. Your account will be upgraded once payment is verified.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Payment Reference
          </label>
          <input
            name="referenceText"
            required
            placeholder="e.g. Mobile Money ref #12345"
            className="w-full bg-surface-3 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Note (optional)
          </label>
          <input
            name="note"
            placeholder="Any additional details"
            className="w-full bg-surface-3 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {error && (
          <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Upgrade Request"}
        </button>
      </form>
    </div>
  );
}

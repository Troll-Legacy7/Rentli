"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createDispute } from "@/actions/disputes";
import { BackButton } from "@/components/shared/back-button";

export default function NewDisputePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unitId, setUnitId] = useState("");

  useEffect(() => {
    fetch("/api/tenant/active-tenancy")
      .then((r) => r.json())
      .then((data) => {
        if (data.unitId) setUnitId(data.unitId);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("unitId", unitId);
    const result = await createDispute(formData);

    if (!result.success) {
      setError(result.error || "Failed to create dispute");
      setLoading(false);
      return;
    }

    router.push(`/tenant/disputes/${result.id}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <BackButton href="/tenant/disputes" label="Disputes" />
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-6">Raise a Dispute</h1>

      {!unitId ? (
        <p className="text-on-surface-variant text-sm bg-surface-4 rounded-2xl p-6 text-center">
          You need an active lease to raise a dispute.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
              Title
            </label>
            <input
              name="title"
              required
              maxLength={200}
              placeholder="e.g. Incorrect payment amount"
              className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              name="description"
              required
              maxLength={2000}
              rows={5}
              placeholder="Describe the issue in detail..."
              className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
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
            {loading ? "Submitting..." : "Submit Dispute"}
          </button>
        </form>
      )}
    </div>
  );
}

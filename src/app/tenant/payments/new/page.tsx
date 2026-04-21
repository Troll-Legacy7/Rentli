"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logPayment } from "@/actions/payments";
import { BackButton } from "@/components/shared/back-button";

type TenancyInfo = {
  unitId: string;
  unitLabel: string;
  propertyLabel: string;
  monthlyRent: number;
  currency: string;
};

export default function NewPaymentPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tenancy, setTenancy] = useState<TenancyInfo | null>(null);

  useEffect(() => {
    fetch("/api/tenant/active-tenancy")
      .then((r) => r.json())
      .then((data) => {
        if (data.unitId) setTenancy(data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await logPayment(formData);

    if (!result.success) {
      setError(result.error || "Failed to log payment");
      setLoading(false);
      return;
    }

    router.push(`/tenant/payments/${result.id}`);
  }

  if (!tenancy) {
    return (
      <div className="max-w-lg mx-auto">
        <BackButton href="/tenant/payments" label="Payments" />
        <h1 className="text-2xl font-bold font-headline tracking-tight mb-6">Log Payment</h1>
        <p className="text-on-surface-variant text-sm bg-surface-4 rounded-2xl p-6 text-center">
          Loading your lease details...
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg mx-auto">
      <BackButton href="/tenant/payments" label="Payments" />
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-2">Log Payment</h1>
      <p className="text-on-surface-variant text-sm mb-6">
        {tenancy.propertyLabel} &bull; {tenancy.unitLabel}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="unitId" value={tenancy.unitId} />

        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Amount ({tenancy.currency})
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={tenancy.monthlyRent}
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Payment Method
          </label>
          <select
            name="method"
            required
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="Mobile Money">Mobile Money</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Date Paid
          </label>
          <input
            name="paidOn"
            type="date"
            required
            defaultValue={today}
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Reference / Note (optional)
          </label>
          <input
            name="referenceNote"
            placeholder="e.g. Airtel Money ref #12345"
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
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
          {loading ? "Submitting..." : "Submit Payment"}
        </button>
      </form>
    </div>
  );
}

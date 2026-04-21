"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/actions/properties";
import { BackButton } from "@/components/shared/back-button";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export default function NewPropertyPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProperty(formData);

    if (!result.success) {
      setError(result.error || "Failed to create property");
      setLoading(false);
      return;
    }

    router.push(`/landlord/properties/${result.id}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <BackButton href="/landlord/properties" label="Properties" />
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-6">New Property</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Property Name
          </label>
          <input
            name="label"
            required
            placeholder="e.g. Plot 52, Boarding House, Flats"
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Area / Location
          </label>
          <input
            name="area"
            placeholder="e.g. Lusaka, Woodlands"
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
              Default Rent
            </label>
            <input
              name="defaultRent"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
              Due Day
            </label>
            <input
              name="dueDay"
              type="number"
              min="1"
              max="31"
              defaultValue="1"
              className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Currency
          </label>
          <select
            name="currency"
            defaultValue="ZMW"
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-sm bg-error/10 px-4 py-3 rounded-xl space-y-2">
            <p className="text-error">{error}</p>
            {error.includes("Upgrade") && (
              <a href="/landlord/upgrade" className="text-primary font-bold text-xs hover:underline">
                View upgrade options
              </a>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Property"}
        </button>
      </form>
    </div>
  );
}

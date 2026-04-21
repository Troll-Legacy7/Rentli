"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createUnit } from "@/actions/units";
import { BackButton } from "@/components/shared/back-button";

export default function NewUnitPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createUnit(propertyId, formData);

    if (!result.success) {
      setError(result.error || "Failed to create unit");
      setLoading(false);
      return;
    }

    router.push(`/landlord/properties/${propertyId}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <BackButton href={`/landlord/properties/${propertyId}`} label="Property" />
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-6">Add Unit</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Unit Label
          </label>
          <input
            name="label"
            required
            placeholder="e.g. Room 1, Unit 402, Flat A"
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Rent Override (optional)
          </label>
          <input
            name="rentOverride"
            type="number"
            step="0.01"
            min="0"
            placeholder="Leave blank to use property default"
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <p className="text-on-surface-muted text-xs mt-1">If blank, the property default rent will be used.</p>
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
          {loading ? "Adding..." : "Add Unit"}
        </button>
      </form>
    </div>
  );
}

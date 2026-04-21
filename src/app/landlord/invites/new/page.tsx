"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInvite } from "@/actions/invites";
import { BackButton } from "@/components/shared/back-button";

type PropertyOption = { id: string; label: string; units: { id: string; label: string; occupancyStatus: string }[] };

export default function NewInvitePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/landlord/properties")
      .then((r) => r.json())
      .then((data) => setProperties(data))
      .catch(() => {});
  }, []);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const vacantUnits = selectedProperty?.units.filter((u) => u.occupancyStatus === "VACANT") || [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createInvite(formData);

    if (!result.success) {
      setError(result.error || "Failed to create invite");
      setLoading(false);
      return;
    }

    setInviteLink(`${window.location.origin}/invite/${result.token}`);
    setLoading(false);
  }

  if (inviteLink) {
    return (
      <div className="max-w-lg mx-auto">
        <BackButton href="/landlord/invites" label="Invites" />
        <h1 className="text-2xl font-bold font-headline tracking-tight mb-6">Invite Created</h1>

        <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">Share this link with your tenant. It expires in 7 days.</p>
          <div className="bg-surface-3 rounded-xl p-4 font-mono text-xs break-all text-on-surface">
            {inviteLink}
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="w-full py-4 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hi! You've been invited to manage your rent payments on Rentli. Click this link to get started (expires in 7 days): ${inviteLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#25D366] text-white font-bold rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share via WhatsApp
          </a>
          <button
            onClick={() => router.push("/landlord/invites")}
            className="w-full py-3 bg-surface-5 text-on-surface font-bold rounded-full hover:opacity-90 active:scale-95 transition-all text-sm"
          >
            Back to Invites
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <BackButton href="/landlord/invites" label="Invites" />
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-6">New Invite</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Property
          </label>
          <select
            name="propertyId"
            required
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="">Select a property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {selectedPropertyId && (
          <div>
            <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
              Unit (optional)
            </label>
            <select
              name="unitId"
              className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              <option value="">Any vacant unit</option>
              {vacantUnits.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
            {vacantUnits.length === 0 && (
              <p className="text-error text-xs mt-1">No vacant units in this property.</p>
            )}
          </div>
        )}

        {error && (
          <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Invite Link"}
        </button>
      </form>
    </div>
  );
}

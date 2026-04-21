"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDisputeStatus, resolveDispute } from "@/actions/disputes";

export function DisputeActions({ disputeId, status }: { disputeId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  async function handleMarkInProgress() {
    setLoading(true);
    setError("");
    const result = await updateDisputeStatus(disputeId, "IN_PROGRESS");
    if (!result.success) {
      setError(result.error || "Failed to update");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  async function handleResolve(resolveStatus: "RESOLVED" | "CLOSED") {
    if (!resolutionNote.trim()) {
      setError("Please provide a resolution note");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("disputeId", disputeId);
    formData.set("resolutionNote", resolutionNote);
    formData.set("status", resolveStatus);

    const result = await resolveDispute(formData);
    if (!result.success) {
      setError(result.error || "Failed to resolve");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-xl">{error}</p>}

      {showResolve ? (
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold font-headline">Resolve Dispute</h3>
          <textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Describe how this dispute was resolved..."
            rows={3}
            className="w-full bg-surface-3 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleResolve("RESOLVED")}
              disabled={loading}
              className="flex-1 py-3 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? "Resolving..." : "Mark Resolved"}
            </button>
            <button
              onClick={() => handleResolve("CLOSED")}
              disabled={loading}
              className="flex-1 py-3 bg-surface-5 text-on-surface font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 text-sm"
            >
              Close
            </button>
          </div>
          <button
            onClick={() => { setShowResolve(false); setError(""); }}
            className="w-full py-2 text-on-surface-variant text-sm hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          {status === "OPEN" && (
            <button
              onClick={handleMarkInProgress}
              disabled={loading}
              className="flex-1 py-4 bg-surface-5 text-on-surface font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Updating..." : "Mark In Progress"}
            </button>
          )}
          <button
            onClick={() => setShowResolve(true)}
            className="flex-1 py-4 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}

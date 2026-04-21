"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPayment, disputePayment } from "@/actions/payments";

export function PaymentActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  const [disputeNote, setDisputeNote] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    const result = await confirmPayment(paymentId);
    if (!result.success) {
      setError(result.error || "Failed to confirm");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  async function handleDispute() {
    if (!disputeNote.trim()) {
      setError("Please provide a reason for the dispute");
      return;
    }
    setLoading(true);
    setError("");
    const result = await disputePayment(paymentId, disputeNote);
    if (!result.success) {
      setError(result.error || "Failed to dispute");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-xl">{error}</p>}

      {showDispute ? (
        <div className="bg-surface-4 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold font-headline">Dispute Payment</h3>
          <textarea
            value={disputeNote}
            onChange={(e) => setDisputeNote(e.target.value)}
            placeholder="Explain why this payment is being disputed..."
            rows={3}
            className="w-full bg-surface-3 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleDispute}
              disabled={loading}
              className="flex-1 py-3 bg-error text-white font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 text-sm"
            >
              {loading ? "Submitting..." : "Submit Dispute"}
            </button>
            <button
              onClick={() => { setShowDispute(false); setError(""); }}
              className="flex-1 py-3 bg-surface-5 text-on-surface font-bold rounded-full hover:opacity-90 active:scale-95 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-4 bg-primary text-black font-bold rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Confirming..." : "Confirm Payment"}
          </button>
          <button
            onClick={() => setShowDispute(true)}
            className="flex-1 py-4 bg-surface-5 text-error font-bold rounded-full hover:bg-error/10 active:scale-95 transition-all"
          >
            Dispute
          </button>
        </div>
      )}
    </div>
  );
}

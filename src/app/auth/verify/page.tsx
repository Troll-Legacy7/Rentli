"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp } from "@/actions/auth";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneOrEmail = searchParams.get("phoneOrEmail") || "";
  const devOtp = searchParams.get("otp") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("phoneOrEmail", phoneOrEmail);

    const result = await verifyOtp(formData);

    if (!result.success) {
      setError(result.error || "Verification failed");
      setLoading(false);
      return;
    }

    // Hard redirect so the middleware can route to /landlord or /tenant cleanly
    window.location.href = "/";
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-headline">Verify OTP</h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Enter the code sent to <span className="text-on-surface font-medium">{phoneOrEmail}</span>
        </p>
      </div>

      {/* Dev-mode OTP display */}
      {devOtp && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
          <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-1">
            Dev Mode — Your OTP
          </p>
          <p className="text-3xl font-extrabold font-headline text-primary tracking-[0.3em]">
            {devOtp}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            OTP Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            maxLength={6}
            placeholder="000000"
            autoComplete="one-time-code"
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-center text-2xl font-headline font-bold tracking-[0.3em] text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
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
          {loading ? "Verifying..." : "Verify & Sign In"}
        </button>
      </form>

      <button
        onClick={() => router.back()}
        className="w-full text-on-surface-variant text-sm hover:text-on-surface transition-colors"
      >
        &larr; Back to login
      </button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center text-on-surface-variant">Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}

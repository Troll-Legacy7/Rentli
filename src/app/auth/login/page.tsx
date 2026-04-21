"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestOtp } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"LANDLORD" | "TENANT">("LANDLORD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const result = await requestOtp(formData);

    if (!result.success) {
      setError(result.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // Store data for verify page
    const params = new URLSearchParams({
      phoneOrEmail: result.phoneOrEmail!,
      otp: result.otp!, // dev-mode: pass OTP for display
    });
    router.push(`/auth/verify?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold font-headline">Welcome</h2>
        <p className="text-on-surface-variant text-sm mt-1">Sign in or create your account</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("LANDLORD")}
          className={`p-4 rounded-2xl border text-center transition-all ${
            role === "LANDLORD"
              ? "bg-primary/10 border-primary text-primary"
              : "bg-surface-4 border-white/5 text-on-surface-variant hover:border-white/10"
          }`}
        >
          <span className="material-symbols-outlined text-2xl block mb-1">corporate_fare</span>
          <span className="text-sm font-semibold">Property Manager</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("TENANT")}
          className={`p-4 rounded-2xl border text-center transition-all ${
            role === "TENANT"
              ? "bg-primary/10 border-primary text-primary"
              : "bg-surface-4 border-white/5 text-on-surface-variant hover:border-white/10"
          }`}
        >
          <span className="material-symbols-outlined text-2xl block mb-1">person</span>
          <span className="text-sm font-semibold">Tenant</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            className="w-full bg-surface-4 border border-white/5 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div>
          <label htmlFor="phoneOrEmail" className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-2">
            Phone or Email
          </label>
          <input
            id="phoneOrEmail"
            name="phoneOrEmail"
            type="text"
            required
            placeholder="+260 97X XXX XXX or email@example.com"
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
          {loading ? "Sending OTP..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

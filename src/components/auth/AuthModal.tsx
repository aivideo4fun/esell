"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from "lucide-react";

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}) {
  const [step, setStep] = useState<"INPUT" | "OTP">("INPUT");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep("OTP");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, name }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid OTP");
      }

      onSuccess(data.user);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black font-black text-lg cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center mx-auto text-[#16a34a]">
            {step === "INPUT" ? <ShieldCheck className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-black text-[#0f172a]">
            {step === "INPUT" ? "Login / Register with OTP" : "Enter Verification Code"}
          </h2>
          <p className="text-xs text-[#64748b]">
            {step === "INPUT"
              ? "1-Click verification for instant orders & tracking"
              : `6-digit OTP sent to ${identifier}`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center border border-red-200">
            {errorMsg}
          </div>
        )}

        {step === "INPUT" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-black text-[#0f172a] block mb-1.5 uppercase">
                Your Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none focus:border-[#16a34a]"
              />
            </div>

            <div>
              <label className="text-xs font-black text-[#0f172a] block mb-1.5 uppercase">
                Mobile Number or Email
              </label>
              <input
                type="text"
                required
                placeholder="Enter 10-digit mobile or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none focus:border-[#16a34a]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#065f46] hover:bg-[#044e39] text-white text-xs font-black py-3.5 rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Get OTP Code <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-xs font-black text-[#0f172a] block mb-1.5 uppercase">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-[10px] text-lg font-black px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-2xl focus:outline-none focus:border-[#16a34a]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-black py-3.5 rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Verify &amp; Continue <ArrowRight className="w-4 h-4" /></>}
            </button>

            <button
              type="button"
              onClick={() => setStep("INPUT")}
              className="w-full text-center text-xs font-bold text-[#64748b] hover:text-black cursor-pointer"
            >
              Change Mobile / Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
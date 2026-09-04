"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, KeyRound, CheckCircle2, Loader2, User, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"INPUT" | "OTP">("INPUT");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "OTP" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  useEffect(() => {
    if (verifiedSuccess) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verifiedSuccess, router]);

  // Step 1: Send OTP to /api/auth/send-otp
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (data.success) {
        setStep("OTP");
        setResendTimer(30);
        if (data.devOtp) {
          alert(`Test OTP: ${data.devOtp}`);
        }
      } else {
        setErrorMsg(data.error || "OTP bhejne me samasya aayi. Kripya dobara try karein.");
      }
    } catch {
      setErrorMsg("Network error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP to /api/auth/verify-otp
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, name }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem("cb_customer", JSON.stringify(data.user));
        window.dispatchEvent(new Event("customer-auth-changed"));
        setVerifiedSuccess(true);
      } else {
        setErrorMsg(data.error || "Galat OTP code daala gaya hai.");
      }
    } catch {
      setErrorMsg("Network error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-black inline-flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <h1 className="text-2xl font-black text-slate-950">
            {step === "INPUT" ? "Login with OTP" : "Enter Verification Code"}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {step === "INPUT"
              ? "Enter your mobile number or email to receive a secure OTP"
              : `We sent a 6-digit code to ${identifier}`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
            {errorMsg}
          </div>
        )}

        {verifiedSuccess ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-black text-emerald-950">Logged In Successfully!</h3>
            <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to CatchBuddy...
            </p>
          </div>
        ) : step === "INPUT" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Name (Optional)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Jitendra Gawdiya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number / Email</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  placeholder="e.g. 9876543210 or your@email.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">6-Digit OTP</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  maxLength={6}
                  type="text"
                  autoFocus
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base tracking-widest font-black text-center text-slate-900 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify OTP &amp; Login
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep("INPUT")}
                className="text-slate-500 font-bold hover:underline cursor-pointer"
              >
                Change Number
              </button>

              {resendTimer > 0 ? (
                <span className="text-slate-400 font-medium">Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-emerald-700 font-black hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Secure &amp; Spam Free Verification
        </div>
      </div>
    </div>
  );
}
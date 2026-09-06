"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"LOGIN" | "SIGNUP" | "FORGOT">("LOGIN");
  const [signupStep, setSignupStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [forgotStep, setForgotStep] = useState<"REQUEST" | "OTP" | "RESET">("REQUEST");

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Forgot Password Form
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Visibility Toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && auth && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {},
            "expired-callback": () => {
              setErrorMsg("Security check expired. Please try again.");
            },
          }
        );
      } catch (err) {
        console.warn("reCAPTCHA init:", err);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // 1. STRICT LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg("Please enter both email/mobile and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOGIN",
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("cb_user", JSON.stringify(data.user));
          localStorage.setItem("cb_customer", JSON.stringify(data.user));
          window.dispatchEvent(new Event("customer-auth-changed"));
          window.dispatchEvent(new Event("storage"));
        }
        router.push("/");
      } else {
        setErrorMsg(data.error || "Invalid login credentials or wrong password.");
      }
    } catch {
      setErrorMsg("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. SIGNUP - SEND FIREBASE OTP
  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanMobile = mobile.replace(/\D/g, "").slice(-10);

    if (!fullName.trim() || !email.trim() || cleanMobile.length !== 10 || password.length < 6) {
      setErrorMsg("Please fill all fields properly (Password min 6 chars, Mobile 10 digits).");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (!auth) throw new Error("Firebase Auth not initialized");

      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + cleanMobile,
        recaptchaVerifierRef.current
      );
      confirmationResultRef.current = confirmation;

      setSignupStep("OTP");
      setSuccessMsg(`Firebase SMS OTP sent to +91 ${cleanMobile}`);
    } catch (fbErr: any) {
      console.error("Firebase SMS error:", fbErr);
      setErrorMsg(fbErr.message || "Failed to send Firebase SMS OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFY FIREBASE OTP & REGISTER
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (otp.trim().length < 6) {
      setErrorMsg("Please enter the 6-digit SMS OTP.");
      return;
    }

    setLoading(true);

    try {
      if (!confirmationResultRef.current) {
        setErrorMsg("Session expired. Please resend OTP.");
        setLoading(false);
        return;
      }

      // Verify via Firebase SDK
      await confirmationResultRef.current.confirm(otp.trim());

      // Save to database
      const res = await fetch("/api/auth/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REGISTER_VERIFIED",
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.replace(/\D/g, "").slice(-10),
          password: password,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("cb_user", JSON.stringify(data.user));
        localStorage.setItem("cb_customer", JSON.stringify(data.user));
        window.dispatchEvent(new Event("customer-auth-changed"));
        router.push("/");
      } else {
        setErrorMsg(data.error || "Failed to complete registration");
      }
    } catch {
      setErrorMsg("Invalid OTP code entered. Please check the SMS and retry.");
    } finally {
      setLoading(false);
    }
  };

  // 4. FORGOT PASSWORD - CHECK USER & SEND FIREBASE OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanPhone = forgotPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const checkRes = await fetch("/api/auth/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CHECK_FORGOT_USER", mobile: cleanPhone }),
      });
      const checkData = await checkRes.json();

      if (!checkData.success) {
        setErrorMsg(checkData.error || "Mobile number not registered.");
        setLoading(false);
        return;
      }

      if (!auth) throw new Error("Firebase Auth not initialized");
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + cleanPhone,
        recaptchaVerifierRef.current
      );
      confirmationResultRef.current = confirmation;

      setForgotStep("OTP");
      setSuccessMsg(`Firebase Reset OTP sent to +91 ${cleanPhone}`);
    } catch (fbErr: any) {
      setErrorMsg(fbErr.message || "Failed to send reset SMS.");
    } finally {
      setLoading(false);
    }
  };

  // 5. FORGOT PASSWORD - VERIFY OTP
  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (forgotOtp.trim().length < 6) {
      setErrorMsg("Enter valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      if (!confirmationResultRef.current) {
        setErrorMsg("Session expired. Request new OTP.");
        setLoading(false);
        return;
      }

      await confirmationResultRef.current.confirm(forgotOtp.trim());
      setForgotStep("RESET");
      setSuccessMsg("OTP verified successfully! Enter new password.");
    } catch {
      setErrorMsg("Invalid OTP entered. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 6. FORGOT PASSWORD - RESET NEW PASSWORD
  const handleResetPasswordConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_PASSWORD_VERIFIED",
          mobile: forgotPhone.replace(/\D/g, "").slice(-10),
          newPassword: newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Password reset successfully! Please login.");
        setTimeout(() => {
          setMode("LOGIN");
          setForgotStep("REQUEST");
          setSuccessMsg("");
        }, 2000);
      } else {
        setErrorMsg(data.error || "Failed to update password.");
      }
    } catch {
      setErrorMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (targetMode: "LOGIN" | "SIGNUP" | "FORGOT") => {
    setMode(targetMode);
    setSignupStep("DETAILS");
    setForgotStep("REQUEST");
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-10 font-sans">
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {mode === "LOGIN"
              ? "Welcome Back"
              : mode === "SIGNUP"
              ? signupStep === "OTP"
                ? "Verify Firebase SMS OTP"
                : "Create Account"
              : forgotStep === "OTP"
              ? "Verify Reset OTP"
              : forgotStep === "RESET"
              ? "Set New Password"
              : "Recover Account"}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {mode === "LOGIN"
              ? "Login with your Email / Mobile & Password"
              : mode === "SIGNUP"
              ? signupStep === "OTP"
                ? `Enter the 6-digit code sent to +91 ${mobile}`
                : "Register with real mobile number verification"
              : "Secure password recovery via Firebase Auth"}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* 1. LOGIN VIEW */}
        {mode === "LOGIN" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email or Mobile Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter email or mobile number"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>

            <div className="flex justify-between items-center pt-2 text-xs font-medium">
              <p className="text-slate-500">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("SIGNUP")}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer ml-0.5"
                >
                  Create Account
                </button>
              </p>
              <button
                type="button"
                onClick={() => switchMode("FORGOT")}
                className="text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGNUP VIEW */}
        {mode === "SIGNUP" && (
          <>
            {signupStep === "DETAILS" ? (
              <form onSubmit={handleSendSignupOtp} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Firebase SMS OTP"}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 font-medium">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("LOGIN")}
                      className="text-emerald-600 font-bold hover:underline cursor-pointer ml-0.5"
                    >
                      Login Here
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Enter Firebase SMS OTP</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit SMS code"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black tracking-widest text-center focus:outline-emerald-600"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP & Create Account"}
                </button>

                <div className="flex justify-between items-center text-xs font-bold pt-1">
                  <button
                    type="button"
                    onClick={() => setSignupStep("DETAILS")}
                    className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Change Details
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSignupOtp}
                    className="text-emerald-600 hover:underline cursor-pointer"
                  >
                    Resend SMS OTP
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* 3. FORGOT PASSWORD VIEW */}
        {mode === "FORGOT" && (
          <>
            {forgotStep === "REQUEST" && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Registered Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Firebase Reset OTP"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode("LOGIN")}
                    className="text-xs text-slate-500 font-medium hover:text-slate-800 cursor-pointer"
                  >
                    Remember your password? <span className="text-emerald-600 font-bold">Login</span>
                  </button>
                </div>
              </form>
            )}

            {forgotStep === "OTP" && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Enter Firebase SMS OTP</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit SMS code"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black tracking-widest text-center focus:outline-emerald-600"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || forgotOtp.length < 6}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP"}
                </button>
              </form>
            )}

            {forgotStep === "RESET" && (
              <form onSubmit={handleResetPasswordConfirm} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-600"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password & Login"}
                </button>
              </form>
            )}
          </>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Powered by Firebase Phone Authentication</span>
        </div>
      </div>
    </div>
  );
}
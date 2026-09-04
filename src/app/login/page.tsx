"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, User, Phone, CheckCircle2, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Automatic redirect to Home Screen on login
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [submitted, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // User profile object create karein (sirf real user input, koi dummy number nahi)
    const customerUser = {
      name: formData.name.trim() || formData.email.split("@")[0],
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    // Client storage aur custom event trigger karein
    localStorage.setItem("cb_customer", JSON.stringify(customerUser));
    window.dispatchEvent(new Event("customer-auth-changed"));

    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-gray-500 hover:text-black inline-flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <h1 className="text-2xl font-black text-gray-950">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {isSignUp
              ? "Sign up to track orders and checkout faster"
              : "Login with your email to view order status"}
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-black text-emerald-950">
              {isSignUp ? "Account Created Successfully!" : "Logged In Successfully!"}
            </h3>
            <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Redirecting to home screen...
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Go to Home Screen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-bold text-gray-700">Full Name</label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    required
                    type="text"
                    placeholder="Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-700">Email Address</label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  required
                  type="email"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
            >
              {isSignUp ? "Sign Up & Continue" : "Log In & Continue"}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setSubmitted(false);
            }}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            {isSignUp
              ? "Already have an account? Log in"
              : "New to CatchBuddy? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
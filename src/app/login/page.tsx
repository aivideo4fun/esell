"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, User, Phone, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login / Registration handling
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        
        <div>
          <Link href="/" className="text-xs font-semibold text-gray-500 hover:text-black inline-flex items-center gap-1 mb-4">
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
          <div className="p-6 bg-green-50 rounded-2xl border border-green-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
            <h3 className="text-sm font-bold text-green-950">
              {isSignUp ? "Account Created Successfully!" : "Logged In Successfully!"}
            </h3>
            <p className="text-xs text-green-800">Redirecting to your orders...</p>
            <Link
              href="/track-order"
              className="inline-block mt-3 px-4 py-2 bg-gray-950 text-white rounded-xl text-xs font-bold"
            >
              Go to Orders
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
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-blue-600"
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
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-blue-600"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    required
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-blue-600"
                  />
                </div>
              </div>
            )}

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
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gray-950 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </form>
        )}

        {/* Toggle Switch */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setSubmitted(false);
            }}
            className="text-xs text-blue-600 font-bold hover:underline"
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
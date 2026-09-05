"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  HelpCircle, 
  Mail, 
  Phone,
  Lock
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-24 md:pb-12 mt-12 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Express Dispatch</p>
              <p className="text-[11px] text-slate-400">All India shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Easy Returns</p>
              <p className="text-[11px] text-slate-400">Hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">100% Secure</p>
              <p className="text-[11px] text-slate-400">UPI &amp; Cards Encrypted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">Quick Support</p>
              <p className="text-[11px] text-slate-400">Dedicated help desk</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-slate-700 flex items-center justify-center p-1 group-hover:border-emerald-400 transition">
                <Image
                  src="/logo.png"
                  alt="CatchBuddy Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Catch<span className="text-emerald-400">Buddy</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your go-to store for trending utilities, smart gadgets, and everyday essentials at unbeatable direct-to-consumer prices.
            </p>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/account" className="hover:text-emerald-400 transition">
                  Help Desk &amp; Tickets
                </Link>
              </li>
              <li>
                <Link href="/orders/track" className="hover:text-emerald-400 transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition">
                  Frequently Asked Questions (FAQs)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Policies
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/return-policy" className="hover:text-emerald-400 transition">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-emerald-400 transition">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@catchbuddy.store</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 7976152206 (10 AM - 7 PM)</span>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Rajasthan, India • Mon - Sat
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CatchBuddy. All rights reserved.</p>
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Merchant Store</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
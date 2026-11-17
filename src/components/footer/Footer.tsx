"use client";

import { useEffect, useState } from "react";
import { footerDefaults } from "@/lib/footer-defaults";
import BusinessIdentity from "@/components/BusinessIdentity";
import { storeInfo } from "@/lib/store-info";
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
  const [config, setConfig] = useState(footerDefaults);
  useEffect(() => { fetch("/api/footer").then((r) => r.json()).then((d) => { if (d.success) setConfig(d.footer); }).catch(() => {}); }, []);
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
              <p className="text-[11px] text-slate-400">See return eligibility</p>
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
              {config.aboutText}
            </p>
            <div className="flex flex-wrap gap-3 text-xs">{config.shopLinks.map((link) => <Link key={link.url} href={link.url} className="underline">{link.title}</Link>)}</div>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs font-medium">{config.customerLinks.map((link) => <li key={link.url}><Link href={link.url} className="hover:text-emerald-400">{link.title}</Link></li>)}</ul>
          </div>

          {/* Policies & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Policies
            </h4>
            <ul className="space-y-2 text-xs font-medium">{config.bottomLinks.map((link) => <li key={link.url}><Link href={link.url} className="hover:text-emerald-400">{link.title}</Link></li>)}</ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${storeInfo.supportEmail}`}>{storeInfo.supportEmail}</a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={storeInfo.supportPhoneHref}>{storeInfo.supportPhone}</a>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Rajasthan, India • {storeInfo.supportHours}
              </p>
            </div>
          </div>
        </div>

        <BusinessIdentity />

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>{config.copyrightText}</p>
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>CatchBuddy Store</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
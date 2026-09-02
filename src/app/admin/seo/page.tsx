"use client";

import { useState } from "react";
import { Search, Save, CheckCircle2, Globe } from "lucide-react";

export default function AdminSeoPage() {
  const [seoConfig, setSeoConfig] = useState({
    metaTitle: "CatchBuddy - Premium Lifestyle Gadgets & Smart Accessories",
    metaDescription: "Shop authentic gadgets, fast magnetic chargers, ANC wireless earbuds with flat ₹50 off on prepaid orders and express shipping.",
    keywords: "online shopping, catchbuddy, gadgets, electronic accessories, best offers",
    ogImage: "https://catchbuddy.com/og-banner.jpg",
    googleSiteVerification: "google-site-verification-cb-98218",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-emerald-600" /> Search Engine Optimization (SEO)
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Configure Google Search meta tags, OpenGraph sharing cards, and search crawler keys.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SEO Meta configurations saved successfully!
          </div>
        )}

        <div>
          <label className="font-bold text-slate-700 block mb-1">Global Meta Title (Max 60 chars)</label>
          <input
            type="text"
            required
            value={seoConfig.metaTitle}
            onChange={(e) => setSeoConfig({ ...seoConfig, metaTitle: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-semibold outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Meta Description (Max 160 chars)</label>
          <textarea
            required
            rows={3}
            value={seoConfig.metaDescription}
            onChange={(e) => setSeoConfig({ ...seoConfig, metaDescription: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-semibold outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Target Search Keywords (Comma separated)</label>
          <input
            type="text"
            value={seoConfig.keywords}
            onChange={(e) => setSeoConfig({ ...seoConfig, keywords: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-semibold outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Google Site Verification Token</label>
          <input
            type="text"
            value={seoConfig.googleSiteVerification}
            onChange={(e) => setSeoConfig({ ...seoConfig, googleSiteVerification: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-semibold font-mono outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save SEO Settings
        </button>
      </form>
    </div>
  );
}
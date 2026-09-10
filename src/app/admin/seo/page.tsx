"use client";

import { useState, useEffect } from "react";
import { Search, Save, CheckCircle2, Globe, Loader2 } from "lucide-react";

export default function AdminSeoPage() {
  const [seoConfig, setSeoConfig] = useState({
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    googleSiteVerification: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchSeo() {
      try {
        const res = await fetch("/api/admin/seo", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.seo) {
          setSeoConfig(data.seo);
        }
      } catch (err) {
        console.error("Failed to load SEO config", err);
      } finally {
        setLoading(false);
      }
    }
    void fetchSeo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seoConfig),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setErrorMsg(data.error || "Failed to save");
      }
    } catch (err) {
      setErrorMsg("Network error while saving SEO settings");
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

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
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SEO Meta configurations saved to database successfully!
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl font-bold text-rose-800">
            {errorMsg}
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
            onChange={(e) => setseoConfig({ ...seoConfig, metaDescription: e.target.value })}
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
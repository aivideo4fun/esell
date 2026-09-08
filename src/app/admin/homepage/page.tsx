/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Save, Flame, LayoutTemplate, Check } from "lucide-react";

export default function AdminHomepageManager() {
  const [badge, setBadge] = useState("LIMITED TIME OFFER");
  const [headingMain, setHeadingMain] = useState("Premium Gadgets,");
  const [headingHighlight, setHeadingHighlight] = useState("Direct to Your Doorstep.");
  const [subtitle, setSubtitle] = useState("100% Verified Products • Instant Prepaid Discounts • Free Shipping");
  
  const [products, setProducts] = useState<any[]>([]);
  const [selectedDealId, setSelectedDealId] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedBanner = localStorage.getItem("cb_admin_hero_banner");
    if (savedBanner) {
      try {
        const b = JSON.parse(savedBanner);
        setBadge(b.badge || "");
        setHeadingMain(b.headingMain || "");
        setHeadingHighlight(b.headingHighlight || "");
        setSubtitle(b.subtitle || "");
      } catch {}
    }

    const savedDeal = localStorage.getItem("cb_admin_deal_id");
    if (savedDeal) {
      setSelectedDealId(savedDeal);
    }

    // Fetch store products for Deal of the Day dropdown
    fetch("/api/admin/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
          if (!savedDeal && data.products.length > 0) {
            setSelectedDealId(data.products[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("cb_admin_hero_banner", JSON.stringify({
      badge,
      headingMain,
      headingHighlight,
      subtitle
    }));
    localStorage.setItem("cb_admin_deal_id", selectedDealId);
    
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-emerald-600" /> Homepage Manager &amp; Live Preview
          </h1>
          <p className="text-xs text-slate-500">Manage Hero Banner and Deal of the Day live on storefront.</p>
        </div>
        {savedMsg && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Hero Banner Manager */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">1. Hero Banner Customization</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Badge Text</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Features Text</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Main Heading</label>
              <input
                type="text"
                value={headingMain}
                onChange={(e) => setHeadingMain(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Highlighted Heading (Green)</label>
              <input
                type="text"
                value={headingHighlight}
                onChange={(e) => setHeadingHighlight(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wide">Live Home Screen Preview:</span>
            <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-md">
              <span className="inline-block px-2.5 py-1 bg-amber-400/20 text-amber-300 rounded-md text-[10px] font-black uppercase tracking-wider mb-2">
                {badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-snug">
                {headingMain} <span className="text-emerald-400">{headingHighlight}</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 font-medium">{subtitle}</p>
              <button type="button" className="mt-4 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black">
                Shop Now →
              </button>
            </div>
          </div>
        </div>

        {/* Deal of the Day Product Manager */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600" /> 2. Deal of the Day Product Selection
          </h2>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Featured Deal Product</label>
            <select
              value={selectedDealId}
              onChange={(e) => setSelectedDealId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (₹{p.price})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">This product will be featured prominently in the Deal of the Day section on the homepage.</p>
          </div>
        </div>

        <button
          type="submit"
          className="py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Homepage Settings
        </button>

      </form>
    </div>
  );
}
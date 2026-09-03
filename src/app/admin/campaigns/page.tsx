"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Megaphone, 
  RefreshCw, 
  Loader2, 
  Tag, 
  Plus, 
  Send
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FLAT" | "FREE_SHIPPING";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  validTo?: string | null;
  isActive: boolean;
}

export default function MarketingCampaignsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch {
      console.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCoupons();
  }, [fetchCoupons]);

  const handleBroadcast = (coupon: Coupon) => {
    const discountText =
      coupon.discountType === "PERCENTAGE"
        ? `${coupon.discountValue}% OFF${coupon.maxDiscount ? ` (Up to ₹${coupon.maxDiscount})` : ""}`
        : `Flat ₹${coupon.discountValue} OFF`;

    const text = encodeURIComponent(
      `Special Announcement from CatchBuddy! Use code ${coupon.code} to get ${discountText} on your next order.\nShop now: ${window.location.origin}/shop`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2.5">
            <Megaphone className="w-7 h-7 text-emerald-600" /> Marketing &amp; Promotional Campaigns
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Create broadcast promotions, flash sale deals, and coupon boosts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          
          <Link
            href="/admin/coupons"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add Campaign / Coupon
          </Link>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          <span className="text-xs font-bold">Syncing live coupon campaigns...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3 shadow-xs">
          <Tag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No Active Promotional Campaigns</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Coupons & Offers section mein banaye gaye saare coupons yahan live cards ke roop mein auto-display honge.
          </p>
          <Link
            href="/admin/coupons"
            className="inline-block px-5 py-2.5 bg-slate-950 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition"
          >
            Create First Coupon
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coupons.map((coupon, index) => {
            const isExpired = coupon.validTo ? new Date() > new Date(coupon.validTo) : false;
            const status = !coupon.isActive ? "PAUSED" : isExpired ? "EXPIRED" : "RUNNING";
            const cmpId = `CMP-${String(index + 1).padStart(2, "0")}`;

            return (
              <div
                key={coupon.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 transition duration-200 flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      {cmpId}
                    </span>
                    
                    {status === "RUNNING" ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-200">
                        RUNNING
                      </span>
                    ) : status === "PAUSED" ? (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-200">
                        PAUSED
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-black uppercase rounded-full border border-rose-200">
                        EXPIRED
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-950 capitalize">
                    {coupon.description || `${coupon.code} Special Campaign`}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {coupon.discountType === "PERCENTAGE" ? "WhatsApp & SMS" : "Storefront Banner & Push"} &bull;{" "}
                    <span className="text-emerald-700 font-bold">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} FLAT OFF`}
                      {coupon.maxDiscount ? ` (Cap: ₹${coupon.maxDiscount})` : ""}
                    </span>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-600">
                    <span>Target: All Registered Customers ({coupon.usageCount || 0} used)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBroadcast(coupon)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
                      title="Share WhatsApp broadcast"
                    >
                      <Send className="w-3 h-3 text-emerald-600" /> Broadcast
                    </button>

                    <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl uppercase tracking-wider">
                      {coupon.code}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
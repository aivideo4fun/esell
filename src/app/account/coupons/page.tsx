"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TicketPercent, 
  Copy, 
  Check, 
  ArrowLeft, 
  Clock, 
  Percent, 
  Loader2,
  Sparkles
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  expiresAt?: string;
  description?: string;
}

export default function CustomerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/coupons");
        const data = await res.json();
        if (data.success) {
          setCoupons(data.coupons || []);
        }
      } catch (err) {
        console.error("Failed to load coupons", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <TicketPercent className="w-5 h-5 text-emerald-600" /> Available Coupons &amp; Offers
            </h1>
            <p className="text-xs text-slate-500">Apply these exclusive promo codes at checkout for instant savings.</p>
          </div>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold text-slate-500">Finding the best deals for you...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <TicketPercent className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-800">No Active Coupons Right Now</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Stay tuned! Festive discount codes and flash voucher codes will appear here soon.
            </p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-2xl border border-dashed border-emerald-300 p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/40"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-600 text-white font-mono font-black text-xs rounded-lg tracking-wider">
                      {coupon.code}
                    </span>
                    <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 pt-1">
                    {coupon.description || `Get ${coupon.discountValue}${coupon.discountType === "PERCENTAGE" ? "%" : "₹"} flat discount on your cart.`}
                  </p>

                  {coupon.minOrderValue && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      Min. order value: <strong className="text-slate-700">₹{coupon.minOrderValue}</strong>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> Verified &amp; Active
                  </span>

                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
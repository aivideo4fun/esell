"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Send,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

interface AbandonedCart {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productsSummary: string;
  cartValue: number;
  timeAgo: string;
  isReminded: boolean;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchCarts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/abandoned-carts");
      const data = await res.json();
      if (data.success && Array.isArray(data.carts)) {
        setCarts(data.carts);
      }
    } catch {
      console.error("Failed to fetch abandoned carts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCarts();
  }, [fetchCarts]);

  const handleSendOffer = async (cart: AbandonedCart) => {
    try {
      setSendingId(cart.id);

      // WhatsApp direct checkout discount link trigger (agar phone number hai)
      if (cart.customerPhone && cart.customerPhone.trim().length >= 10) {
        const cleanPhone = cart.customerPhone.replace(/[^0-9]/g, "");
        const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const msg = encodeURIComponent(
          `Hi ${cart.customerName}! Aapke CatchBuddy cart me "${cart.productsSummary}" reh gaya hai. Aaj complete karne par paiye extra 10% OFF with coupon: SAVE10 🎁\nCheckout now: ${window.location.origin}/checkout`
        );
        window.open(`https://wa.me/${finalPhone}?text=${msg}`, "_blank");
      }

      // Mark reminder status in database
      const res = await fetch("/api/admin/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: cart.id }),
      });

      const data = await res.json();
      if (data.success) {
        setCarts((prev) =>
          prev.map((c) => (c.id === cart.id ? { ...c, isReminded: true } : c))
        );
      }
    } catch {
      alert("Reminder process karte waqt issue aaya");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-emerald-600" /> Abandoned Carts Recovery
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Recover lost checkouts by sending automated reminder coupons and WhatsApp alerts.
          </p>
        </div>
        <button
          onClick={() => fetchCarts()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Unfinished carts check ho rahe hain...</span>
          </div>
        ) : carts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-900">No abandoned carts right now.</p>
            <p className="text-xs text-slate-500">Jab koi customer checkout page par payment chhodega, entry yahan aayegi.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Cart Products</th>
                <th className="p-4">Total Cart Value</th>
                <th className="p-4">Left Unfinished</th>
                <th className="p-4 text-right">Recovery Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {carts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <span className="font-black text-slate-950 block">{c.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-normal block">{c.customerEmail}</span>
                    {c.customerPhone && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <MessageCircle className="w-2.5 h-2.5" /> {c.customerPhone}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-700 max-w-xs truncate">
                    {c.productsSummary}
                  </td>
                  <td className="p-4 font-black text-slate-950">
                    ₹{c.cartValue.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {c.timeAgo}
                  </td>
                  <td className="p-4 text-right">
                    {c.isReminded ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Reminder Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendOffer(cartHelper(c))}
                        disabled={sendingId === c.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {sendingId === c.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Send 10% Off Offer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function cartHelper(c: AbandonedCart) {
  return c;
}
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, Package, Loader2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setLoading(false);
      }
    }
    void fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Fetching order confirmation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
              Order Placed Successfully
            </span>
            <h1 className="text-2xl font-black text-slate-900">Thank You For Your Order!</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              We have received your order and are getting it ready for shipment.
            </p>
          </div>

          {orderId && (
            <div className="inline-block bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-700">
              Order ID: {orderId}
            </div>
          )}

          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/shop"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
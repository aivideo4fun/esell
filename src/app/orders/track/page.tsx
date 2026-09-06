"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  X,
  AlertTriangle,
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || searchParams.get("orderId") || "";

  const [orderQuery, setOrderQuery] = useState(queryParam);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Return Appeal Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("Damaged product received in transit");
  const [returnComments, setReturnComments] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrderDetails = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(idToSearch.trim())}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setErrorMsg(data.error || "Order nahi mila. Kripya valid Order ID check karein.");
        setOrder(null);
      }
    } catch {
      setErrorMsg("Order load karne me dikkat hui. Kripya dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      void fetchOrderDetails(queryParam);
    }
  }, [queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchOrderDetails(orderQuery);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReturnAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      setSubmittingReturn(true);
      const res = await fetch("/api/orders/return", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          orderId: order.orderNumber || order.id,
          reason: returnReason,
          comments: returnComments,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Server returned non-JSON response");
      }

      if (res.ok && data.success) {
        alert("Aapki Return & Refund appeal submit ho gayi hai! Admin verification ke baad reverse pickup arrange hoga.");
        setShowReturnModal(false);
        void fetchOrderDetails(order.orderNumber || order.id);
      } else {
        alert(data.error || data.message || "Failed to submit return request");
      }
    } catch (err: any) {
      console.error("Return submit err:", err);
      alert(err?.message || "Appeal submit karne me problem aayi.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  // 5-Day Delivery Window Logic
  const isDelivered = order?.orderStatus === "DELIVERED";
  const isReturnRequested = order?.orderStatus === "RETURN_REQUESTED";

  // Delivery date calculate karein (updatedAt or fallback createdAt)
  const deliveryDate = order ? new Date(order.updatedAt || order.createdAt).getTime() : 0;
  const daysSinceDelivery = order ? (Date.now() - deliveryDate) / (1000 * 60 * 60 * 24) : 999;
  const isWithin5Days = daysSinceDelivery <= 5;
  const daysRemaining = Math.max(0, Math.ceil(5 - daysSinceDelivery));

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-900 font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 inline-flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <span className="text-sm font-black text-slate-950">
            Order Tracking &amp; Delivery Desk
          </span>
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live Status
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Search Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h1 className="text-lg font-black text-slate-950">Track Your Consignment</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Enter your 6-digit Order ID (e.g. CB-608621) to check live courier dispatch.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. CB-608621)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-emerald-600 uppercase"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track"}
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-600 mt-2">{errorMsg}</p>
          )}
        </div>

        {/* Order Details Output */}
        {order && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  ORDER ID
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-base font-black text-slate-950">
                    #{order.orderNumber || order.id}
                  </span>
                  <button
                    onClick={() => handleCopy(order.orderNumber || order.id)}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-900 transition cursor-pointer"
                    title="Copy ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">
                  Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <span
                  className={`inline-block px-3 py-1 text-xs font-black rounded-xl border ${
                    order.orderStatus === "SHIPPED"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : order.orderStatus === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : order.orderStatus === "RETURN_REQUESTED"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {order.orderStatus || "PROCESSING"}
                </span>
              </div>
            </div>

            {/* LIVE COURIER TRACKING BOX */}
            {order.trackingNumber ? (
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl mt-0.5">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">
                      Live Courier Consignment
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      Courier: {order.trackingUrl && !order.trackingUrl.startsWith("[") ? order.trackingUrl : "Delhivery Express"}
                    </p>
                    <p className="font-mono text-xs font-black text-blue-700 mt-0.5">
                      AWB / Tracking No: {order.trackingNumber}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(order.trackingNumber)}
                  className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-center flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy Tracking ID
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold text-slate-600">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Order is being packed. Courier tracking ID will be generated once dispatched.</span>
              </div>
            )}

            {/* Return status notice */}
            {isReturnRequested && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs text-purple-900 font-semibold space-y-1">
                <p className="font-black flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-purple-600" /> Return &amp; Refund Appeal Under Review
                </p>
                <p className="text-[11px] text-purple-700">
                  Aapka return appeal admin review kar raha hai. Reverse pickup coordinate hote hi confirmation notification aayega.
                </p>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Ordered Items ({order.items?.length || 1})
              </h2>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                {order.items?.map((item: any) => {
                  const itemImg =
                    item.product?.images?.[0]?.url ||
                    item.product?.images?.[0] ||
                    item.image ||
                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80";

                  return (
                    <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={itemImg}
                          alt=""
                          width={44}
                          height={44}
                          className="w-11 h-11 rounded-xl object-contain bg-white border border-slate-200"
                          unoptimized
                        />
                        <div>
                          <p className="text-xs font-black text-slate-900 line-clamp-1">
                            {item.product?.title || item.title || "Ordered Item"}
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-950">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5-DAY RETURN WINDOW & APPEAL SECTION */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Total Amount</span>
                <span className="text-lg font-black text-slate-950">
                  ₹{order.totalAmount?.toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                {isReturnRequested ? (
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3.5 py-2 rounded-xl border border-purple-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" /> Return Appeal Submitted
                  </span>
                ) : isDelivered ? (
                  isWithin5Days ? (
                    <div className="flex flex-col sm:items-end gap-1">
                      <button
                        type="button"
                        onClick={() => setShowReturnModal(true)}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Request Return / Refund
                      </button>
                      <span className="text-[10px] font-bold text-slate-500">
                        Return window open for {daysRemaining} more day(s)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> Return window expired (5 days passed)
                    </div>
                  )
                ) : (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                    Return available after delivery
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Return & Refund Appeal Modal */}
        {showReturnModal && order && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" /> Return &amp; Refund Appeal
                </h3>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReturnAppealSubmit} className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Order</span>
                  <span className="font-bold text-slate-900">#{order.orderNumber || order.id} (₹{order.totalAmount})</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Reason for Return *</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-emerald-600"
                  >
                    <option value="Damaged product received in transit">Damaged product received in transit</option>
                    <option value="Incorrect item or size delivered">Incorrect item or size delivered</option>
                    <option value="Product not functioning / defective">Product not functioning / defective</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Additional Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                    placeholder="Describe issue clearly for faster approval..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingReturn ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  <span>Submit Appeal for Return / Refund</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Loading Order Tracking...</p>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
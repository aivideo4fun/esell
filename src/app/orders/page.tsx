"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Truck,
  Calendar,
  Loader2,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface ProductItem {
  id: string;
  price: number;
  quantity: number;
  title?: string;
  image?: string;
  selectedSize?: string | null;
  selectedColor?: string | null;
  product?: {
    title: string;
    images?: Array<{ url: string }>;
  };
}

interface CustomerOrder {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  totalAmount: number;
  orderStatus?: string;
  paymentStatus?: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items?: ProductItem[];
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const justPlacedId = searchParams.get("placed");

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        setLoading(true);
        const query = justPlacedId ? `?orderId=${encodeURIComponent(justPlacedId)}` : "";
        const res = await fetch(`/api/orders${query}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed to load customer orders:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchCustomerOrders();
  }, [justPlacedId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PROCESSING":
      case "PAID":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900 font-sans">
      {/* 1. TOP HEADER WITH BACK BUTTON */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 inline-flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <span className="text-sm font-black text-slate-950">
            Catch<span className="text-emerald-600">Buddy</span> Orders
          </span>
          <Link
            href="/shop"
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Shop More
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 mt-6 space-y-5">
        {/* Success Alert if navigated from Cart checkout */}
        {justPlacedId && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-xs font-black text-emerald-950">Order Placed Successfully!</h3>
              <p className="text-[11px] text-emerald-800 font-medium">
                Thank you for your purchase. We are preparing your order for express dispatch.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">My Orders</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review and track all your CatchBuddy purchases
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-800">No Orders Placed Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Looks like you haven&apos;t made your first purchase. Explore trending deals and gadgets now!
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4 hover:border-slate-300 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                      <p className="font-mono font-black text-slate-900">
                        #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                      <p className="font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formattedDate}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</span>
                      <p className="font-black text-emerald-600">₹{order.totalAmount?.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(
                          order.orderStatus || "PAID"
                        )}`}
                      >
                        {order.orderStatus || "PAID"}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100">
                    {order.items?.map((item) => {
                      const itemTitle = item.product?.title || item.title || "CatchBuddy Product";
                      const itemImg =
                        item.product?.images?.[0]?.url ||
                        item.image ||
                        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80";

                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Image
                              src={itemImg}
                              alt={itemTitle}
                              width={52}
                              height={52}
                              className="w-13 h-13 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                              unoptimized
                            />
                            <div>
                              <p className="font-bold text-xs text-slate-900 line-clamp-1">{itemTitle}</p>
                              <div className="text-[11px] text-slate-400 font-medium space-x-2 mt-0.5">
                                <span>Qty: {item.quantity}</span>
                                {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                                {item.selectedColor && <span>• Color: {item.selectedColor}</span>}
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-slate-900 whitespace-nowrap">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Action Links */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Payment: <strong className="text-slate-800">{order.paymentStatus || "SUCCESS"}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/invoice/${order.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition border border-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> Invoice
                      </Link>

                      {order.trackingUrl ? (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Live <ArrowRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <Link
                          href={`/orders/track?orderId=${order.orderNumber || order.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track Status <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Loading your orders...</p>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
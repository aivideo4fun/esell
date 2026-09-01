/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Truck, Calendar, Loader2, ArrowRight, FileText } from "lucide-react";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders");
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
    fetchCustomerOrders();
  }, []);

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Orders</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review and track all your CatchBuddy purchases
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-xl transition"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-800">No Orders Placed Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Looks like you haven't made your first purchase. Explore trending deals and gadgets now!
            </p>
            <Link
              href="/shop"
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
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Order ID</span>
                      <p className="font-mono font-black text-slate-900">
                        #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Date</span>
                      <p className="font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formattedDate}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Total Paid</span>
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

                  {/* Ordered Items */}
                  <div className="divide-y divide-slate-100">
                    {order.items?.map((item: any) => {
                      const itemTitle = item.product?.title || item.title || "CatchBuddy Product";
                      const itemImg =
                        item.product?.images?.[0]?.url ||
                        item.image ||
                        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80";

                      return (
                        <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={itemImg}
                              alt={itemTitle}
                              className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-slate-50"
                            />
                            <div>
                              <p className="font-bold text-xs text-slate-900 line-clamp-1">{itemTitle}</p>
                              <p className="text-[11px] text-slate-400 font-medium">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-slate-800">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Actions: Invoice & Live Tracking */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Status: <strong className="text-slate-700">{order.paymentStatus || "PREPAID"}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/invoice/${order.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl transition border border-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> GST Invoice
                      </Link>

                      <Link
                        href={`/orders/track?orderId=${order.orderNumber || order.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition"
                      >
                        <Truck className="w-3.5 h-3.5" /> Track Live Status <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
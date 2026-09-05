"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  AlertTriangle,
  Package,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface MetricsData {
  totalRevenue: number;
  prepaidOrdersCount: number;
  pendingDispatchCount: number;
  activeProductsCount: number;
  categoriesCount: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalRevenue: 0,
    prepaidOrdersCount: 0,
    pendingDispatchCount: 0,
    activeProductsCount: 0,
    categoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Store Performance
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            Real-time metrics for CatchBuddy
          </p>
        </div>

        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Total Revenue
            </span>
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            ) : (
              <p className="text-2xl font-black text-slate-900">
                ₹{metrics.totalRevenue.toLocaleString("en-IN")}
              </p>
            )}
            <p className="text-[11px] font-bold text-emerald-600 mt-1">Live verified sales</p>
          </div>
        </div>

        {/* Prepaid Orders */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Prepaid Orders
            </span>
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <p className="text-2xl font-black text-slate-900">
                {metrics.prepaidOrdersCount}
              </p>
            )}
            <p className="text-[11px] font-bold text-slate-500 mt-1">100% verified payment</p>
          </div>
        </div>

        {/* Pending Dispatch */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Pending Dispatch
            </span>
            <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            ) : (
              <p className="text-2xl font-black text-slate-900">
                {metrics.pendingDispatchCount}
              </p>
            )}
            <p className="text-[11px] font-bold text-slate-500 mt-1">Needs fulfillment</p>
          </div>
        </div>

        {/* Active Catalog */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Active Catalog
            </span>
            <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            ) : (
              <p className="text-2xl font-black text-slate-900">
                {metrics.activeProductsCount} Items
              </p>
            )}
            <p className="text-[11px] font-bold text-slate-500 mt-1">
              In {metrics.categoriesCount} categories
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Operational Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-black text-slate-900">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products"
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-2xl transition group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                Add / Manage Store Products
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </Link>

            <Link
              href="/admin/orders"
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-2xl transition group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                Process Pending Customer Orders
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </Link>
          </div>
        </div>

        {/* Operational Health */}
        <div className="bg-[#0b1329] text-white rounded-3xl p-6 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Operational Health
            </span>
            <h2 className="text-lg font-black text-white">
              100% Prepaid Verification Active
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Razorpay API automatically verifies transactions before order status switches to confirmed.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>All systems normal • Database connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
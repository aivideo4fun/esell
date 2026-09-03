"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  IndianRupee,
  Search,
  RefreshCw,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  isBlocked: boolean;
  createdAt: string;
}

interface Metrics {
  totalCustomers: number;
  activeBuyers: number;
  blockedAccounts: number;
  totalCustomerSpend: number;
}

export default function CustomersCRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalCustomers: 0,
    activeBuyers: 0,
    blockedAccounts: 0,
    totalCustomerSpend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "blocked">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers?filter=${activeTab}&search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setMetrics(data.metrics);
      }
    } catch {
      console.error("Error fetching customers");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      void fetchCustomers();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [fetchCustomers]);

  const toggleBlockStatus = async (customer: Customer) => {
    const confirmMsg = customer.isBlocked
      ? `Kya aap ${customer.name} ko unblock karna chahte hain?`
      : `Kya aap ${customer.name} ko fraud protection ke antargat block karna chahte hain?`;

    if (!confirm(confirmMsg)) return;

    try {
      setActionLoading(customer.id);
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          isBlocked: !customer.isBlocked,
        }),
      });
      const data = await res.json();
      if (data.success) {
        void fetchCustomers();
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Error updating customer status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Customer Management &amp; CRM</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Directory of verified shoppers, lifetime order metrics, and fraud protection.
          </p>
        </div>
        <button
          onClick={() => fetchCustomers()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            TOTAL CUSTOMERS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-950">{metrics.totalCustomers}</span>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Registered buyers</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block mb-1">
            ACTIVE BUYERS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-950">{metrics.activeBuyers}</span>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Allowed to checkout</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 block mb-1">
            BLOCKED ACCOUNTS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-950">{metrics.blockedAccounts}</span>
            <UserX className="w-5 h-5 text-rose-500" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Restricted from ordering</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 block mb-1">
            TOTAL CUSTOMER SPEND
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-950">₹{metrics.totalCustomerSpend.toLocaleString("en-IN")}</span>
            <IndianRupee className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Lifetime GMV</span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          {(["all", "active", "blocked"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                activeTab === tab
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {tab === "all" ? "All Customers" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-bold">Customers load ho rahe hain...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-950">No customers found matching criteria.</p>
            <p className="text-xs text-slate-500">Jab customers signup ya order karenge, data yahan live hoga.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <span className="font-black text-slate-950 block">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Joined {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="block text-slate-900">{c.email}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{c.phone}</span>
                  </td>
                  <td className="p-4 text-slate-700">
                    {c.ordersCount} order{c.ordersCount !== 1 ? "s" : ""}
                  </td>
                  <td className="p-4 font-black text-slate-950">
                    ₹{c.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4">
                    {c.isBlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black">
                        <ShieldAlert className="w-3 h-3" /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleBlockStatus(c)}
                      disabled={actionLoading === c.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        c.isBlocked
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      {actionLoading === c.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : c.isBlocked ? (
                        "Unblock"
                      ) : (
                        "Block User"
                      )}
                    </button>
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
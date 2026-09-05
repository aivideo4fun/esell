"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, RefreshCw, Loader2, Calendar, Phone, Mail, ShieldCheck } from "lucide-react";

interface CustomerUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    wishlists: number;
    reviews: number;
  };
}

export default function CustomerLoginsPage() {
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const res = await fetch(
        `/api/admin/customer-logins?search=${encodeURIComponent(search)}&_t=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setTotalCount(data.totalLoggedInUsers || 0);
      }
    } catch {
      console.error("Failed to load customer logins");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => void loadUsers(true), 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // Har 10 second me realtime background poll
  useEffect(() => {
    const interval = setInterval(() => void loadUsers(false), 10000);
    return () => clearInterval(interval);
  }, [loadUsers]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Customer Logins &amp; Registered Accounts</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Realtime directory of shoppers who have logged in or created accounts on CatchBuddy.
          </p>
        </div>
        <button
          onClick={() => loadUsers(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            TOTAL LOGGED-IN CUSTOMERS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-950">{totalCount}</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Active shopper profiles</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-bold">Logins directory load ho rahi hai...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-950">Abhi tak koi logged-in customer nahi mila.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <span className="font-black text-slate-950 block">{u.name || "Customer User"}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                  </td>
                  <td className="p-4 space-y-1">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                    </span>
                    {u.phone && (
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black">
                      <ShieldCheck className="w-3 h-3" /> {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-800 font-extrabold">{u._count.orders} order(s)</td>
                  <td className="p-4 text-slate-500 font-normal">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
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
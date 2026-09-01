"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ShoppingBag,
  IndianRupee,
  Phone,
  Mail,
  Calendar,
  UserX,
  UserCheck
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, ACTIVE, BLOCKED

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (id: string, currentBlockedStatus: boolean) => {
    const action = currentBlockedStatus ? "Unblock" : "Block";
    if (!confirm(`Are you sure you want to ${action} this customer?`)) return;

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isBlocked: !currentBlockedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isBlocked: !currentBlockedStatus } : c))
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating customer");
    }
  };

  // Metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => !c.isBlocked).length;
  const blockedCustomers = customers.filter((c) => c.isBlocked).length;
  const totalLifetimeSales = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "ACTIVE") return !c.isBlocked;
    if (filter === "BLOCKED") return c.isBlocked;
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Customer Management &amp; CRM</h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Directory of verified shoppers, lifetime order metrics, and fraud protection.
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Customers</p>
          <p className="text-2xl font-black text-slate-900">{totalCustomers}</p>
          <p className="text-[10px] text-slate-500 font-medium">Registered buyers</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Active Buyers</p>
          <p className="text-2xl font-black text-emerald-700">{activeCustomers}</p>
          <p className="text-[10px] text-emerald-600 font-medium">Allowed to checkout</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-rose-600 uppercase tracking-wider">Blocked Accounts</p>
          <p className="text-2xl font-black text-rose-700">{blockedCustomers}</p>
          <p className="text-[10px] text-rose-600 font-medium">Restricted from ordering</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Total Customer Spend</p>
          <p className="text-2xl font-black text-blue-700">₹{totalLifetimeSales.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-blue-600 font-medium">Lifetime GMV</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Customers" },
            { key: "ACTIVE", label: "Active" },
            { key: "BLOCKED", label: "Blocked" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition cursor-pointer border ${
                filter === t.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading customer directory...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-black text-slate-700">No customers found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-900">{cust.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Joined {new Date(cust.joinedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <p className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Phone className="w-3 h-3 text-slate-400" /> {cust.phone}
                      </p>
                      {cust.email !== "—" && (
                        <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" /> {cust.email}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-500" /> {cust.orderCount}
                      </span>
                    </td>

                    <td className="p-4 font-black text-slate-900">
                      ₹{cust.totalSpent.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      {cust.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black uppercase">
                          <ShieldAlert className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black uppercase">
                          <ShieldCheck className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(cust.id, cust.isBlocked)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                          cust.isBlocked
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {cust.isBlocked ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Unblock
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Block Customer
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
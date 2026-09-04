"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LifeBuoy,
  Search,
  RefreshCw,
  Loader2,
  Trash2,
  Phone,
  Mail
} from "lucide-react";

interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/tickets", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status } : t))
        );
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const res = await fetch(`/api/admin/tickets?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      alert("Error deleting ticket");
    }
  };

  // Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  const filteredTickets = tickets.filter((t) => {
    const contact = t.customerPhone || t.customerEmail || t.user?.phone || t.user?.name || "";
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase()) ||
      contact.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "OPEN") return t.status === "OPEN";
    if (filter === "IN_PROGRESS") return t.status === "IN_PROGRESS";
    if (filter === "RESOLVED") return t.status === "RESOLVED";
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Active Support Tickets</h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Manage customer inquiries submitted from Contact Support desk.
          </p>
        </div>
        <button
          onClick={() => void fetchTickets()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">All Inquiries</p>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-rose-600 uppercase tracking-wider">Open Tickets</p>
          <p className="text-2xl font-black text-rose-700">{openCount}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-amber-600 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-black text-amber-700">{inProgressCount}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-black text-emerald-700">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Tickets" },
            { key: "OPEN", label: "Open" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "RESOLVED", label: "Resolved" },
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
            placeholder="Search ticket #, customer, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading support desk tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <LifeBuoy className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-black text-slate-700">No support tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Ticket #</th>
                  <th className="p-4">Customer Contact</th>
                  <th className="p-4">Subject &amp; Message</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredTickets.map((t) => {
                  const phone = t.customerPhone || t.user?.phone || "—";
                  const email = t.customerEmail || t.user?.email || "—";
                  const name = t.customerName || t.user?.name || "Shopper";

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="p-4 align-top">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                          #{t.ticketNumber}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(t.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </td>

                      <td className="p-4 align-top space-y-0.5">
                        <p className="font-black text-slate-900">{name}</p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" /> {phone}
                        </p>
                        {email !== "—" && (
                          <p className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Mail className="w-3 h-3 text-slate-400" /> {email}
                          </p>
                        )}
                      </td>

                      <td className="p-4 align-top max-w-md space-y-1">
                        <p className="font-black text-xs text-slate-900">{t.subject}</p>
                        <p className="text-slate-600 font-medium leading-relaxed">{t.message}</p>
                      </td>

                      <td className="p-4 align-top">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          t.priority === "URGENT" || t.priority === "HIGH"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {t.priority}
                        </span>
                      </td>

                      <td className="p-4 align-top">
                        <select
                          value={t.status}
                          onChange={(e) => void handleUpdateStatus(t.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border focus:outline-none cursor-pointer ${
                            t.status === "OPEN"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : t.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>

                      <td className="p-4 align-top text-right">
                        <button
                          onClick={() => void handleDelete(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
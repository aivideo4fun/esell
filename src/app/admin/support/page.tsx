"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  RotateCw, 
  Search, 
  Loader2, 
  LifeBuoy, 
  Phone, 
  Mail, 
  Trash2 
} from "lucide-react";

interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  cleanMessage?: string;
  priority?: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

export default function AdminSupportDeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState({ all: 0, open: 0, inProgress: 0, resolved: 0 });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/support/tickets?role=admin", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch {
      console.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const handleUpdateStatus = async (ticketId: string, status: "IN_PROGRESS" | "RESOLVED" | "OPEN") => {
    try {
      setUpdatingId(ticketId);
      const res = await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
        );
        void fetchTickets();
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "OPEN" && t.status === "OPEN") ||
      (activeFilter === "IN_PROGRESS" && t.status === "IN_PROGRESS") ||
      (activeFilter === "RESOLVED" && t.status === "RESOLVED");

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.ticketNumber?.toLowerCase().includes(query) ||
      t.customerName?.toLowerCase().includes(query) ||
      t.customerEmail?.toLowerCase().includes(query) ||
      t.subject?.toLowerCase().includes(query) ||
      t.message?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            Active Support Tickets
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage customer inquiries submitted from Contact Support desk.
          </p>
        </div>

        <button
          onClick={() => void fetchTickets()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">ALL INQUIRIES</p>
          <p className="text-3xl font-black text-slate-950 mt-1">{counts.all}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <p className="text-[11px] font-black text-rose-600 uppercase tracking-wider">OPEN TICKETS</p>
          <p className="text-3xl font-black text-rose-600 mt-1">{counts.open}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <p className="text-[11px] font-black text-amber-600 uppercase tracking-wider">IN PROGRESS</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{counts.inProgress}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">RESOLVED</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{counts.resolved}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { key: "ALL", label: "All Tickets" },
            { key: "OPEN", label: "Open" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "RESOLVED", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeFilter === tab.key
                  ? "bg-slate-950 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search ticket #, customer, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Main Tickets List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading customer tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <LifeBuoy className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-black text-slate-900">No support tickets found.</p>
            <p className="text-[11px] text-slate-400">Tickets submitted by customers will show up here in real-time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((t) => {
              const displayMessage = t.cleanMessage || t.message?.replace(/\[Customer:\s*[^\]]+\]\n?/, "") || t.message;
              return (
                <div key={t.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-emerald-700 text-xs">#{t.ticketNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        t.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" :
                        t.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-800" :
                        "bg-rose-100 text-rose-800"
                      }`}>
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h3 className="font-black text-xs text-slate-900">{t.subject}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      {displayMessage}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 pt-1">
                      <span>Customer: <strong className="text-slate-900">{t.customerName}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {t.customerEmail}</span>
                      {t.customerPhone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">📞 {t.customerPhone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {t.status !== "IN_PROGRESS" && t.status !== "RESOLVED" && (
                      <button
                        onClick={() => void handleUpdateStatus(t.id, "IN_PROGRESS")}
                        disabled={updatingId === t.id}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-black transition cursor-pointer"
                      >
                        In Progress
                      </button>
                    )}

                    {t.status !== "RESOLVED" && (
                      <button
                        onClick={() => void handleUpdateStatus(t.id, "RESOLVED")}
                        disabled={updatingId === t.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-2xs"
                      >
                        Mark Resolved
                      </button>
                    )}

                    {t.status === "RESOLVED" && (
                      <button
                        onClick={() => void handleUpdateStatus(t.id, "OPEN")}
                        disabled={updatingId === t.id}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}
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

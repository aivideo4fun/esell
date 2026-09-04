"use client";

import { useEffect, useState, useCallback } from "react";
import { Ticket as TicketIcon, Loader2, CheckCircle2 } from "lucide-react";

interface TicketRecord {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export default function AdminTicketsListPage() {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchRealTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/support/tickets?role=admin", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      }
    } catch {
      console.error("Failed to load active tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRealTickets();
  }, [fetchRealTickets]);

  const handleResolve = async (ticketId: string) => {
    try {
      setResolvingId(ticketId);
      const res = await fetch("/api/support/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: "RESOLVED" }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: "RESOLVED" } : t))
        );
      }
    } catch {
      alert("Failed to update ticket status");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <div>
        <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
          <TicketIcon className="w-6 h-6 text-emerald-600" /> Active Support Tickets
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Manage customer inquiries submitted from Contact Support desk.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading live support tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-black text-slate-900">No Active Tickets</p>
            <p className="text-xs text-slate-500 font-medium">
              Customer support inquiries will appear here automatically when submitted.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">TICKET</th>
                <th className="p-4">CUSTOMER</th>
                <th className="p-4">SUBJECT</th>
                <th className="p-4">PRIORITY</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right pr-6">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {tickets.map((t) => {
                // Parse clean customer details
                const nameMatch = t.message?.match(/\[Customer:\s*([^\]]+)\]/);
                const extractedName = nameMatch ? nameMatch[1] : null;
                const customerName = extractedName || t.customerName || t.user?.name || "Customer";
                const customerEmail = t.customerEmail || t.user?.email || "customer@catchbuddy.store";

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 pl-6 font-black text-slate-950 font-mono">
                      #{t.ticketNumber}
                    </td>
                    <td className="p-4">
                      <p className="text-slate-950 font-black">{customerName}</p>
                      <p className="text-[11px] text-slate-400 font-normal">{customerEmail}</p>
                    </td>
                    <td className="p-4 text-slate-800">{t.subject}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          t.priority === "HIGH" || t.priority === "URGENT"
                            ? "bg-rose-100/80 text-rose-700"
                            : "bg-amber-100/80 text-amber-800"
                        }`}
                      >
                        {t.priority || "MEDIUM"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          t.status === "RESOLVED"
                            ? "bg-emerald-100/70 text-emerald-800"
                            : "bg-amber-100/70 text-amber-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      {t.status !== "RESOLVED" && (
                        <button
                          onClick={() => void handleResolve(t.id)}
                          disabled={resolvingId === t.id}
                          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {resolvingId === t.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
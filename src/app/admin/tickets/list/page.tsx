"use client";

import { useState } from "react";
import { Ticket, CheckCircle2 } from "lucide-react";

interface SupportTicket {
  id: string;
  customer: string;
  email: string;
  subject: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "RESOLVED";
}

export default function AdminTicketsListPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: "TCK-108", customer: "Aakash Jain", email: "aakash@gmail.com", subject: "Tracking not updating on BlueDart", priority: "HIGH", status: "OPEN" },
    { id: "TCK-109", customer: "Pooja Reddy", email: "pooja@yahoo.com", subject: "Request for tax invoice PDF", priority: "MEDIUM", status: "OPEN" },
  ]);

  const handleResolve = (id: string) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "RESOLVED" } : t)));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Ticket className="w-6 h-6 text-emerald-600" /> Active Support Tickets
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Manage customer inquiries submitted from Contact Support desk.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">Ticket</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="p-4 font-mono font-bold text-slate-900">{t.id}</td>
                <td className="p-4">
                  <p className="font-bold text-slate-900">{t.customer}</p>
                  <p className="text-[10px] text-slate-400">{t.email}</p>
                </td>
                <td className="p-4 font-semibold text-slate-800">{t.subject}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    t.priority === "HIGH" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    t.status === "OPEN" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {t.status === "OPEN" && (
                    <button
                      onClick={() => handleResolve(t.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
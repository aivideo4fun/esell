"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Loader2, CheckCircle2, Phone, Mail, RotateCw } from "lucide-react";

interface TicketMessage {
  id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/tickets", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setMessages(data.tickets);
      }
    } catch {
      console.error("Failed to load customer messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-600" /> Inbound Customer Inquiries
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Direct messages and contact form inquiries received from visitors.
          </p>
        </div>

        <button
          onClick={() => void fetchMessages()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition"
        >
          <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading customer inquiries...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-black text-slate-900">No Inbound Inquiries</p>
            <p className="text-xs text-slate-500 font-medium">
              Customer support inquiries will automatically appear here.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            // Customer Name aur Clean Message parse karein
            const nameMatch = m.message?.match(/\[Customer:\s*([^\]]+)\]/);
            const extractedName = nameMatch ? nameMatch[1] : null;
            const customerName = extractedName || m.user?.name || "Jitendra Gawdiya";
            const cleanBody = m.message?.replace(/\[Customer:\s*[^\]]+\]\n?/, "") || m.message;
            const phone = m.customerPhone || m.user?.phone;
            const email = m.customerEmail || m.user?.email || "customer@catchbuddy.store";

            return (
              <div
                key={m.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-slate-950">{customerName}</h3>
                      <span className="font-mono font-bold text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded-md">
                        #{m.ticketNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-semibold">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {email}
                      </span>
                      {phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-900">{m.subject}</p>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    {cleanBody}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
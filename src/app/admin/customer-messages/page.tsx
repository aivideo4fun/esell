"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

interface MessageRecord {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  message: string;
  createdAt: string;
}

export default function AdminCustomerMessagesPage() {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/support/tickets?role=admin", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setMessages(data.tickets || []);
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
      <div>
        <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-600" /> Inbound Customer Inquiries
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Direct messages and contact form inquiries received from visitors.
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-black text-slate-900">No Customer Messages</p>
            <p className="text-xs text-slate-500 font-medium">
              Inbound inquiries submitted by customers will show up here.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900">{m.customerName}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{m.customerEmail}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-bold">
                  {new Date(m.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                {m.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
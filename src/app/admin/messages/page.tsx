"use client";

import { MessageSquare, Mail } from "lucide-react";

export default function AdminMessagesPage() {
  const messages = [
    { sender: "Suresh Pillai", email: "suresh@gmail.com", msg: "Will the black variant of ANC Earbuds restock next week?", time: "1 hour ago" },
    { sender: "Divya Gupta", email: "divya@outlook.com", msg: "Need wholesale pricing for 20 units of magnetic car mounts.", time: "4 hours ago" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-600" /> Inbound Customer Inquiries
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Direct messages and contact form inquiries received from visitors.
        </p>
      </div>

      <div className="space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-slate-900">{m.sender}</p>
                <p className="text-[11px] text-slate-400">{m.email}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">{m.time}</span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">{m.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
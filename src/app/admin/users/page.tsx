"use client";

import { ShieldCheck, Plus } from "lucide-react";

export default function AdminUsersPage() {
  const users = [
    { name: "Teja Jat (Owner)", email: "admin@catchbuddy.com", role: "SUPER_ADMIN", status: "ACTIVE" },
    { name: "Support Manager", email: "support.lead@catchbuddy.com", role: "CUSTOMER_SUPPORT", status: "ACTIVE" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" /> Admin Staff &amp; Team Members
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage authenticated team access to the Enterprise Control Hub.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">Staff Member</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {users.map((u, idx) => (
              <tr key={idx}>
                <td className="p-4">
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-[10px] text-slate-400">{u.email}</p>
                </td>
                <td className="p-4 font-mono font-bold text-emerald-700">{u.role}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
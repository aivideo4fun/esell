"use client";

import { useState } from "react";
import { Receipt, Plus } from "lucide-react";

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: "EXP-1", category: "Packaging & Boxes", description: "Corrugated shipping boxes & bubble wraps", amount: 4800, date: "31 Aug 2026" },
    { id: "EXP-2", category: "Software Hosting", description: "Vercel / Netlify & Database server costs", amount: 2400, date: "01 Sep 2026" },
    { id: "EXP-3", category: "Logistics Partner", description: "BlueDart monthly pre-paid balance", amount: 15000, date: "02 Sep 2026" },
  ]);

  const [newExp, setNewExp] = useState({ category: "", description: "", amount: "" });
  const [showAdd, setShowAdd] = useState(false);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenses([
      {
        id: `EXP-${expenses.length + 1}`,
        category: newExp.category,
        description: newExp.description,
        amount: Number(newExp.amount),
        date: "02 Sep 2026",
      },
      ...expenses,
    ]);
    setShowAdd(false);
    setNewExp({ category: "", description: "", amount: "" });
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" /> Operational Expenses (OPEX)
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Log warehousing, shipping supplies, and merchant software operating expenses.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4 inline mr-1" /> Log Expense
        </button>
      </div>

      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs max-w-xs space-y-1">
        <p className="text-[10px] font-black uppercase text-slate-400">Total Month Spend</p>
        <p className="text-2xl font-black text-slate-900">₹{totalExpense.toLocaleString("en-IN")}</p>
      </div>

      {showAdd && (
        <form onSubmit={handleAddExpense} className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Category (e.g. Courier)"
              value={newExp.category}
              onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold"
            />
            <input
              type="text"
              required
              placeholder="Description"
              value={newExp.description}
              onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold"
            />
            <input
              type="number"
              required
              placeholder="Amount (₹)"
              value={newExp.amount}
              onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold"
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold">
            Save Expense
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">ID &amp; Date</th>
              <th className="p-4">Expense Category</th>
              <th className="p-4">Details</th>
              <th className="p-4 text-right">Cost (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {expenses.map((e) => (
              <tr key={e.id}>
                <td className="p-4 font-mono font-bold text-slate-900">{e.id} ({e.date})</td>
                <td className="p-4 font-bold text-slate-900">{e.category}</td>
                <td className="p-4 text-slate-600">{e.description}</td>
                <td className="p-4 text-right font-black text-rose-600">₹{e.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
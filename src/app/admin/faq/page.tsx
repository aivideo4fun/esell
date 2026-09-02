"use client";

import { useState } from "react";
import { HelpCircle, Plus, Trash2 } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: "FAQ-1",
      question: "How do I track my CatchBuddy order live?",
      answer: "Go to Track Order from the top navbar or customer account and enter your Order ID.",
      category: "Shipping",
    },
    {
      id: "FAQ-2",
      question: "What is the return and replacement policy?",
      answer: "We offer a 7-day hassle-free replacement on all defective or damaged products received.",
      category: "Returns",
    },
    {
      id: "FAQ-3",
      question: "Is Prepaid ₹50 discount applicable on UPI?",
      answer: "Yes, instant ₹50 discount is auto-applied at checkout for all UPI, cards and Netbanking.",
      category: "Payment",
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "General" });

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    setFaqs([...faqs, { id: `FAQ-${faqs.length + 1}`, ...newFaq }]);
    setNewFaq({ question: "", answer: "", category: "General" });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-600" /> Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage FAQs shown on product landing pages, checkout, and customer support portal.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddFaq} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-black text-slate-900">Add New FAQ</h3>
          <input
            type="text"
            required
            placeholder="Question"
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-emerald-500"
          />
          <textarea
            required
            rows={3}
            placeholder="Answer"
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-emerald-500"
          />
          <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer">
            Save FAQ
          </button>
        </form>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {faq.category}
              </span>
              <h3 className="text-xs font-black text-slate-900 pt-1">{faq.question}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{faq.answer}</p>
            </div>
            <button
              onClick={() => handleDelete(faq.id)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition self-start cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
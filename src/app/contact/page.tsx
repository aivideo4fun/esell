"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  Loader2,
  ChevronDown,
  ArrowLeft,
  Truck,
  RotateCcw,
  CreditCard
} from "lucide-react";

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Tracking Issue",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "Order Tracking Issue", message: "" });
      }
    } catch (err) {
      console.error("Failed to submit ticket", err);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How can I track my CatchBuddy order live?",
      a: "Go to Track Order page from your top menu or enter your Order ID / AWB tracking number to get real-time courier updates.",
    },
    {
      q: "What is the return and replacement policy?",
      a: "We offer a 7-day hassle-free replacement on all defective, transit-damaged, or incorrect products received.",
    },
    {
      q: "How long does shipping normally take?",
      a: "Standard dispatch takes 24 hours. Delivery across metro cities takes 2-4 business days, and rest of India takes 4-7 business days.",
    },
    {
      q: "Are prepaid payments safe on CatchBuddy?",
      a: "Yes, all online transactions are secured with 256-bit SSL encryption via Razorpay standard payment gateways with Instant ₹50 Prepaid discount.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <HelpCircle className="w-3.5 h-3.5" /> 24/7 Dedicated Support
          </div>
          <h1 className="text-3xl font-black text-slate-950">How can we help you today?</h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto font-semibold">
            Have questions about an order, tracking, or payments? Reach out to us or find quick answers below.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Us</p>
              <p className="text-xs font-black text-slate-900 mt-0.5">support@catchbuddy.com</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Support</p>
              <p className="text-xs font-black text-slate-900 mt-0.5">+91 98765 43210</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Hours</p>
              <p className="text-xs font-black text-slate-900 mt-0.5">10:00 AM - 7:00 PM (IST)</p>
            </div>
          </div>
        </div>

        {/* Main Section: Ticket Form + Quick FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Support Ticket Form */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-black text-slate-900">Send us a Message</h2>
              <p className="text-xs text-slate-500 mt-0.5">We typically respond to inquiries within a few hours.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-black text-emerald-900">Message Received!</p>
                <p className="text-xs text-emerald-700 font-medium">
                  Our customer support executive will review your ticket and reply to your email shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-xs font-bold text-emerald-800 underline cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Inquiry Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Order Tracking Issue">Order Tracking Issue</option>
                    <option value="Payment / Refund Status">Payment / Refund Status</option>
                    <option value="Return / Replacement Request">Return / Replacement Request</option>
                    <option value="Damaged / Defective Item Received">Damaged / Defective Item Received</option>
                    <option value="Other Inquiries">Other Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Message Details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your query in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Support Ticket
                </button>
              </form>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <h2 className="text-base font-black text-slate-900">Frequently Asked Questions</h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180 text-emerald-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs font-medium text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
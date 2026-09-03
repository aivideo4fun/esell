"use client";

import { useState, useEffect } from "react";
import { 
  LayoutTemplate, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

interface FooterLink {
  title: string;
  url: string;
}

export default function AdminFooterPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [aboutText, setAboutText] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [shopLinks, setShopLinks] = useState<FooterLink[]>([]);
  const [customerLinks, setCustomerLinks] = useState<FooterLink[]>([]);
  const [assurancePoints, setAssurancePoints] = useState<string[]>([]);

  // New Link inputs
  const [newShopTitle, setNewShopTitle] = useState("");
  const [newShopUrl, setNewShopUrl] = useState("");
  const [newCustTitle, setNewCustTitle] = useState("");
  const [newCustUrl, setNewCustUrl] = useState("");
  const [newAssurance, setNewAssurance] = useState("");

  const fetchFooterData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/footer", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.footer) {
        setAboutText(data.footer.aboutText || "");
        setWhatsappNumber(data.footer.whatsappNumber || "");
        setShopLinks(data.footer.shopLinks || []);
        setCustomerLinks(data.footer.customerLinks || []);
        setAssurancePoints(data.footer.assurancePoints || []);
      }
    } catch {
      console.error("Failed to load footer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFooterData();
  }, []);

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const payload = {
        aboutText,
        whatsappNumber,
        shopLinks,
        customerLinks,
        assurancePoints,
      };

      const res = await fetch("/api/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        alert("Failed to save changes");
      }
    } catch {
      alert("Network error while saving footer");
    } finally {
      setSaving(false);
    }
  };

  const addShopLink = () => {
    if (!newShopTitle || !newShopUrl) return;
    setShopLinks([...shopLinks, { title: newShopTitle, url: newShopUrl }]);
    setNewShopTitle("");
    setNewShopUrl("");
  };

  const addCustomerLink = () => {
    if (!newCustTitle || !newCustUrl) return;
    setCustomerLinks([...customerLinks, { title: newCustTitle, url: newCustUrl }]);
    setNewCustTitle("");
    setNewCustUrl("");
  };

  const addAssurance = () => {
    if (!newAssurance) return;
    setAssurancePoints([...assurancePoints, newAssurance]);
    setNewAssurance("");
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
        <span className="text-xs font-bold text-slate-500">Loading Footer Settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <LayoutTemplate className="w-7 h-7 text-emerald-600" /> Customer Footer Manager
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage links, collection categories, assurance bullets, and WhatsApp support number.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFooterData}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {savedSuccess ? "Saved Live!" : "Save Footer Changes"}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-black">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Storefront footer has been updated and is now live for all customers!
        </div>
      )}

      {/* Brand & Support Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
          <h3 className="font-black text-sm text-slate-950">Brand Tagline &amp; About Text</h3>
          <textarea
            rows={4}
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
          <h3 className="font-black text-sm text-slate-950 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Support Number
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold">
            Jab customer &quot;Chat on WhatsApp&quot; click karega toh is number par message trigger hoga.
          </p>
          <input
            type="text"
            value={whatsappNumber}
            placeholder="+919876543210"
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Dynamic Columns Manager */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Col 1: Shop Collections */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">SHOP COLLECTIONS</h3>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {shopLinks.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold">
                <div>
                  <p className="text-slate-900">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{item.url}</p>
                </div>
                <button
                  onClick={() => setShopLinks(shopLinks.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Link Title (e.g. Smart Gadgets)"
              value={newShopTitle}
              onChange={(e) => setNewShopTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            />
            <input
              type="text"
              placeholder="Route URL (e.g. /shop?cat=smart)"
              value={newShopUrl}
              onChange={(e) => setNewShopUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            />
            <button
              onClick={addShopLink}
              className="w-full py-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Collection Link
            </button>
          </div>
        </div>

        {/* Col 2: Customer Desk Links */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">CUSTOMER DESK</h3>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {customerLinks.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold">
                <div>
                  <p className="text-slate-900">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{item.url}</p>
                </div>
                <button
                  onClick={() => setCustomerLinks(customerLinks.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Link Title (e.g. Return Policy)"
              value={newCustTitle}
              onChange={(e) => setNewCustTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            />
            <input
              type="text"
              placeholder="Route URL (e.g. /shipping-policy)"
              value={newCustUrl}
              onChange={(e) => setNewCustUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            />
            <button
              onClick={addCustomerLink}
              className="w-full py-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Customer Link
            </button>
          </div>
        </div>

        {/* Col 3: CatchBuddy Assurance Points */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> CATCHBUDDY ASSURANCE
          </h3>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {assurancePoints.map((point, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold">
                <span className="text-slate-800">&bull; {point}</span>
                <button
                  onClick={() => setAssurancePoints(assurancePoints.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="e.g. 5-Day Hassle-Free Replacement"
              value={newAssurance}
              onChange={(e) => setNewAssurance(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            />
            <button
              onClick={addAssurance}
              className="w-full py-1.5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Assurance Point
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
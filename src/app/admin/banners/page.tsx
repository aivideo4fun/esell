/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";
import Link from "next/link";

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  badgeText?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("/shop");
  const [badgeText, setBadgeText] = useState("SPECIAL DEAL");
  const [displayOrder, setDisplayOrder] = useState("0");

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          imageUrl,
          linkUrl,
          badgeText,
          displayOrder,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setTitle("");
        setSubtitle("");
        setImageUrl("");
        setLinkUrl("/shop");
        setBadgeText("SPECIAL DEAL");
        setDisplayOrder("0");
        fetchBanners();
      } else {
        alert(data.error || "Failed to create banner");
      }
    } catch {
      alert("Error saving banner");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, isActive: !currentStatus } : b))
        );
      }
    } catch {
      alert("Error updating status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch {
      alert("Error deleting banner");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Store Banners &amp; Sliders (CMS)</h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Manage top hero sliders, campaign promotional banners, and seasonal sale graphics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Banner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Banners</p>
          <p className="text-2xl font-black text-slate-900">{banners.length}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Active on Homepage</p>
          <p className="text-2xl font-black text-emerald-700">{banners.filter((b) => b.isActive).length}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Paused Banners</p>
          <p className="text-2xl font-black text-slate-600">{banners.filter((b) => !b.isActive).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading promotional banners...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-black text-slate-700">No banners configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs transition hover:shadow-md"
              >
                <div className="relative h-44 bg-slate-200 overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  {banner.badgeText && (
                    <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> {banner.badgeText}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 font-mono text-[10px] font-black px-2 py-0.5 rounded-md text-slate-800">
                    Order #{banner.displayOrder}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-black text-sm text-slate-900 line-clamp-1">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-xs text-slate-500 line-clamp-2 font-medium">{banner.subtitle}</p>
                  )}
                  <div className="pt-2 flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <span>Target: {banner.linkUrl}</span>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200/80 bg-white flex items-center justify-between">
                  <button
                    onClick={() => toggleStatus(banner.id, banner.isActive)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer transition ${
                      banner.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {banner.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Live
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Paused
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={banner.linkUrl || "/shop"}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                      title="Test Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Add Homepage Banner</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mega Summer Tech Clearance Sale"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Punchline</label>
                <input
                  type="text"
                  placeholder="e.g. Up to 60% OFF on Smart Home & Mobile Gadgets"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or your image link"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Link (CTA)</label>
                  <input
                    type="text"
                    placeholder="/shop"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. FESTIVE DEAL"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Display Priority Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  UploadCloud,
  X,
  ExternalLink,
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl: string;
  badgeText?: string;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Stores base64 or url
  const [linkUrl, setLinkUrl] = useState("/shop");
  const [badgeText, setBadgeText] = useState("SPECIAL DEAL");
  const [displayOrder, setDisplayOrder] = useState("0");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.banners)) {
        setBanners(data.banners);
      }
    } catch {
      console.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  // Handle Local Image File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert("Image size must be less than 4MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Please upload a banner image!");
      return;
    }

    setSubmitting(true);
    try {
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
        // Reset form
        setTitle("");
        setSubtitle("");
        setImageUrl("");
        setLinkUrl("/shop");
        setBadgeText("SPECIAL DEAL");
        setDisplayOrder("0");
        void fetchBanners();
      } else {
        alert(data.error || "Failed to create banner");
      }
    } catch {
      alert("Error saving banner");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
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
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Error deleting banner");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            Store Banners &amp; Sliders (CMS)
          </h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Manage top hero sliders, campaign promotional banners, and seasonal sale graphics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBanners()}
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

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">TOTAL BANNERS</p>
          <p className="text-2xl font-black text-slate-900">{banners.length}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">ACTIVE ON HOMEPAGE</p>
          <p className="text-2xl font-black text-emerald-700">{banners.filter((b) => b.isActive).length}</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">PAUSED BANNERS</p>
          <p className="text-2xl font-black text-slate-500">{banners.filter((b) => !b.isActive).length}</p>
        </div>
      </div>

      {/* Banners List Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading banners...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-black text-slate-700">No banners created yet.</p>
            <p className="text-[11px] text-slate-500">Click &quot;Add New Banner&quot; to upload promotional graphics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 transition flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/75 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider backdrop-blur-xs">
                    {banner.badgeText || "SPECIAL DEAL"}
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-white/90 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    Order #{banner.displayOrder}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-black text-sm text-slate-900 line-clamp-1">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-xs text-slate-500 line-clamp-1">{banner.subtitle}</p>
                  )}
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    Target: {banner.linkUrl}
                  </p>
                </div>

                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleBannerStatus(banner.id, banner.isActive)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer transition ${
                      banner.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {banner.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> LIVE
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" /> PAUSED
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Open Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete"
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

      {/* CREATE NEW BANNER MODAL WITH FILE UPLOAD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Add New Banner</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              {/* IMAGE UPLOAD BOX (NO URL LINK REQUIRED) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Banner Graphic Image *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-emerald-500 group">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      Image Selected ✓
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition space-y-2"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-black text-slate-800">
                      Click to upload banner image from device
                    </p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, WEBP (Recommended ratio 16:9 or 21:9)</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Great Indian Festival"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Offer Description</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 30% OFF on all gadgets with code WINTER50"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Click Target Route</label>
                  <input
                    type="text"
                    placeholder="/shop"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="SPECIAL DEAL"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !imageUrl}
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
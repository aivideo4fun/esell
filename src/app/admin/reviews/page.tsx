/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  MessageSquareQuote
} from "lucide-react";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, APPROVED, PENDING, REJECTED

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      } else {
        alert(data.error || "Failed to update review status");
      }
    } catch (err) {
      alert("Error updating review");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert("Error deleting review");
    }
  };

  // Metrics
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.status === "APPROVED").length;
  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;
  const averageStoreRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.product?.title?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "APPROVED") return r.status === "APPROVED";
    if (filter === "PENDING") return r.status === "PENDING";
    if (filter === "REJECTED") return r.status === "REJECTED";
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Customer Reviews &amp; Ratings</h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Moderate buyer feedback, approve photo reviews, and manage store reputation.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Reviews</p>
          <p className="text-2xl font-black text-slate-900">{totalReviews}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-amber-500 uppercase tracking-wider">Avg Store Rating</p>
          <p className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> {averageStoreRating}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Approved (Live)</p>
          <p className="text-2xl font-black text-emerald-700">{approvedCount}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-purple-600 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-black text-purple-700">{pendingCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Reviews" },
            { key: "APPROVED", label: "Approved" },
            { key: "PENDING", label: "Pending" },
            { key: "REJECTED", label: "Rejected" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition cursor-pointer border ${
                filter === t.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by customer, product, comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading buyer feedback...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <MessageSquareQuote className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-black text-slate-700">No customer reviews found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Customer &amp; Rating</th>
                  <th className="p-4">Review Content</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredReviews.map((rev) => {
                  const prodImg = rev.product?.images?.[0]?.url || "/placeholder.png";
                  return (
                    <tr key={rev.id} className="hover:bg-slate-50/60">
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prodImg}
                            alt=""
                            className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-black text-xs text-slate-900 line-clamp-1 max-w-[180px]">
                              {rev.product?.title || "Store Product"}
                            </p>
                            {rev.product?.slug && (
                              <Link
                                href={`/product/${rev.product.slug}`}
                                target="_blank"
                                className="text-[10px] text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                              >
                                View Live <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 align-top space-y-1">
                        <p className="font-black text-slate-900">{rev.customerName || "Verified Buyer"}</p>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </td>

                      <td className="p-4 align-top max-w-sm">
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {rev.comment || <span className="italic text-slate-400">No comment provided</span>}
                        </p>
                      </td>

                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                            rev.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : rev.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {rev.status}
                        </span>
                      </td>

                      <td className="p-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rev.status !== "APPROVED" && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, "APPROVED")}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
                              title="Approve Review"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {rev.status !== "REJECTED" && (
                            <button
                              onClick={() => handleUpdateStatus(rev.id, "REJECTED")}
                              className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition cursor-pointer"
                              title="Reject Review"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(rev.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
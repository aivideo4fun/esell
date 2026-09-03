"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink,
  X,
  FileText
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: string;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Quick form state
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState("Tech & Accessories");

  // Detailed Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalCategory, setModalCategory] = useState("Tech & Accessories");
  const [modalAuthor, setModalAuthor] = useState("Admin Team");
  const [modalContent, setModalContent] = useState("");

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blog", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch {
      console.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  // Quick Publish Handler
  const handleQuickPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) {
      alert("Please enter article headline");
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: headline,
          category,
          author: "Admin Team",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setHeadline("");
        void fetchArticles();
      } else {
        alert(data.error || "Failed to publish");
      }
    } catch {
      alert("Network error");
    } finally {
      setPublishing(false);
    }
  };

  // Detailed Modal Publish Handler
  const handleModalPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) {
      alert("Please enter article headline");
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: modalTitle,
          category: modalCategory,
          author: modalAuthor,
          content: modalContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setModalTitle("");
        setModalContent("");
        void fetchArticles();
      } else {
        alert(data.error || "Failed to publish");
      }
    } catch {
      alert("Network error");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Error deleting article");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-600" /> Articles &amp; Blog Publishing
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Create and edit buying guides, gadget reviews, and SEO blog articles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchArticles()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>
      </div>

      {/* Quick Publish Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900">Publish New Article</h3>

        <form onSubmit={handleQuickPublish} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Article Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="Tech & Accessories">Tech &amp; Accessories</option>
              <option value="Buying Guide">Buying Guide</option>
              <option value="Gadgets Review">Gadgets Review</option>
              <option value="Company News">Company News</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={publishing || !headline.trim()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Publish Post"}
          </button>
        </form>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading published articles...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-black text-slate-700">No articles published yet.</p>
            <p className="text-[11px] text-slate-500">Headline enter karke Publish Post par click karein.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">ARTICLE TITLE</th>
                  <th className="p-4">CATEGORY</th>
                  <th className="p-4">AUTHOR</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 max-w-md">
                      <p className="font-black text-xs text-slate-900 line-clamp-1">{post.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        /{post.slug}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 font-bold">{post.category}</td>
                    <td className="p-4 text-slate-900 font-bold">{post.author}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {post.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Article Creator Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Create Full Blog Article
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalPublish} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Headline *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Top 10 Must-Have Smart Gadgets for 2026"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Tech & Accessories">Tech &amp; Accessories</option>
                    <option value="Buying Guide">Buying Guide</option>
                    <option value="Gadgets Review">Gadgets Review</option>
                    <option value="Company News">Company News</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Author Name</label>
                  <input
                    type="text"
                    placeholder="Admin Team"
                    value={modalAuthor}
                    onChange={(e) => setModalAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Article Content / Body</label>
                <textarea
                  rows={5}
                  placeholder="Write article details, buying tips, product specifications..."
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
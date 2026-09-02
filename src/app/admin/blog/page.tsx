"use client";

import { useState } from "react";
import { BookOpen, Plus, Eye, Trash2, CheckCircle2 } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  status: "PUBLISHED" | "DRAFT";
  publishedAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "POST-101",
      title: "Top 10 Must-Have Smart Gadgets for 2026",
      slug: "top-10-must-have-smart-gadgets-2026",
      author: "Admin Team",
      category: "Tech & Accessories",
      status: "PUBLISHED",
      publishedAt: "28 Aug 2026",
    },
    {
      id: "POST-102",
      title: "Why Prepaid Orders Give You the Best Deal on CatchBuddy",
      slug: "why-prepaid-orders-best-deal",
      author: "CatchBuddy Editor",
      category: "Buying Guide",
      status: "PUBLISHED",
      publishedAt: "01 Sep 2026",
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    category: "Tech & Accessories",
    author: "Admin",
  });

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    const created: BlogPost = {
      id: `POST-10${posts.length + 1}`,
      title: newPost.title,
      slug: newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      author: newPost.author,
      category: newPost.category,
      status: "PUBLISHED",
      publishedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
    setPosts([created, ...posts]);
    setNewPost({ title: "", category: "Tech & Accessories", author: "Admin" });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" /> Articles &amp; Blog Publishing
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Create and edit buying guides, gadget reviews, and SEO blog articles.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddPost} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900">Publish New Article</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Article Headline"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="sm:col-span-2 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              required
              placeholder="Category"
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer">
            Publish Post
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">Article Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Author</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50/60 transition">
                <td className="p-4 font-bold text-slate-900">
                  {post.title}
                  <span className="block text-[10px] font-mono text-slate-400 font-normal">/{post.slug}</span>
                </td>
                <td className="p-4 text-slate-600">{post.category}</td>
                <td className="p-4 text-slate-700 font-semibold">{post.author}</td>
                <td className="p-4 text-slate-500">{post.publishedAt}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> {post.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
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
    </div>
  );
}
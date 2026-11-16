"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState("");
  const [sizes, setSizes] = useState(""); const [colors, setColors] = useState("");
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch(`/api/admin/products/${encodeURIComponent(id)}`).then((r) => r.json()).then((data) => {
      if (!data.success) throw new Error(data.error || "Product not found");
      setProduct(data.product); setImages(data.product.images.map((i: any) => i.url).join("\n")); setSizes(data.product.sizes.join(", ")); setColors(data.product.colors.join(", "));
    }).catch((e) => setMessage(e.message));
  }, [id]);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const r = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: product.title, description: product.description || "", price: product.price, originalPrice: product.originalPrice, stock: product.stock, isActive: product.isActive, sizes: sizes.split(",").map((v) => v.trim()).filter(Boolean), colors: colors.split(",").map((v) => v.trim()).filter(Boolean), imageUrls: images.split("\n").map((v) => v.trim()).filter(Boolean) }) });
      const data = await r.json(); if (!data.success) throw new Error(data.error || "Save failed"); setProduct(data.product); setMessage("Product saved to the database.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to save"); } finally { setBusy(false); }
  }
  async function upload(files: FileList | null) {
    if (!files) return; setBusy(true);
    try { const form = new FormData(); for (const file of Array.from(files)) form.append("files", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: form }); const data = await r.json(); if (!data.success) throw new Error(data.error);
      setImages((old) => [old, ...data.urls].filter(Boolean).join("\n")); setMessage("Photos ready. Save the product to apply them.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Upload failed"); } finally { setBusy(false); }
  }
  return <div className="max-w-4xl mx-auto p-6 space-y-5"><Link href="/admin/products" className="underline">Back to products</Link><h1 className="text-2xl font-bold">Edit product</h1>{message && <p role="status" className="p-3 border rounded-xl">{message}</p>}{!product ? <p>Load the product to edit its details.</p> : <form onSubmit={save} className="space-y-4 rounded-2xl bg-white border p-5">
    <label className="block">Title<input required className="block w-full border rounded-lg p-2" value={product.title} onChange={(e) => setProduct({ ...product, title: e.target.value })} /></label>
    <div className="grid sm:grid-cols-3 gap-3">{["price", "originalPrice", "stock"].map((key) => <label key={key}>{key}<input type="number" min={key === "stock" ? 0 : 0.01} step={key === "stock" ? 1 : 0.01} className="block w-full border rounded-lg p-2" value={product[key]} onChange={(e) => setProduct({ ...product, [key]: e.target.value })} /></label>)}</div>
    <label className="block">Description, specifications, compatibility and warranty<textarea rows={8} className="block w-full border rounded-lg p-2" value={product.description || ""} onChange={(e) => setProduct({ ...product, description: e.target.value })} /></label>
    <label className="block">Sizes (comma separated)<input className="block w-full border rounded-lg p-2" value={sizes} onChange={(e) => setSizes(e.target.value)} /></label>
    <label className="block">Colours (comma separated)<input className="block w-full border rounded-lg p-2" value={colors} onChange={(e) => setColors(e.target.value)} /></label>
    <label className="block">Product photo URLs (one per line; first is primary)<textarea rows={4} className="block w-full border rounded-lg p-2" value={images} onChange={(e) => setImages(e.target.value)} /></label>
    <input aria-label="Upload product photos" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => void upload(e.target.files)} />
    <label className="block"><input type="checkbox" checked={product.isActive} onChange={(e) => setProduct({ ...product, isActive: e.target.checked })} /> Active in storefront</label>
    <button disabled={busy} className="bg-emerald-700 text-white px-5 py-3 rounded-xl disabled:opacity-50">{busy ? "Saving…" : "Save product"}</button>
  </form>}</div>;
}

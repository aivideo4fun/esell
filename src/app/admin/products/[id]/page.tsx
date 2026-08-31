/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Zap } from "lucide-react";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id?: string[] | string }>;
}) {
  const resolvedParams = await params;
  const raw = resolvedParams?.id;
  const paramVal = Array.isArray(raw) ? raw.join("/") : raw || "";
  const cleanParam = decodeURIComponent(paramVal).trim();

  let product: any = null;

  try {
    if (cleanParam) {
      product = await prisma.product.findFirst({
        where: {
          OR: [{ slug: cleanParam }, { id: cleanParam }],
        },
        include: { images: true, category: true },
      });
    }

    if (!product) {
      product = await prisma.product.findFirst({
        orderBy: { createdAt: "desc" },
        include: { images: true, category: true },
      });
    }
  } catch (err) {
    console.error("DB Fetch Error:", err);
  }

  // Guaranteed product object
  const currentProduct = product || {
    id: "default-id",
    title: "Trending Smart Gadget",
    price: 233,
    originalPrice: 1088,
    description: "Premium quality verified viral gadget with durable built quality.",
    category: { name: "KITCHEN" },
    images: [],
    slug: "gadget",
  };

  const cutPrice = Number(currentProduct.originalPrice || currentProduct.mrp || 1088);
  const sellingPrice = Number(currentProduct.price || 233);
  const discount =
    cutPrice > sellingPrice
      ? Math.round(((cutPrice - sellingPrice) / cutPrice) * 100)
      : 0;

  const productForClient = {
    id: currentProduct.id,
    title: currentProduct.title,
    price: sellingPrice,
    originalPrice: cutPrice,
    description: currentProduct.description,
    images: currentProduct.images?.map((img: any) => (typeof img === "string" ? img : img.url)) || [],
    category: currentProduct.category?.name || "KITCHEN",
    slug: currentProduct.slug,
  };

  const displayImage =
    productForClient.images[0] ||
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="min-h-screen bg-white text-[#0f172a] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-xs font-bold text-[#64748b] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#065f46]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#065f46]">Shop</Link>
          <span>/</span>
          <span className="text-[#0f172a] truncate max-w-xs">{currentProduct.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl bg-[#f8fafc] border border-gray-200 overflow-hidden flex items-center justify-center p-6">
              <img
                src={displayImage}
                alt={currentProduct.title}
                className="object-contain w-full h-full"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-[#16a34a] text-white text-xs font-black px-3 py-1 rounded-lg">
                  {discount}% OFF
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-[#16a34a]" /> Direct Verified Dispatch
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#0f172a] leading-tight capitalize">
              {currentProduct.title}
            </h1>

            <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-[#f8fafc] border border-gray-200">
              <span className="text-3xl font-black text-[#065f46]">₹{sellingPrice}</span>
              {cutPrice > sellingPrice && (
                <span className="text-base font-bold text-[#64748b] line-through">₹{cutPrice}</span>
              )}
              <span className="text-xs font-black text-[#16a34a] bg-[#f0fdf4] px-2.5 py-1 rounded-md border border-[#bbf7d0]">
                Flat ₹50 Extra Off on Prepaid UPI
              </span>
            </div>

            <ProductDetailClient product={productForClient} />

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <Truck className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">Free Express Delivery</p>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">100% Verified Safe</p>
              </div>
              <div className="p-3 bg-[#f8fafc] rounded-xl border border-gray-100">
                <RotateCcw className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                <p className="text-[11px] font-bold text-[#0f172a]">5-Day Replacement</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-black text-[#0f172a]">Product Overview</h3>
              <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed whitespace-pre-line">
                {currentProduct.description || "High quality verified viral gadget with premium finish and durable built quality."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
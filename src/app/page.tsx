/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function HomePage() {
  let featuredProducts: Array<{
    id: string;
    title: string;
    price: number;
    originalPrice: number;
    slug: string;
    images: Array<{ url: string }>;
  }> = [];

  try {
    featuredProducts = await prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { images: true },
    });
  } catch (error) {
    console.error(error);
  }

  const heroDeal = featuredProducts[0];

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs font-bold shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-[#16a34a]" />
                <span>DIRECT VERIFIED SUPPLIER DISPATCH</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0f172a] leading-[1.1]">
                Premium Trending Gadgets, <br />
                <span className="text-[#16a34a]">Direct to Your Doorstep.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#64748b] font-medium max-w-xl leading-relaxed">
                Discover everyday smart utilities, lifestyle innovations, and viral products with 100% verified quality &amp; instant prepaid discounts.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-[#065f46] hover:bg-[#044e39] text-white text-sm font-black px-7 py-3.5 rounded-2xl transition shadow-lg shadow-emerald-950/20 active:scale-95"
                >
                  Explore Live Catalog <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2 text-xs font-bold text-[#16a34a] bg-[#f0fdf4] px-4 py-3 rounded-2xl border border-[#bbf7d0]">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  <span>100% Safe Prepaid Checkout</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clickable Hero Deal Card */}
            <div className="lg:col-span-5 relative">
              <Link
                href={heroDeal ? `/product/${heroDeal.slug || heroDeal.id}` : "/shop"}
                className="block group"
              >
                <div className="relative mx-auto max-w-md bg-white rounded-3xl border-2 border-[#22c55e] p-6 shadow-2xl shadow-emerald-100 group-hover:border-[#16a34a] group-hover:scale-[1.02] transition duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-red-50 text-red-600 text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      DEAL OF THE DAY 🔥
                    </span>
                    <span className="text-[11px] font-bold text-[#64748b]">
                      Limited Stock Left
                    </span>
                  </div>

                  <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-[#f8fafc] flex items-center justify-center">
                    <img
                      src={
                        heroDeal?.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={heroDeal?.title || "Featured Gadget"}
                      className="object-contain w-full h-full p-4 group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-[#0f172a] group-hover:text-[#16a34a] transition">
                        {heroDeal ? heroDeal.title : "Smart Utility Bottles Set"}
                      </h3>
                      <p className="text-xs text-[#64748b] font-semibold">Special Edition &bull; Click to View</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-[#16a34a]">
                        ₹{heroDeal ? heroDeal.price : 399}
                      </span>
                      <span className="text-xs text-gray-400 line-through ml-1.5 font-bold">
                        ₹{heroDeal ? heroDeal.originalPrice : 799}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* RECENT / FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Trending Right Now</h2>
            <p className="text-xs text-[#64748b] font-semibold">Curated viral gadgets with express shipping</p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-black text-[#16a34a] hover:text-[#065f46] flex items-center gap-1 transition"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-200">
            <p className="text-xs font-bold text-[#64748b]">No live products in catalog yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((p) => {
              const discount =
                p.originalPrice > p.price
                  ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                  : 0;
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug || p.id}`}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-[#16a34a] p-3 transition shadow-xs hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden mb-3">
                    <img
                      src={p.images?.[0]?.url || "/placeholder.png"}
                      alt={p.title}
                      className="object-contain w-full h-full p-2 group-hover:scale-105 transition"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-[#16a34a] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#0f172a] line-clamp-1 group-hover:text-[#16a34a] transition">
                      {p.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-black text-[#065f46]">₹{p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-[11px] font-bold text-gray-400 line-through">₹{p.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
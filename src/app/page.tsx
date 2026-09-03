/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  slug: string;
  stock?: number | null;
  images: Array<{ url: string }>;
}

interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string;
  badgeText: string;
  displayOrder: number;
  isActive: boolean;
}

export default async function HomePage() {
  let featuredProducts: ProductItem[] = [];
  let liveBanners: BannerItem[] = [];

  try {
    const [productsData, bannersData] = await Promise.all([
      prisma.product.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { images: true },
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

    featuredProducts = productsData as unknown as ProductItem[];
    liveBanners = bannersData as unknown as BannerItem[];
  } catch (error) {
    console.error("Homepage fetch error:", error);
  }

  const heroDeal = featuredProducts[0];
  const isHeroOutOfStock = heroDeal ? (heroDeal.stock ?? 0) <= 0 : false;
  const primaryBanner = liveBanners[0];

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 border-b border-gray-100">
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

            {/* Right Column: Hero Deal Card */}
            <div className="lg:col-span-5 relative">
              <Link
                href={heroDeal ? `/product/${heroDeal.slug || heroDeal.id}` : "/shop"}
                className="block group"
              >
                <div className={`relative mx-auto max-w-md bg-white rounded-3xl border-2 p-6 shadow-2xl transition duration-300 ${
                  isHeroOutOfStock
                    ? "border-red-300 shadow-red-50"
                    : "border-[#22c55e] shadow-emerald-100 group-hover:border-[#16a34a] group-hover:scale-[1.02]"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-red-50 text-red-600 text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      DEAL OF THE DAY 🔥
                    </span>
                    <span className={`text-[11px] font-bold ${isHeroOutOfStock ? "text-red-600 font-black" : "text-[#64748b]"}`}>
                      {isHeroOutOfStock ? "Out of Stock ❌" : "Limited Stock Left"}
                    </span>
                  </div>

                  <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-[#f8fafc] flex items-center justify-center">
                    <img
                      src={
                        heroDeal?.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={heroDeal?.title || "Featured Gadget"}
                      className={`object-contain w-full h-full p-4 transition duration-500 ${
                        isHeroOutOfStock ? "grayscale opacity-60" : "group-hover:scale-105"
                      }`}
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
                    </div>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* DYNAMIC STORE BANNER SECTION (CMS SYNCED) */}
      {primaryBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <Link
            href={primaryBanner.linkUrl || "/shop"}
            className="block group relative overflow-hidden rounded-3xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="w-full h-44 sm:h-60 md:h-72 bg-gradient-to-r from-emerald-950 via-slate-900 to-black relative flex items-center">
              {primaryBanner.imageUrl && (
                <img
                  src={primaryBanner.imageUrl}
                  alt={primaryBanner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/85 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1 rounded-full w-fit mb-2 shadow-sm">
                  <Sparkles className="w-3 h-3" /> {primaryBanner.badgeText || "SPECIAL OFFER"}
                </span>
                <h3 className="text-xl sm:text-3xl font-black tracking-tight capitalize max-w-lg">
                  {primaryBanner.title}
                </h3>
                {primaryBanner.subtitle && (
                  <p className="text-xs sm:text-sm text-gray-200 font-semibold mt-1 max-w-md line-clamp-2">
                    {primaryBanner.subtitle}
                  </p>
                )}
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black bg-white text-slate-950 px-4 py-2 rounded-xl group-hover:bg-emerald-400 group-hover:text-white transition">
                    Explore Deals <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* RECENT / FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              const isOutOfStock = (p.stock ?? 0) <= 0;
              const orig = p.originalPrice ?? 0;
              const discount = orig > p.price ? Math.round(((orig - p.price) / orig) * 100) : 0;

              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug || p.id}`}
                  className={`group bg-white rounded-2xl border p-3 transition shadow-xs flex flex-col justify-between ${
                    isOutOfStock
                      ? "border-red-200 opacity-80"
                      : "border-gray-200 hover:border-[#16a34a] hover:shadow-lg"
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden mb-3">
                    <img
                      src={p.images?.[0]?.url || "/placeholder.png"}
                      alt={p.title}
                      className={`object-contain w-full h-full p-2 transition ${
                        isOutOfStock ? "grayscale opacity-60" : "group-hover:scale-105"
                      }`}
                    />

                    {isOutOfStock ? (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                        OUT OF STOCK
                      </span>
                    ) : discount > 0 ? (
                      <span className="absolute top-2 left-2 bg-[#16a34a] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        {discount}% OFF
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-[#0f172a] line-clamp-1 group-hover:text-[#16a34a] transition">
                      {p.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-black text-[#065f46]">₹{p.price}</span>
                      {orig > p.price && (
                        <span className="text-[11px] font-bold text-gray-400 line-through">
                          ₹{orig}
                        </span>
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
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Loader2, 
  Sparkles,
  Check,
  ArrowRight,
  Plus,
  Minus
} from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import Header from "@/components/Header";

interface ProductImage {
  url: string;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  images?: ProductImage[];
  category?: ProductCategory;
  stock?: number;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  badgeText?: string;
  isActive: boolean;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const catSlugParam = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  
  // Cart items mapping: productId -> quantity
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  const { wishlist, toggleWishlist } = useWishlist();

  // Load cart quantities from localStorage
  useEffect(() => {
    const updateCartMap = () => {
      try {
        const saved = localStorage.getItem("cb_cart");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const map: Record<string, number> = {};
            parsed.forEach((item: any) => {
              const pid = item.productId || item.id;
              if (pid) {
                map[pid] = item.quantity || 1;
              }
            });
            setCartQuantities(map);
          }
        } else {
          setCartQuantities({});
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateCartMap();
    window.addEventListener("storage", updateCartMap);
    const interval = setInterval(updateCartMap, 400);
    return () => {
      window.removeEventListener("storage", updateCartMap);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (catSlugParam) {
      setSelectedCategory(catSlugParam);
    } else {
      setSelectedCategory("ALL");
    }
  }, [catSlugParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, bannerRes] = await Promise.all([
          fetch("/api/admin/products", { cache: "no-store" }),
          fetch("/api/admin/categories", { cache: "no-store" }),
          fetch("/api/admin/banners", { cache: "no-store" }),
        ]);

        const prodData = await prodRes.json();
        if (prodData.success && Array.isArray(prodData.products)) {
          setProducts(prodData.products);
        } else if (Array.isArray(prodData)) {
          setProducts(prodData);
        }

        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.categories)) {
          setCategories(catData.categories);
        }

        const bannerData = await bannerRes.json();
        if (bannerData.success && Array.isArray(bannerData.banners)) {
          setBanners(bannerData.banners.filter((b: Banner) => b.isActive));
        }
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const filteredProducts = products.filter((item) => {
    const itemCatSlug = item.category?.slug || item.category?.name?.toLowerCase().replace(/\s+/g, "-");
    const matchesCategory = 
      selectedCategory === "ALL" || 
      item.category?.name === selectedCategory || 
      itemCatSlug === selectedCategory;

    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle adding or incrementing quantity in cart
  const handleUpdateCartQty = (product: Product, delta: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const existing = localStorage.getItem("cb_cart");
      let cart = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(cart)) cart = [];

      const index = cart.findIndex((i: any) => (i.productId === product.id || i.id === product.id));

      if (index > -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
      } else if (delta > 0) {
        cart.push({
          productId: product.id,
          slug: product.slug || product.id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice || product.price * 1.3,
          image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
          quantity: 1,
        });
      }

      localStorage.setItem("cb_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));

      // Refresh local quantities map
      const newMap: Record<string, number> = {};
      cart.forEach((item: any) => {
        newMap[item.productId || item.id] = item.quantity;
      });
      setCartQuantities(newMap);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWishlistToggle = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    });
  };

  const activeShopBanner = banners[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Reusable Header */}
      <Header />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Title & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              Trending Catalog <Sparkles className="w-5 h-5 text-emerald-600" />
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Explore gadgets, smart accessories and home essentials.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* PROMOTIONAL BANNER */}
        {activeShopBanner && (
          <Link
            href={activeShopBanner.linkUrl || "/shop"}
            className="block group relative overflow-hidden rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition duration-300"
          >
            <div className="w-full h-40 sm:h-52 bg-gradient-to-r from-emerald-950 to-slate-900 relative flex items-center">
              {activeShopBanner.imageUrl && (
                <img
                  src={activeShopBanner.imageUrl}
                  alt={activeShopBanner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-85"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-6 sm:p-10 text-white">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1 rounded-full w-fit mb-1.5">
                  {activeShopBanner.badgeText || "SPECIAL DEAL"}
                </span>
                <h2 className="text-lg sm:text-2xl font-black">{activeShopBanner.title}</h2>
                {activeShopBanner.subtitle && (
                  <p className="text-xs text-gray-200 mt-1 max-w-md line-clamp-1">{activeShopBanner.subtitle}</p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                  Shop Deal <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Link
            href="/shop"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition border ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            ALL
          </Link>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name || selectedCategory === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs font-bold text-slate-500">Loading catalog items...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-800">No Products Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const imgUrl =
                product.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80";
              const isWishlisted = wishlist.some((w) => w.id === product.id);
              const isOutOfStock = (product.stock ?? 1) <= 0;
              const qty = cartQuantities[product.id] || 0;
              const productUrl = `/product/${product.slug || product.id}`;

              return (
                <Link
                  key={product.id}
                  href={productUrl}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
                >
                  <div className="relative aspect-square bg-slate-50 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={product.title}
                      className={`w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300 ${
                        isOutOfStock ? "grayscale opacity-60" : ""
                      }`}
                    />
                    
                    {isOutOfStock && (
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        OUT OF STOCK
                      </span>
                    )}

                    <button
                      onClick={(e) => handleWishlistToggle(product, e)}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-xs rounded-full border border-slate-100 shadow-2xs hover:bg-white text-slate-700 hover:text-red-500 transition cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {product.category?.name || "Gadget"}
                    </p>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2 min-h-8 group-hover:text-emerald-600 transition">
                      {product.title}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="font-black text-sm text-slate-900">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controller / Add Button */}
                      {isOutOfStock ? (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-xl">
                          Sold Out
                        </span>
                      ) : qty > 0 ? (
                        <div
                          onClick={(e) => e.preventDefault()}
                          className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-xs"
                        >
                          <button
                            onClick={(e) => handleUpdateCartQty(product, -1, e)}
                            className="p-1.5 hover:bg-emerald-700 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-black">{qty}</span>
                          <button
                            onClick={(e) => handleUpdateCartQty(product, 1, e)}
                            className="p-1.5 hover:bg-emerald-700 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleUpdateCartQty(product, 1, e)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black transition flex items-center gap-1 border border-emerald-200 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-600" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Loader2, 
  Sparkles,
  Check
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductImage {
  url: string;
}

interface ProductCategory {
  name: string;
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

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [addedId, setAddedId] = useState<string | null>(null);

  const cart = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  const rawCategories = products
    .map((p) => p.category?.name)
    .filter((name): name is string => typeof name === "string" && Boolean(name));

  const categories = ["ALL", ...Array.from(new Set(rawCategories))];

  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === "ALL" || item.category?.name === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    cart.addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
      quantity: 1,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleWishlistToggle = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              Trending Catalog <Sparkles className="w-5 h-5 text-emerald-600" />
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Explore gadgets, smart accessories and home essentials.
            </p>
          </div>

          {/* Search bar */}
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

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
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
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No products matching your selected category or query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const imgUrl =
                product.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80";
              const isWishlisted = wishlist.some((w) => w.id === product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="relative aspect-square bg-slate-50 overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={(e) => handleWishlistToggle(product, e)}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-xs rounded-full border border-slate-100 shadow-2xs hover:bg-white text-slate-700 hover:text-red-500 transition cursor-pointer"
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {product.category?.name || "Gadget"}
                    </p>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2 min-h-8">
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

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          addedId === product.id
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {addedId === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
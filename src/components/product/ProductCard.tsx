/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Minus, ShoppingBag, Heart } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images?: any[];
    image?: string;
    stock?: number;
    badge?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [qty, setQty] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const rawStock = Number(product.stock);
  const stockAvailable = !isNaN(rawStock) && rawStock >= 0 ? rawStock : 10;
  
  // STRICT FALLBACK TO /logo.png IF NO IMAGE EXISTS
  const imgUrl =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image ||
    "/logo.png";

  const effectiveOriginalPrice = product.originalPrice && Number(product.originalPrice) > Number(product.price) 
    ? Number(product.originalPrice) 
    : Math.round(Number(product.price) * 1.35);

  const discountPercent = Math.round(((effectiveOriginalPrice - Number(product.price)) / effectiveOriginalPrice) * 100);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cb_cart") || "[]");
      const item = savedCart.find((i: any) => i.productId === product.id || i.id === product.id);
      if (item) {
        const currentStoredQty = item.quantity || 0;
        const clamped = currentStoredQty > 9 ? 9 : currentStoredQty;
        setQty(clamped);
      }

      const savedWishlist = JSON.parse(localStorage.getItem("cb_wishlist") || "[]");
      if (savedWishlist.some((i: any) => i.id === product.id || i.slug === product.slug)) {
        setIsWishlisted(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [product.id, product.slug]);

  const updateCardCart = (newQty: number) => {
    if (newQty < 0) newQty = 0;

    if (newQty > 9) {
      alert("Aap ek order mein maximum 9 quantity hi add kar sakte hain.");
      return;
    }

    if (newQty > stockAvailable) {
      alert(`Maaf kijiye, inventory mein sirf ${stockAvailable} items available hain.`);
      return;
    }

    try {
      const existing = localStorage.getItem("cb_cart");
      let cart = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(cart)) cart = [];

      const index = cart.findIndex((i: any) => i.productId === product.id || i.id === product.id);

      if (newQty === 0) {
        if (index > -1) cart.splice(index, 1);
      } else {
        const cartItem = {
          id: product.id,
          productId: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          originalPrice: effectiveOriginalPrice,
          image: imgUrl,
          quantity: newQty,
          stock: product.stock,
        };

        if (index > -1) {
          cart[index].quantity = newQty;
        } else {
          cart.push(cartItem);
        }
      }

      localStorage.setItem("cb_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      setQty(newQty);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const savedWishlist = JSON.parse(localStorage.getItem("cb_wishlist") || "[]");
      let updated = [];
      if (isWishlisted) {
        updated = savedWishlist.filter((i: any) => i.id !== product.id && i.slug !== product.slug);
        setIsWishlisted(false);
      } else {
        updated = [...savedWishlist, { id: product.id, slug: product.slug, title: product.title, price: product.price, image: imgUrl }];
        setIsWishlisted(true);
      }
      localStorage.setItem("cb_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 relative flex flex-col justify-between shadow-2xs group">
      <Link href={`/product/${product.slug || product.id}`} className="space-y-3 block">
        <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative">
          <img
            src={imgUrl}
            alt={product.title}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
          />
          
          <button
            type="button"
            onClick={toggleWishlist}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full border shadow-xs transition cursor-pointer z-10 backdrop-blur-xs ${
              isWishlisted ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white/90 border-slate-200 text-slate-600 hover:text-rose-600"
            }`}
            title="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-rose-600" : ""}`} />
          </button>

          {/* EXACT TOP-LEFT CORNER RED DISCOUNT BADGE */}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs z-20">
              {discountPercent}% OFF
            </span>
          )}

          {product.badge && (
            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
              {product.badge}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xs font-black text-slate-950 line-clamp-2 leading-snug">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-black text-slate-950">₹{product.price}</span>
            <span className="text-xs text-slate-400 line-through font-bold">₹{effectiveOriginalPrice}</span>
          </div>
        </div>
      </Link>

      <div className="pt-3 mt-2 border-t border-slate-100">
        {qty === 0 ? (
          <button
            type="button"
            onClick={() => updateCardCart(1)}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Add
          </button>
        ) : (
          <div className="w-full flex items-center justify-between bg-emerald-600 rounded-xl p-1 text-white shadow-xs">
            <button
              type="button"
              onClick={() => updateCardCart(qty - 1)}
              className="w-8 h-8 bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center justify-center text-white cursor-pointer font-black transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black">{qty}</span>
            <button
              type="button"
              onClick={() => updateCardCart(qty + 1)}
              disabled={qty >= stockAvailable || qty >= 9}
              className="w-8 h-8 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 rounded-lg flex items-center justify-center text-white cursor-pointer font-black transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
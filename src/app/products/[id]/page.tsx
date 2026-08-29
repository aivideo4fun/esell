"use client";

import { useParams, useRouter } from "next/navigation";
import { FEATURED_PRODUCTS } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import { Star, ShieldCheck, Truck, RotateCcw, Zap, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Find product from constants
  const product = FEATURED_PRODUCTS.find((p) => p.id === id) || FEATURED_PRODUCTS[0];
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium capitalize">{product.category}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Left: Product Image */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-100 bg-white p-4">
          {product.badge && (
            <span className="absolute top-6 left-6 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
              {product.badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.title}
            className="w-full aspect-square object-cover rounded-2xl"
          />
        </div>

        {/* Right: Product Buy Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-gray-600 font-normal">({product.rating} rating from verified buyers)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-950">₹{product.price}</span>
                <span className="text-base text-gray-400 line-through">₹{product.originalPrice}</span>
                <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-0.5 rounded-full">
                  Save {discount}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes + Free shipping across India</p>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 px-6 rounded-2xl bg-white border-2 border-gray-900 text-gray-950 font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              {added ? <Check className="w-5 h-5 text-green-600" /> : <ShoppingBag className="w-5 h-5" />}
              {added ? "Added to Bag" : "Add to Bag"}
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Zap className="w-5 h-5 fill-white" />
              Prepaid Checkout
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="border-t border-gray-100 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <div className="text-xs">
                <p className="font-semibold text-gray-900">100% Safe</p>
                <p className="text-gray-500">Secure Prepaid</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <Truck className="w-5 h-5 text-blue-600" />
              <div className="text-xs">
                <p className="font-semibold text-gray-900">Fast Dispatch</p>
                <p className="text-gray-500">Tracked Delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <RotateCcw className="w-5 h-5 text-blue-600" />
              <div className="text-xs">
                <p className="font-semibold text-gray-900">7 Days Return</p>
                <p className="text-gray-500">Defect Protection</p>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Highlights</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Engineered with premium quality and durable build materials.</li>
              <li>Tested for reliable performance and hassle-free operation.</li>
              <li>Carefully packed and dispatched via trusted Indian logistics partners.</li>
              <li>Full customer support assistance over WhatsApp after dispatch.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
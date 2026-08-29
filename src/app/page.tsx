import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Award, Headphones } from "lucide-react";
import { CATEGORIES, FEATURED_PRODUCTS, TRUST_POINTS } from "@/lib/constants";
import ProductCard from "@/components/product/ProductCard";

export default function Home() {
  const trustIcons = [ShieldCheck, Truck, Award, Headphones];

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-blue-600 bg-blue-50 uppercase mb-6">
            Curated For Everyday Living
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            DISCOVER SOMETHING <br />
            <span className="text-blue-600">YOU&apos;LL LOVE</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Premium trending lifestyle, gadgets, home &amp; car essentials. Delivered securely across India with 100% prepaid safety.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gray-950 text-white font-medium px-8 py-3.5 rounded-full hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-gray-950/10"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Shop Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-950">Shop by Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Explore our handpicked collection</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Trending Now (Featured Products) */}
      <section id="trending" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950">Trending Now</h2>
            <p className="text-sm text-gray-500 mt-1">Most loved products this week</p>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Why CatchBuddy? (Trust Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950">Why Shop With CatchBuddy?</h2>
            <p className="text-sm text-gray-500 mt-1">Fast, reliable, and genuine prepaid e-commerce experience</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_POINTS.map((point, index) => {
              const Icon = trustIcons[index];
              return (
                <div key={point.title} className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base">{point.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{point.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
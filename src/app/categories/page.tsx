import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-950">Shop by Categories</h1>
        <p className="text-sm text-gray-600 mt-1">Browse our handpicked collections</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="flex items-center justify-between p-6 rounded-3xl bg-white border border-gray-200 hover:border-blue-600 hover:shadow-lg transition group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{cat.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-950 group-hover:text-blue-600 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium">Explore Collection</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
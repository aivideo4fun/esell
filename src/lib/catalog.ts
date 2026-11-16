export function cleanCatalogText(value: unknown) {
  return String(value ?? "").replace(/ï¿½|�|Â(?=\s)|â€™/g, " ").replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ").trim();
}
export function categoryName(value: unknown) {
  const name = cleanCatalogText(value).replace(/\bstationary\b/i, "Stationery").replace(/\bwomens\b/i, "Women's");
  const aliases: Record<string, string> = { "trending gadgets": "Gadgets", "daily": "Daily Essentials", "home accessories": "Home Accessories", "beauty and accessories": "Beauty & Accessories" };
  return aliases[name.toLowerCase()] || name;
}
export function categoryIcon(name: string) {
  const n = name.toLowerCase();
  for (const [pattern, icon] of [[/remote/, "🎛️"], [/cable|phone|gadget|electronic/, "🔌"], [/beauty|hair|personal/, "🧴"], [/kitchen/, "🍳"], [/clean|laundry/, "🧹"], [/pet/, "🐾"], [/sport|fitness/, "🎾"], [/car|vehicle/, "🚗"], [/lamp|light/, "💡"], [/toy|kid/, "🧸"], [/cloth|wear|fashion|sock|pant|slip/, "👕"], [/bag|storage|organis/, "👜"], [/jewel/, "💍"], [/station|keychain/, "✏️"], [/home|bed/, "🏠"]] as const) {
    if (pattern.test(n)) return icon;
  }
  return "🛍️";
}
export function formatCategory<T extends { name: string; icon?: string | null }>(category: T) {
  const name = categoryName(category.name);
  return { ...category, name, icon: category.icon && category.icon !== "📦" && !category.icon.includes("�") ? category.icon : categoryIcon(name) };
}
export function validProductImage(url: unknown): url is string {
  return typeof url === "string" && !!url.trim() && url !== "/logo.png" && !url.includes("unsplash.com") && (/^https:\/\//.test(url) || /^\/(?!\/)/.test(url) || /^data:image\/(png|jpeg|webp);base64,/.test(url));
}
export function formatProduct<T extends { title: string; description?: string | null; images?: { url: string; isPrimary?: boolean }[]; category?: { name: string; icon?: string | null } | null; reviews?: { rating: number }[] }>(product: T) {
  const reviews = product.reviews || [];
  return {
    ...product, title: cleanCatalogText(product.title), description: cleanCatalogText(product.description),
    images: (product.images || []).filter((image) => validProductImage(image.url)).sort((a, b) => Number(!!b.isPrimary) - Number(!!a.isPrimary)),
    category: product.category ? formatCategory(product.category) : product.category,
    rating: reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
    reviewCount: reviews.length,
  };
}

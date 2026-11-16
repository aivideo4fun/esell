import { prisma } from "@/lib/prisma";
export async function removeCategory(id: string) {
  return prisma.$transaction(async (tx) => {
    const products = await tx.product.count({ where: { categoryId: id } });
    const children = await tx.category.count({ where: { parentId: id } });
    if (products || children) throw new Error(`Move the ${products} linked products and ${children} subcategories before deleting this category`);
    await tx.category.delete({ where: { id } });
  }, { isolationLevel: "Serializable" });
}

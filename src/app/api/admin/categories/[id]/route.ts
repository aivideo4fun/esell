import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await props.params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID missing" }, { status: 400 });
    }

    // 1. Unlink child categories (parentId)
    try {
      await (prisma.category as any).updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });
    } catch {}

    // 2. Unlink products (Foreign key constraint solve)
    try {
      await (prisma.product as any).updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    } catch {}

    // 3. Disconnect many-to-many relation
    try {
      await prisma.category.update({
        where: { id },
        data: { products: { set: [] } },
      });
    } catch {}

    // 4. Delete the category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Category DB Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Unlink products
    try {
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    } catch {}

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error deleting category" },
      { status: 500 }
    );
  }
}
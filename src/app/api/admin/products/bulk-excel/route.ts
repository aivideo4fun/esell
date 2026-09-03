import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Please upload an Excel file (.xlsx or .xls)" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read workbook
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // 1. Sheet: Products
    const productsSheetName = workbook.SheetNames.find((s) =>
      s.toLowerCase().includes("product")
    );

    if (!productsSheetName) {
      return NextResponse.json(
        { success: false, error: "Invalid Excel format: 'Products' sheet not found." },
        { status: 400 }
      );
    }

    const productsRaw: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[productsSheetName]);

    // 2. Sheet: AdditionalImages (if available)
    const imagesSheetName = workbook.SheetNames.find((s) =>
      s.toLowerCase().includes("additionalimage")
    );
    const additionalImagesRaw: any[] = imagesSheetName
      ? XLSX.utils.sheet_to_json(workbook.Sheets[imagesSheetName])
      : [];

    // Group additional images by product_id
    const additionalImageMap = new Map<string, string[]>();
    for (const imgRow of additionalImagesRaw) {
      const pId = String(imgRow.product_id || "");
      const url = imgRow.image || imgRow.image_url;
      if (pId && url) {
        if (!additionalImageMap.has(pId)) {
          additionalImageMap.set(pId, []);
        }
        additionalImageMap.get(pId)!.push(String(url).trim());
      }
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const row of productsRaw) {
      const excelProductId = String(row.product_id || "");
      const title = row["name(en-gb)"] || row.name || row.title;
      const price = parseFloat(row.price || 0);

      if (!title || isNaN(price) || price <= 0) {
        skippedCount++;
        continue;
      }

      const sku = String(row.sku || "").trim();
      const stock = parseInt(row.quantity || 10);
      const categoryName = row.model || row.manufacturer || "Gadgets & Utilities";
      const description = row["description(en-gb)"] || row.description || "";
      const primaryImage = row.image_name ? String(row.image_name).trim() : null;

      // Unique slug generate karein
      const cleanSlugBase = String(title)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .slice(0, 50);
      const slug = `${cleanSlugBase}-${excelProductId || Date.now().toString().slice(-4)}`;

      // Calculate Original Market Price (e.g. 40% higher)
      const originalPrice = Math.round(price * 1.45);

      // Collect all images (primary + additional)
      const allImageUrls: string[] = [];
      if (primaryImage) allImageUrls.push(primaryImage);

      if (excelProductId && additionalImageMap.has(excelProductId)) {
        for (const addUrl of additionalImageMap.get(excelProductId)!) {
          if (!allImageUrls.includes(addUrl)) {
            allImageUrls.push(addUrl);
          }
        }
      }

      // Upsert Category
      let categoryRecord: any = null;
      if (categoryName) {
        try {
          categoryRecord = await prisma.category.findFirst({
            where: { name: { equals: categoryName, mode: "insensitive" } },
          });
          if (!categoryRecord) {
            categoryRecord = await prisma.category.create({
              data: {
                name: categoryName,
                slug: categoryName.toLowerCase().replace(/[\s_]+/g, "-"),
              },
            });
          }
        } catch {
          // silent fallback
        }
      }

      // Upsert Product in Database
      const product = await prisma.product.create({
        data: {
          title: String(title).trim(),
          slug,
          sku: sku || undefined,
          price,
          originalPrice,
          stock: isNaN(stock) ? 10 : stock,
          description: String(description).replace(/<[^>]*>?/gm, "").trim(), // Strip HTML tags cleanly
          categoryId: categoryRecord?.id || null,
          images: {
            create: allImageUrls.map((url, idx) => ({
              url,
              isPrimary: idx === 0,
            })),
          },
        },
      });

      if (product) addedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${addedCount} products with images! (${skippedCount} skipped)`,
      addedCount,
      skippedCount,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to parse Excel file";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
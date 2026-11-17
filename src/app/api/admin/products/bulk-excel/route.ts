import { cleanCatalogText } from "@/lib/catalog";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ success: false, error: "Spreadsheet must be under 5 MB" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Uploaded file is empty" }, { status: 400 });
    }

    if (rows.length > 10000) return NextResponse.json({ success: false, error: "Import at most 10,000 rows at once" }, { status: 400 });

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const title = cleanCatalogText(row["Title"] || row["title"]);
      if (!title) continue;

      const categoryName = cleanCatalogText(row["Product Category"] || row["Category"] || "General");
      const sku = row["Variant SKU"] || row["SKU"] || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const price = parseFloat(row["Price"] || row["price"] || "0");
      // Original price ko thoda zyada set kar dete hain agar available na ho taaki discount dikh sake
      const originalPrice = Number(row["MRP"] || row["Original Price"] || row["Compare At Price"] || price);
      const stock = Number(row["Quantity"] ?? row["quantity"] ?? 0);
      if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(originalPrice) || originalPrice < price || !Number.isSafeInteger(stock) || stock < 0) { skippedCount++; continue; }
      const description = cleanCatalogText(row["Body (HTML)"] || row["Description"] || "");
      const color = row["Color"] || "";
      const weight = row["Weight (gm)"] || "";

      // Slug generate karna
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 10000);

      // 1. Category find ya create karna
      let categorySlug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      let category = await prisma.category.findFirst({
        where: { OR: [{ name: categoryName }, { slug: categorySlug }] },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: categorySlug,
          },
        });
      }

      // 2. Images collect karna (Image 1 se Image 9 tak)
      const images: string[] = [];
      for (let i = 1; i <= 9; i++) {
        const imgUrl = row[`Image ${i}`];
        if (imgUrl && typeof imgUrl === "string" && imgUrl.trim().startsWith("http")) {
          images.push(imgUrl.trim());
        }
      }

      for (const key of ["Image Src", "Image URL", "ImageUrl", "imageUrls", "imageUrl", "Images", "Main Image", "Photo"] ) {
        const cell = row[key];
        if (typeof cell === "string") for (const candidate of cell.split(/[|,\n]/)) {
          const url = candidate.trim();
          if (/^https?:\/\//.test(url) && !images.includes(url)) images.push(url);
        }
      }
      // Colors array
      const colorsList = color ? [color.trim()] : [];

      // 3. Product check karna SKU ke basis par
      const existingProduct = await prisma.product.findUnique({
        where: { sku: String(sku) },
      });

      if (existingProduct) {
        // Update product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            title,
            description,
            price,
            originalPrice,
            stock,
            categoryId: category.id,
            colors: colorsList,
            ...(images.length ? { images: {
              deleteMany: {},
              create: images.map((url, idx) => ({ url, isPrimary: idx === 0 })),
            } } : {}),
          },
        });
        updatedCount++;
      } else {
        // Create new product
        await prisma.product.create({
          data: {
            title,
            slug,
            sku: String(sku),
            description,
            price,
            originalPrice,
            stock,
            categoryId: category.id,
            colors: colorsList,
            images: {
              create: images.map((url, idx) => ({
                url,
                isPrimary: idx === 0,
              })),
            },
          },
        });
        importedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      skippedCount,
      message: `Skipped ${skippedCount} invalid rows. Successfully imported ${importedCount} new products and updated ${updatedCount} products.`,
    });
  } catch (error: any) {
    console.error("Bulk excel upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process excel file" },
      { status: 500 }
    );
  }
}
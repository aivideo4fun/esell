import { validProductImage, cleanCatalogText } from "@/lib/catalog";
export function numberField(value: unknown, name: string, minimum = 0, integer = false) {
  if (value === "" || value === null || value === undefined || typeof value === "boolean") throw new Error(`${name} is required`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || (integer && !Number.isSafeInteger(parsed))) throw new Error(`Invalid ${name}`);
  return parsed;
}
export function textField(value: unknown, name: string, max = 200, allowEmpty = false) {
  if (typeof value !== "string" || value.length > max || (!allowEmpty && !value.trim())) throw new Error(`Invalid ${name}`);
  return cleanCatalogText(value);
}
export function productInput(body: Record<string, unknown>, partial = false) {
  const data: Record<string, any> = {};
  for (const key of ["title", "description", "badge", "sku"] as const) {
    if (body[key] !== undefined) data[key] = textField(body[key], key, key === "description" ? 20000 : 300, key !== "title");
  }
  if (!partial && !data.title) throw new Error("Product title is required");
  for (const key of ["price", "originalPrice", "stock"] as const) {
    if (body[key] !== undefined && !(key === "originalPrice" && body[key] === "")) data[key] = numberField(body[key], key, key === "stock" ? 0 : 0.01, key === "stock");
  }
  if (!partial && data.price === undefined) throw new Error("Price is required");
  if (data.originalPrice !== undefined && data.price !== undefined && data.originalPrice < data.price) throw new Error("Original price cannot be less than selling price");
  for (const key of ["sizes", "colors"] as const) if (body[key] !== undefined) {
    if (!Array.isArray(body[key]) || (body[key] as unknown[]).length > 30) throw new Error(`Invalid ${key}`);
    data[key] = [...new Set((body[key] as unknown[]).map((v) => textField(v, key, 50)))];
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") throw new Error("Invalid active status");
    data.isActive = body.isActive;
  }
  if (body.imageUrls !== undefined) {
    if (!Array.isArray(body.imageUrls) || body.imageUrls.length > 9 || !body.imageUrls.every(validProductImage)) throw new Error("Use at most 9 valid HTTPS, local or uploaded product photos");
    data.imageUrls = body.imageUrls;
  }
  return data;
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export const orderTransitions: Record<string, string[]> = {
  PENDING: ["CANCELLED"], PAID: ["PROCESSING", "CANCELLED"], PROCESSING: ["SHIPPED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"], PAYMENT_REVIEW: ["PROCESSING", "CANCELLED"],
  SHIPPED: ["DELIVERED"], DELIVERED: ["RETURN_REQUESTED"], RETURN_REQUESTED: ["RETURN_APPROVED", "RETURN_REJECTED"],
  RETURN_APPROVED: ["RETURN_PICKUP", "RETURNED"], RETURN_REJECTED: ["RETURN_REQUESTED"], RETURN_PICKUP: ["RETURNED"], RETURNED: [], REFUNDED: [], CANCELLED: [], PAYMENT_FAILED: [],
};
export function validateOrderTransition(current: string, next: string, paymentStatus: string) {
  if (current === next) return;
  if (!(orderTransitions[current] || []).includes(next)) throw new Error(`Cannot change ${current} to ${next}`);
  if (["PROCESSING", "SHIPPED", "DELIVERED"].includes(next) && paymentStatus !== "SUCCESS") throw new Error("A verified paid order is required before fulfilment");
}

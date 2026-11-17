import { prisma } from "@/lib/prisma";
import ProductPage from "@/app/product/[slug]/page";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let page = null;
  try { page = await prisma.staticPage.findUnique({ where: { slug } }); } catch { /* Product client handles availability errors. */ }
  if (page?.status === "ACTIVE") return <article className="max-w-4xl mx-auto px-5 py-10 space-y-5"><h1 className="text-3xl font-bold">{page.title}</h1><div className="whitespace-pre-wrap leading-relaxed">{page.content}</div></article>;
  return <ProductPage params={Promise.resolve({ slug })} />;
}

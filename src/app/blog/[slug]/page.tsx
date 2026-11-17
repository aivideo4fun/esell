import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cleanCatalogText } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } }); if (!post || post.status !== "PUBLISHED") notFound();
  return <article className="max-w-4xl mx-auto px-5 py-10 space-y-5"><h1 className="text-3xl font-bold">{post.title}</h1><p>{post.author} · {post.createdAt.toLocaleDateString("en-IN")}</p><div className="whitespace-pre-wrap leading-relaxed">{cleanCatalogText(post.content)}</div></article>;
}

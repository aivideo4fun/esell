import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Blog() {
  const posts = await prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, select: { title: true, slug: true, category: true }, take: 100 });
  return <section className="max-w-4xl mx-auto p-6 space-y-5"><h1 className="text-3xl font-bold">CatchBuddy guides</h1>{posts.length ? posts.map((p) => <Link key={p.slug} href={`/blog/${p.slug}`} className="block bg-white border rounded-xl p-5"><h2 className="font-bold">{p.title}</h2><p>{p.category}</p></Link>) : <p>No guides published yet.</p>}</section>;
}

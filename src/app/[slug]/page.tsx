import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaticPageView({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();

  // Database se page dhoondein
  const page = await (prisma as any).staticPage.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (!page || page.status !== "ACTIVE") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-12 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 capitalize">
              {page.title}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> CatchBuddy Official Policy
            </span>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
            {page.content}
          </div>

          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
            Last Updated: {new Date(page.updatedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
}
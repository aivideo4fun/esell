import { readConfig } from "@/lib/admin-config";
import { faqDefaults } from "@/lib/faq-defaults";
export const dynamic = "force-dynamic";
export default async function FAQ() {
  let config = faqDefaults; try { config = await readConfig("FAQ", faqDefaults); } catch {}
  return <section className="max-w-4xl mx-auto p-6 space-y-5"><h1 className="text-3xl font-bold">Frequently asked questions</h1>{config.items.map((item) => <details key={item.id} className="bg-white border rounded-xl p-5"><summary className="font-semibold cursor-pointer">{item.question}</summary><p className="pt-3 leading-relaxed">{item.answer}</p></details>)}</section>;
}

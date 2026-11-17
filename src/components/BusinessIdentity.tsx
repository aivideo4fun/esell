import { storeInfo } from "@/lib/store-info";

export default function BusinessIdentity() {
  return (
    <section aria-label="Registered business and GST details" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6 text-slate-900 space-y-3 break-words">
      <h2 className="text-base font-black">Business &amp; GST Details</h2>
      <p className="text-sm">CatchBuddy is operated by <strong>{storeInfo.tradeName}</strong>.</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-semibold text-slate-600">Legal name / Proprietor</dt><dd>{storeInfo.legalName}</dd></div>
        <div><dt className="font-semibold text-slate-600">GSTIN</dt><dd className="font-mono text-base font-bold tracking-wide select-all">{storeInfo.gstin}</dd></div>
      </dl>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 text-sm font-semibold">
        <a href={`mailto:${storeInfo.supportEmail}`} className="underline">{storeInfo.supportEmail}</a>
        <a href={storeInfo.supportPhoneHref} className="underline">{storeInfo.supportPhone}</a>
      </div>
    </section>
  );
}

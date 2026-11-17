# CatchBuddy security and update report

Scope: source review, regression checks and local production-server checks on 16 November 2026. This is not a production penetration test or a guarantee that all vulnerabilities are absent.

## Confirmed corrections

| Area | Result |
|---|---|
| Registered address | Removed from public business blocks and public shared configuration. Retained only in authenticated invoice data. |
| GST/support | JPC DIGITAL VENTURES; Lokesh Saran; 08MSOPS4751E1Z0; support@catchbuddy.in; +91 6350108713. |
| Admin authentication | Signed expiring sessions; no built-in fallback credentials; active middleware included in production build. |
| Customer authentication | Signed sessions, account-state checks, password-change invalidation and verified Firebase phone proof. |
| Customer data access | Session ownership required for orders, invoices, saved addresses, profile, tickets and returns. |
| Payments | Database prices and stock checks; signed gateway verification; matching captured amount/currency/order; idempotent finalization and signed webhook recovery. |
| Reviews | Delivered paid-order proof, real session author, approved-review averages and no fake examples/ratings. |
| Catalog | Broken-text cleanup, category-name deduplication, relevant icons, clear missing-photo fallback and real photo gallery. |
| Import | Additional supplier image-column formats; no erasing existing photos when incoming images are absent; upload limits. |
| Shopping flow | Public storefront reads do not use admin APIs; missing Razorpay route aliases added; free prepaid delivery consistent across cart and checkout. |
| Contact/returns | Matching support details/hours; support tickets persist; one canonical policy with disclosed variable charges. |
| Windows setup | Full source ZIP and self-contained PowerShell runner; no project-folder moves or Read-Host paste traps. |

## Validation

- Clean npm ci from the included lockfile.
- TypeScript checked by the production build.
- scripts/check-security.cjs: session forgery, roles, missing signing secret, password-change invalidation, server price/quantity/stock checks, coupon expiry/caps, variants, signature tampering, review authorization and failed persistence.
- scripts/check-payment-flows.cjs: payment ownership, HMAC, amount mismatch, authorized-versus-captured state, replay/idempotency, and webhook signatures.
- scripts/check-http.cjs: compiled production middleware, anonymous denial, signed admin access, forged legacy cookies, cross-site writes and public GST/address visibility.
- Dependency audit: initial 30 findings (2 critical, 14 high, 14 moderate); updated dependency tree has 0 critical, 0 high and 8 moderate findings, all in development lint tooling (ESLint/TypeScript-ESLint/minimatch). No production dependency has a reported high or critical issue in this audit snapshot.
- Next.js updated to 15.5.29; the runtime PostCSS dependency is overridden to a patched 8.5.x release. SheetJS uses the official 0.20.3 distribution. Capacitor asset tools updated to 4.x; gRPC uses a patched 1.14.x release.

## Required before production

1. Configure a private PostgreSQL connection, a random JWT_SECRET, explicit admin credentials and SITE_URL=https://catchbuddy.in. Existing unsigned sessions must sign in again. Do not reuse test secrets.
2. Configure Firebase project settings, actual SMS delivery and authorized domains. Confirm signup/reset against your test accounts.
3. Configure the Razorpay account and capture settings. Register /api/checkout/webhook for payment.captured using the same private webhook secret as the server. Test with Razorpay test mode before a production deployment.
4. Test real database transactions, gateway credentials, email delivery and mobile checkout in staging. No real payment, production DB write, email, SMS or WhatsApp notification was sent during this review.
5. Review PAYMENT_REVIEW orders for manual fulfilment/refund if stock changes while a customer pays. This package does not automatically refund charges or expire abandoned pending orders.
6. Product photos, exact specifications, compatibility, warranty duration and per-product return charges were not supplied. The code supports and explains these fields/flows, but does not invent facts or genuine product images. Upload supplier-provided data in admin.
7. Invoice tax/HSN classification and historical invoice snapshots need a separate accounting review; this update does not certify tax calculations based on the old title-based mapping.
8. Apply appropriate production reverse-proxy rate limits and operational monitoring. Database-backed attempt limits are approximate during concurrent requests. The remaining moderate lint-tool advisories and Android packaging should be addressed/tested separately; an Android release build was not validated here.

## Deployment status

Changes are local and included in the ZIP. No GitHub push, merge, production deployment, live account permission change or external message was performed.


## Admin workflow follow-up

- Added product detail GET/PUT, actual product edit/photo-upload screen, numeric/variant/image validation and zero-stock support. Product retirement now archives listings and retains historical orders.
- Homepage hero/deal IDs, checkout shipping/prepaid rules, footer links, FAQ and SEO now persist using the existing PostgreSQL ActivityLog table. This requires no schema migration. Public readers consume those saved values; SEO metadata can refresh on the existing 60-second revalidation interval.
- Added dedicated admin support API compatibility for id/ticketId, status validation, normalized legacy names and ticket counts. Customer-facing APIs remain isolated.
- Customer block/unblock updates the actual isActive column and cannot target an administrator. The nonexistent isBlocked User field was removed.
- Added order lifecycle checks, paid-order/AWB requirements before shipping, and optimistic guards against overwriting a concurrently changed order. Return pickup/rejection states follow the same lifecycle.
- Revenue and product/category analytics exclude unpaid checkout drafts. The invented 28% profit assumption and hardcoded revenue growth were removed. Actual costs are still needed for profit reporting.
- Refund verification now requires a processed full Razorpay refund ID for the same payment and amount. It records an existing gateway refund; it does not initiate a refund or bank transfer. Manual SUCCESS/REFUNDED payment status overrides are rejected.
- Category deletion refuses linked products/subcategories instead of moving products to a random category. Review statuses and coupon values/dates are validated. Automatic age-based product deletion is disabled.
- Supplier payout pages describe accounting records, not bank transfers. Duplicate demo finance/support screens redirect to the functional screens. Staff roles and expense accounting are explicitly identified as not implemented rather than showing example accounts or profits.
- CSV reports now download real database records and escape spreadsheet formulas. Live courier lookup uses recorded order/AWB details and does not invent tracking numbers.
- New FAQ and plain-text custom/blog pages render saved content. Admin GET requests no longer seed made-up policy records. Saved built-in policy conflicts are rejected with a clear explanation.
- Existing notification broadcasts appear in the customer notification API. Abandoned-cart actions open manual WhatsApp drafts; the server does not claim a message was sent.
- Start-CatchBuddy.ps1 now passes --allow-remote=root for the official SheetJS dependency with npm 12+. This is command-scoped; global npm policy is unchanged.

Validation: production build, TypeScript, 84 literal/template frontend API route-method contracts, mocked admin validation/configuration/ticket/refund-guard tests, existing auth/payment regressions and local HTTP authorization checks. Real PostgreSQL persistence across server restarts and real Razorpay/Firebase/email operations still require staging validation with the owner's credentials. No production data, external message or financial transfer was changed during this work.

Local development uses its own request origin for CSRF checks even when a copied .env contains the production SITE_URL; production still validates against the configured SITE_URL.

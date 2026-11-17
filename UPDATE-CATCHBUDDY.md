# CatchBuddy updated source — 16 November 2026

This is the full source project, including package.json, package-lock.json and Start-CatchBuddy.ps1. It is not a patch-only ZIP. Extract into a NEW folder; keep your old checkout and private .env backup. No production deployment is performed by this package.

## Local Windows setup

Use Node.js 22 LTS or newer. Open PowerShell in the extracted folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-CatchBuddy.ps1
```

On first run the script creates a private .env file and generates a signing secret locally. Configure your own DATABASE_URL, admin credentials, Firebase, Razorpay and email settings in that file; then rerun the script. Do not send the .env file, passwords or API secrets to anyone. The runner checks each command and stops on the first failure. It never downloads a different Prisma version through an unpinned npx prompt.

The PostgreSQL database must already contain this project's schema. This update uses existing tables and does not require a schema migration. For a completely new empty development database, initialize it separately with the project Prisma schema after checking that it is the correct database. Do not point local tests at a production database.

## Business identity and requested design changes

- Public footer, Contact and Terms display JPC DIGITAL VENTURES, proprietor Lokesh Saran, GSTIN 08MSOPS4751E1Z0, support@catchbuddy.in and +91 6350108713.
- The requested registered-address block is removed from public pages and the shared public configuration. The address remains only in the authenticated invoice seller response and invoice, not the public footer/contact page or shared browser bundle.
- Homepage WhatsApp, telephone links and default support settings use the new number. Support timing is Mon–Sat, 10 AM–7 PM IST.
- Product photos prefer the real primary image; thumbnails switch photos. Logo/unrelated stock-photo fallbacks are replaced by an explicit missing-photo placeholder.
- Spreadsheet import accepts Image 1–9, Image Src/Main Image/Photo-style columns and preserves previous images when an update supplies none. Real supplier photographs must still be uploaded: no photos or warranty terms were invented.
- Product pages include available descriptions, variant selection, compatibility/warranty guidance and return information. Specific technical specifications, warranty duration and exact product return fees still require seller-supplied data. Missing values are explicitly disclosed with a support contact.
- Return and Terms pages refer to one canonical policy. Product pages explain the five-day request window, hygiene restrictions and variable charges. Cart/checkout share persisted shipping/prepaid rules, with free delivery by default; COD is unavailable.
- Ratings come from approved actual reviews, with no fake 4.8 fallback or example customers. A signed-in customer must have a delivered paid order before reviewing a product. Review authorship comes from the session.
- Catalog rendering cleans the observed broken characters and HTML import artifacts, deduplicates category names, uses relevant category icons and clamps card titles. This does not destructively merge/delete database categories or alter product IDs/share links.
- The empty homepage hero space now contains category discovery tiles. Supplier photographs can replace these when supplied.

## Security and flow corrections

- Middleware moved beside src/app and confirmed in the production middleware manifest. Old middleware.ts at the root must be removed when upgrading an old checkout; the Windows runner backs it up automatically.
- Admin login now issues the same signed token that middleware verifies. Default admin credentials and static-cookie authentication were removed. Configure ADMIN_EMAIL, ADMIN_PASSWORD and a random JWT_SECRET of at least 32 characters before enabling admin access.
- Customer sessions are signed, expire, honor disabled accounts, and are invalidated after password changes. Old unsigned customer_id cookies are ignored. Existing users must sign in again.
- Firebase SMS proofs are verified server-side, including signature, project, phone/provider and recent authentication. Frontend signup/password reset sends the ID token. Phone-only login/reset shortcuts and development OTP bypasses were removed.
- Order details, invoices, addresses, profile, tickets and return requests are scoped to the authenticated customer. Query email/phone, supplied role or a raw user ID no longer grants access. Customer pages use public/customer APIs rather than admin endpoints.
- Password hashes are not returned in customer order/profile APIs. Profile writes cannot set email-verification flags or change another account by email.
- Server checkout recalculates database prices, quantities, stock, variants and real coupons in paise. Client totals are ignored. Missing Razorpay routes are implemented and old checkout paths delegate to the same flow.
- Orders stay pending until gateway signature, gateway order, payment amount, INR currency and captured status are checked. Repeated verification is idempotent. Stock changes are conditional and cannot become negative.
- Signed payment.captured webhooks recover successful payments after the browser closes. Configure https://catchbuddy.in/api/checkout/webhook in Razorpay with the private RAZORPAY_WEBHOOK_SECRET. Enable automatic capture in the Razorpay account. Never use test payments to validate production orders.
- A paid order whose stock changed during payment is retained as PAYMENT_REVIEW for manual fulfilment/refund. There is no automatic refund or stock-reservation expiry job in this update.
- Auth/email-verification rate buckets use PostgreSQL and work across workers; limits are approximate under simultaneous requests. Configure edge/proxy rate limits for production as well.
- OTPs for email verification are random, hashed, expire, are consumed once, and are not exposed in API responses. Failed delivery does not claim success.
- Support submissions are persisted to SupportTicket; writes fail truthfully. Public abandoned-cart endpoints no longer expose or mutate customer orders. Product upload limits check image bytes/type and count.
- Cross-site mutation requests are rejected. Set SITE_URL=https://catchbuddy.in in production (localhost in local development). The server adds no-store and standard content/referrer/frame headers to matched API/admin responses.
- Next.js was updated within the existing major release, PostCSS patched through an override, and SheetJS replaced with the official 0.20.3 distribution. No forced framework-major upgrade was applied.

## Verification and limits

Run node scripts/check-security.cjs and node scripts/check-payment-flows.cjs. These exercise the actual handlers with mocked database/gateway objects; no real customer records or money are used. Production build, TypeScript and local HTTP authorization checks are recorded in VALIDATION.md.

The package is not a completed penetration test or a guarantee of zero vulnerabilities. Live database/gateway/Firebase credentials were not available, so perform a staging test for signup, password reset, checkout, webhook recovery, delivery, returns and authorized invoices before production. Invoice HSN/GST-rate logic still requires accountant/product-tax confirmation; this package does not certify those calculations. Review DEPENDENCY-AUDIT.md for remaining third-party advisories.

Internal order-alert recipients are separate from the public support number and were not changed. No messages, real orders, payments, refunds, database migrations, GitHub pushes or production deployments were performed.

Detailed validation, security findings and production limitations are in SECURITY-AND-UPDATE-REPORT.md.


### Admin update included

See the Admin workflow follow-up in SECURITY-AND-UPDATE-REPORT.md. New scripts/check-admin.cjs and scripts/check-admin-contracts.cjs cover regression cases and frontend route/method matching. The Windows runner includes the admin tests and the npm remote-package policy correction. Saved settings use the existing ActivityLog table; there is no Prisma migration in this ZIP. Existing .env values remain private and must be retained locally.

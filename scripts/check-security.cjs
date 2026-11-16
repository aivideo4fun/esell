const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
function load(file, mocks = {}) {
 const module = { exports: {} };
 const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
 vm.runInNewContext(code, { module, exports: module.exports, process, Buffer, TextEncoder, URL, Request, Date, crypto: crypto.webcrypto, require: (id) => id in mocks ? mocks[id] : require(id) }, { filename: file });
 return module.exports;
}
const response = { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } };
(async () => {
 process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';
 const sessions = load('src/lib/security/session.ts');
 const admin = await sessions.issueSession('admin', 'ADMIN');
 const customer = await sessions.issueSession('customer-a', 'CUSTOMER');
 assert.equal(await sessions.verifySession(admin, 'ADMIN'), 'admin');
 assert.equal(await sessions.verifySession(customer, 'ADMIN'), null);
 assert.equal(await sessions.verifySession('authenticated_admin_token_2026', 'ADMIN'), null);
 assert.equal(await sessions.verifySession(admin.slice(0, -3) + 'bad', 'ADMIN'), null);
 const previous = process.env.JWT_SECRET; delete process.env.JWT_SECRET;
 assert.equal(await sessions.verifySession(admin, 'ADMIN'), null);
 process.env.JWT_SECRET = previous;
 let active = true, password = 'hash-before-reset', cookieToken;
 const customerSessions = load('src/lib/security/customer.ts', {
  './session': sessions,
  'next/headers': { cookies: async () => ({ get: () => ({ value: cookieToken }) }) },
  '@/lib/prisma': { prisma: { user: { findUnique: async () => ({ id: 'customer-a', isActive: active, password }) } } },
 });
 cookieToken = await customerSessions.issueCustomerSession({ id: 'customer-a', password });
 assert.equal(await customerSessions.getCustomerId(), 'customer-a');
 password = 'hash-after-reset'; assert.equal(await customerSessions.getCustomerId(), null);
 active = false; assert.equal(await customerSessions.getCustomerId(), null);
 console.log('PASS signed sessions, role isolation, forged tokens, missing secret, password-reset invalidation');

 const product = { id: 'p1', price: 482, stock: 3, sizes: [], colors: [] };
 let coupon = null;
 const checkout = load('src/lib/checkout.ts', { '@/lib/store-settings': {getStoreSettings: async()=>({freeShippingThreshold:0,standardDeliveryFee:0,prepaidDiscount:0,enablePrepaidDiscount:false})}, '@/lib/prisma': { prisma: { product: { findFirst: async ({where}) => where.id === 'p1' ? product : null }, coupon: { findFirst: async () => coupon } } } });
 const line = { id: 'p1', quantity: 2, price: 0.01 };
 const quote = await checkout.quoteCart([line]);
 assert.equal(quote.totalPaise, 96400); // Client's price is ignored.
 for (const quantity of [0, -1, 1.5, 10, 4]) await assert.rejects(() => checkout.quoteCart([{ ...line, quantity }]));
 await assert.rejects(() => checkout.quoteCart([line, line]));
 await assert.rejects(() => checkout.quoteCart([{ id: 'missing', quantity: 1 }]));
 product.sizes = ['M']; await assert.rejects(() => checkout.quoteCart([line])); product.sizes = [];
 coupon = { code: 'REAL', validFrom: new Date(0), validTo: null, usageLimit: 2, usageCount: 0, minOrderValue: 0, discountType: 'PERCENTAGE', discountValue: 10, maxDiscount: 20 };
 assert.equal((await checkout.quoteCart([line], 'REAL')).discountPaise, 2000);
 coupon.validTo = new Date(0); await assert.rejects(() => checkout.quoteCart([line], 'REAL'));
 const signature = crypto.createHmac('sha256', 'gateway-secret').update('order_123|pay_123').digest('hex');
 assert.equal(checkout.verifyPaymentSignature('order_123', 'pay_123', signature, 'gateway-secret'), true);
 assert.equal(checkout.verifyPaymentSignature('order_123', 'pay_999', signature, 'gateway-secret'), false);
 assert.equal(checkout.verifyPaymentSignature('order_123', 'pay_123', 'bad', 'gateway-secret'), false);
 console.log('PASS server prices, quantity bounds, stock, duplicate products, variants, coupon cap/expiry and HMAC tampering');

 let userId = null, delivered = true, duplicate = false, failedWrite = false;
 const reviews = load('src/app/api/products/reviews/route.ts', {
  'next/server': response, '@/lib/security/customer': { getCustomerId: async () => userId }, '@/lib/security/rate-limit': { rateLimit: async () => true },
  '@/lib/prisma': { prisma: {
   product: { findFirst: async () => ({ id: 'p1' }) }, orderItem: { findFirst: async () => delivered ? { id: 'item' } : null }, user: { findUniqueOrThrow: async () => ({ name: 'Actual Customer' }) },
   review: { findFirst: async () => duplicate ? { id: 'old' } : null, create: async ({data}) => { if (failedWrite) throw Error(); return {id:'review', ...data}; }, findMany: async ({where}) => { assert.equal(where.status,'APPROVED'); return []; } },
  } },
 });
 const valid = { productId:'p1',userName:'Forged Name',rating:4,comment:'Useful product' };
 const post = (body = valid) => reviews.POST({json:async()=>body});
 assert.equal((await post()).status,401); userId = 'customer-a'; delivered = false;
 assert.equal((await post()).status,403); delivered = true; duplicate = true;
 assert.equal((await post()).status,409); duplicate = false;
 assert.equal((await post({...valid,rating:6})).status,400);
 const saved = await post(); assert.equal(saved.status,201); assert.equal(saved.body.review.customerName,'Actual Customer');
 failedWrite = true; assert.equal((await post()).body.success,false);
 await reviews.GET({url:'https://example.test/api/products/reviews?productId=p1'});
 console.log('PASS review login, delivered-order proof, duplicate rejection, real customer identity, input validation and failed writes');

 const catalog = load('src/lib/catalog.ts');
 assert.equal(catalog.cleanCatalogText('Storage Box� ï¿½'), 'Storage Box');
 assert.equal(catalog.formatProduct({title:'Remote',images:[{url:'/logo.png'}],reviews:[]}).rating,0);
 assert.equal(catalog.formatProduct({title:'Remote',reviews:[{rating:5},{rating:3}]}).rating,4);
 console.log('PASS catalog cleanup and real review averages');
})().catch((error) => { console.error(error); process.exitCode=1; });

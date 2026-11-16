const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
function load(file, mocks) {
 const module = {exports:{}};
 const code = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,process,Buffer,URL,Request,Date,require:(id)=>id in mocks?mocks[id]:require(id)});
 return module.exports;
}
const next = {NextResponse:{json:(body,options)=>({body,status:options?.status||200})}};
(async()=>{
 process.env.RAZORPAY_KEY_ID='test-key';process.env.RAZORPAY_KEY_SECRET='test-secret';
 let customerId='owner',amount=48200,status='captured',stockChanges=0;
 const order={id:'local-order',userId:'owner',totalAmount:482,paymentStatus:'PENDING',orderStatus:'PENDING',orderNumber:'CB-TEST',items:[{productId:'p1',quantity:1}],payments:[{gatewayTxnId:'order_123'}]};
 const api={payments:{fetch:async()=>({order_id:'order_123',currency:'INR',amount,status})},orders:{fetch:async()=>({receipt:'local-order',amount:48200})}};
 const prisma={order:{findFirst:async({where})=>(where.userId&&where.userId!==order.userId)?null:order},$transaction:async(fn)=>fn({
  order:{updateMany:async()=>{if(order.paymentStatus!=='PENDING')return{count:0};order.paymentStatus='SUCCESS';return{count:1}},findUniqueOrThrow:async()=>order,update:async({data})=>Object.assign(order,data)},
  product:{updateMany:async()=>{stockChanges++;return{count:1}}},payment:{updateMany:async()=>{order.payments[0].gatewayTxnId='pay_123';return{count:1}}},coupon:{updateMany:async()=>({count:1})},
 })};
 const checkout=load('src/lib/checkout.ts',{'@/lib/prisma':{prisma},'@/lib/store-settings':{getStoreSettings:async()=>({freeShippingThreshold:0,standardDeliveryFee:0,prepaidDiscount:0,enablePrepaidDiscount:false})}});
 const handlers=load('src/lib/payment-routes.ts',{
  'next/server':next,'razorpay':{default:class{constructor(){return api}}},'@/lib/prisma':{prisma},'@/lib/security/customer':{getCustomerId:async()=>customerId},'@/lib/checkout':checkout,
 });
 const proof={razorpay_order_id:'order_123',razorpay_payment_id:'pay_123',razorpay_signature:crypto.createHmac('sha256','test-secret').update('order_123|pay_123').digest('hex')};
 const verify=(body=proof)=>handlers.verifyPayment({json:async()=>body});
 customerId=null;assert.equal((await verify()).status,401);
 customerId='other';assert.equal((await verify()).status,400);
 customerId='owner';assert.equal((await verify({...proof,razorpay_signature:'0'.repeat(64)})).status,400);
 amount=100;assert.equal((await verify()).status,400);assert.equal(stockChanges,0);
 amount=48200;status='authorized';assert.equal((await verify()).status,400);assert.equal(stockChanges,0);
 status='captured';assert.equal((await verify()).status,200);assert.equal(stockChanges,1);
 assert.equal((await verify()).status,200);assert.equal(stockChanges,1);
 console.log('PASS payment ownership, signature/amount tampering, uncaptured payment rejection and idempotent stock changes');
 let webhookCalls=0;
 const hook=load('src/app/api/checkout/webhook/route.ts',{'next/server':next,'@/lib/payment-routes':{settleCapturedPayment:async()=>{webhookCalls++}}});
 process.env.RAZORPAY_WEBHOOK_SECRET='hook-secret';
 const raw=JSON.stringify({event:'payment.captured',payload:{payment:{entity:{id:'pay_123',order_id:'order_123'}}}});
 const request=(signature)=>({text:async()=>raw,headers:new Headers({'x-razorpay-signature':signature})});
 assert.equal((await hook.POST(request('bad'))).status,401);assert.equal(webhookCalls,0);
 assert.equal((await hook.POST(request(crypto.createHmac('sha256','hook-secret').update(raw).digest('hex')))).status,200);assert.equal(webhookCalls,1);
 console.log('PASS signed webhook verification and unsigned event rejection');
})().catch((error)=>{console.error(error);process.exitCode=1});

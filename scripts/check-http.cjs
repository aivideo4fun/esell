// Runs a local production server with test-only settings. Never uses production credentials.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const fs = require('node:fs');
(async () => {
 const port = await new Promise((resolve) => { const socket=net.createServer();socket.listen(0,'127.0.0.1',()=>{const port=socket.address().port;socket.close(()=>resolve(port));}); });
 const base=`http://127.0.0.1:${port}`;
 const secret='local-test-only-secret-longer-than-32-characters';
 const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{
  env:{...process.env,JWT_SECRET:secret,SITE_URL:base,DATABASE_URL:'postgresql://invalid:invalid@127.0.0.1:1/never_used',ADMIN_EMAIL:'',ADMIN_PASSWORD:''},stdio:['ignore','pipe','pipe'],
 });
 let log='';server.stdout.on('data',(data)=>{log+=data});server.stderr.on('data',(data)=>{log+=data});
 try {
  let ready=false;
  for(let attempt=0;attempt<100;attempt++){
   try{const r=await fetch(base+'/contact');if(r.ok){ready=true;break}}catch{}
   await new Promise((resolve)=>setTimeout(resolve,300));
  }
  assert.ok(ready,log);
  const manifest=JSON.parse(fs.readFileSync('.next/server/middleware-manifest.json','utf8'));
  assert.ok(Object.keys(manifest.middleware).length,'Middleware must be included in the production build');
  const html=await (await fetch(base+'/contact')).text();
  for(const text of ['08MSOPS4751E1Z0','JPC DIGITAL VENTURES','6350108713','support@catchbuddy.in'])assert.ok(html.includes(text),text);
  assert.ok(!html.includes('Khasra no 2274'));assert.ok(!html.includes('Registered business address'));
  for(const url of ['/api/admin/products','/api/admin/customers','/api/orders?email=victim@example.test','/api/orders/CB-OTHER','/api/customer/profile?email=victim@example.test','/api/customer/addresses?phone=9999999999','/api/support/tickets?role=admin']){
   const r=await fetch(base+url);assert.equal(r.status,401,url);console.log('PASS anonymous denied',url);
  }
  assert.equal((await fetch(base+'/api/footer',{method:'POST',body:'{}',headers:{'content-type':'application/json'}})).status,401);
  assert.equal((await fetch(base+'/api/support',{method:'POST',body:'{}',headers:{origin:'https://untrusted.example','content-type':'application/json'}})).status,403);
  assert.equal((await fetch(base+'/api/customer',{headers:{cookie:'customer_id=someone-else'}})).status,401);
  assert.equal((await fetch(base+'/api/admin/integrations',{headers:{cookie:'admin_session=authenticated_admin_token_2026'}})).status,401);
  const {SignJWT}=await import('jose');
  const token=await new SignJWT({role:'ADMIN'}).setProtectedHeader({alg:'HS256'}).setSubject('test-admin').setIssuer('catchbuddy').setAudience('catchbuddy-web').setIssuedAt().setExpirationTime('1m').sign(new TextEncoder().encode(secret));
  assert.equal((await fetch(base+'/api/admin/integrations',{headers:{cookie:`admin_token=${token}`}})).status,200);
  assert.equal((await fetch(base+'/api/admin/integrations',{headers:{cookie:`admin_token=${token.slice(0,-3)}bad`}})).status,401);
  console.log('PASS live middleware, signed admin access, forged cookies, cross-site writes and public GST/address visibility');
 }finally{server.kill();}
})().catch((error)=>{console.error(error);process.exitCode=1});

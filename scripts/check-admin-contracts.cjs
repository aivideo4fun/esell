const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)])}
const routes=files('src/app/api').filter(f=>f.endsWith('route.ts')).sort((a,b)=>(a.match(/\[/g)||[]).length-(b.match(/\[/g)||[]).length);
const checked=[];
for(const file of files('src/app/admin').filter(f=>f.endsWith('.tsx'))){
 const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node){
  if(ts.isCallExpression(node)&&node.expression.getText(source)==='fetch'&&node.arguments.length){
   const arg=node.arguments[0];let url;
   if(ts.isStringLiteral(arg)||ts.isNoSubstitutionTemplateLiteral(arg))url=arg.text;
   else if(ts.isTemplateExpression(arg))url=arg.head.text+arg.templateSpans.map(s=>'__dynamic__'+s.literal.text).join('');
   if(url&&url.startsWith('/api/')){
    url=url.split('?')[0];let method='GET';const opts=node.arguments[1];
    if(opts&&ts.isObjectLiteralExpression(opts))for(const p of opts.properties)if(ts.isPropertyAssignment(p)&&p.name.getText(source)==='method'&&ts.isStringLiteral(p.initializer))method=p.initializer.text;
    const route=routes.find(f=>{const pattern=f.replace(/\\/g,'/').replace(/^src\/app/,'').replace(/\/route.ts$/,'');const a=pattern.split('/'),b=url.split('/');return a.length===b.length&&a.every((v,i)=>v.startsWith('[')||v===b[i]);});
    assert.ok(route,`${file}: missing route ${method} ${url}`);
    const text=fs.readFileSync(route,'utf8');assert.ok(new RegExp(`export (?:async function|function|const) ${method}\\b|export \\{[^}]*\\b${method}\\b`,'s').test(text),`${file}: missing ${method} in ${route}`);checked.push(`${method} ${url}`);
   }
  }ts.forEachChild(node,visit);
 }visit(source);
}
console.log(`PASS ${checked.length} admin fetch contracts resolve to implemented routes and HTTP methods`);

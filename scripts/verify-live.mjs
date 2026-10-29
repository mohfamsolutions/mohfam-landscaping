import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {pages} from '../data/seo.mjs';
const config=JSON.parse(await readFile('deployment.json','utf8'));
const origin=config.canonicalOrigin;
const checks=[];
for(const p of pages){const response=await fetch(origin+p.path,{signal:AbortSignal.timeout(20000)});assert.equal(response.status,p.key==='404'?404:200,p.path);const html=await response.text();assert(html.includes(`rel="canonical" href="${origin+p.path}"`),p.path+' canonical');assert(!html.includes('landscaping.invalid'));assert(html.includes('landscaping-emblem.svg'));assert(!html.includes('>⌄</span>'));const social=await fetch(origin+'/assets/social/'+p.key+'.jpg');assert.equal(social.status,200);assert.match(social.headers.get('content-type'),/image\/jpeg/);assert.deepEqual(Buffer.from(await social.arrayBuffer()),await readFile('dist/assets/social/'+p.key+'.jpg'));checks.push(p.path);}
for(const asset of ['/assets/landscaping-emblem.svg','/assets/landscaping-logo.png','/assets/app-qr.png','/assets/inter.woff2','/styles.css','/app.js','/sitemap.xml','/robots.txt']){const response=await fetch(origin+asset);assert.equal(response.status,200,asset);}
for(const route of ['/this-page-does-not-exist/','/missing-file.html'])assert.equal((await fetch(origin+route)).status,404);
const redirects=[['http://mohfamlandscaping.com/about/',origin+'/about/'],['https://www.mohfamlandscaping.com/contact/',origin+'/contact/'],['http://www.mohfamlandscaping.com/services/?source=check',origin+'/services/?source=check'],[origin+'/index.html',origin+'/']];
for(const [from,to] of redirects){const response=await fetch(from,{redirect:'manual'});assert([301,308].includes(response.status),from+' redirect status '+response.status);assert.equal(response.headers.get('location'),to);}
const api=await fetch(origin+'/api/contact.php');assert.equal(api.status,200);const session=await api.json();assert.match(session.csrf,/^[a-f0-9]{64}$/);assert.equal(session.mailReady,config.mailEnabled);
await mkdir('artifacts',{recursive:true});await writeFile('artifacts/live-results.json',JSON.stringify({checkedAt:new Date().toISOString(),origin,pages:checks,redirects:redirects.length,mailReady:session.mailReady,missingPages:2},null,2));console.log(`Verified live HTTPS: ${checks.length} pages/social images, 8 shared assets, redirects, two 404 responses and inquiry endpoint (mail ${session.mailReady?'enabled':'disabled'}).`);

import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pages} from '../data/seo.mjs';
import {services} from '../data/site.mjs';
const config=JSON.parse(await readFile('deployment.json','utf8'));const origin=config.canonicalOrigin||'https://landscaping.invalid';
export function jpegSize(buffer){let i=2;while(i<buffer.length){if(buffer[i]!==255){i++;continue;}const marker=buffer[i+1];const size=buffer.readUInt16BE(i+2);if([192,193,194].includes(marker))return [buffer.readUInt16BE(i+7),buffer.readUInt16BE(i+5)];i+=size+2;}throw Error('JPEG dimensions missing');}
const titles=new Set(),descriptions=new Set(),socialHashes=new Set();let links=0;
for(const p of pages){const html=await readFile('dist'+p.path+'index.html','utf8');const title=html.match(/<title>(.*?)<\/title>/)[1],description=html.match(/name="description" content="(.*?)"/)[1];assert(!titles.has(title));assert(!descriptions.has(description));titles.add(title);descriptions.add(description);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,p.path+' needs one H1');assert(html.includes(`rel="canonical" href="${origin+p.path}"`));assert(html.includes('name="twitter:card" content="summary_large_image"'));assert(html.includes('property="og:image:width" content="1200"'));assert(html.includes('property="og:image:height" content="630"'));if(!config.enabled)assert(html.includes('noindex, nofollow'));
assert(!/[\u00c2\u00c3\u00e2\ufffd]/.test(html),'Unexpected text encoding corruption on '+p.path);
const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(schema['@context'],'https://schema.org');assert(schema['@graph'].some(n=>n['@type']==='Organization'));assert(!JSON.stringify(schema).match(/aggregateRating|LocalBusiness|openingHours|areaServed/));
for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)){const url=new URL(match[1],origin);const target='dist'+url.pathname+(url.pathname.endsWith('/')?'index.html':'');await stat(target);links++;}
for(const match of html.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]*"/.test(match[0]),'Image alt missing '+p.path);
for(const match of html.matchAll(/aria-controls="([^"]*)"/g))assert(html.includes(`id="${match[1]}"`),'Broken control '+match[1]);
const ids=[...html.matchAll(/\bid="([^"]*)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate IDs');
const social=await readFile(`dist/assets/social/${p.key}.jpg`);assert.deepEqual(jpegSize(social),[1200,630]);assert(social.length<300000);const hash=createHash('sha256').update(social).digest('hex');assert(!socialHashes.has(hash));socialHashes.add(hash);
if(services.some(s=>s.slug===p.key))assert(html.includes('Proposed scope'));
}
const png=await readFile('dist/assets/landscaping-logo.png');assert.equal(png.readUInt32BE(16),512);assert.equal(png.readUInt32BE(20),512);
assert.equal(createHash('sha256').update(await readFile('dist/assets/app-qr.png')).digest('hex'),'9ce2fe3736a5a2b074e25c2de98ce6f7185223502dbfe904db910f757aa66214');
const sitemap=await readFile('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<url>/g)||[]).length,pages.length-1);assert.equal((sitemap.match(/<image:image>/g)||[]).length,pages.length-1);assert(!sitemap.includes('/404/'));assert(!sitemap.includes('lastmod'));for(const p of pages.filter(p=>p.key!=='404'))assert(sitemap.includes(`<loc>${origin+p.path}</loc>`));
const php=await readFile('public/api/contact.php','utf8');assert(!php.includes('mohfampoolcleaning'));assert(php.includes('[MohFam Landscaping]'));assert(php.includes("'Reply-To'=>$email"));assert(!(await readFile('public/app.js','utf8')).includes('localStorage'));
console.log(`Verified ${pages.length} pages, ${links} internal references, unique metadata/schema, sitemap, QR hash, separate logo and 11 distinct 1200×630 social images under 300 KB.`);

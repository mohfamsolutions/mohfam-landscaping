import {readFile,writeFile} from 'node:fs/promises';
const art=JSON.parse(await readFile('data/logo.json','utf8'));
const paths=art.shapes.map(s=>`  <path d="${s.commands.map(c=>c.join(' ')).join(' ')}" fill="${s.fill}"${s.stroke?` stroke="${s.stroke}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"`:''}/>`).join('\n');
await writeFile('public/assets/landscaping-emblem.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <title>${art.title}</title>\n${paths}\n</svg>\n`);
const compact=art.shapes.filter((s,i)=>![2,6].includes(i)).map(s=>`  <path d="${s.commands.map(c=>c.join(' ')).join(' ')}" fill="${s.fill}"${s.stroke?` stroke="${s.stroke}" stroke-width="${Math.max(s.width,1.6)}" stroke-linecap="round" stroke-linejoin="round"`:''}/>`).join('\n');
await writeFile('public/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <title>MohFam Landscaping favicon</title>\n${compact}\n</svg>\n`);

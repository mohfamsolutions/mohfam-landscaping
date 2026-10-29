import {writeFile} from 'node:fs/promises';
import {pages} from '../data/seo.mjs';
await writeFile('artifacts/social-data.json',JSON.stringify(pages.map(p=>({key:p.key,heading:p.heading,photo:p.photo})),null,2));

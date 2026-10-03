import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const dashboard=await readFile(new URL('../vercel-index.html',import.meta.url),'utf8');
const readme=await readFile(new URL('../README.md',import.meta.url),'utf8');
const checklist=await readFile(new URL('../RELEASE_VALIDATION_V981.md',import.meta.url),'utf8');

assert.equal(pkg.version,'10900000000.0.0');
assert.equal(dashboard.includes('TravAI Elite v10.9.0'),true);
assert.equal(readme.startsWith('# TravAI Elite v10.9.0'),true);
assert.equal(checklist.includes('production-validated'),true);
assert.equal(checklist.includes('Attempt to reuse the same approval'),true);
assert.equal(checklist.includes('prior approved/consumed authority returns to pending'),true);
console.log('v10.9.0 release consistency: PASS');

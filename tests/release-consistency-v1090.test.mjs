import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const dashboard=await readFile(new URL('../vercel-index.html',import.meta.url),'utf8');
const readme=await readFile(new URL('../README.md',import.meta.url),'utf8');
const checklist=await readFile(new URL('../RELEASE_VALIDATION_V981.md',import.meta.url),'utf8');

assert.match(pkg.version,/^\d+\.0\.0$/);
assert.equal(readme.includes('TravAI Elite'),true);
assert.equal(dashboard.includes('TravAI Elite'),true);
assert.equal(checklist.includes('production-validated'),true);
assert.equal(checklist.includes('Attempt to reuse the same approval'),true);
assert.equal(checklist.includes('prior approved/consumed authority returns to pending'),true);
assert.equal(pkg.scripts.runtime,'node local-runtime-v1120.mjs');
assert.equal(pkg.scripts['test:local-runtime'],'node tests/local-runtime-v1120.test.mjs');
console.log('release consistency: PASS');

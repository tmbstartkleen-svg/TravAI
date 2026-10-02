import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const client=await readFile(new URL('../task-control-client-v972.js',import.meta.url),'utf8');
const dashboard=await readFile(new URL('../vercel-index.html',import.meta.url),'utf8');

assert.equal(client.includes('taskVisibleCount'),true);
assert.equal(client.includes('resetTaskFilters'),true);
assert.equal(client.includes("+' steps</span>"),true);
assert.equal(dashboard.includes('id="resetTaskFilters"'),true);
assert.equal(dashboard.includes('id="taskVisibleCount"'),true);
console.log('v10.7.0 dashboard recovery polish: PASS');

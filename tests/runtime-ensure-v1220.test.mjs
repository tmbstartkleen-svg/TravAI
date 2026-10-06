import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../runtime-ensure-v1220.mjs',import.meta.url),'utf8');
assert.equal(source.includes('runtimeStatus()'),true);
assert.equal(source.includes('detached:true'),true);
assert.equal(source.includes("['local-runtime-v1120.mjs']"),true);
assert.equal(source.includes('kill('),false);
assert.equal(source.includes('0.0.0.0'),false);
console.log('v12.2.0 runtime ensure: PASS');

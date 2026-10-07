import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../pair-local-v1300.mjs',import.meta.url),'utf8');
assert.equal(source.includes('approvePairingRequest'),true);
assert.equal(source.includes("'command:request'"),true);
assert.equal(source.includes('exec('),false);
assert.equal(source.includes('spawn('),false);
assert.equal(source.includes('http.createServer'),false);
console.log('v13.0.0 local pairing CLI: PASS');

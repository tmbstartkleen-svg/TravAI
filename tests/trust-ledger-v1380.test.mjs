import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../trust-ledger-v1380.mjs',import.meta.url),'utf8');
assert.equal(source.includes('sessionToken'),false);
assert.equal(source.includes('claimSecret'),false);
assert.equal(source.includes('approvalId'),false);
assert.equal(source.includes('sha256'),true);
console.log('v13.8 trust ledger privacy pass');

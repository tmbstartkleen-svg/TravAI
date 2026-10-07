import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const [certifier,control]=await Promise.all([
 readFile(new URL('../certify-local-v1140.mjs',import.meta.url),'utf8'),
 readFile(new URL('../control-plane-v1240.mjs',import.meta.url),'utf8')
]);
assert.equal(certifier.includes('liveRuntimeIdentity'),true);
assert.equal(certifier.includes("legacy-runtime-identity"),true);
assert.equal(certifier.includes("stale-runtime-identity"),true);
assert.equal(control.includes('liveRuntimeIdentity'),true);
assert.equal(control.includes('&&liveIdentity.ok'),true);
assert.equal(control.includes("id:'stale-runtime'"),true);
console.log('v13.5.0 certification/control live identity enforcement: PASS');

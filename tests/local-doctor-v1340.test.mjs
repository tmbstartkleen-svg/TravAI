import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../local-doctor-v1340.mjs',import.meta.url),'utf8');
for(const term of ['runtimeStatus','localReadiness','certificationAudit','pairingDiagnostics','releaseDrift']) assert.equal(source.includes(term),true);
assert.equal(source.includes("automaticProcessKill:false"),true);
assert.equal(source.includes("automaticRestart:false"),true);
assert.equal(source.includes("securityBoundaryMutation:false"),true);
assert.equal(source.includes('exec('),false);
assert.equal(source.includes('spawn('),false);
assert.equal(source.includes('kill('),false);
console.log('v13.4.0 local doctor boundary: PASS');

assert.equal(source.includes("./local-bridge/runtime-lifecycle-v1150.mjs"),true);
assert.equal(source.includes("./runtime-status-v1150.mjs"),false);

import assert from 'node:assert/strict';
import {certificationFresh} from '../local-readiness-v1210.mjs';
const now=Date.now();
const base={productionValidated:true,generatedAt:new Date(now-1000).toISOString(),releaseIdentity:{packageVersion:'12100000000.0.0'}};
assert.deepEqual(certificationFresh(base,{packageVersion:'12100000000.0.0',now}),{ok:true,reason:'fresh'});
assert.equal(certificationFresh({...base,generatedAt:new Date(now-90000000).toISOString()},{packageVersion:'12100000000.0.0',now}).reason,'stale');
assert.equal(certificationFresh(base,{packageVersion:'other',now}).reason,'version-mismatch');
assert.equal(certificationFresh({productionValidated:false},{packageVersion:'12100000000.0.0',now}).reason,'not-certified');
console.log('v12.1.0 local readiness: PASS');

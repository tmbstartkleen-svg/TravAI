import assert from 'node:assert/strict';
import {certificateMatchesRelease} from '../local-bridge/certification-identity-v1230.mjs';
const identity={service:'travai-local-runtime',packageVersion:'12300000000.0.0',release:'12.3.0',protocol:'travai-local/v1'};
assert.equal(certificateMatchesRelease({productionValidated:true,version:'12.3.0',releaseIdentity:identity},identity),true);
assert.equal(certificateMatchesRelease({productionValidated:true,version:'11.6.0',releaseIdentity:identity},identity),false);
assert.equal(certificateMatchesRelease({productionValidated:true,version:'12.3.0',releaseIdentity:{...identity,packageVersion:'12200000000.0.0'}},identity),false);
assert.equal(certificateMatchesRelease({productionValidated:true,version:'12.3.0',releaseIdentity:{...identity,protocol:'old'}},identity),false);
console.log('v12.3.0 certificate audit contract: PASS');

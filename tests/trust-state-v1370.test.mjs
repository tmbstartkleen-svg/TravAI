import assert from 'node:assert/strict';
import {classifyTrustState} from '../trust-state-v1370.mjs';
assert.equal(classifyTrustState({runtime:{running:false}}).state,'runtime-offline');
assert.equal(classifyTrustState({runtime:{running:true},liveIdentity:{ok:false,legacy:true}}).state,'runtime-stale');
assert.equal(classifyTrustState({runtime:{running:true},liveIdentity:{ok:true},certificateAudit:{releaseExact:true,liveExact:false}}).state,'restart-recertification-required');
assert.equal(classifyTrustState({runtime:{running:true},liveIdentity:{ok:true},certificateAudit:{ok:true,releaseExact:true,liveExact:true}}).state,'trusted');
console.log('v13.7 trust state pass');

import assert from 'node:assert/strict';
import {bindLiveRuntime,certificateMatchesLiveRuntime} from '../local-bridge/live-certification-binding-v1360.mjs';
const identity={service:'travai-local-runtime',packageVersion:'13600000000.0.0',release:'13.6.0',protocol:'travai-local/v1'};
const first={ok:true,live:identity,processStartedAt:'first-start'};
const record=bindLiveRuntime({productionValidated:true},first);
assert.equal(certificateMatchesLiveRuntime(record,first),true);
assert.equal(certificateMatchesLiveRuntime(record,{...first,processStartedAt:'second-start'}),false);
console.log('v13.6 live binding pass');

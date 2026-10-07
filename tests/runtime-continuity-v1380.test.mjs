import assert from 'node:assert/strict';
import {summarizeContinuity} from '../runtime-continuity-v1380.mjs';
const entries=[
 {version:'13.8.0',packageVersion:'13800000000.0.0',productionValidated:true,processStartedAt:'p2',certificationBinding:'live-runtime-process-identity'},
 {version:'13.7.0',packageVersion:'13700000000.0.0',productionValidated:true,processStartedAt:'p1',certificationBinding:'live-runtime-process-identity'}
];
const s=summarizeContinuity(entries);
assert.equal(s.continuityOk,true);
assert.equal(s.latestBoundToLiveProcess,true);
assert.equal(s.transitions[0].releaseChanged,true);
assert.equal(s.transitions[0].processChanged,true);
console.log('v13.8 runtime continuity pass');

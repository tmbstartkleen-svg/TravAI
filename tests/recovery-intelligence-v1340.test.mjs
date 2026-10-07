import assert from 'node:assert/strict';
import {recoveryIntelligence,recoveryIntelligencePolicy} from '../recovery-intelligence-v1340.mjs';
let r=recoveryIntelligence({ok:false,checks:{runtimeReachable:false},recovery:[{id:'runtime',command:'npm run runtime:ensure'}]});
assert.equal(r.severity,'runtime-offline');assert.equal(r.steps[0].requiresUserAction,true);assert.equal(r.steps[0].automatic,false);
r=recoveryIntelligence({ok:true,recovery:[{id:'none',command:null}]});assert.equal(r.severity,'healthy');assert.equal(r.steps.length,0);
assert.equal(recoveryIntelligencePolicy.executesCommands,false);
console.log('v13.4.0 recovery intelligence: PASS');

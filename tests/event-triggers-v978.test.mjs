import assert from 'node:assert/strict';
import {createTrigger,tickTriggers,setTriggerEnabled,triggerPolicy} from '../local-bridge/event-triggers-v978.mjs';

let healthy=false;
const trigger=createTrigger({
  label:'Runtime health event',
  type:'runtime-health',
  steps:[{action:'read-health',requiresApproval:false}]
});
let result=await tickTriggers({time:100000,providers:{runtimeHealthy:async()=>healthy}});
assert.equal(result.created.length,0);
healthy=true;
result=await tickTriggers({time:200000,providers:{runtimeHealthy:async()=>healthy}});
assert.equal(result.created.length,1);
result=await tickTriggers({time:300000,providers:{runtimeHealthy:async()=>healthy}});
assert.equal(result.created.length,0);
assert.equal(setTriggerEnabled(trigger.id,false).ok,true);
assert.equal(triggerPolicy.createsTasksOnly,true);
assert.equal(triggerPolicy.executesMacActions,false);
assert.equal(triggerPolicy.arbitraryShell,false);
console.log('v9.7.8 event triggers: PASS');

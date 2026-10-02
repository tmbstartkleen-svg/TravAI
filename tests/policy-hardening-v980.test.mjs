import assert from 'node:assert/strict';
import {createTask} from '../local-bridge/task-orchestrator-v970.mjs';
import {executeMacAction,macActionPolicy} from '../local-bridge/mac-action-executor-v971.mjs';

const task=createTask({label:'Policy hardening',steps:[
  {action:'open-app',input:{app:'Safari'},requiresApproval:false},
  {action:'read-health',requiresApproval:false}
]});
assert.equal(task.steps[0].requiresApproval,true);
assert.equal(task.steps[1].requiresApproval,false);

let blocked=false;
try{
  await executeMacAction({action:'open-app',input:{app:'Safari'},requiresApproval:false},{approved:false,run:async()=>({})});
}catch(error){blocked=error.message==='LOCAL_APPROVAL_REQUIRED'}
assert.equal(blocked,true);
assert.equal(macActionPolicy.taskMetadataCannotDisableMutatingApproval,true);
assert.equal(macActionPolicy.shell,false);
assert.equal(macActionPolicy.tccBypass,false);
console.log('v9.8.0 policy hardening: PASS');

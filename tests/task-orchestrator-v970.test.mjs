import assert from 'node:assert/strict';
import {createTask,getTask,nextStep,recordStepResult,autonomousPolicy} from '../local-bridge/task-orchestrator-v970.mjs';

const task=createTask({
  label:'Open settings and verify readiness',
  steps:[
    {action:'open-system-settings-pane',input:{pane:'Privacy & Security'}},
    {action:'read-readiness',verify:{field:'ok',equals:true},requiresApproval:false}
  ]
});

assert.equal(task.status,'pending');
assert.equal(nextStep(task.id).action,'open-system-settings-pane');

let state=recordStepResult(task.id,{ok:false,error:'TEMPORARY_FAILURE'});
assert.equal(state.status,'retry-pending');
assert.equal(state.steps[0].attempts,1);

state=recordStepResult(task.id,{ok:true,result:{opened:true}});
assert.equal(state.steps[0].status,'completed');
assert.equal(nextStep(task.id).action,'read-readiness');

state=recordStepResult(task.id,{ok:true,result:{ok:true},verified:true});
assert.equal(state.status,'completed');
assert.equal(getTask(task.id).steps.length,2);

assert.equal(autonomousPolicy.arbitraryShell,false);
assert.equal(autonomousPolicy.unrestrictedFilesystem,false);
assert.equal(autonomousPolicy.securityBoundaryBypass,false);
console.log('v9.7 autonomous task orchestrator: PASS');

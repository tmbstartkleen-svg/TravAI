import assert from 'node:assert/strict';
import {importTaskState,getTask,autonomousPolicy} from '../local-bridge/task-orchestrator-v970.mjs';

const records=[{
  id:'legacy-task',
  label:'Legacy restored task',
  status:'running',
  currentStep:0,
  maxRetries:2,
  steps:[
    {id:'step-1',action:'open-app',input:{app:'Safari'},requiresApproval:false,attempts:0,status:'running',result:null,error:null},
    {id:'step-2',action:'read-health',input:{},requiresApproval:false,attempts:0,status:'pending',result:null,error:null},
    {id:'step-3',action:'not-allowed',input:{},requiresApproval:false,attempts:0,status:'pending',result:null,error:null}
  ],
  history:[]
}];

importTaskState(records);
const task=getTask('legacy-task');
assert.ok(task);
assert.equal(task.status,'pending');
assert.equal(task.steps.length,2);
assert.equal(task.steps[0].action,'open-app');
assert.equal(task.steps[0].requiresApproval,true);
assert.equal(task.steps[0].status,'pending');
assert.equal(task.steps[1].action,'read-health');
assert.equal(task.steps[1].requiresApproval,false);
assert.equal(autonomousPolicy.restoredMutatingApprovalReenforced,true);
console.log('v10.5.0 restored-state hardening: PASS');

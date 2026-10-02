import assert from 'node:assert/strict';
import {createTask,nextStep,recordStepResult,taskDiagnostics} from '../local-bridge/task-orchestrator-v970.mjs';
import {handleTaskApi} from '../local-bridge/task-api-routes-v973.mjs';

const task=createTask({label:'Diag test',steps:[{action:'read-health',requiresApproval:false}]});
nextStep(task.id);
recordStepResult(task.id,{ok:true,result:{ok:true},verified:true});

const d=taskDiagnostics();
assert.equal(d.totalTasks>=1,true);
assert.equal(d.completedSteps>=1,true);
assert.equal(Array.isArray(d.recentHistory),true);

const r=await handleTaskApi({method:'GET',url:'/api/v973/diagnostics',body:{}});
assert.equal(r.status,200);
assert.equal(typeof r.body.diagnostics.totalTasks,'number');
console.log('v9.7.9 diagnostics: PASS');

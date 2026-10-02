import assert from 'node:assert/strict';
import {createTask,nextStep,recordStepResult,retryTask,getTask} from '../local-bridge/task-orchestrator-v970.mjs';

const task=createTask({label:'Manual retry',steps:[{action:'read-health',requiresApproval:false}]});
nextStep(task.id);
recordStepResult(task.id,{ok:false,error:'TRANSIENT'});
const retried=retryTask(task.id);
assert.equal(retried.ok,true);
assert.equal(retried.task.status,'pending');
assert.equal(retried.task.steps[0].status,'pending');
assert.equal(getTask(task.id).history.at(-1).event,'task-manual-retry');

const bad=retryTask('missing');
assert.equal(bad.ok,false);
console.log('v10.3.0 reliability controls: PASS');

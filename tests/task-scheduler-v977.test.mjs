import assert from 'node:assert/strict';
import {createSchedule,tickScheduler,pauseSchedule,resumeSchedule,getSchedule,schedulerPolicy} from '../local-bridge/task-scheduler-v977.mjs';
import {getTask,recordStepResult,nextStep} from '../local-bridge/task-orchestrator-v970.mjs';

const base=Date.now()+1000;
const first=createSchedule({label:'First',steps:[{action:'read-health',requiresApproval:false}],runAt:base});
let tick=tickScheduler(base-1);
assert.equal(tick.created.length,0);
tick=tickScheduler(base);
assert.equal(tick.created.length,1);
const firstTask=tick.created[0];
assert.equal(getSchedule(first.id).status,'completed');

const dep=createSchedule({label:'Dependent',steps:[{action:'open-app',input:{app:'Safari'}}],runAt:base,dependsOn:[firstTask.id]});
tick=tickScheduler(base);
assert.equal(tick.created.length,0);
assert.equal(getSchedule(dep.id).status,'waiting-dependency');

nextStep(firstTask.id);
recordStepResult(firstTask.id,{ok:true,result:{ok:true},verified:true});
tick=tickScheduler(base+1);
assert.equal(tick.created.length,1);
assert.equal(tick.created[0].steps[0].requiresApproval,true);

const recurring=createSchedule({label:'Recurring',steps:[{action:'read-readiness',requiresApproval:false}],runAt:base,everyMs:60_000});
assert.equal(pauseSchedule(recurring.id).ok,true);
assert.equal(tickScheduler(base+60_000).created.some(t=>t.label==='Recurring'),false);
assert.equal(resumeSchedule(recurring.id,{runAt:base+60_001}).ok,true);
assert.equal(tickScheduler(base+60_001).created.some(t=>t.label==='Recurring'),true);

assert.equal(schedulerPolicy.executesActionsDirectly,false);
assert.equal(schedulerPolicy.consequentialActionsStillRequireApproval,true);
assert.equal(schedulerPolicy.arbitraryShell,false);
console.log('v9.7.7 scheduler: PASS');

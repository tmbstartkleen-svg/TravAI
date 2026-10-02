import assert from 'node:assert/strict';
import {createTask,taskQueueSummary,cancelTask} from '../local-bridge/task-orchestrator-v970.mjs';

const before=taskQueueSummary();
const a=createTask({label:'Queue pending',steps:[{action:'read-health',requiresApproval:false}]});
const b=createTask({label:'Queue cancelled',steps:[{action:'read-readiness',requiresApproval:false}]});
cancelTask(b.id);
const after=taskQueueSummary();
assert.equal(after.total,before.total+2);
assert.equal(after.counts.pending,(before.counts.pending||0)+1);
assert.equal(after.counts.cancelled,(before.counts.cancelled||0)+1);
assert.equal(after.actionable,(before.actionable||0)+1);
assert.equal(typeof after.counts.failed,'number');
console.log('v10.4.0 queue summary: PASS');

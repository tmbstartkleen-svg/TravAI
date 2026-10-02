import assert from 'node:assert/strict';
import {createTask,listTasks} from '../local-bridge/task-orchestrator-v970.mjs';
import {createApproval,decideApproval,listApprovals} from '../local-bridge/approval-queue-v972.mjs';
import {savePersistentState,restorePersistentState,persistencePolicy} from '../local-bridge/persistent-state-v976.mjs';

const task=createTask({label:'Persist me',steps:[{action:'read-health',requiresApproval:false}]});
const approval=createApproval({id:'abcdefabcdefabcdefabcdef',taskId:task.id,stepId:'step-1',action:'read-health'});
decideApproval(approval.id,'approve');

const saved=await savePersistentState({state:'ready',mountedAt:1});
assert.equal(saved.ok,true);

const restored=await restorePersistentState();
assert.equal(restored.ok,true);
assert.equal(listTasks().some(t=>t.id===task.id),true);
const a=listApprovals().find(x=>x.id===approval.id);
assert.equal(a.status,'pending');
assert.equal(a.restoredRequiresFreshDecision,true);
assert.equal(persistencePolicy.storesSessionTokens,false);
assert.equal(persistencePolicy.restoresApprovedAuthority,false);
console.log('v9.7.6 persistent state: PASS');

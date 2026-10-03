import assert from 'node:assert/strict';
import {createApproval,decideApproval,consumeApproval,exportApprovalState,importApprovalState,approvalPolicy} from '../local-bridge/approval-queue-v972.mjs';

createApproval({id:'restore-approved',taskId:'task-a',stepId:'step-a',action:'open-app'});
decideApproval('restore-approved','approve');
createApproval({id:'restore-consumed',taskId:'task-b',stepId:'step-b',action:'open-app'});
decideApproval('restore-consumed','approve');
consumeApproval('restore-consumed',{taskId:'task-b',stepId:'step-b'});

const restored=importApprovalState(exportApprovalState());
for(const id of ['restore-approved','restore-consumed']){
  const item=restored.find(x=>x.id===id);
  assert.ok(item);
  assert.equal(item.status,'pending');
  assert.equal(item.restoredRequiresFreshDecision,true);
  assert.equal(item.consumedAt,undefined);
}
assert.equal(approvalPolicy.restoredAuthorityRequiresFreshDecision,true);
console.log('v10.8.0 approval restore finalization: PASS');

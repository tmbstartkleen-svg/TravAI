const approvals = new Map();
const TTL_MS = 5 * 60_000;

const now = () => Date.now();
const copy = value => JSON.parse(JSON.stringify(value));

export function createApproval({id,taskId,stepId,action}={}){
  if(!id || !taskId || !stepId || !action) throw new Error('INVALID_APPROVAL');
  const record={
    id:String(id),
    taskId:String(taskId),
    stepId:String(stepId),
    action:String(action),
    status:'pending',
    createdAt:now(),
    expiresAt:now()+TTL_MS
  };
  approvals.set(record.id,record);
  return copy(record);
}

export function listApprovals(){
  const time=now();
  for(const item of approvals.values()){
    if(item.status==='pending' && item.expiresAt<=time) item.status='expired';
  }
  return [...approvals.values()].map(copy);
}

export function exportApprovalState(){
  return listApprovals();
}

export function importApprovalState(records=[]){
  approvals.clear();
  const time=now();
  for(const raw of Array.isArray(records)?records:[]){
    if(!raw || typeof raw!=='object' || !raw.id || !raw.taskId || !raw.stepId || !raw.action) continue;
    const item=copy(raw);
    if(item.status==='approved' || item.status==='consumed'){
      item.status='pending';
      item.createdAt=time;
      item.expiresAt=time+TTL_MS;
      delete item.decidedAt;
      delete item.consumedAt;
      item.restoredRequiresFreshDecision=true;
    }else if(item.status==='pending' && item.expiresAt<=time){
      item.status='expired';
    }
    approvals.set(String(item.id),item);
  }
  return listApprovals();
}

export function decideApproval(id,decision){
  const item=approvals.get(String(id||''));
  if(!item || item.status!=='pending' || item.expiresAt<=now()) throw new Error('APPROVAL_NOT_PENDING');
  if(!['approve','deny'].includes(decision)) throw new Error('INVALID_DECISION');
  item.status=decision==='approve'?'approved':'denied';
  item.decidedAt=now();
  return copy(item);
}

export function consumeApproval(id,{taskId,stepId}={}){
  const item=approvals.get(String(id||''));
  if(!item || item.status!=='approved' || item.expiresAt<=now()) throw new Error('APPROVAL_INVALID');
  if(item.taskId!==String(taskId||'') || item.stepId!==String(stepId||'')) throw new Error('APPROVAL_SCOPE_MISMATCH');
  item.status='consumed';
  item.consumedAt=now();
  return copy(item);
}

export const approvalPolicy=Object.freeze({
  ttlMs:TTL_MS,
  singleUse:true,
  explicitDecision:true,
  silentApproval:false,
  restoredAuthorityRequiresFreshDecision:true
});

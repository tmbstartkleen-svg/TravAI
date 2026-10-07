import {
  durableCreateRequest,
  durableListRequests,
  durableApproveRequest,
  durableDenyRequest,
  durableConsumeApproval,
  resetDurableApprovals
} from './pairing-state-v1390.mjs';

const locks=new Map();

function withKeyLock(key,fn){
  const prev=locks.get(key)||Promise.resolve();
  const next=prev.then(fn,fn);
  const settled=next.then(()=>undefined,()=>undefined);
  const tracked=settled.finally(()=>{if(locks.get(key)===tracked)locks.delete(key);});
  locks.set(key,tracked);
  return next;
}

export async function createPairingRequestSafe(input={}){
  const id=String(input.requestId||'').toLowerCase();
  return withKeyLock(id,async()=>{
    const existing=(await durableListRequests()).find(r=>r.id===id);
    if(existing) throw new Error('PAIR_REQUEST_DUPLICATE');
    return durableCreateRequest(input);
  });
}

export async function listPairingRequestsSafe(){
  const rows=await durableListRequests();
  if(!Array.isArray(rows)) throw new Error('PAIRING_STATE_INVALID');
  for(const r of rows){
    if(!r||typeof r!=='object'||!/^[a-f0-9]{32}$/i.test(r.id||'')) throw new Error('PAIRING_STATE_INVALID');
  }
  return rows;
}

export async function approvePairingRequestSafe(id){return withKeyLock(String(id||'').toLowerCase(),()=>durableApproveRequest(id));}
export async function denyPairingRequestSafe(id){return withKeyLock(String(id||'').toLowerCase(),()=>durableDenyRequest(id));}
export async function consumePairingApprovalSafe(id,secret){return withKeyLock(String(id||'').toLowerCase(),()=>durableConsumeApproval(id,secret));}
export async function resetPairingApprovalsSafe(){return withKeyLock('__reset__',()=>resetDurableApprovals());}

export const pairingIntegrityPolicy=Object.freeze({
  duplicateRequestRejected:true,
  perRequestMutationSerialization:true,
  invalidStateRejected:true,
  rawClaimSecretPersisted:false,
  sessionAuthorityPersisted:false
});

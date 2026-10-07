import crypto from 'node:crypto';
import {createPairingRequest,listPairingRequests,authorizeSession} from './pairing-authority-v956.mjs';

const claims=new Map();
const CLAIM_TTL_MS=2*60_000;
const hash=v=>crypto.createHash('sha256').update(String(v||'')).digest('hex');
const clean=()=>{const t=Date.now();for(const [k,v] of claims)if(v.expiresAt<=t||v.consumed)claims.delete(k);};

export function createBrowserPairing({requestId,label='TravAI browser'}={}){
  const request=createPairingRequest({requestId,label});
  return request;
}

export function registerApprovedClaim(requestId,sessionToken,sessionExpiresAt){
  clean();
  const id=String(requestId||'').toLowerCase();
  if(!listPairingRequests().some(x=>x.id===id&&x.status==='approved')) throw new Error('PAIR_REQUEST_NOT_APPROVED');
  const claimSecret=crypto.randomBytes(24).toString('base64url');
  claims.set(id,{secretHash:hash(claimSecret),sessionToken,sessionExpiresAt,expiresAt:Date.now()+CLAIM_TTL_MS,consumed:false});
  return {requestId:id,claimSecret,expiresAt:Date.now()+CLAIM_TTL_MS};
}

export function claimApprovedSession(requestId,claimSecret){
  clean();
  const id=String(requestId||'').toLowerCase(), claim=claims.get(id);
  if(!claim||claim.secretHash!==hash(claimSecret)) throw new Error('CLAIM_INVALID');
  claim.consumed=true; claims.delete(id);
  return {sessionToken:claim.sessionToken,expiresAt:claim.sessionExpiresAt};
}

export function sessionState(sessionToken){
  const auth=authorizeSession(sessionToken,'command:request');
  return {ok:auth.ok,expiresAt:auth.expiresAt||null,reason:auth.ok?null:auth.reason};
}

export const pairingLifecyclePolicy=Object.freeze({
  oneTimeClaim:true,
  claimTtlMs:CLAIM_TTL_MS,
  browserSelfApproval:false,
  storesPlainSessionTokenInPersistentState:false,
  sessionScope:'command:request'
});

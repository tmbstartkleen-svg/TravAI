import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const DIR=path.join(os.homedir(),'.travai','state');
const FILE=path.join(DIR,'pairing-state-v1390.json');
const REQUEST_TTL=5*60_000;
const APPROVAL_TTL=2*60_000;
const hash=v=>crypto.createHash('sha256').update(String(v||'')).digest('hex');
const cleanLabel=v=>String(v||'TravAI browser').replace(/[\r\n\0]/g,' ').slice(0,80);
async function readState(){
 try{return JSON.parse(await fs.readFile(FILE,'utf8'));}catch{return {requests:{}};}
}
async function writeState(state){
 await fs.mkdir(DIR,{recursive:true,mode:0o700});
 const tmp=FILE+'.tmp-'+process.pid;
 await fs.writeFile(tmp,JSON.stringify(state,null,2)+'\n',{mode:0o600});
 await fs.rename(tmp,FILE);
}
function prune(state,now=Date.now()){
 for(const [id,r] of Object.entries(state.requests||{})){
   if(r.expiresAt<=now) delete state.requests[id];
   else if(r.approvalExpiresAt&&r.approvalExpiresAt<=now&&r.status==='locally-approved'){
     r.status='pending'; delete r.approvalHash; delete r.approvalExpiresAt; delete r.approvedAt;
   }
 }
 return state;
}
export async function durableCreateRequest({requestId,label='TravAI browser'}={}){
 if(!/^[a-f0-9]{32}$/i.test(requestId||'')) throw new Error('INVALID_PAIR_REQUEST');
 const state=prune(await readState()),id=requestId.toLowerCase(),now=Date.now();
 state.requests[id]={id,label:cleanLabel(label),status:'pending',createdAt:now,expiresAt:now+REQUEST_TTL};
 await writeState(state); return {...state.requests[id]};
}
export async function durableListRequests(){
 const state=prune(await readState()); await writeState(state); return Object.values(state.requests);
}
export async function durableApproveRequest(requestId){
 const state=prune(await readState()),id=String(requestId||'').toLowerCase(),r=state.requests[id];
 if(!r||r.status!=='pending') throw new Error('PAIR_REQUEST_NOT_PENDING');
 const secret=crypto.randomBytes(24).toString('base64url'),now=Date.now();
 r.status='locally-approved';r.approvedAt=now;r.approvalHash=hash(secret);r.approvalExpiresAt=now+APPROVAL_TTL;
 await writeState(state);return {requestId:id,approvalSecret:secret,expiresAt:r.approvalExpiresAt};
}
export async function durableDenyRequest(requestId){
 const state=prune(await readState()),id=String(requestId||'').toLowerCase(),r=state.requests[id];
 if(!r)return {ok:false};r.status='denied';r.deniedAt=Date.now();delete r.approvalHash;delete r.approvalExpiresAt;await writeState(state);return {ok:true};
}
export async function durableConsumeApproval(requestId,secret){
 const state=prune(await readState()),id=String(requestId||'').toLowerCase(),r=state.requests[id];
 if(!r||r.status!=='locally-approved'||!r.approvalHash||r.approvalHash!==hash(secret)) throw new Error('CLAIM_INVALID');
 r.status='consumed';r.consumedAt=Date.now();delete r.approvalHash;delete r.approvalExpiresAt;await writeState(state);return {ok:true,requestId:id};
}
export async function resetDurableApprovals(){
 const state=prune(await readState());let changed=false;
 for(const r of Object.values(state.requests||{}))if(r.status==='locally-approved'){r.status='pending';delete r.approvalHash;delete r.approvalExpiresAt;delete r.approvedAt;changed=true;}
 if(changed)await writeState(state);return {changed};
}
export const durablePairingPolicy=Object.freeze({rawApprovalSecretPersisted:false,sessionAuthorityPersisted:false,restartRequiresFreshApproval:true,fileMode:'0600',directoryMode:'0700'});

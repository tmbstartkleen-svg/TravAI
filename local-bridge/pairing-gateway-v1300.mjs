import {createPairingRequest,listPairingRequests,authorizeSession,revokeSession} from './pairing-authority-v956.mjs';
import {claimApprovedSession} from './pairing-lifecycle-v1310.mjs';

function pathOf(req){try{return new URL(req.url,'http://127.0.0.1').pathname}catch{return ''}}
async function bodyOf(req){
  const chunks=[]; for await(const chunk of req) chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));
  if(!chunks.length)return {}; const raw=Buffer.concat(chunks).toString('utf8').trim(); return raw?JSON.parse(raw):{};
}
const reply=(status,body)=>({status,headers:{'content-type':'application/json','cache-control':'no-store'},body});

export async function handlePairingGateway(req){
  const path=pathOf(req), method=String(req.method||'GET').toUpperCase();
  if(path==='/api/v1300/pairing/request'&&method==='POST'){
    try{
      const data=await bodyOf(req);
      const request=createPairingRequest({requestId:data.requestId,label:data.label||'TravAI browser'});
      return reply(201,{ok:true,request});
    }catch(error){return reply(400,{ok:false,error:error?.message||'PAIRING_REQUEST_FAILED'});}
  }
  const status=path.match(/^\/api\/v1300\/pairing\/([a-f0-9]{32})$/i);
  if(status&&method==='GET'){
    const request=listPairingRequests().find(x=>x.id===status[1].toLowerCase());
    if(!request)return reply(404,{ok:false,error:'PAIR_REQUEST_NOT_FOUND'});
    return reply(200,{ok:true,request});
  }
  const claim=path.match(/^\/api\/v1300\/pairing\/([a-f0-9]{32})\/claim$/i);
  if(claim&&method==='POST'){
    try{
      const data=await bodyOf(req);
      const session=claimApprovedSession(claim[1],data.claimSecret);
      return reply(200,{ok:true,...session});
    }catch(error){return reply(409,{ok:false,error:error?.message||'CLAIM_FAILED'});}
  }
  if(path==='/api/v1300/session/revoke'&&method==='POST'){
    const token=String(req.headers?.['x-travai-session']||'');
    const result=revokeSession(token);
    return reply(result.ok?200:401,{ok:result.ok});
  }
  if(path==='/api/v1300/session/check'&&method==='GET'){
    const token=String(req.headers?.['x-travai-session']||'');
    const auth=authorizeSession(token,'command:request');
    return reply(auth.ok?200:401,{ok:auth.ok,expiresAt:auth.expiresAt||null,error:auth.ok?null:auth.reason});
  }
  if(path.includes('/approve')||path.includes('/deny')) return reply(404,{ok:false,error:'LOCAL_APPROVAL_ONLY'});
  return null;
}

export const pairingGatewayPolicy=Object.freeze({
  browserCanRequest:true,
  browserCanPoll:true,
  browserCanClaimAfterLocalApproval:true,
  claimIsSingleUse:true,
  browserCanRevokeOwnSession:true,
  browserCanApprove:false,
  browserCanDeny:false,
  approvalAuthority:'local-cli-only',
  sessionScope:'command:request',
  loopbackOnly:true
});

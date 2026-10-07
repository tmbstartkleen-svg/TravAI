import {listPairingRequests,approvePairingRequest,denyPairingRequest} from './local-bridge/pairing-authority-v956.mjs';
import {registerApprovedClaim} from './local-bridge/pairing-lifecycle-v1310.mjs';

const [action,id]=process.argv.slice(2);
if(action==='list'){
  console.log(JSON.stringify({requests:listPairingRequests()},null,2)); process.exit(0);
}
if(!/^[a-f0-9]{32}$/i.test(id||'')){console.error('A valid 32-character pairing request ID is required.');process.exit(2);}
if(action==='approve'){
  const result=approvePairingRequest(id,['health:read','readiness:read','command:request']);
  const claim=registerApprovedClaim(id,result.sessionToken,result.expiresAt);
  console.log(JSON.stringify({ok:true,requestId:id,claimSecret:claim.claimSecret,claimExpiresAt:claim.expiresAt,scopes:result.scopes,sessionExpiresAt:result.expiresAt},null,2)); process.exit(0);
}
if(action==='deny'){console.log(JSON.stringify(denyPairingRequest(id),null,2));process.exit(0);}
console.error('Use: list, approve <request-id>, or deny <request-id>');process.exit(2);

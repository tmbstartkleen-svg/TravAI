import {listPairingRequestsSafe,approvePairingRequestSafe,denyPairingRequestSafe} from './local-bridge/pairing-integrity-v1313.mjs';
const [action,id]=process.argv.slice(2);
if(action==='list'){console.log(JSON.stringify({requests:await listPairingRequestsSafe()},null,2));process.exit(0);}
if(!/^[a-f0-9]{32}$/i.test(id||'')){console.error('A valid 32-character pairing request ID is required.');process.exit(2);}
if(action==='approve'){
 const result=await approvePairingRequestSafe(id);
 console.log(JSON.stringify({ok:true,requestId:id,claimSecret:result.approvalSecret,claimExpiresAt:result.expiresAt,sessionCreated:false},null,2));process.exit(0);
}
if(action==='deny'){console.log(JSON.stringify(await denyPairingRequestSafe(id),null,2));process.exit(0);}
console.error('Use: list, approve <request-id>, or deny <request-id>');process.exit(2);

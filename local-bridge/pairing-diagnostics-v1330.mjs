import {listPairingRequests} from './pairing-authority-v956.mjs';

export function pairingDiagnostics(){
  const now=Date.now();
  const requests=listPairingRequests();
  const counts={pending:0,approved:0,denied:0};
  for(const r of requests) if(Object.hasOwn(counts,r.status)) counts[r.status]++;
  const pending=requests.filter(r=>r.status==='pending').map(r=>({
    id:r.id,label:r.label,expiresAt:r.expiresAt,remainingMs:Math.max(0,r.expiresAt-now)
  }));
  return {
    ok:true,
    generatedAt:new Date(now).toISOString(),
    counts,
    pending,
    policy:{
      exposesSessionTokens:false,
      exposesClaimSecrets:false,
      browserApproval:false,
      localApprovalRequired:true
    }
  };
}

if(import.meta.url===new URL('file:'+process.argv[1]).href) console.log(JSON.stringify(pairingDiagnostics(),null,2));

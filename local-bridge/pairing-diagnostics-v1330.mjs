import {listPairingRequestsSafe} from './pairing-integrity-v1313.mjs';

export async function pairingDiagnostics(){
  const now=Date.now();
  const requests=await listPairingRequestsSafe();
  const counts={pending:0,approved:0,denied:0,consumed:0};
  for(const r of requests){
    const status=r.status==='locally-approved'?'approved':r.status;
    if(Object.hasOwn(counts,status)) counts[status]++;
  }
  const pending=requests.filter(r=>r.status==='pending').map(r=>({
    id:r.id,label:r.label,expiresAt:r.expiresAt,remainingMs:Math.max(0,r.expiresAt-now)
  }));
  return {
    ok:true,
    generatedAt:new Date(now).toISOString(),
    counts,
    pending,
    policy:{
      durableCrossProcessState:true,
      exposesSessionTokens:false,
      exposesClaimSecrets:false,
      exposesApprovalHashes:false,
      browserApproval:false,
      localApprovalRequired:true
    }
  };
}

if(import.meta.url===new URL('file:'+process.argv[1]).href) console.log(JSON.stringify(await pairingDiagnostics(),null,2));

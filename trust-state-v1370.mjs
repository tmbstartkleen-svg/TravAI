export function classifyTrustState({runtime,liveIdentity,certificateAudit}={}){
 if(!runtime?.running) return {state:'runtime-offline',trusted:false,reason:'runtime-unreachable',next:'npm run runtime:ensure'};
 if(!liveIdentity?.ok) return {state:'runtime-stale',trusted:false,reason:liveIdentity?.legacy?'legacy-runtime':'release-mismatch',next:'restart-runtime-manually'};
 if(certificateAudit?.releaseExact===true&&certificateAudit?.liveExact===false) return {state:'restart-recertification-required',trusted:false,reason:'process-start-changed',next:'npm run certify:local'};
 if(!certificateAudit?.ok) return {state:'certification-required',trusted:false,reason:'certificate-not-current',next:'npm run certify:local'};
 return {state:'trusted',trusted:true,reason:'live-process-certified',next:null};
}
export const trustStatePolicy=Object.freeze({advisoryOnly:true,automaticRestart:false,automaticCertification:false});

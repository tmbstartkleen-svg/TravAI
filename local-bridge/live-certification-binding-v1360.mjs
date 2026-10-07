import {identityMatches} from './runtime-identity-v1160.mjs';
export function bindLiveRuntime(record,liveIdentity){
 if(!record||!liveIdentity?.ok||!liveIdentity?.live||!liveIdentity?.processStartedAt) throw new Error('LIVE_RUNTIME_BINDING_REQUIRED');
 record.liveRuntimeBinding={identity:liveIdentity.live,processStartedAt:liveIdentity.processStartedAt};
 record.certificationBinding='live-runtime-process-identity';
 return record;
}
export function certificateMatchesLiveRuntime(record,liveIdentity){
 return Boolean(record?.productionValidated&&record?.certificationBinding==='live-runtime-process-identity'&&liveIdentity?.ok&&identityMatches(record?.liveRuntimeBinding?.identity,liveIdentity.live)&&record?.liveRuntimeBinding?.processStartedAt===liveIdentity.processStartedAt);
}
export const liveCertificationPolicy=Object.freeze({exactLiveIdentity:true,processStartBinding:true,secretFree:true});

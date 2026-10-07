import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';
import {certificateMatchesRelease} from './local-bridge/certification-identity-v1230.mjs';
import {certificationHistory} from './certification-history-v1220.mjs';
import {liveRuntimeIdentity} from './live-runtime-identity-v1350.mjs';
import {certificateMatchesLiveRuntime} from './local-bridge/live-certification-binding-v1360.mjs';

export async function certificationAudit(){
  const identity=await loadReleaseIdentity();
  const liveIdentity=await liveRuntimeIdentity();
  const history=await certificationHistory({limit:20});
  const current=history[0]||null;
  const releaseExact=Boolean(current?.raw&&certificateMatchesRelease(current.raw,identity));
  const liveExact=Boolean(current?.raw&&certificateMatchesLiveRuntime(current.raw,liveIdentity));
  const exact=releaseExact&&liveExact;
  return {
    ok:exact,
    identity,
    liveIdentity,
    releaseExact,
    liveExact,
    latest:current?{file:current.file,generatedAt:current.generatedAt,version:current.version,packageVersion:current.packageVersion,productionValidated:current.productionValidated}:null,
    historyCount:history.length,
    recommendation:!current?'certify-local':!exact?'recertify-local':'current'
  };
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const result=await certificationAudit();
  console.log(JSON.stringify(result,null,2));
  process.exit(result.ok?0:2);
}

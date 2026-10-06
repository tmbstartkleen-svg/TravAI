import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';
import {certificateMatchesRelease} from './local-bridge/certification-identity-v1230.mjs';
import {certificationHistory} from './certification-history-v1220.mjs';

export async function certificationAudit(){
  const identity=await loadReleaseIdentity();
  const history=await certificationHistory({limit:20});
  const current=history[0]||null;
  const exact=Boolean(current?.raw&&certificateMatchesRelease(current.raw,identity));
  return {
    ok:exact,
    identity,
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

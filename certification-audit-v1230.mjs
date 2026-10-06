import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';
import {certificateMatchesRelease} from './local-bridge/certification-identity-v1230.mjs';
import {certificationHistory} from './certification-history-v1220.mjs';

export async function certificationAudit(){
  const identity=await loadReleaseIdentity();
  const history=await certificationHistory({limit:20});
  const current=history[0]||null;
  return {
    ok:Boolean(current&&certificateMatchesRelease(current.raw||current,identity)),
    identity,
    latest:current,
    historyCount:history.length,
    recommendation:!current?'certify-local':current.packageVersion!==identity.packageVersion?'recertify-local':current.version!==identity.release?'recertify-local':'current'
  };
}

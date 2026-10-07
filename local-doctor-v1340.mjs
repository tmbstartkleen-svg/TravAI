import {runtimeStatus} from './local-bridge/runtime-lifecycle-v1150.mjs';
import {localReadiness} from './local-readiness-v1210.mjs';
import {certificationAudit} from './certification-audit-v1230.mjs';
import {pairingDiagnostics} from './local-bridge/pairing-diagnostics-v1330.mjs';
import {releaseDrift} from './release-drift-v1240.mjs';
import {liveRuntimeIdentity} from './live-runtime-identity-v1350.mjs';

export async function localDoctor(){
  const [runtime,readiness,certification,drift,liveIdentity]=await Promise.all([
    runtimeStatus(),localReadiness(),certificationAudit(),releaseDrift(),liveRuntimeIdentity()
  ]);
  const pairing=pairingDiagnostics();
  const checks={
    runtimeReachable:runtime.running===true&&runtime.status===200,
    readiness:readiness.ok===true,
    certification:certification.ok===true,
    releaseDrift:drift.ok===true,
    pairingDiagnostics:pairing.ok===true,
    liveRuntimeIdentity:liveIdentity.ok===true
  };
  const recovery=[];
  if(!checks.runtimeReachable) recovery.push({id:'runtime',command:'npm run runtime:ensure',automatic:false});
  if(checks.runtimeReachable&&!checks.readiness) recovery.push({id:'certify',command:'npm run certify:local',automatic:false});
  if(!checks.certification) recovery.push({id:'certificate-audit',command:'npm run certifications:audit',automatic:false});
  if(!checks.releaseDrift) recovery.push({id:'release-drift',command:'npm run release:drift',automatic:false});
  if(checks.runtimeReachable&&!checks.liveRuntimeIdentity) recovery.push({id:'stale-runtime',command:'Stop the existing runtime with Ctrl+C, then run npm run runtime',automatic:false});
  if(!recovery.length) recovery.push({id:'none',command:null,automatic:false});
  return {
    schema:'travai-local-doctor/v1',
    generatedAt:new Date().toISOString(),
    ok:Object.values(checks).every(Boolean),
    checks,
    runtime:{running:runtime.running,status:runtime.status,latencyMs:runtime.latencyMs,base:runtime.base,identity:liveIdentity.live,expectedIdentity:liveIdentity.expected,processStartedAt:liveIdentity.processStartedAt,stale:liveIdentity.stale,legacyIdentity:liveIdentity.legacy},
    certification:{ok:certification.ok,recommendation:certification.recommendation,latest:certification.latest||null},
    release:{release:drift.release,packageVersion:drift.packageVersion},
    pairing:{counts:pairing.counts,pending:pairing.pending},
    recovery,
    authority:{readOnly:true,automaticProcessKill:false,automaticRestart:false,securityBoundaryMutation:false}
  };
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
 const result=await localDoctor(); console.log(JSON.stringify(result,null,2)); process.exitCode=result.ok?0:2;
}

import {runtimeStatus} from './local-bridge/runtime-lifecycle-v1150.mjs';
import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';
import {localReadiness} from './local-readiness-v1210.mjs';
import {certificationAudit} from './certification-audit-v1230.mjs';
import {liveRuntimeIdentity} from './live-runtime-identity-v1350.mjs';
import {classifyTrustState} from './trust-state-v1370.mjs';

export function recoveryPlan({runtime,readiness,certificateAudit,liveIdentity}){
  const actions=[];
  if(!runtime?.running) actions.push({id:'start-runtime',command:'npm run runtime:ensure',automatic:false});
  if(runtime?.running&&liveIdentity?.ok&&certificateAudit&&!certificateAudit.ok) actions.push({id:'recertify-live-process',command:'npm run certify:local',automatic:false});
  if(runtime?.running&&liveIdentity&&!liveIdentity.ok) actions.push({id:'stale-runtime',command:'Stop the existing runtime with Ctrl+C, then run npm run runtime',automatic:false});
  if(!actions.length) actions.push({id:'none',command:null,automatic:false});
  return actions;
}

export async function controlPlaneSnapshot(){
  const [runtime,identity,readiness,certificateAudit,liveIdentity]=await Promise.all([
    runtimeStatus(),loadReleaseIdentity(),localReadiness(),certificationAudit(),liveRuntimeIdentity()
  ]);
  const recovery=recoveryPlan({runtime,readiness,certificateAudit,liveIdentity});
  const trust=classifyTrustState({runtime,liveIdentity,certificateAudit});
  return {
    schema:'travai-control-plane/v1',
    generatedAt:new Date().toISOString(),
    healthy:Boolean(runtime.running&&readiness.ok&&certificateAudit.ok&&liveIdentity.ok),
    trust,
    runtime:{running:runtime.running,status:runtime.status??null,latencyMs:runtime.latencyMs??null,base:runtime.base,identity:liveIdentity.live,expectedIdentity:liveIdentity.expected,processStartedAt:liveIdentity.processStartedAt,stale:liveIdentity.stale,legacyIdentity:liveIdentity.legacy},
    release:identity,
    certification:{ok:certificateAudit.ok,releaseExact:certificateAudit.releaseExact,liveExact:certificateAudit.liveExact,recommendation:certificateAudit.recommendation,latest:certificateAudit.latest},
    recovery,
    authority:{readOnly:true,executesActions:false,automaticProcessKill:false,securityBoundaryBypass:false}
  };
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const snapshot=await controlPlaneSnapshot();
  console.log(JSON.stringify(snapshot,null,2));
  process.exit(snapshot.healthy?0:2);
}

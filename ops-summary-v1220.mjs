import {runtimeStatus} from './local-bridge/runtime-lifecycle-v1150.mjs';
import {localReadiness} from './local-readiness-v1210.mjs';
import {selfDiagnostics} from './self-diagnostics-v1210.mjs';
import {certificationHistory} from './certification-history-v1220.mjs';
import {certificationAudit} from './certification-audit-v1230.mjs';

const [runtime,readiness,diagnostics,history,certificateAudit]=await Promise.all([
  runtimeStatus(),
  localReadiness(),
  selfDiagnostics(),
  certificationHistory({limit:5}),
  certificationAudit()
]);

const result={
  ok:Boolean(runtime.running&&readiness.ok&&diagnostics.ok),
  runtime,
  readiness:{ok:readiness.ok,nextAction:readiness.nextAction,certification:readiness.certification},
  diagnostics:{ok:diagnostics.ok,checks:diagnostics.checks},
  certificationAudit:{ok:certificateAudit.ok,recommendation:certificateAudit.recommendation,latest:certificateAudit.latest},
  recentCertifications:history.map(({raw,...row})=>row)
};
console.log(JSON.stringify(result,null,2));
process.exit(result.ok?0:2);

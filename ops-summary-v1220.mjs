import {runtimeStatus} from './local-bridge/runtime-lifecycle-v1150.mjs';
import {localReadiness} from './local-readiness-v1210.mjs';
import {selfDiagnostics} from './self-diagnostics-v1210.mjs';
import {certificationHistory} from './certification-history-v1220.mjs';

const [runtime,readiness,diagnostics,history]=await Promise.all([
  runtimeStatus(),
  localReadiness(),
  selfDiagnostics(),
  certificationHistory({limit:5})
]);

const result={
  ok:Boolean(runtime.running&&readiness.ok&&diagnostics.ok),
  runtime,
  readiness:{ok:readiness.ok,nextAction:readiness.nextAction,certification:readiness.certification},
  diagnostics:{ok:diagnostics.ok,checks:diagnostics.checks},
  recentCertifications:history
};
console.log(JSON.stringify(result,null,2));
process.exit(result.ok?0:2);

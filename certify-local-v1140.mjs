import fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {probeRuntime,buildCertification,writeCertification} from './local-bridge/production-certifier-v1100.mjs';
import {runtimeMountPolicy} from './local-bridge/runtime-mount-v974.mjs';
import {schedulerPolicy} from './local-bridge/task-scheduler-v977.mjs';
import {approvalPolicy} from './local-bridge/approval-queue-v972.mjs';
import {persistencePolicy} from './local-bridge/persistent-state-v976.mjs';
import {loadReleaseIdentity,identityPolicy} from './local-bridge/runtime-identity-v1160.mjs';
import {certificationReleaseMetadata} from './local-bridge/certification-identity-v1230.mjs';
import {liveRuntimeIdentity} from './live-runtime-identity-v1350.mjs';
import {bindLiveRuntime} from './local-bridge/live-certification-binding-v1360.mjs';

const run=promisify(execFile);
const checks={};
const evidence={};
async function policyCheck(name,testFile){
  try{await run(process.execPath,[testFile],{timeout:30000,maxBuffer:1024*1024});checks[name]=true;evidence[name]='repository-test';}
  catch{checks[name]=false;evidence[name]='failed-repository-test';}
}
const probe=await probeRuntime();
const liveIdentity=await liveRuntimeIdentity();
checks['runtime-health']=probe.ok&&liveIdentity.ok;
evidence['runtime-health']=!probe.ok?'unreachable':liveIdentity.ok?'live-runtime-current':liveIdentity.legacy?'legacy-runtime-identity':'stale-runtime-identity';
await policyCheck('mutating-blocked-before-approval','tests/runtime-approval-v1060.test.mjs');
await policyCheck('restart-authority-reset','tests/approval-restore-v1080.test.mjs');
await policyCheck('scheduled-task-pending','tests/task-scheduler-v977.test.mjs');
await policyCheck('dashboard-degraded-state','tests/dashboard-recovery-v1070.test.mjs');
await policyCheck('diagnostics-secret-free','tests/diagnostics-v979.test.mjs');
checks['single-use-approval']=approvalPolicy.singleUse===true;evidence['single-use-approval']='policy-assertion';
checks['local-execution-boundary']=runtimeMountPolicy.intendedHost==='127.0.0.1'&&runtimeMountPolicy.arbitraryShell===false&&persistencePolicy.storesSessionTokens===false&&schedulerPolicy.executesActionsDirectly===false;
evidence['local-execution-boundary']='policy-assertion';
await policyCheck('scoped-pairing','tests/pairing-authority-v956.test.mjs');
checks['readonly-task']=probe.ok&&runtimeMountPolicy.sessionScope==='command:request';evidence['readonly-task']=checks['readonly-task']?'live-plus-policy':'unverified';

const manual=process.env.TRAVAI_CERT_EVIDENCE||'';
if(manual){try{const supplied=JSON.parse(await fs.readFile(manual,'utf8'));for(const [key,value] of Object.entries(supplied)){if(value===true){checks[key]=true;evidence[key]='manual-local-evidence';}}}catch{}}
const releaseIdentity=await loadReleaseIdentity();
const certificationMetadata=await certificationReleaseMetadata();
const record=buildCertification({runtimeProbe:{...probe,ok:probe.ok&&liveIdentity.ok},checks,commit:process.env.TRAVAI_COMMIT||'',version:certificationMetadata.version});
record.releaseIdentity=certificationMetadata.releaseIdentity;
record.identityPolicy={secretFree:identityPolicy.secretFree,exactPackageBinding:identityPolicy.exactPackageBinding};
record.evidenceSources=evidence;
record.automatedHarness=true;
bindLiveRuntime(record,liveIdentity);
const file=await writeCertification(record);
console.log(JSON.stringify({ok:record.productionValidated,runtimeReachable:probe.ok,liveRuntimeIdentity:liveIdentity,certificationFile:file,checks:record.checks,evidenceSources:evidence},null,2));
process.exit(record.productionValidated?0:2);

import assert from 'node:assert/strict';
import {buildCertification,certificationPolicy} from '../local-bridge/production-certifier-v1100.mjs';

const checks={
  'runtime-health':true,
  'scoped-pairing':true,
  'readonly-task':true,
  'mutating-blocked-before-approval':true,
  'single-use-approval':true,
  'restart-authority-reset':true,
  'scheduled-task-pending':true,
  'dashboard-degraded-state':true,
  'diagnostics-secret-free':true,
  'local-execution-boundary':true
};
const pass=buildCertification({runtimeProbe:{ok:true,endpoint:'/health',status:200,latencyMs:4},checks,commit:'abc',version:'11.0.0'});
assert.equal(pass.productionValidated,true);
const fail=buildCertification({runtimeProbe:{ok:false},checks});
assert.equal(fail.productionValidated,false);
const missing=buildCertification({runtimeProbe:{ok:true},checks:{...checks,'single-use-approval':false}});
assert.equal(missing.productionValidated,false);
assert.equal(certificationPolicy.storesSessionTokens,false);
assert.equal(certificationPolicy.storesApprovalIds,false);
assert.equal(certificationPolicy.failClosed,true);
console.log('v11.0.0 production certifier: PASS');

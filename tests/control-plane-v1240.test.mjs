import assert from 'node:assert/strict';
import {recoveryPlan} from '../control-plane-v1240.mjs';

assert.deepEqual(
  recoveryPlan({
    runtime:{running:false},
    readiness:{ok:false},
    certificateAudit:{ok:false},
    liveIdentity:{ok:false}
  }).map(x=>x.id),
  ['start-runtime']
);

assert.deepEqual(
  recoveryPlan({
    runtime:{running:true},
    readiness:{ok:false},
    certificateAudit:{ok:false},
    liveIdentity:{ok:true}
  }).map(x=>x.id),
  ['recertify-live-process']
);

const stale=recoveryPlan({
  runtime:{running:true},
  readiness:{ok:false},
  certificateAudit:{ok:false},
  liveIdentity:{ok:false}
});
assert.deepEqual(stale.map(x=>x.id),['stale-runtime']);

const healthy=recoveryPlan({
  runtime:{running:true},
  readiness:{ok:true},
  certificateAudit:{ok:true},
  liveIdentity:{ok:true}
});
assert.equal(healthy[0].id,'none');
assert.equal(healthy.every(x=>x.automatic===false),true);
console.log('v13.11 control plane recovery: PASS');

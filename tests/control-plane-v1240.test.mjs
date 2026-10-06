import assert from 'node:assert/strict';
import {recoveryPlan} from '../control-plane-v1240.mjs';
assert.deepEqual(recoveryPlan({runtime:{running:false},readiness:{ok:false},certificateAudit:{ok:false}}).map(x=>x.id),['start-runtime','audit-certification']);
assert.deepEqual(recoveryPlan({runtime:{running:true},readiness:{ok:false},certificateAudit:{ok:false}}).map(x=>x.id),['refresh-certification','audit-certification']);
const healthy=recoveryPlan({runtime:{running:true},readiness:{ok:true},certificateAudit:{ok:true}});
assert.equal(healthy[0].id,'none');
assert.equal(healthy.every(x=>x.automatic===false),true);
console.log('v12.4.0 control plane recovery: PASS');

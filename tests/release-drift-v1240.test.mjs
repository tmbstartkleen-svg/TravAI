import assert from 'node:assert/strict';
import {releaseDrift} from '../release-drift-v1240.mjs';
const result=await releaseDrift();
assert.equal(result.ok,true);
assert.equal(result.checks.packageIdentity,true);
assert.equal(result.checks.dashboardRelease,true);
assert.equal(result.checks.readmeRelease,true);
assert.equal(result.checks.protocolCurrent,true);
console.log('v12.4.0 release drift: PASS');

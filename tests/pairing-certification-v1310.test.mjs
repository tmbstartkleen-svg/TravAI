import assert from 'node:assert/strict';
import {pairingCertification} from '../pairing-certification-v1310.mjs';
const r=pairingCertification();
assert.equal(r.ok,true);
assert.equal(r.checks.browserCannotApprove,true);
assert.equal(r.checks.sessionAuthorityNotPersisted,true);
console.log('v13.10 pairing certification pass');

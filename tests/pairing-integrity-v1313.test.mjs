import assert from 'node:assert/strict';
import {createPairingRequestSafe,listPairingRequestsSafe,pairingIntegrityPolicy} from '../local-bridge/pairing-integrity-v1313.mjs';

const id='d'.repeat(32);
const created=await createPairingRequestSafe({requestId:id,label:'integrity test'});
assert.equal(created.id,id);
await assert.rejects(()=>createPairingRequestSafe({requestId:id,label:'duplicate'}),/PAIR_REQUEST_DUPLICATE/);
const listed=await listPairingRequestsSafe();
assert.equal(listed.some(r=>r.id===id),true);
assert.equal(pairingIntegrityPolicy.duplicateRequestRejected,true);
assert.equal(pairingIntegrityPolicy.perRequestMutationSerialization,true);
assert.equal(pairingIntegrityPolicy.rawClaimSecretPersisted,false);
assert.equal(pairingIntegrityPolicy.sessionAuthorityPersisted,false);
console.log('v13.13 pairing state integrity: PASS');

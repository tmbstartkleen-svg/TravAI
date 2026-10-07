import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const [client,html]=await Promise.all([
 readFile(new URL('../task-control-client-v972.js',import.meta.url),'utf8'),
 readFile(new URL('../vercel-index.html',import.meta.url),'utf8')
]);
for(const id of ['requestPairing','pairingClaimSecret','claimPairing','revokeSession','pairingStatus']) assert.equal(html.includes('id="'+id+'"'),true);
assert.equal(client.includes('/api/v1300/pairing/request'),true);
assert.equal(client.includes('/claim'),true);
assert.equal(client.includes('/api/v1300/session/check'),true);
assert.equal(client.includes('/api/v1300/session/revoke'),true);
assert.equal(client.includes("sessionStorage.setItem('travai_session'"),true);
assert.equal(client.includes('/approve'),false);
assert.equal(html.includes('browser cannot approve itself'),true);
console.log('v13.2.0 pairing dashboard: PASS');

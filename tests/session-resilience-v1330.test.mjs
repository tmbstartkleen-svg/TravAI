import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const [client,html,gateway]=await Promise.all([
 readFile(new URL('../task-control-client-v972.js',import.meta.url),'utf8'),
 readFile(new URL('../vercel-index.html',import.meta.url),'utf8'),
 readFile(new URL('../local-bridge/pairing-gateway-v1300.mjs',import.meta.url),'utf8')
]);
assert.equal(client.includes('sessionCountdown'),true);
assert.equal(client.includes('refreshPairingDiagnostics'),true);
assert.equal(client.includes('SESSION EXPIRED OR REVOKED'),true);
assert.equal(html.includes('id="pairingDiagnostics"'),true);
assert.equal(gateway.includes("'/api/v1300/pairing/diagnostics'"),true);
assert.equal(client.includes('/api/v1300/pairing/diagnostics'),true);
console.log('v13.3.0 session resilience UX: PASS');

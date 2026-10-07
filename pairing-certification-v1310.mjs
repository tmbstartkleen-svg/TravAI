import {durablePairingPolicy} from './local-bridge/pairing-state-v1390.mjs';
import {pairingGatewayPolicy} from './local-bridge/pairing-gateway-v1300.mjs';

export function pairingCertification(){
 const checks={
  durableCrossProcessState:durablePairingPolicy.fileMode==='0600'&&durablePairingPolicy.directoryMode==='0700',
  rawApprovalSecretNotPersisted:durablePairingPolicy.rawApprovalSecretPersisted===false,
  sessionAuthorityNotPersisted:durablePairingPolicy.sessionAuthorityPersisted===false,
  restartRequiresFreshApproval:durablePairingPolicy.restartRequiresFreshApproval===true,
  browserCannotApprove:pairingGatewayPolicy.browserCanApprove===false,
  claimSingleUse:pairingGatewayPolicy.claimIsSingleUse===true,
  runtimeLoopbackOnly:pairingGatewayPolicy.loopbackOnly===true
 };
 return {schema:'travai-pairing-certification/v1',ok:Object.values(checks).every(Boolean),checks};
}
if(import.meta.url===new URL('file:'+process.argv[1]).href){const r=pairingCertification();console.log(JSON.stringify(r,null,2));process.exitCode=r.ok?0:2;}

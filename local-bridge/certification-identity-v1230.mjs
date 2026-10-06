import fs from 'node:fs/promises';
import {loadReleaseIdentity} from './runtime-identity-v1160.mjs';

export async function certificationReleaseMetadata(){
  const identity=await loadReleaseIdentity();
  return Object.freeze({
    version:identity.release,
    releaseIdentity:identity,
    certificationBinding:'repository-release-identity'
  });
}

export function certificateMatchesRelease(record,identity){
  return Boolean(record?.productionValidated)&&record?.version===identity?.release&&record?.releaseIdentity?.packageVersion===identity?.packageVersion&&record?.releaseIdentity?.protocol===identity?.protocol;
}

export const certificationIdentityPolicy=Object.freeze({
  derivedVersion:true,
  exactPackageBinding:true,
  protocolBinding:true,
  hardcodedReleaseVersion:false
});

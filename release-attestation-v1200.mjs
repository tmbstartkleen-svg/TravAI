import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const stable=value=>{
  if(Array.isArray(value)) return value.map(stable);
  if(value&&typeof value==='object'){
    const out={}; for(const key of Object.keys(value).sort()) out[key]=stable(value[key]); return out;
  }
  return value;
};
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');

export async function buildReleaseAttestation(directory){
  const release=JSON.parse(await fs.readFile(path.join(directory,'release.json'),'utf8'));
  const integrity=JSON.parse(await fs.readFile(path.join(directory,'integrity.json'),'utf8'));
  const subject={service:release.service,packageVersion:release.packageVersion,commit:release.commit,artifact:release.artifact,runtimeAuthority:release.runtimeAuthority,integrity};
  return {
    schema:'travai-release-attestation/v1',
    algorithm:'sha256',
    subject,
    digest:digest(subject)
  };
}

export function verifyReleaseAttestation(attestation){
  if(attestation?.schema!=='travai-release-attestation/v1'||attestation?.algorithm!=='sha256'||!attestation.subject) return false;
  return /^[a-f0-9]{64}$/.test(String(attestation.digest))&&digest(attestation.subject)===attestation.digest;
}

export const attestationPolicy=Object.freeze({
  deterministic:true,
  secretFree:true,
  hostIndependent:true,
  bindsCommit:true,
  bindsIntegrityManifest:true
});

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {runtimeStatus} from './local-bridge/runtime-lifecycle-v1150.mjs';
import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';

export function certificationFresh(cert,{packageVersion,maxAgeMs=24*60*60*1000,now=Date.now()}={}){
  if(!cert?.productionValidated) return {ok:false,reason:'not-certified'};
  const generated=Date.parse(cert.generatedAt||'');
  if(!Number.isFinite(generated)||now-generated>maxAgeMs) return {ok:false,reason:'stale'};
  const bound=cert.releaseIdentity?.packageVersion;
  if(bound&&bound!==packageVersion) return {ok:false,reason:'version-mismatch'};
  return {ok:true,reason:'fresh'};
}

async function latestCertification(directory){
  try{
    const files=(await fs.readdir(directory)).filter(x=>/^production-.*\.json$/.test(x)).sort();
    if(!files.length) return null;
    return JSON.parse(await fs.readFile(path.join(directory,files.at(-1)),'utf8'));
  }catch{return null;}
}

export async function localReadiness({certificationDirectory=path.join(os.homedir(),'.travai','certifications')}={}){
  const [runtime,identity,cert]=await Promise.all([runtimeStatus(),loadReleaseIdentity(),latestCertification(certificationDirectory)]);
  const freshness=certificationFresh(cert,{packageVersion:identity.packageVersion});
  return {
    ok:Boolean(runtime.running&&freshness.ok),
    runtime,
    identity,
    certification:{present:Boolean(cert),fresh:freshness.ok,reason:freshness.reason,generatedAt:cert?.generatedAt||null},
    nextAction:!runtime.running?'start-runtime':!cert?'certify-local':!freshness.ok?'recertify-local':'ready'
  };
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const result=await localReadiness();
  console.log(JSON.stringify(result,null,2));
  process.exit(result.ok?0:2);
}

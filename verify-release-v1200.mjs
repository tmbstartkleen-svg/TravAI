import fs from 'node:fs/promises';
import path from 'node:path';
import {verifyIntegrity} from './release-integrity-v1190.mjs';
import {verifyReleaseAttestation} from './release-attestation-v1200.mjs';

export async function verifyPortableRelease(directory){
  const release=JSON.parse(await fs.readFile(path.join(directory,'release.json'),'utf8'));
  const integrity=JSON.parse(await fs.readFile(path.join(directory,'integrity.json'),'utf8'));
  const attestation=JSON.parse(await fs.readFile(path.join(directory,'attestation.json'),'utf8'));
  const integrityOk=await verifyIntegrity(directory,integrity);
  const attestationOk=verifyReleaseAttestation(attestation);
  const identityOk=attestation?.subject?.packageVersion===release.packageVersion&&attestation?.subject?.commit===release.commit&&attestation?.subject?.integrity?.algorithm===integrity.algorithm;
  return {ok:Boolean(integrityOk&&attestationOk&&identityOk),integrityOk,attestationOk,identityOk,release};
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const directory=process.argv[2]||'_site';
  try{
    const result=await verifyPortableRelease(directory);
    console.log(JSON.stringify(result,null,2));
    process.exit(result.ok?0:2);
  }catch(error){
    console.error(JSON.stringify({ok:false,error:String(error?.message||error)},null,2));
    process.exit(2);
  }
}

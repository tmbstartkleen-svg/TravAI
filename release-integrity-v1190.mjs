import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export async function sha256(file){
  const data=await fs.readFile(file);
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function buildIntegrityManifest(directory){
  const names=['index.html','task-control-client-v972.js'];
  const files={};
  for(const name of names) files[name]=await sha256(path.join(directory,name));
  return {algorithm:'sha256',files};
}

export async function verifyIntegrity(directory,manifest){
  if(manifest?.algorithm!=='sha256'||!manifest.files) return false;
  for(const [name,expected] of Object.entries(manifest.files)){
    if(!/^[a-f0-9]{64}$/.test(String(expected))) return false;
    if(await sha256(path.join(directory,name))!==expected) return false;
  }
  return true;
}

export const integrityPolicy=Object.freeze({algorithm:'sha256',secretFree:true,signingKeyRequired:false});

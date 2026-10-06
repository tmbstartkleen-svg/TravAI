import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {runtimeStatus} from './local-bridge/runtime-lifecycle-v1150.mjs';

export function summarizeReleaseHealth({packageVersion='',runtime={},certification=null}={}){
  const certified=certification?.productionValidated===true;
  return {
    packageVersion:String(packageVersion),
    runtimeRunning:runtime?.running===true,
    runtimeBase:String(runtime?.base||''),
    productionCertified:certified,
    certificationGeneratedAt:certification?.generatedAt||null,
    ready:Boolean(runtime?.running===true&&certified)
  };
}

export async function latestCertification(directory=path.join(os.homedir(),'.travai','certifications')){
  try{
    const files=(await fs.readdir(directory)).filter(x=>x.startsWith('production-')&&x.endsWith('.json')).sort();
    if(!files.length) return null;
    return JSON.parse(await fs.readFile(path.join(directory,files.at(-1)),'utf8'));
  }catch{return null;}
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const pkg=JSON.parse(await fs.readFile(new URL('./package.json',import.meta.url),'utf8'));
  const runtime=await runtimeStatus();
  const certification=await latestCertification();
  const result=summarizeReleaseHealth({packageVersion:pkg.version,runtime,certification});
  console.log(JSON.stringify(result,null,2));
  process.exit(result.ready?0:2);
}

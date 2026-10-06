import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export async function certificationHistory({directory=path.join(os.homedir(),'.travai','certifications'),limit=10}={}){
  try{
    const files=(await fs.readdir(directory)).filter(x=>/^production-.*\.json$/.test(x)).sort().reverse().slice(0,Math.max(1,Math.min(50,limit)));
    const rows=[];
    for(const file of files){
      try{
        const data=JSON.parse(await fs.readFile(path.join(directory,file),'utf8'));
        rows.push({file,generatedAt:data.generatedAt||null,version:data.version||data.releaseIdentity?.release||null,packageVersion:data.releaseIdentity?.packageVersion||null,productionValidated:data.productionValidated===true});
      }catch{}
    }
    return rows;
  }catch{return [];}
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
  console.log(JSON.stringify(await certificationHistory(),null,2));
}

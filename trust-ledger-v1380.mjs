import crypto from 'node:crypto';
import {certificationHistory} from './certification-history-v1220.mjs';

const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

export async function trustLedger({limit=25}={}){
  const history=await certificationHistory({limit});
  const entries=history.map((row,index)=>{
    const record=row.raw||{};
    const live=record.liveRuntimeBinding||null;
    const payload={
      file:row.file,
      generatedAt:row.generatedAt,
      version:row.version,
      packageVersion:row.packageVersion,
      productionValidated:row.productionValidated,
      processStartedAt:live?.processStartedAt||null,
      livePackageVersion:live?.identity?.packageVersion||null,
      liveRelease:live?.identity?.release||null,
      certificationBinding:record.certificationBinding||null
    };
    return {...payload,index,digest:digest(payload)};
  });
  return {
    schema:'travai-trust-ledger/v1',
    generatedAt:new Date().toISOString(),
    count:entries.length,
    entries,
    secretFree:true
  };
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
  console.log(JSON.stringify(await trustLedger(),null,2));
}

import {trustLedger} from './trust-ledger-v1380.mjs';

export function summarizeContinuity(entries=[]){
  const transitions=[];
  for(let i=0;i<entries.length-1;i++){
    const newer=entries[i],older=entries[i+1];
    transitions.push({
      from:older.version,
      to:newer.version,
      releaseChanged:older.packageVersion!==newer.packageVersion,
      processChanged:Boolean(older.processStartedAt&&newer.processStartedAt&&older.processStartedAt!==newer.processStartedAt),
      fromProcessStartedAt:older.processStartedAt,
      toProcessStartedAt:newer.processStartedAt
    });
  }
  const latest=entries[0]||null;
  return {
    latest,
    transitions,
    continuityOk:Boolean(latest?.productionValidated===true),
    latestBoundToLiveProcess:Boolean(latest?.certificationBinding==='live-runtime-process-identity'&&latest?.processStartedAt)
  };
}

if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const ledger=await trustLedger();
  console.log(JSON.stringify(summarizeContinuity(ledger.entries),null,2));
}

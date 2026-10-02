import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import {exportTaskState,importTaskState} from './task-orchestrator-v970.mjs';
import {exportApprovalState,importApprovalState} from './approval-queue-v972.mjs';
import {exportScheduleState,importScheduleState} from './task-scheduler-v977.mjs';
import {exportTriggerState,importTriggerState} from './event-triggers-v978.mjs';

const DIR=path.join(os.homedir(),'.travai','state');
const FILE=path.join(DIR,'runtime-state-v976.json');

async function atomicWrite(file,data){
  await fs.mkdir(path.dirname(file),{recursive:true,mode:0o700});
  const tmp=file+'.tmp';
  await fs.writeFile(tmp,JSON.stringify(data,null,2),{encoding:'utf8',mode:0o600});
  await fs.rename(tmp,file);
}

export async function savePersistentState(extra={}){
  const payload={
    version:976,
    savedAt:Date.now(),
    tasks:exportTaskState(),
    approvals:exportApprovalState(),
    schedules:exportScheduleState(),
    triggers:exportTriggerState(),
    runtime:{
      state:String(extra.state||'unknown'),
      mountedAt:Number(extra.mountedAt||0),
      lastSuccessAt:Number(extra.lastSuccessAt||0),
      lastFailureAt:Number(extra.lastFailureAt||0),
      consecutiveFailures:Number(extra.consecutiveFailures||0)
    }
  };
  await atomicWrite(FILE,payload);
  return {ok:true,file:FILE,savedAt:payload.savedAt};
}

export async function restorePersistentState(){
  try{
    const raw=await fs.readFile(FILE,'utf8');
    const data=JSON.parse(raw);
    importTaskState(data.tasks||[]);
    importApprovalState(data.approvals||[]);
    importScheduleState(data.schedules||[]);
    importTriggerState(data.triggers||[]);
    return {ok:true,restoredAt:Date.now(),savedAt:data.savedAt||0,runtime:data.runtime||{}};
  }catch(error){
    if(error?.code==='ENOENT') return {ok:true,empty:true};
    return {ok:false,error:error?.message||'STATE_RESTORE_FAILED'};
  }
}

export async function clearPersistentState(){
  try{await fs.unlink(FILE);return {ok:true}}
  catch(error){if(error?.code==='ENOENT') return {ok:true}; throw error}
}

export const persistencePolicy=Object.freeze({
  location:'~/.travai/state/runtime-state-v976.json',
  fileMode:'0600',
  directoryMode:'0700',
  atomicWrite:true,
  storesSessionTokens:false,
  restoresApprovedAuthority:false,
  localOnly:true
});

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createTask} from './task-orchestrator-v970.mjs';

const triggers=new Map();
const id=()=>crypto.randomBytes(12).toString('hex');
const copy=v=>JSON.parse(JSON.stringify(v));
const now=()=>Date.now();
const ALLOWED=new Set(['runtime-health','file-exists','file-changed','app-running']);
const home=os.homedir();

function safeHomePath(value){
  const resolved=path.resolve(home,String(value||''));
  if(resolved!==home && !resolved.startsWith(home+path.sep)) throw new Error('TRIGGER_PATH_OUTSIDE_HOME');
  return resolved;
}

export function createTrigger({label='TravAI event trigger',type,condition={},steps=[],cooldownMs=60_000}={}){
  if(!ALLOWED.has(type)) throw new Error('TRIGGER_TYPE_NOT_ALLOWED');
  const cooldown=Math.max(10_000,Number(cooldownMs)||60_000);
  const item={id:id(),label:String(label).slice(0,100),type,condition:copy(condition),steps:copy(steps),cooldownMs:cooldown,enabled:true,status:'watching',createdAt:now(),updatedAt:now(),lastCheckedAt:0,lastFiredAt:0,lastValue:null,fireCount:0};
  if(['file-exists','file-changed'].includes(type)) item.condition.path=safeHomePath(condition.path);
  triggers.set(item.id,item);
  return copy(item);
}

export function listTriggers(){return [...triggers.values()].map(copy)}
export function setTriggerEnabled(triggerId,enabled){
  const item=triggers.get(String(triggerId||'')); if(!item) return {ok:false,reason:'TRIGGER_NOT_FOUND'};
  item.enabled=Boolean(enabled); item.status=item.enabled?'watching':'paused'; item.updatedAt=now();
  return {ok:true,trigger:copy(item)};
}
export function removeTrigger(triggerId){return {ok:triggers.delete(String(triggerId||''))}}

async function evaluate(item,providers={}){
  if(item.type==='runtime-health') return Boolean(await providers.runtimeHealthy?.());
  if(item.type==='app-running') return Boolean(await providers.appRunning?.(String(item.condition.app||'')));
  if(item.type==='file-exists'){try{await fs.access(item.condition.path);return true}catch{return false}}
  if(item.type==='file-changed'){
    try{const stat=await fs.stat(item.condition.path);return Number(stat.mtimeMs)}
    catch{return 0}
  }
  return false;
}

export async function tickTriggers({time=now(),providers={}}={}){
  const created=[];
  for(const item of triggers.values()){
    if(!item.enabled) continue;
    const value=await evaluate(item,providers);
    item.lastCheckedAt=time;
    const prior=item.lastValue;
    item.lastValue=value;
    let matched=false;
    if(item.type==='file-changed') matched=prior!=null && value!==0 && value!==prior;
    else matched=value===true && prior!==true;
    if(matched && time-item.lastFiredAt>=item.cooldownMs){
      const task=createTask({label:item.label,steps:item.steps});
      item.lastFiredAt=time; item.fireCount+=1; item.updatedAt=time; created.push(task);
    }
  }
  return {created,triggers:listTriggers()};
}

export function exportTriggerState(){return listTriggers()}
export function importTriggerState(records=[]){
  triggers.clear();
  for(const raw of Array.isArray(records)?records:[]){
    if(!raw||!raw.id||!ALLOWED.has(raw.type)||!Array.isArray(raw.steps)) continue;
    const item=copy(raw);
    if(['file-exists','file-changed'].includes(item.type)){try{item.condition.path=safeHomePath(item.condition.path)}catch{continue}}
    item.status=item.enabled?'watching':'paused';
    triggers.set(String(item.id),item);
  }
  return listTriggers();
}

export const triggerPolicy=Object.freeze({
  allowedTypes:[...ALLOWED],
  pathScope:'user-home',
  createsTasksOnly:true,
  executesMacActions:false,
  minimumCooldownMs:10_000,
  consequentialActionsStillRequireApproval:true,
  arbitraryShell:false
});

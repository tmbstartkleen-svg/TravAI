import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {randomUUID} from 'node:crypto';

const directory=()=>join(homedir(),'.travai','state');
const file=()=>join(directory(),'agent-receipts-v1318.json');
const allowed=new Set(['blocked','executed','failed','verification-failed']);
let writeQueue=Promise.resolve();
const sanitize=(v,max=96)=>String(v??'').replace(/[^a-zA-Z0-9_.:-]/g,'').slice(0,max);
export async function readAgentReceipts(){
 try{
  const parsed=JSON.parse(await readFile(file(),'utf8'));
  return Array.isArray(parsed)?parsed.filter(x=>x&&typeof x==='object').slice(-500):[];
 }catch(error){
  if(error?.code==='ENOENT')return [];
  throw error;
 }
}
export function appendAgentReceipt({taskId,stepId,action,result}={}){
 const record={id:randomUUID(),at:new Date().toISOString(),taskId:sanitize(taskId),stepId:sanitize(stepId),
  action:sanitize(action),result:allowed.has(result)?result:'failed'};
 const operation=writeQueue.then(async()=>{
  const entries=await readAgentReceipts();
  entries.push(record);
  await mkdir(directory(),{recursive:true,mode:0o700});
  const tmp=join(directory(),`agent-receipts-${record.id}.tmp`);
  await writeFile(tmp,JSON.stringify(entries.slice(-500)),{mode:0o600,flag:'wx'});
  await rename(tmp,file());
  return record;
 });
 writeQueue=operation.catch(()=>{});
 return operation;
}

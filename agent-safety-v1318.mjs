import {readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';

export const AGENT_ACTIONS=Object.freeze({
  'read-health':'read','read-readiness':'read',
  'open-app':'execute','quit-app':'execute','open-system-settings-pane':'execute',
  'set-volume':'execute','toggle-mute':'execute','finder-open-path':'execute','shortcut-run':'execute'
});
export function authorizeAgentTask({action,permission='read',approved=false}={}){
  const required=AGENT_ACTIONS[action];
  if(!required) return {allowed:false,reason:'action-not-allowlisted'};
  if(required==='read') return {allowed:['read','analyze','propose','execute'].includes(permission),reason:'read-scope'};
  if(permission!=='execute') return {allowed:false,reason:'execute-permission-required'};
  if(approved!==true) return {allowed:false,reason:'explicit-approval-required'};
  return {allowed:true,reason:'approved-scoped-action'};
}
export function summarizeAgentReceipts(records=[]){
  return {schema:'travai-agent-safety/v1',total:records.length,
    blocked:records.filter(x=>x?.result==='blocked').length,
    executed:records.filter(x=>x?.result==='executed').length,
    automaticApproval:false,arbitraryCommands:false};
}
export async function agentSafetyStatus(){
  const location=join(homedir(),'.travai','state','runtime-state-v976.json');
  let state='unavailable';
  try { const value=JSON.parse(await readFile(location,'utf8')); state=value&&typeof value==='object'?'readable':'invalid'; }
  catch(e){state=e.code==='ENOENT'?'missing':'invalid';}
  return {schema:'travai-agent-safety/v1',state,defaultPermission:'read',
    allowedActions:Object.keys(AGENT_ACTIONS),mutationsRequireApproval:true,
    automaticApproval:false,arbitraryCommands:false};
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
  console.log(JSON.stringify(await agentSafetyStatus(),null,2));
}

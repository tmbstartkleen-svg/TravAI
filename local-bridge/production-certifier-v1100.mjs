import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const BASE=process.env.TRAVAI_RUNTIME_URL||'http://127.0.0.1:4783';
const REQUIRED=[
  'runtime-health',
  'scoped-pairing',
  'readonly-task',
  'mutating-blocked-before-approval',
  'single-use-approval',
  'restart-authority-reset',
  'scheduled-task-pending',
  'dashboard-degraded-state',
  'diagnostics-secret-free',
  'local-execution-boundary'
];

function clean(value){
  return String(value??'').replace(/[\r\n\0]/g,' ').slice(0,180);
}

export async function probeRuntime(fetchImpl=fetch){
  const startedAt=Date.now();
  const candidates=['/api/v958/bridge/health','/health','/api/health'];
  for(const endpoint of candidates){
    try{
      const res=await fetchImpl(BASE+endpoint,{signal:AbortSignal.timeout(2500),headers:{accept:'application/json'}});
      if(res.ok) return {ok:true,endpoint,status:res.status,latencyMs:Date.now()-startedAt};
    }catch{}
  }
  return {ok:false,endpoint:null,status:null,latencyMs:Date.now()-startedAt};
}

export function buildCertification({runtimeProbe,checks={},commit='',version=''}={}){
  const normalized={};
  for(const name of REQUIRED) normalized[name]=checks[name]===true;
  const passed=Boolean(runtimeProbe?.ok)&&REQUIRED.every(name=>normalized[name]===true);
  return {
    schema:'travai-production-certification/v1',
    generatedAt:new Date().toISOString(),
    platform:process.platform,
    hostname:clean(os.hostname()),
    version:clean(version),
    commit:clean(commit),
    runtime:{reachable:Boolean(runtimeProbe?.ok),endpoint:clean(runtimeProbe?.endpoint),status:runtimeProbe?.status??null,latencyMs:runtimeProbe?.latencyMs??null},
    checks:normalized,
    productionValidated:passed
  };
}

export async function writeCertification(record,{directory=path.join(os.homedir(),'.travai','certifications')}={}){
  await fs.mkdir(directory,{recursive:true,mode:0o700});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const file=path.join(directory,'production-'+stamp+'.json');
  await fs.writeFile(file,JSON.stringify(record,null,2)+'\n',{mode:0o600});
  return file;
}

export const certificationPolicy=Object.freeze({
  localOnly:true,
  storesSessionTokens:false,
  storesApprovalIds:false,
  requiresRuntimeReachable:true,
  requiresExplicitChecks:[...REQUIRED],
  failClosed:true
});

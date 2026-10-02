import {savePersistentState} from './persistent-state-v976.mjs';
import {authorizeSession} from './pairing-authority-v956.mjs';
import {handleTaskApi} from './task-api-routes-v973.mjs';
import {getTask} from './task-orchestrator-v970.mjs';
import {consumeApproval} from './approval-queue-v972.mjs';
import {runNextApprovedTaskStep} from './task-runner-v971.mjs';

function header(req,name){
  const key=String(name).toLowerCase();
  if(typeof req?.headers?.get==='function') return req.headers.get(name)||'';
  const headers=req?.headers||{};
  return headers[key]||headers[name]||'';
}

function pathname(req){
  try{return new URL(req.url,'http://127.0.0.1').pathname}
  catch{return String(req?.url||'').split('?')[0]}
}

async function readBody(req){
  if(req?.body && typeof req.body==='object' && !Buffer.isBuffer(req.body)) return req.body;
  if(typeof req?.json==='function') return await req.json();
  if(req && typeof req[Symbol.asyncIterator]==='function'){
    const chunks=[];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));
    if(!chunks.length) return {};
    const raw=Buffer.concat(chunks).toString('utf8').trim();
    return raw?JSON.parse(raw):{};
  }
  return {};
}

function response(status,body){
  return {status,headers:{'content-type':'application/json','cache-control':'no-store'},body};
}

function withParsedBody(req,body,url=req.url){
  return {...req,url,body};
}

function authorize(req){
  const token=header(req,'x-travai-session');
  return authorizeSession(token,'command:request');
}

export async function handleRuntimeTaskRequest(req,{run}={}){
  const path=pathname(req);
  if(!path.startsWith('/api/v974/')) return null;

  const auth=authorize(req);
  if(!auth.ok) return response(401,{ok:false,error:auth.reason||'UNAUTHORIZED'});

  const execute=path.match(/^\/api\/v974\/tasks\/([a-f0-9]+)\/execute$/i);
  if(String(req.method||'GET').toUpperCase()==='POST' && execute){
    const taskId=execute[1];
    const task=getTask(taskId);
    if(!task) return response(404,{ok:false,error:'TASK_NOT_FOUND'});
    const step=task.steps?.[task.currentStep];
    if(!step) return response(409,{ok:false,error:'NO_ACTIVE_STEP'});

    try{
      const data=await readBody(req);
      if(step.requiresApproval!==false){
        consumeApproval(data.approvalId,{taskId,stepId:step.id});
      }
      const result=await runNextApprovedTaskStep(taskId,{approved:true,run});
      await savePersistentState();
      return response(200,{ok:!result.error,...result});
    }catch(error){
      return response(409,{ok:false,error:error?.message||'EXECUTION_FAILED',task:getTask(taskId)});
    }
  }

  const data=await readBody(req);
  const rewritten=String(req.url||'').replace('/api/v974/','/api/v973/');
  return await handleTaskApi(withParsedBody(req,data,rewritten));
}

export function createMountedTaskHandler(existingHandler,{run}={}){
  return async function mountedTaskHandler(req,res){
    const result=await handleRuntimeTaskRequest(req,{run});
    if(!result){
      if(typeof existingHandler==='function') return existingHandler(req,res);
      return false;
    }

    if(res && typeof res.writeHead==='function'){
      res.writeHead(result.status,result.headers);
      res.end(JSON.stringify(result.body));
      return true;
    }

    return result;
  };
}

export const runtimeMountPolicy=Object.freeze({
  intendedHost:'127.0.0.1',
  intendedPort:4783,
  createsListener:false,
  reusesExistingRuntime:true,
  sessionScope:'command:request',
  approvalSingleUse:true,
  arbitraryShell:false,
  macSecurityBypass:false
});

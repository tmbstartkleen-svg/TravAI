import {savePersistentState} from './persistent-state-v976.mjs';
import {createSchedule,listSchedules,pauseSchedule,resumeSchedule,cancelSchedule,tickScheduler} from './task-scheduler-v977.mjs';
import crypto from 'node:crypto';
import {createTask,listTasks,getTask,cancelTask,taskDiagnostics} from './task-orchestrator-v970.mjs';
import {createApproval,listApprovals,decideApproval} from './approval-queue-v972.mjs';

const json=(status,body)=>({status,headers:{'content-type':'application/json','cache-control':'no-store'},body});
const newid=()=>crypto.randomBytes(12).toString('hex');

function pathname(req){
  try{return new URL(req.url,'http://127.0.0.1').pathname}catch{return String(req.url||'').split('?')[0]}
}
async function body(req){
  if(req.body && typeof req.body==='object') return req.body;
  if(typeof req.json==='function') return await req.json();
  return {};
}

export async function handleTaskApi(req){
  const method=String(req.method||'GET').toUpperCase();
  const path=pathname(req);

  if(method==='GET' && path==='/api/v973/diagnostics'){
    return json(200,{ok:true,diagnostics:taskDiagnostics()});
  }

  if(method==='GET' && path==='/api/v973/schedules'){
    return json(200,{ok:true,schedules:listSchedules()});
  }

  if(method==='POST' && path==='/api/v973/schedules'){
    try{
      const data=await body(req);
      const schedule=createSchedule(data);
      await savePersistentState();
      return json(201,{ok:true,schedule});
    }catch(error){return json(400,{ok:false,error:error?.message||'INVALID_SCHEDULE'})}
  }

  const scheduleAction=path.match(/^\/api\/v973\/schedules\/([a-f0-9]+)\/(pause|resume|cancel)$/i);
  if(method==='POST' && scheduleAction){
    try{
      const data=await body(req);
      const [,scheduleId,action]=scheduleAction;
      const result=action==='pause'?pauseSchedule(scheduleId):action==='resume'?resumeSchedule(scheduleId,data):cancelSchedule(scheduleId);
      if(!result.ok) return json(404,{ok:false,error:result.reason||'SCHEDULE_NOT_FOUND'});
      await savePersistentState();
      return json(200,{ok:true,...result});
    }catch(error){return json(400,{ok:false,error:error?.message||'SCHEDULE_ACTION_FAILED'})}
  }

  if(method==='POST' && path==='/api/v973/scheduler/tick'){
    const data=await body(req);
    const result=tickScheduler(data.time==null?Date.now():Number(data.time));
    await savePersistentState();
    return json(200,{ok:true,...result});
  }

  if(method==='GET' && path==='/api/v973/tasks'){
    return json(200,{ok:true,tasks:listTasks()});
  }

  if(method==='POST' && path==='/api/v973/tasks'){
    try{
      const data=await body(req);
      const task=createTask({label:data.label,steps:data.steps}); await savePersistentState(); return json(201,{ok:true,task});
    }catch(error){return json(400,{ok:false,error:error?.message||'INVALID_TASK'})}
  }

  const cancel=path.match(/^\/api\/v973\/tasks\/([a-f0-9]+)\/cancel$/i);
  if(method==='POST' && cancel){
    const result=cancelTask(cancel[1]);
    if(result.ok) await savePersistentState(); return result.ok?json(200,{ok:true,result}):json(404,{ok:false,error:result.reason||'TASK_NOT_FOUND'});
  }

  const approvalFor=path.match(/^\/api\/v973\/tasks\/([a-f0-9]+)\/approval$/i);
  if(method==='POST' && approvalFor){
    const task=getTask(approvalFor[1]);
    if(!task) return json(404,{ok:false,error:'TASK_NOT_FOUND'});
    const step=task.steps?.[task.currentStep];
    if(!step) return json(409,{ok:false,error:'NO_ACTIVE_STEP'});
    try{
      const approval=createApproval({id:newid(),taskId:task.id,stepId:step.id,action:step.action});
      await savePersistentState();
      return json(201,{ok:true,approval});
    }catch(error){return json(400,{ok:false,error:error?.message||'APPROVAL_CREATE_FAILED'})}
  }

  if(method==='GET' && path==='/api/v973/approvals'){
    return json(200,{ok:true,approvals:listApprovals()});
  }

  const decision=path.match(/^\/api\/v973\/approvals\/([a-f0-9]+)$/i);
  if(method==='POST' && decision){
    try{
      const data=await body(req);
      const approval=decideApproval(decision[1],data.decision);
      await savePersistentState();
      return json(200,{ok:true,approval});
    }catch(error){return json(409,{ok:false,error:error?.message||'APPROVAL_UPDATE_FAILED'})}
  }

  return null;
}

export const taskApiPolicy=Object.freeze({
  bindTarget:'existing-local-runtime',
  intendedHost:'127.0.0.1',
  createsServer:false,
  arbitraryShell:false,
  executesMacActions:false,
  approvalDecisionsOnly:true
});

import crypto from 'node:crypto';
import {createTask,getTask} from './task-orchestrator-v970.mjs';

const schedules=new Map();
const id=()=>crypto.randomBytes(12).toString('hex');
const now=()=>Date.now();
const copy=v=>JSON.parse(JSON.stringify(v));

function normalizeDependencies(value=[]){
  if(!Array.isArray(value)) throw new Error('INVALID_DEPENDENCIES');
  return [...new Set(value.map(String).filter(Boolean))].slice(0,20);
}

function normalizeRecurrence(value){
  if(value==null) return null;
  const ms=Number(value);
  if(!Number.isFinite(ms) || ms<60_000) throw new Error('RECURRENCE_MINIMUM_60_SECONDS');
  return Math.round(ms);
}

export function createSchedule({
  label='Scheduled TravAI task',
  steps=[],
  runAt=now(),
  everyMs=null,
  dependsOn=[]
}={}){
  const due=Number(runAt);
  if(!Number.isFinite(due)) throw new Error('INVALID_RUN_AT');
  const record={
    id:id(),
    label:String(label).slice(0,100),
    steps:copy(steps),
    runAt:due,
    everyMs:normalizeRecurrence(everyMs),
    dependsOn:normalizeDependencies(dependsOn),
    status:'scheduled',
    paused:false,
    createdAt:now(),
    updatedAt:now(),
    lastTaskId:null,
    lastRunAt:0,
    nextRunAt:due,
    runCount:0
  };
  schedules.set(record.id,record);
  return copy(record);
}

export function listSchedules(){
  return [...schedules.values()].map(copy);
}

export function getSchedule(scheduleId){
  const item=schedules.get(String(scheduleId||''));
  return item?copy(item):null;
}

export function pauseSchedule(scheduleId){
  const item=schedules.get(String(scheduleId||''));
  if(!item) return {ok:false,reason:'SCHEDULE_NOT_FOUND'};
  item.paused=true;
  item.status='paused';
  item.updatedAt=now();
  return {ok:true,schedule:copy(item)};
}

export function resumeSchedule(scheduleId,{runAt}={}){
  const item=schedules.get(String(scheduleId||''));
  if(!item) return {ok:false,reason:'SCHEDULE_NOT_FOUND'};
  item.paused=false;
  item.status='scheduled';
  if(runAt!=null){
    const due=Number(runAt);
    if(!Number.isFinite(due)) throw new Error('INVALID_RUN_AT');
    item.nextRunAt=due;
  }
  item.updatedAt=now();
  return {ok:true,schedule:copy(item)};
}

export function cancelSchedule(scheduleId){
  const item=schedules.get(String(scheduleId||''));
  if(!item) return {ok:false,reason:'SCHEDULE_NOT_FOUND'};
  item.status='cancelled';
  item.paused=false;
  item.updatedAt=now();
  return {ok:true,schedule:copy(item)};
}

function dependenciesComplete(item){
  for(const dependencyId of item.dependsOn){
    const depSchedule=schedules.get(dependencyId);
    if(depSchedule){
      if(!depSchedule.lastTaskId) return false;
      const depTask=getTask(depSchedule.lastTaskId);
      if(!depTask || depTask.status!=='completed') return false;
      continue;
    }
    const depTask=getTask(dependencyId);
    if(!depTask || depTask.status!=='completed') return false;
  }
  return true;
}

export function tickScheduler(time=now()){
  const created=[];
  for(const item of schedules.values()){
    if(item.status==='cancelled' || item.paused) continue;
    if(time<item.nextRunAt) continue;

    if(!dependenciesComplete(item)){
      item.status='waiting-dependency';
      item.updatedAt=time;
      continue;
    }

    if(item.lastTaskId){
      const previous=getTask(item.lastTaskId);
      if(previous && !['completed','failed','cancelled'].includes(previous.status)){
        item.status='waiting-previous-run';
        item.updatedAt=time;
        continue;
      }
    }

    const task=createTask({label:item.label,steps:item.steps});
    item.lastTaskId=task.id;
    item.lastRunAt=time;
    item.runCount+=1;
    item.updatedAt=time;
    created.push(task);

    if(item.everyMs){
      item.nextRunAt=time+item.everyMs;
      item.status='scheduled';
    }else{
      item.nextRunAt=0;
      item.status='completed';
    }
  }
  return {created, schedules:listSchedules()};
}

export function exportScheduleState(){
  return listSchedules();
}

export function importScheduleState(records=[]){
  schedules.clear();
  const time=now();
  for(const raw of Array.isArray(records)?records:[]){
    if(!raw || typeof raw!=='object' || !raw.id || !Array.isArray(raw.steps)) continue;
    const item=copy(raw);
    if(item.status==='waiting-previous-run' || item.status==='waiting-dependency') item.status='scheduled';
    if(item.status==='paused') item.paused=true;
    if(item.everyMs && item.nextRunAt<time && item.lastRunAt){
      item.nextRunAt=Math.max(time,item.lastRunAt+item.everyMs);
    }
    schedules.set(String(item.id),item);
  }
  return listSchedules();
}

export const schedulerPolicy=Object.freeze({
  minimumRecurrenceMs:60_000,
  executesActionsDirectly:false,
  createsTasksOnly:true,
  consequentialActionsStillRequireApproval:true,
  arbitraryShell:false,
  securityBoundaryBypass:false
});

import {tickScheduler} from './task-scheduler-v977.mjs';
import {savePersistentState} from './persistent-state-v976.mjs';

export function startSchedulerLoop({intervalMs=1000,onTick}={}){
  const ms=Math.max(250,Number(intervalMs)||1000);
  let running=false;

  const run=async()=>{
    if(running) return;
    running=true;
    try{
      const result=tickScheduler(Date.now());
      if(result.created.length){
        await savePersistentState();
      }
      if(typeof onTick==='function') await onTick(result);
    }finally{
      running=false;
    }
  };

  const timer=setInterval(()=>{run().catch(()=>{})},ms);
  if(typeof timer.unref==='function') timer.unref();

  return Object.freeze({
    stop:()=>clearInterval(timer),
    tick:run,
    intervalMs:ms
  });
}

export const schedulerLoopPolicy=Object.freeze({
  createsTasksOnly:true,
  executesMacActions:false,
  approvalBypass:false,
  minimumLoopMs:250
});

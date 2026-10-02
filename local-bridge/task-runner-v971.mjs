import {nextStep,recordStepResult} from './task-orchestrator-v970.mjs';
import {executeMacAction,verifyMacAction} from './mac-action-executor-v971.mjs';

export async function runNextApprovedTaskStep(taskId,{approved=false,run}={}){
  const step=nextStep(taskId);
  if (!step) return {done:true,taskId};

  try{
    const output=await executeMacAction(step,{approved,run});
    const verified=verifyMacAction(step,output);
    const task=recordStepResult(taskId,{ok:output.ok,result:output.result,verified});
    return {done:task.status==='completed',step,output,verified,task};
  }catch(error){
    const task=recordStepResult(taskId,{ok:false,error:error?.message||String(error),verified:false});
    return {done:false,step,error:error?.message||String(error),task};
  }
}

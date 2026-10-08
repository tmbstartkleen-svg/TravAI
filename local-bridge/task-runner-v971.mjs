import {nextStep,recordStepResult} from './task-orchestrator-v970.mjs';
import {executeMacAction,verifyMacAction} from './mac-action-executor-v971.mjs';
import {appendAgentReceipt} from './agent-receipts-v1318.mjs';

export async function runNextApprovedTaskStep(taskId,{approved=false,run}={}){
  const step=nextStep(taskId);
  if(!step)return {done:true,taskId};
  let output,verified=false,task,errorMessage;
  try{
    output=await executeMacAction(step,{approved,run});
    verified=verifyMacAction(step,output);
    task=recordStepResult(taskId,{ok:output.ok,result:output.result,verified});
  }catch(error){
    errorMessage=error?.message||String(error);
    task=recordStepResult(taskId,{ok:false,error:errorMessage,verified:false});
  }
  const outcome=errorMessage||!output?.ok?'failed':verified?'executed':'verification-failed';
  try{
    await appendAgentReceipt({taskId,stepId:step.id,action:step.action,result:outcome});
  }catch{
    // The step has already been recorded. Never disguise an executed action as
    // an unattempted one or invite an automatic retry on an audit disk failure.
    return {done:task.status==='completed',step,output,verified,task,error:'AUDIT_WRITE_FAILED',auditFailed:true,executionAttempted:true};
  }
  if(errorMessage)return {done:false,step,error:errorMessage,task};
  return {done:task.status==='completed',step,output,verified,task};
}

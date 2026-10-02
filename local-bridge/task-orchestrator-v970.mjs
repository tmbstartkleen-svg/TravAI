import crypto from 'node:crypto';

const tasks = new Map();
const MAX_RETRIES = 2;
const ALLOWED_ACTIONS = new Set([
  'read-health',
  'read-readiness',
  'open-app',
  'quit-app',
  'open-system-settings-pane',
  'set-volume',
  'toggle-mute',
  'finder-open-path',
  'shortcut-run'
]);

function id(){ return crypto.randomBytes(12).toString('hex'); }
function now(){ return Date.now(); }
function clone(v){ return JSON.parse(JSON.stringify(v)); }

function normalizeSteps(steps=[]){
  if (!Array.isArray(steps) || steps.length === 0) throw new Error('TASK_REQUIRES_STEPS');
  if (steps.length > 20) throw new Error('TASK_TOO_LARGE');
  return steps.map((step,index)=>{
    const action=String(step?.action||'');
    if (!ALLOWED_ACTIONS.has(action)) throw new Error('ACTION_NOT_ALLOWED:'+action);
    return {
      id: String(step?.id||('step-'+(index+1))),
      action,
      input: step?.input && typeof step.input === 'object' ? clone(step.input) : {},
      verify: step?.verify && typeof step.verify === 'object' ? clone(step.verify) : null,
      requiresApproval: ['read-health','read-readiness'].includes(action) ? step?.requiresApproval === true : true,
      attempts: 0,
      status: 'pending',
      result: null,
      error: null
    };
  });
}

export function createTask({label='TravAI task',steps=[]}={}){
  const task={
    id:id(),
    label:String(label).slice(0,100),
    createdAt:now(),
    updatedAt:now(),
    status:'pending',
    currentStep:0,
    maxRetries:MAX_RETRIES,
    steps:normalizeSteps(steps),
    history:[{at:now(),event:'task-created'}]
  };
  tasks.set(task.id,task);
  return clone(task);
}

export function getTask(taskId){
  const task=tasks.get(String(taskId||''));
  return task ? clone(task) : null;
}

export function listTasks(){
  return [...tasks.values()].map(clone);
}

export function taskDiagnostics(){
  const items=listTasks();
  const byStatus={};
  let retries=0, failures=0, completedSteps=0;
  for(const task of items){
    byStatus[task.status]=(byStatus[task.status]||0)+1;
    for(const step of task.steps||[]){
      retries+=Math.max(0,(step.attempts||0)-1);
      if(step.status==='failed') failures+=1;
      if(step.status==='completed') completedSteps+=1;
    }
  }
  return {
    totalTasks:items.length,
    byStatus,
    retries,
    failedSteps:failures,
    completedSteps,
    recentHistory:items.flatMap(t=>(t.history||[]).slice(-5).map(h=>({taskId:t.id,label:t.label,event:h.event,at:h.at}))).sort((a,b)=>b.at-a.at).slice(0,50)
  };
}

export function exportTaskState(){
  return listTasks();
}

export function importTaskState(records=[]){
  tasks.clear();
  for(const raw of Array.isArray(records)?records:[]){
    if(!raw || typeof raw!=='object' || !raw.id || !Array.isArray(raw.steps)) continue;
    const safe={...clone(raw)};
    if(safe.status==='running') safe.status='pending';
    if(safe.steps?.[safe.currentStep]?.status==='running') safe.steps[safe.currentStep].status='pending';
    tasks.set(String(safe.id),safe);
  }
  return listTasks();
}

export function nextStep(taskId){
  const task=tasks.get(String(taskId||''));
  if (!task) throw new Error('TASK_NOT_FOUND');
  if (['completed','failed','cancelled'].includes(task.status)) return null;
  const step=task.steps[task.currentStep];
  if (!step){
    task.status='completed'; task.updatedAt=now();
    task.history.push({at:now(),event:'task-completed'});
    return null;
  }
  task.status='running'; task.updatedAt=now();
  return clone(step);
}

export function recordStepResult(taskId,{ok,result=null,error=null,verified=false}={}){
  const task=tasks.get(String(taskId||''));
  if (!task) throw new Error('TASK_NOT_FOUND');
  const step=task.steps[task.currentStep];
  if (!step) throw new Error('NO_ACTIVE_STEP');

  step.attempts += 1;
  task.updatedAt=now();

  if (ok && (step.verify ? verified : true)){
    step.status='completed';
    step.result=clone(result);
    step.error=null;
    task.history.push({at:now(),event:'step-completed',stepId:step.id,attempt:step.attempts});
    task.currentStep += 1;
    if (task.currentStep >= task.steps.length){
      task.status='completed';
      task.history.push({at:now(),event:'task-completed'});
    }
    return clone(task);
  }

  step.error=String(error||(!verified && ok ? 'VERIFICATION_FAILED' : 'STEP_FAILED'));
  if (step.attempts <= task.maxRetries){
    step.status='retry-pending';
    task.status='retry-pending';
    task.history.push({at:now(),event:'step-retry',stepId:step.id,attempt:step.attempts,error:step.error});
  } else {
    step.status='failed';
    task.status='failed';
    task.history.push({at:now(),event:'task-failed',stepId:step.id,attempt:step.attempts,error:step.error});
  }
  return clone(task);
}

export function cancelTask(taskId){
  const task=tasks.get(String(taskId||''));
  if (!task) return {ok:false};
  if (task.status==='completed') return {ok:false,reason:'ALREADY_COMPLETED'};
  task.status='cancelled'; task.updatedAt=now();
  task.history.push({at:now(),event:'task-cancelled'});
  return {ok:true};
}

export const autonomousPolicy = Object.freeze({
  localAuthority:true,
  explicitApprovalForConsequentialActions:true,
  allowlistedActionsOnly:true,
  automaticVerification:true,
  mutatingApprovalCannotBeDisabled:true,
  boundedRetries:MAX_RETRIES,
  arbitraryShell:false,
  unrestrictedFilesystem:false,
  securityBoundaryBypass:false,
  silentCloudFallback:false
});

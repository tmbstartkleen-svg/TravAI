import {createMountedTaskHandler} from './runtime-mount-v974.mjs';

const DEFAULT_BACKOFF_MS=[250,500,1000,2000,5000];
const now=()=>Date.now();

export function createRuntimeSupervisor({
  existingHandler,
  run,
  maxConsecutiveFailures=5,
  backoffMs=DEFAULT_BACKOFF_MS
}={}){
  if(typeof existingHandler!=='function') throw new Error('EXISTING_HANDLER_REQUIRED');

  let mounted=createMountedTaskHandler(existingHandler,{run});
  let mountedAt=now();
  let lastSuccessAt=0;
  let lastFailureAt=0;
  let failures=0;
  let state='ready';

  function status(){
    return {
      state,
      mounted:true,
      mountedAt,
      lastSuccessAt,
      lastFailureAt,
      consecutiveFailures:failures,
      maxConsecutiveFailures,
      createsListener:false
    };
  }

  function delayForFailure(){
    const index=Math.min(Math.max(failures-1,0),backoffMs.length-1);
    return Number(backoffMs[index]||0);
  }

  async function recover(){
    state='recovering';
    mounted=createMountedTaskHandler(existingHandler,{run});
    mountedAt=now();
    state='ready';
    return status();
  }

  async function handler(req,res){
    try{
      const result=await mounted(req,res);
      failures=0;
      lastSuccessAt=now();
      state='ready';
      return result;
    }catch(error){
      failures+=1;
      lastFailureAt=now();
      state=failures>=maxConsecutiveFailures?'degraded':'recovering';
      const retryAfterMs=delayForFailure();

      if(failures<maxConsecutiveFailures){
        await recover();
      }

      if(res && typeof res.writeHead==='function' && !res.headersSent){
        res.writeHead(503,{'content-type':'application/json','cache-control':'no-store','retry-after':String(Math.ceil(retryAfterMs/1000))});
        res.end(JSON.stringify({ok:false,error:'LOCAL_RUNTIME_RECOVERY',retryAfterMs}));
        return true;
      }

      return {
        status:503,
        headers:{'content-type':'application/json','cache-control':'no-store'},
        body:{ok:false,error:'LOCAL_RUNTIME_RECOVERY',retryAfterMs}
      };
    }
  }

  return Object.freeze({
    handler,
    status,
    recover
  });
}

export function autoMountRuntime(runtime,{run}={}){
  if(!runtime || typeof runtime.handler!=='function') throw new Error('RUNTIME_HANDLER_REQUIRED');
  const supervisor=createRuntimeSupervisor({existingHandler:runtime.handler,run});
  runtime.handler=supervisor.handler;
  runtime.travAiTaskSupervisor=supervisor;
  return supervisor;
}

export const recoveryPolicy=Object.freeze({
  createsListener:false,
  changesPort:false,
  boundedBackoff:true,
  autoRemount:true,
  maxDefaultFailures:5,
  arbitraryShell:false,
  permissionBypass:false
});

const BASE=process.env.TRAVAI_RUNTIME_URL||'http://127.0.0.1:4783';
const endpoints=['/api/v958/bridge/health','/health','/api/health'];

export async function runtimeStatus(fetchImpl=fetch){
  const started=Date.now();
  for(const endpoint of endpoints){
    try{
      const res=await fetchImpl(BASE+endpoint,{signal:AbortSignal.timeout(1500),headers:{accept:'application/json'}});
      if(res.ok){
        let body={};try{body=await res.json();}catch{}
        return {running:true,base:BASE,endpoint,status:res.status,latencyMs:Date.now()-started,service:String(body.service||'travai-local-runtime')};
      }
    }catch{}
  }
  return {running:false,base:BASE,endpoint:null,status:null,latencyMs:Date.now()-started};
}

export function classifyListenError(error){
  if(error?.code==='EADDRINUSE') return {code:'RUNTIME_ALREADY_RUNNING_OR_PORT_BUSY',safeToKill:false,message:'Port 4783 is already in use. Check runtime status before starting another process.'};
  return {code:'RUNTIME_START_FAILED',safeToKill:false,message:String(error?.message||'Runtime start failed').slice(0,180)};
}

export const lifecyclePolicy=Object.freeze({
  loopbackBase:'http://127.0.0.1:4783',
  automaticProcessKill:false,
  arbitraryPidKill:false,
  remoteBind:false,
  statusReadOnly:true
});

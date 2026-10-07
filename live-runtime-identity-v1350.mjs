import {loadReleaseIdentity,identityMatches} from './local-bridge/runtime-identity-v1160.mjs';

const BASE='http://127.0.0.1:4783';

export async function liveRuntimeIdentity({fetchImpl=fetch,base=BASE}={}){
  const expected=await loadReleaseIdentity();
  try{
    const res=await fetchImpl(base+'/health',{headers:{accept:'application/json'}});
    const body=await res.json();
    const live=body?.identity||null;
    return {
      ok:Boolean(res.ok&&live&&identityMatches(live,expected)),
      reachable:Boolean(res.ok),
      stale:Boolean(res.ok&&live&&!identityMatches(live,expected)),
      legacy:Boolean(res.ok&&!live),
      live,
      expected,
      processStartedAt:body?.processStartedAt||null
    };
  }catch{
    return {ok:false,reachable:false,stale:false,legacy:false,live:null,expected,processStartedAt:null};
  }
}
export const liveIdentityPolicy=Object.freeze({readOnly:true,secretFree:true,exactPackageBinding:true,automaticRestart:false});
if(import.meta.url===new URL('file:'+process.argv[1]).href){const r=await liveRuntimeIdentity();console.log(JSON.stringify(r,null,2));process.exitCode=r.ok?0:2;}

import http from 'node:http';
import {restorePersistentState,savePersistentState} from './local-bridge/persistent-state-v976.mjs';
import {startSchedulerLoop} from './local-bridge/scheduler-loop-v977.mjs';
import {createMountedTaskHandler} from './local-bridge/runtime-mount-v974.mjs';
import {classifyListenError} from './local-bridge/runtime-lifecycle-v1150.mjs';
import {handlePairingGateway} from './local-bridge/pairing-gateway-v1300.mjs';
import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';
import {resetPairingApprovalsSafe} from './local-bridge/pairing-integrity-v1313.mjs';
import {releasePreflight} from './release-preflight-v1311.mjs';

const HOST='127.0.0.1';
const PORT=4783;
const ALLOWED_ORIGINS=new Set([
  'https://travai-one.vercel.app',
  'https://travai-tmbstartkleen-4716s-projects.vercel.app',
  'https://travai-git-main-tmbstartkleen-4716s-projects.vercel.app',
  'https://travai-pxf7nd6fd-tmbstartkleen-4716s-projects.vercel.app'
]);
function applyCors(req,res){
  const origin=String(req.headers.origin||'');
  if(!ALLOWED_ORIGINS.has(origin))return false;
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','content-type, x-travai-session');
  res.setHeader('Access-Control-Max-Age','600');
  if(req.headers['access-control-request-private-network']==='true'){
    res.setHeader('Access-Control-Allow-Private-Network','true');
  }
  return true;
}
const PROCESS_STARTED_AT=new Date().toISOString();
const PREFLIGHT=await releasePreflight();
if(!PREFLIGHT.ok) throw new Error('RELEASE_PREFLIGHT_FAILED');
const PROCESS_IDENTITY=await loadReleaseIdentity();

function send(res,status,body){
  res.writeHead(status,{'content-type':'application/json','cache-control':'no-store'});
  res.end(JSON.stringify(body));
}

async function baseHandler(req,res){
  const pairing=await handlePairingGateway(req);
  if(pairing){
    res.writeHead(pairing.status,pairing.headers);
    res.end(JSON.stringify(pairing.body));
    return true;
  }
  const path=new URL(req.url,'http://127.0.0.1').pathname;
  const method=String(req.method||'GET').toUpperCase();
  if(method==='GET' && (path==='/health'||path==='/api/health'||path==='/api/v958/bridge/health')){
    send(res,200,{ok:true,service:'travai-local-runtime',ready:true,identity:PROCESS_IDENTITY,processStartedAt:PROCESS_STARTED_AT});
    return true;
  }
  send(res,404,{ok:false,error:'NOT_FOUND'});
  return true;
}

await restorePersistentState();
await resetPairingApprovalsSafe();
const handler=createMountedTaskHandler(baseHandler);
const server=http.createServer(async(req,res)=>{
  try{
    const allowed=applyCors(req,res);
    if(req.method==='OPTIONS'){
      res.writeHead(allowed?204:403,{'cache-control':'no-store'});
      res.end();
      return;
    }
    await handler(req,res);
  catch{if(!res.headersSent) send(res,500,{ok:false,error:'LOCAL_RUNTIME_ERROR'});}
});
const scheduler=startSchedulerLoop();

server.on('error',error=>{const info=classifyListenError(error);console.error(JSON.stringify(info,null,2));process.exitCode=1;});
server.listen(PORT,HOST,()=>console.log('TravAI local runtime listening on http://127.0.0.1:4783'));

async function shutdown(){
  scheduler.stop();
  await savePersistentState();
  server.close(()=>process.exit(0));
}
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);

export const localRuntimePolicy=Object.freeze({
  host:HOST,
  port:PORT,
  loopbackOnly:true,
  remoteBind:false,
  arbitraryShell:false,
  securityBypass:false,
  releasePreflightRequired:true,
  pairingApprovalResetOnStartup:true
});

import http from 'node:http';
import {restorePersistentState,savePersistentState} from './local-bridge/persistent-state-v976.mjs';
import {startSchedulerLoop} from './local-bridge/scheduler-loop-v977.mjs';
import {createMountedTaskHandler} from './local-bridge/runtime-mount-v974.mjs';
import {classifyListenError} from './local-bridge/runtime-lifecycle-v1150.mjs';
import {handlePairingGateway} from './local-bridge/pairing-gateway-v1300.mjs';

const HOST='127.0.0.1';
const PORT=4783;

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
    send(res,200,{ok:true,service:'travai-local-runtime',ready:true});
    return true;
  }
  send(res,404,{ok:false,error:'NOT_FOUND'});
  return true;
}

await restorePersistentState();
const handler=createMountedTaskHandler(baseHandler);
const server=http.createServer(async(req,res)=>{
  try{await handler(req,res);}
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
  securityBypass:false
});

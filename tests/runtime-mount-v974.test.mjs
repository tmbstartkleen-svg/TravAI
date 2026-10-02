import assert from 'node:assert/strict';
import {createPairingRequest,approvePairingRequest} from '../local-bridge/pairing-authority-v956.mjs';
import {handleRuntimeTaskRequest,runtimeMountPolicy} from '../local-bridge/runtime-mount-v974.mjs';

const requestId='abcdefabcdefabcdefabcdefabcdefab';
createPairingRequest({requestId});
const session=approvePairingRequest(requestId,['command:request']);
const headers={'x-travai-session':session.sessionToken};
const req=(method,url,body={})=>({method,url,headers,body});

let r=await handleRuntimeTaskRequest(req('POST','/api/v974/tasks',{
  label:'End to end',
  steps:[{action:'open-app',input:{app:'Safari'}}]
}));
assert.equal(r.status,201);
const taskId=r.body.task.id;

r=await handleRuntimeTaskRequest(req('POST','/api/v974/tasks/'+taskId+'/approval'));
assert.equal(r.status,201);
const approvalId=r.body.approval.id;

r=await handleRuntimeTaskRequest(req('POST','/api/v974/approvals/'+approvalId,{decision:'approve'}));
assert.equal(r.status,200);

const calls=[];
r=await handleRuntimeTaskRequest(req('POST','/api/v974/tasks/'+taskId+'/execute',{approvalId}),{
  run:async(file,args)=>{calls.push({file,args});return {stdout:'',stderr:''}}
});
assert.equal(r.status,200);
assert.equal(r.body.task.status,'completed');
assert.equal(calls[0].file,'/usr/bin/open');

r=await handleRuntimeTaskRequest(req('POST','/api/v974/tasks/'+taskId+'/execute',{approvalId}),{
  run:async()=>({stdout:'',stderr:''})
});
assert.equal(r.status,409);

const denied=await handleRuntimeTaskRequest({method:'GET',url:'/api/v974/tasks',headers:{},body:{}});
assert.equal(denied.status,401);

assert.equal(runtimeMountPolicy.createsListener,false);
assert.equal(runtimeMountPolicy.arbitraryShell,false);
assert.equal(runtimeMountPolicy.macSecurityBypass,false);
console.log('v9.7.4 runtime mount: PASS');

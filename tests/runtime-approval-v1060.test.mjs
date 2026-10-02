import assert from 'node:assert/strict';
import {createPairingRequest,approvePairingRequest} from '../local-bridge/pairing-authority-v956.mjs';
import {createTask,importTaskState} from '../local-bridge/task-orchestrator-v970.mjs';
import {handleRuntimeTaskRequest,runtimeMountPolicy} from '../local-bridge/runtime-mount-v974.mjs';

const requestId='10501050105010501050105010501050';
createPairingRequest({requestId});
const session=approvePairingRequest(requestId,['command:request']);
const headers={'x-travai-session':session.sessionToken};

const created=createTask({label:'Runtime approval hardening',steps:[{action:'open-app',input:{app:'Safari'}}]});
const tampered={...created,steps:created.steps.map(s=>({...s,requiresApproval:false}))};
importTaskState([tampered]);

const result=await handleRuntimeTaskRequest({
  method:'POST',
  url:'/api/v974/tasks/'+created.id+'/execute',
  headers,
  body:{}
},{run:async()=>({stdout:'',stderr:''})});

assert.equal(result.status,409);
assert.equal(result.body.ok,false);
assert.equal(result.body.error,'APPROVAL_INVALID');
assert.equal(runtimeMountPolicy.mutatingApprovalDerivedFromAction,true);
console.log('v10.6.0 runtime approval integration: PASS');

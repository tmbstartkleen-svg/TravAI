import assert from 'node:assert/strict';
import {autoMountRuntime,createRuntimeSupervisor,recoveryPolicy} from '../local-bridge/runtime-supervisor-v975.mjs';

let baseCalls=0;
const runtime={
  handler:async()=>{baseCalls+=1; return {status:204}}
};

const supervisor=autoMountRuntime(runtime,{
  run:async()=>({stdout:'',stderr:''})
});

assert.equal(typeof runtime.handler,'function');
assert.equal(runtime.travAiTaskSupervisor,supervisor);
assert.equal(supervisor.status().mounted,true);
assert.equal(supervisor.status().state,'ready');

const passthrough=await runtime.handler({method:'GET',url:'/not-travai',headers:{}},null);
assert.deepEqual(passthrough,{status:204});
assert.equal(baseCalls,1);

let attempts=0;
const flaky=createRuntimeSupervisor({
  existingHandler:async()=>{attempts+=1; if(attempts===1) throw new Error('boom'); return {status:204}},
  run:async()=>({stdout:'',stderr:''}),
  maxConsecutiveFailures:3,
  backoffMs:[0,0,0]
});

const failed=await flaky.handler({method:'GET',url:'/not-travai',headers:{}},null);
assert.equal(failed.status,503);
assert.equal(flaky.status().state,'ready');
assert.equal(flaky.status().consecutiveFailures,1);

await flaky.recover();
assert.equal(flaky.status().state,'ready');

assert.equal(recoveryPolicy.createsListener,false);
assert.equal(recoveryPolicy.changesPort,false);
assert.equal(recoveryPolicy.arbitraryShell,false);
assert.equal(recoveryPolicy.permissionBypass,false);
console.log('v9.7.5 runtime supervisor: PASS');

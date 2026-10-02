import assert from 'node:assert/strict';
import {handleTaskApi,taskApiPolicy} from '../local-bridge/task-api-routes-v973.mjs';

const req=(method,url,body={})=>({method,url,body});
let r=await handleTaskApi(req('POST','/api/v973/tasks',{label:'API test',steps:[{action:'read-health',requiresApproval:false}]}));
assert.equal(r.status,201);
const id=r.body.task.id;

r=await handleTaskApi(req('GET','/api/v973/tasks'));
assert.equal(r.status,200);
assert.equal(r.body.tasks.some(t=>t.id===id),true);

r=await handleTaskApi(req('POST','/api/v973/tasks/'+id+'/approval'));
assert.equal(r.status,201);
const approvalId=r.body.approval.id;

r=await handleTaskApi(req('GET','/api/v973/approvals'));
assert.equal(r.body.approvals.some(a=>a.id===approvalId),true);

r=await handleTaskApi(req('POST','/api/v973/approvals/'+approvalId,{decision:'deny'}));
assert.equal(r.status,200);
assert.equal(r.body.approval.status,'denied');

assert.equal(taskApiPolicy.createsServer,false);
assert.equal(taskApiPolicy.executesMacActions,false);
assert.equal(taskApiPolicy.arbitraryShell,false);
console.log('v9.7.3 task API routes: PASS');

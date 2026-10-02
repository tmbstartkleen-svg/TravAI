import assert from 'node:assert/strict';
import {executeMacAction,verifyMacAction,actionRequiresApproval,macActionPolicy} from '../local-bridge/mac-action-executor-v971.mjs';

const calls=[];
const run=async(file,args)=>{calls.push({file,args});return {stdout:'',stderr:''}};

await assert.rejects(
  ()=>executeMacAction({action:'open-app',input:{app:'Safari'},requiresApproval:true},{approved:false,run}),
  /LOCAL_APPROVAL_REQUIRED/
);

const open=await executeMacAction({action:'open-app',input:{app:'Safari'},requiresApproval:true},{approved:true,run});
assert.equal(open.ok,true);
assert.equal(calls.at(-1).file,'/usr/bin/open');
assert.deepEqual(calls.at(-1).args,['-a','Safari']);
assert.equal(verifyMacAction({action:'open-app'},open),true);

const volume=await executeMacAction({action:'set-volume',input:{volume:42},requiresApproval:true},{approved:true,run});
assert.deepEqual(calls.at(-1).args,['-e','set volume output volume 42']);
assert.equal(verifyMacAction({action:'set-volume',input:{volume:42}},volume),true);

const settings=await executeMacAction({action:'open-system-settings-pane',input:{pane:'privacy-security'},requiresApproval:true},{approved:true,run});
assert.equal(settings.result.pane,'privacy-security');

const shortcut=await executeMacAction({action:'shortcut-run',input:{name:'Morning Routine'},requiresApproval:true},{approved:true,run});
assert.deepEqual(calls.at(-1).args,['run','Morning Routine']);
assert.equal(shortcut.result.requested,true);

await assert.rejects(
  ()=>executeMacAction({action:'set-volume',input:{volume:101},requiresApproval:true},{approved:true,run}),
  /INVALID_VOLUME/
);

await assert.rejects(
  ()=>executeMacAction({action:'finder-open-path',input:{path:'/Library'},requiresApproval:true},{approved:true,run}),
  /PATH_OUTSIDE_HOME/
);

assert.equal(actionRequiresApproval('open-app'),true);
assert.equal(actionRequiresApproval('read-health'),false);
assert.equal(macActionPolicy.shell,false);
assert.equal(macActionPolicy.arbitraryCommand,false);
assert.equal(macActionPolicy.tccBypass,false);
console.log('v9.7.1 mac action executor: PASS');

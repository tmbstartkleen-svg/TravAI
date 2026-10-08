import assert from 'node:assert/strict';
import {authorizeAgentTask,summarizeAgentReceipts} from '../agent-safety-v1318.mjs';
assert.equal(authorizeAgentTask({action:'read-health'}).allowed,true);
assert.equal(authorizeAgentTask({action:'set-volume'}).allowed,false);
assert.equal(authorizeAgentTask({action:'set-volume',permission:'execute'}).allowed,false);
assert.equal(authorizeAgentTask({action:'set-volume',permission:'execute',approved:true}).allowed,true);
assert.equal(authorizeAgentTask({action:'shell',permission:'execute',approved:true}).allowed,false);
assert.equal(summarizeAgentReceipts([{result:'blocked'}]).blocked,1);
console.log('agent safety policy: PASS');

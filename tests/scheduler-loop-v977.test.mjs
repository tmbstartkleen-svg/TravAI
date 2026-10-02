import assert from 'node:assert/strict';
import {startSchedulerLoop,schedulerLoopPolicy} from '../local-bridge/scheduler-loop-v977.mjs';

let ticks=0;
const loop=startSchedulerLoop({intervalMs:250,onTick:()=>{ticks+=1}});
await loop.tick();
assert.equal(ticks>=1,true);
assert.equal(loop.intervalMs,250);
loop.stop();
assert.equal(schedulerLoopPolicy.executesMacActions,false);
assert.equal(schedulerLoopPolicy.approvalBypass,false);
console.log('v9.7.7 scheduler loop: PASS');

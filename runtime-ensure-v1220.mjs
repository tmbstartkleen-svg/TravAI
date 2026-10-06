import {spawn} from 'node:child_process';
import {runtimeStatus} from './local-bridge/runtime-lifecycle-v1150.mjs';

const before=await runtimeStatus();
if(before.running){
  console.log(JSON.stringify({ok:true,action:'already-running',runtime:before},null,2));
  process.exit(0);
}

const child=spawn(process.execPath,['local-runtime-v1120.mjs'],{
  cwd:new URL('.',import.meta.url),
  detached:true,
  stdio:'ignore'
});
child.unref();

let after=null;
for(let i=0;i<12;i++){
  await new Promise(r=>setTimeout(r,250));
  after=await runtimeStatus();
  if(after.running) break;
}

if(after?.running){
  console.log(JSON.stringify({ok:true,action:'started',runtime:after},null,2));
  process.exit(0);
}
console.log(JSON.stringify({ok:false,action:'start-failed',runtime:after},null,2));
process.exit(2);

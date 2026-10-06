import {runtimeStatus,lifecyclePolicy} from './local-bridge/runtime-lifecycle-v1150.mjs';
const status=await runtimeStatus();
console.log(JSON.stringify({...status,policy:lifecyclePolicy},null,2));
process.exit(status.running?0:1);

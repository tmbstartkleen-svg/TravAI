import fs from 'node:fs/promises';
import {runtimeStatus} from './local-bridge/runtime-lifecycle-v1150.mjs';
import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';

export async function selfDiagnostics(){
  const pkg=JSON.parse(await fs.readFile(new URL('./package.json',import.meta.url),'utf8'));
  const [runtime,identity]=await Promise.all([runtimeStatus(),loadReleaseIdentity()]);
  const checks={
    packageIdentity:identity.packageVersion===pkg.version,
    loopbackAuthority:runtime.base==='http://127.0.0.1:4783',
    runtimeReachable:runtime.running===true,
    secretFreeIdentity:!('token' in identity)&&!('approval' in identity)
  };
  return {ok:Object.values(checks).every(Boolean),checks,runtime,identity};
}
if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const result=await selfDiagnostics();
  console.log(JSON.stringify(result,null,2));
  process.exit(result.ok?0:2);
}

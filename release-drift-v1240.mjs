import fs from 'node:fs/promises';
import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';

export async function releaseDrift(){
  const pkg=JSON.parse(await fs.readFile(new URL('./package.json',import.meta.url),'utf8'));
  const identity=await loadReleaseIdentity();
  const dashboard=await fs.readFile(new URL('./vercel-index.html',import.meta.url),'utf8');
  const readme=await fs.readFile(new URL('./README.md',import.meta.url),'utf8');
  const checks={
    packageIdentity:pkg.version===identity.packageVersion,
    dashboardRelease:dashboard.includes('v'+identity.release),
    readmeRelease:readme.includes('# TravAI Elite v'+identity.release),
    protocolCurrent:identity.protocol==='travai-local/v1'
  };
  return {ok:Object.values(checks).every(Boolean),release:identity.release,packageVersion:pkg.version,checks};
}
if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const result=await releaseDrift();
  console.log(JSON.stringify(result,null,2));
  process.exit(result.ok?0:2);
}

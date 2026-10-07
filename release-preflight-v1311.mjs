import fs from 'node:fs/promises';
import {loadReleaseIdentity} from './local-bridge/runtime-identity-v1160.mjs';
import {releaseManifest,assertReleaseManifest} from './release-manifest-v1311.mjs';
export async function releasePreflight(){
 const identity=await loadReleaseIdentity();
 const pkg=JSON.parse(await fs.readFile(new URL('./package.json',import.meta.url),'utf8'));
 const readme=await fs.readFile(new URL('./README.md',import.meta.url),'utf8');
 const dashboard=await fs.readFile(new URL('./vercel-index.html',import.meta.url),'utf8');
 const manifest=assertReleaseManifest(identity);
 const checks={
  ...manifest.checks,
  packageFile:pkg.version===releaseManifest.packageVersion,
  description:pkg.description.includes('v'+releaseManifest.release),
  readme:readme.includes('# TravAI Elite v'+releaseManifest.release),
  dashboard:dashboard.includes('v'+releaseManifest.release)
 };
 return {schema:'travai-release-preflight/v1',ok:Object.values(checks).every(Boolean),release:releaseManifest.release,packageVersion:releaseManifest.packageVersion,checks};
}
if(import.meta.url===new URL('file:'+process.argv[1]).href){const r=await releasePreflight();console.log(JSON.stringify(r,null,2));process.exitCode=r.ok?0:2;}

import fs from 'node:fs/promises';

export function decodeTravAIVersion(packageVersion){
  const head=String(packageVersion||'').split('.')[0];
  if(!/^\d{11}$/.test(head)) return 'unknown';
  const major=Number(head.slice(0,2));
  const minor=Number(head.slice(2,3));
  return major+'.'+minor+'.0';
}

export async function loadReleaseIdentity(){
  const pkg=JSON.parse(await fs.readFile(new URL('../package.json',import.meta.url),'utf8'));
  return Object.freeze({
    service:'travai-local-runtime',
    packageVersion:String(pkg.version),
    release:decodeTravAIVersion(pkg.version),
    protocol:'travai-local/v1'
  });
}

export function identityMatches(runtimeIdentity,expected){
  return Boolean(runtimeIdentity)&&runtimeIdentity.service===expected.service&&runtimeIdentity.packageVersion===expected.packageVersion&&runtimeIdentity.protocol===expected.protocol;
}

export const identityPolicy=Object.freeze({
  secretFree:true,
  includesSessionToken:false,
  includesApprovalAuthority:false,
  exactPackageBinding:true,
  releaseDerivedFromPackage:true
});

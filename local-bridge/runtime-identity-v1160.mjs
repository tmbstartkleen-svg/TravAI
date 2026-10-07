import fs from 'node:fs/promises';

export function decodeTravAIVersion(packageVersion){
  const head=String(packageVersion||'').split('.')[0];
  if(!/^\d+$/.test(head)||head.length<11) return 'unknown';
  if(head.startsWith('13')){
    const zeros=head.match(/0+$/)?.[0]?.length||0;
    const core=head.slice(0,head.length-zeros);
    if(core.length<3) return 'unknown';
    const major=Number(core.slice(0,2));
    const minor=Number(core.slice(2));
    if(!Number.isInteger(major)||!Number.isInteger(minor)) return 'unknown';
    return major+'.'+minor+'.0';
  }
  return 'unknown';
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

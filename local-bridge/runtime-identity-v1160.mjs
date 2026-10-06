import fs from 'node:fs/promises';

export async function loadReleaseIdentity(){
  const pkg=JSON.parse(await fs.readFile(new URL('../package.json',import.meta.url),'utf8'));
  return Object.freeze({
    service:'travai-local-runtime',
    packageVersion:String(pkg.version),
    release:'11.6.0',
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
  exactPackageBinding:true
});

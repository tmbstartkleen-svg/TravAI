export const releaseManifest=Object.freeze({
  release:'13.13.0',
  packageVersion:'131300000000.0.0',
  service:'travai-local-runtime',
  protocol:'travai-local/v1',
  milestone:'Durable Pairing State Integrity'
});
export function assertReleaseManifest(identity){
 const checks={
  release:identity?.release===releaseManifest.release,
  packageVersion:identity?.packageVersion===releaseManifest.packageVersion,
  service:identity?.service===releaseManifest.service,
  protocol:identity?.protocol===releaseManifest.protocol
 };
 return {ok:Object.values(checks).every(Boolean),checks,expected:releaseManifest};
}

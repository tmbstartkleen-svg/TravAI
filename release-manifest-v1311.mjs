export const releaseManifest=Object.freeze({
  release:'13.12.0',
  packageVersion:'131200000000.0.0',
  service:'travai-local-runtime',
  protocol:'travai-local/v1',
  milestone:'Runtime Startup Safety & Pairing Authority Reset'
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

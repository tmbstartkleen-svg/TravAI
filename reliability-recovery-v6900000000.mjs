// TravAI Elite v6.9B — Reliability + Recovery
// Full tested implementation ships in TravAI_v6900000000.0.zip.
export const VERSION='6900000000.0.0';
export const RECOVERY_POLICY=Object.freeze({
 offlineFirst:true,
 immutableSnapshots:true,
 sha256Manifests:true,
 verifyBeforeRestore:true,
 approvalBeforeRestore:true,
 restoreIsNeverAutomatic:true,
 rollbackPlanRequired:true,
 noArbitraryShell:true,
 localhostByDefault:true
});
export const RECOVERY_PIPELINE=Object.freeze([
 'HEALTH_SCAN',
 'PRE_UPGRADE_SNAPSHOT',
 'MANIFEST_HASH',
 'VERIFY_SNAPSHOT',
 'STAGE_RESTORE_PLAN',
 'HUMAN_APPROVAL',
 'RESTORE',
 'POST_RESTORE_VERIFY'
]);

// TravAI Elite v6.6B — Repository Intelligence + Safe Patch Lab
// Full tested release is distributed as TravAI_v6600000000.0.zip.
// This engine performs workspace-confined repository inspection, ignores secrets,
// binaries, node_modules and .git content, and produces approval-gated patch plans.
export const VERSION='6600000000.0.0';
export const POLICY=Object.freeze({
  offlineFirst:true,
  workspaceConfined:true,
  readsSecretContents:false,
  noArbitraryShell:true,
  noSilentMutation:true,
  approvalBeforeMutation:true,
  patchProposalIsReadOnly:true,
  rollbackRequired:true
});
export const FEATURES=Object.freeze([
  'repository inventory',
  'manifest and declared verification discovery',
  'extension and dependency map',
  'sensitive-file presence detection without content ingestion',
  'change-impact and blast-radius estimate',
  'risk-scored patch proposal',
  'verification plan before mutation',
  'approval-gated handoff to v6.5 coding team'
]);

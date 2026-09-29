// TravAI Elite v7.1 — Deep Local Knowledge + RAG
// The complete tested implementation ships in TravAI_v7100000000.0.zip.
export const VERSION='7100000000.0.0';
export const CAPABILITIES=Object.freeze([
  'line-level citations',
  'SHA-256 file provenance',
  'workspace/project knowledge scopes',
  'sensitive-file exclusion before content read',
  'memory-aware retrieval with evidence separation',
  'local Ollama grounded synthesis',
  'persistent index and query history'
]);
export const POLICY=Object.freeze({
  offlineOnly:true,
  cloudSynthesis:false,
  projectMutation:false,
  noArbitraryShell:true,
  sensitiveContentsNeverRead:true,
  workspaceScopesOnly:true
});

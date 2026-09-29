export const VERSION='9000000000.0.0';
export const PIPELINE=Object.freeze(['classify','readiness','approval decision','bounded local execution','verification','evidence receipt']);
export const DIRECT=Object.freeze(['chat','knowledge','evaluation','health']);
export const APPROVAL_GATED=Object.freeze(['coding','planning','recovery']);
export const POLICY=Object.freeze({offlineFirst:true,localExecutionOnly:true,noSilentCloudFallback:true,noAutomaticMutation:true,approvalBeforeConsequentialMutation:true,noArbitraryShell:true,assessmentIntegrityAuthoritative:true});

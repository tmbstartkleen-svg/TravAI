export const VERSION='8700000000.0.0';
export const CAPABILITIES=Object.freeze(['persistent benchmark history','evidence aging','score drift detection','reliability drift detection','latency drift detection','leader change detection','re-evaluation recommendations']);
export const POLICY=Object.freeze({offlineFirst:true,evidenceBased:true,noAutomaticModelSwitch:true,noAutomaticSystemChanges:true,approvalRequiredForOptimization:true,noArbitraryShell:true});

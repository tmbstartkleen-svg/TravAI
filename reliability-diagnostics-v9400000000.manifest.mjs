export const VERSION='9400000000.0.0';
export const CAPABILITIES=Object.freeze(['startup readiness','critical-file hash evidence','bounded diagnostic history','regression detection','recovery snapshot verification','observe-only watchdog','runtime pressure diagnostics']);
export const POLICY=Object.freeze({diagnosticsReadOnly:true,automaticRestart:false,automaticRepair:false,automaticRestore:false,automaticProjectMutation:false,automaticSecurityChanges:false,noArbitraryShell:true,approvalGatesPreserved:true});

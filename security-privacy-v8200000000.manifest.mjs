export const VERSION='8200000000.0.0';
export const CAPABILITIES=Object.freeze(['security posture scan','sensitive filename detection','deployment header verification','localhost binding check','policy regression detection','redacted findings']);
export const POLICY=Object.freeze({offlineFirst:true,secretValuesExposed:false,approvalGatesPreserved:true,noArbitraryShell:true,noSilentCloudFallback:true,cloudMicStreaming:false});

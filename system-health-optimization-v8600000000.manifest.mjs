export const VERSION='8600000000.0.0';
export const CAPABILITIES=Object.freeze(['runtime health','memory pressure','disk pressure','Ollama health','benchmark freshness','guided optimization']);
export const POLICY=Object.freeze({offlineFirst:true,measuredFactsOnly:true,noFabricatedRoutingConfidence:true,approvalGatesPreserved:true,noArbitraryShell:true,noSilentCloudFallback:true});

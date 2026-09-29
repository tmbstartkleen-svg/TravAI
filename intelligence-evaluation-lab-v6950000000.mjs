// TravAI Elite v6.95B — Intelligence Evaluation Lab
// Full tested implementation ships in TravAI_v6950000000.0.zip.
export const VERSION='6950000000.0.0';
export const PROBES=Object.freeze([
 'coding','debugging','review','reasoning','planning','structured','retrieval','tool-selection'
]);
export const SCORING=Object.freeze({
 correctness:72,
 reliability:18,
 latency:10,
 note:'Deterministic microbenchmark score; not a claim of general intelligence.'
});
export const POLICY=Object.freeze({
 offlineFirst:true,
 localOllamaFirst:true,
 noFabricatedModels:true,
 noProjectMutation:true,
 noArbitraryShell:true,
 evidenceBasedRouting:true
});

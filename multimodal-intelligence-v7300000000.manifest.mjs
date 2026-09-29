export const VERSION='7300000000.0.0';
export const CAPABILITIES=Object.freeze(['image metadata and SHA-256 provenance','PDF page/text extraction when local parser is available','local Ollama vision-model discovery','bounded multimodal intake','explicit unsupported/scanned-only states']);
export const POLICY=Object.freeze({offlineFirst:true,cloudUpload:false,noFabricatedOCR:true,projectMutation:false,noArbitraryShell:true});

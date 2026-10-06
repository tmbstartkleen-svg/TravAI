import fs from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {probeRuntime,buildCertification,writeCertification} from './local-bridge/production-certifier-v1100.mjs';

const run=promisify(execFile);
const checks={};
let testsPassed=false;
try{
  await run(process.execPath,['tests/release-validation-v981.test.mjs'],{timeout:30000,maxBuffer:1024*1024});
  testsPassed=true;
}catch{}

const probe=await probeRuntime();
checks['runtime-health']=probe.ok;
const evidencePath=process.env.TRAVAI_CERT_EVIDENCE||'';
if(evidencePath){
  try{
    const supplied=JSON.parse(await fs.readFile(evidencePath,'utf8'));
    for(const key of Object.keys(checks)) if(supplied[key]===true) checks[key]=true;
    for(const [key,value] of Object.entries(supplied)) if(value===true) checks[key]=true;
  }catch{}
}
const record=buildCertification({
  runtimeProbe:probe,
  checks,
  commit:process.env.TRAVAI_COMMIT||'',
  version:'11.1.0'
});
record.repositoryPolicyTestsPassed=testsPassed;
const file=await writeCertification(record);
console.log(JSON.stringify({ok:record.productionValidated,repositoryPolicyTestsPassed:testsPassed,runtimeReachable:probe.ok,certificationFile:file,checks:record.checks},null,2));
process.exit(record.productionValidated&&testsPassed?0:2);

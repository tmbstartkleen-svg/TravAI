import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const root=dirname(fileURLToPath(import.meta.url));
const checks=[
  ['Agent safety','test:agent-safety'],
  ['Approval authorization','test:approval-action'],
  ['Execution receipts','test:agent-receipts'],
  ['Full regression','test']
];
const results=[];
for(const [name,script] of checks){
  const started=Date.now();
  const child=spawnSync('npm',['run',script],{
    cwd:root,encoding:'utf8',timeout:15*60*1000,
    maxBuffer:4*1024*1024,env:process.env,shell:false
  });
  const passed=child.status===0&&!child.error;
  results.push({name,script,status:passed?'PASS':'FAIL',exitCode:child.status,elapsedMs:Date.now()-started,
    error:child.error?.message||null});
  process.stdout.write(name+': '+(passed?'PASS':'FAIL')+'\n');
  if(!passed){
    const tail=(child.stderr||child.stdout||'').slice(-2500);
    if(tail)process.stderr.write(tail+'\n');
  }
}
const ready=results.every(r=>r.status==='PASS');
const report={release:'v14.0',generatedAt:new Date().toISOString(),readyForRelease:ready,results};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
process.exitCode=ready?0:1;

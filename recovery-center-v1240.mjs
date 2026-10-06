import {controlPlaneSnapshot} from './control-plane-v1240.mjs';

export function formatRecovery(snapshot){
  const actions=snapshot.recovery||[];
  if(snapshot.healthy) return ['TravAI local control plane is healthy. No recovery action is required.'];
  return actions.filter(x=>x.id!=='none').map(x=>{
    if(x.id==='start-runtime') return 'Runtime is unavailable. Run: '+x.command;
    if(x.id==='refresh-certification') return 'Certification is not current for this release. Run: '+x.command;
    if(x.id==='audit-certification') return 'Verify certificate authority with: '+x.command;
    return 'Review local state.';
  });
}
if(import.meta.url===new URL('file:'+process.argv[1]).href){
  const snapshot=await controlPlaneSnapshot();
  console.log(formatRecovery(snapshot).join('\n'));
  process.exit(snapshot.healthy?0:2);
}

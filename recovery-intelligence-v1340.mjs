export function recoveryIntelligence(doctor){
  const actions=doctor?.recovery||[];
  if(doctor?.ok) return {severity:'healthy',summary:'TravAI local control plane is healthy.',steps:[]};
  const steps=actions.filter(x=>x.command).map((x,index)=>({
    order:index+1,id:x.id,command:x.command,requiresUserAction:true,automatic:false
  }));
  const severe=doctor?.checks?.runtimeReachable===false;
  return {
    severity:severe?'runtime-offline':'attention',
    summary:severe?'Local runtime is not reachable.':'Local runtime is reachable but one or more release checks need attention.',
    steps
  };
}
export const recoveryIntelligencePolicy=Object.freeze({
  advisoryOnly:true,executesCommands:false,automaticKill:false,automaticRestart:false,securityBypass:false
});

const TEMPLATES=Object.freeze({
  'health-check':{
    id:'health-check',
    label:'Health Check',
    description:'Read local TravAI health and readiness.',
    steps:[
      {action:'read-health',requiresApproval:false},
      {action:'read-readiness',requiresApproval:false}
    ]
  },
  'privacy-settings':{
    id:'privacy-settings',
    label:'Open Privacy Settings',
    description:'Open the macOS Privacy & Security settings pane.',
    steps:[
      {action:'open-system-settings-pane',input:{pane:'privacy-security'}}
    ]
  },
  'mute-mac':{
    id:'mute-mac',
    label:'Mute Mac',
    description:'Mute Mac audio output.',
    steps:[
      {action:'toggle-mute',input:{muted:true}}
    ]
  },
  'open-downloads':{
    id:'open-downloads',
    label:'Open Downloads',
    description:'Open the current user Downloads folder in Finder.',
    steps:[
      {action:'finder-open-path',input:{path:'~/Downloads'}}
    ]
  }
});

const copy=v=>JSON.parse(JSON.stringify(v));

export function listTaskTemplates(){
  return Object.values(TEMPLATES).map(t=>({
    id:t.id,label:t.label,description:t.description,
    requiresApproval:t.steps.some(s=>!['read-health','read-readiness'].includes(s.action))
  }));
}

export function buildTaskFromTemplate(templateId){
  const template=TEMPLATES[String(templateId||'')];
  if(!template) throw new Error('TEMPLATE_NOT_FOUND');
  return {label:template.label,steps:copy(template.steps)};
}

export const templatePolicy=Object.freeze({
  fixedTemplatesOnly:true,
  arbitraryCommands:false,
  mutatingTemplatesRemainApprovalGated:true
});

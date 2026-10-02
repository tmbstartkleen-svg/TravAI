const TEMPLATES=Object.freeze({
  'workspace-ready':{
    id:'workspace-ready',
    label:'Workspace Ready',
    category:'workspace',
    description:'Check TravAI health/readiness and open Downloads.',
    steps:[
      {action:'read-health',requiresApproval:false},
      {action:'read-readiness',requiresApproval:false},
      {action:'finder-open-path',input:{path:'~/Downloads'}}
    ]
  },
  'audio-reset':{
    id:'audio-reset',
    label:'Audio Reset',
    category:'audio',
    description:'Unmute Mac audio and set output volume to 50%.',
    steps:[
      {action:'toggle-mute',input:{muted:false}},
      {action:'set-volume',input:{volume:50}}
    ]
  },
  'work-start':{
    id:'work-start',
    label:'Work Start',
    category:'workflow',
    description:'Run health/readiness, open Downloads, then open Privacy & Security for review.',
    steps:[
      {action:'read-health',requiresApproval:false},
      {action:'read-readiness',requiresApproval:false},
      {action:'finder-open-path',input:{path:'~/Downloads'}},
      {action:'open-system-settings-pane',input:{pane:'privacy-security'}}
    ]
  },
  'focus-mode':{
    id:'focus-mode',
    label:'Focus Mode',
    category:'workflow',
    description:'Mute audio, verify readiness, and open Downloads.',
    steps:[
      {action:'toggle-mute',input:{muted:true}},
      {action:'read-readiness',requiresApproval:false},
      {action:'finder-open-path',input:{path:'~/Downloads'}}
    ]
  },
  'system-review':{
    id:'system-review',
    label:'System Review',
    category:'system',
    description:'Run health and readiness checks and open General and Privacy settings for review.',
    steps:[
      {action:'read-health',requiresApproval:false},
      {action:'read-readiness',requiresApproval:false},
      {action:'open-system-settings-pane',input:{pane:'general'}},
      {action:'open-system-settings-pane',input:{pane:'privacy-security'}}
    ]
  },
  'health-check':{
    id:'health-check',
    label:'Health Check',
    category:'diagnostics',
    description:'Read local TravAI health and readiness.',
    steps:[
      {action:'read-health',requiresApproval:false},
      {action:'read-readiness',requiresApproval:false}
    ]
  },
  'privacy-settings':{
    id:'privacy-settings',
    label:'Open Privacy Settings',
    category:'system',
    description:'Open the macOS Privacy & Security settings pane.',
    steps:[
      {action:'open-system-settings-pane',input:{pane:'privacy-security'}}
    ]
  },
  'mute-mac':{
    id:'mute-mac',
    label:'Mute Mac',
    category:'audio',
    description:'Mute Mac audio output.',
    steps:[
      {action:'toggle-mute',input:{muted:true}}
    ]
  },
  'system-check':{
    id:'system-check',
    label:'System Check',
    category:'diagnostics',
    description:'Run health/readiness checks, then open Privacy & Security for review.',
    steps:[
      {action:'read-health',requiresApproval:false},
      {action:'read-readiness',requiresApproval:false},
      {action:'open-system-settings-pane',input:{pane:'privacy-security'}}
    ]
  },
  'quiet-work':{
    id:'quiet-work',
    label:'Quiet Work',
    category:'workflow',
    description:'Mute Mac audio and open Downloads for a focused local workflow.',
    steps:[
      {action:'toggle-mute',input:{muted:true}},
      {action:'finder-open-path',input:{path:'~/Downloads'}}
    ]
  },
  'open-downloads':{
    id:'open-downloads',
    label:'Open Downloads',
    category:'files',
    description:'Open the current user Downloads folder in Finder.',
    steps:[
      {action:'finder-open-path',input:{path:'~/Downloads'}}
    ]
  }
});

const copy=v=>JSON.parse(JSON.stringify(v));

export function listTaskTemplates(){
  return Object.values(TEMPLATES).map(t=>({
    id:t.id,label:t.label,category:t.category||'other',description:t.description,
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
  mutatingTemplatesRemainApprovalGated:true,
  multiStepBundles:true,
  categorizedTemplates:true,
  workspaceRoutines:true
});

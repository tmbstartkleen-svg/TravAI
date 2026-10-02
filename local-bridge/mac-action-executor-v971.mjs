import {execFile} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);

const SETTINGS_PANES = Object.freeze({
  'privacy-security':'x-apple.systempreferences:com.apple.settings.PrivacySecurity',
  'network':'x-apple.systempreferences:com.apple.Network-Settings.extension',
  'bluetooth':'x-apple.systempreferences:com.apple.BluetoothSettings',
  'sound':'x-apple.systempreferences:com.apple.Sound-Settings.extension',
  'displays':'x-apple.systempreferences:com.apple.Displays-Settings.extension',
  'battery':'x-apple.systempreferences:com.apple.Battery-Settings.extension',
  'general':'x-apple.systempreferences:com.apple.systempreferences.GeneralSettings'
});

const ACTIONS = new Set([
  'read-health',
  'read-readiness',
  'open-app',
  'quit-app',
  'open-system-settings-pane',
  'set-volume',
  'toggle-mute',
  'finder-open-path',
  'shortcut-run'
]);

const MUTATING_ACTIONS = new Set([
  'open-app',
  'quit-app',
  'open-system-settings-pane',
  'set-volume',
  'toggle-mute',
  'finder-open-path',
  'shortcut-run'
]);

function assertMac(){
  if (process.platform !== 'darwin') throw new Error('MACOS_REQUIRED');
}

function safeText(value,max=120){
  const s=String(value ?? '').trim();
  if (!s || s.length>max || /[\0\r\n]/.test(s)) throw new Error('INVALID_TEXT_INPUT');
  return s;
}

function normalizeVolume(value){
  const n=Number(value);
  if (!Number.isFinite(n) || n<0 || n>100) throw new Error('INVALID_VOLUME');
  return Math.round(n);
}

function homeScopedPath(value){
  const home=path.resolve(os.homedir());
  const target=path.resolve(home, safeText(value,1000).replace(/^~(?=\/|$)/,home));
  if (target!==home && !target.startsWith(home+path.sep)) throw new Error('PATH_OUTSIDE_HOME');
  return target;
}

async function defaultRun(file,args=[]){
  const {stdout='',stderr=''}=await execFileAsync(file,args,{timeout:15_000,maxBuffer:256*1024,windowsHide:true});
  return {stdout:String(stdout).trim(),stderr:String(stderr).trim()};
}

export function actionRequiresApproval(action){
  return MUTATING_ACTIONS.has(String(action||''));
}

export async function executeMacAction(step,{approved=false,run=defaultRun}={}){
  const action=String(step?.action||'');
  const input=step?.input && typeof step.input==='object' ? step.input : {};
  if (!ACTIONS.has(action)) throw new Error('ACTION_NOT_ALLOWED:'+action);
  if (actionRequiresApproval(action) && step?.requiresApproval!==false && !approved) throw new Error('LOCAL_APPROVAL_REQUIRED');

  if (run===defaultRun) assertMac();

  switch(action){
    case 'read-health':
      return {
        ok:true,
        action,
        result:{platform:process.platform,arch:process.arch,node:process.version,uptimeSeconds:Math.round(process.uptime())}
      };

    case 'read-readiness': {
      const checks={open:false,osascript:false,shortcuts:false};
      for (const [name,file] of Object.entries({open:'/usr/bin/open',osascript:'/usr/bin/osascript',shortcuts:'/usr/bin/shortcuts'})){
        try { await fs.access(file); checks[name]=true; } catch {}
      }
      return {ok:true,action,result:{ready:checks.open&&checks.osascript,checks}};
    }

    case 'open-app': {
      const app=safeText(input.app,120);
      await run('/usr/bin/open',['-a',app]);
      return {ok:true,action,result:{app,opened:true}};
    }

    case 'quit-app': {
      const app=safeText(input.app,120).replace(/"/g,'');
      const script='tell application '+JSON.stringify(app)+' to quit';
      await run('/usr/bin/osascript',['-e',script]);
      return {ok:true,action,result:{app,quitRequested:true}};
    }

    case 'open-system-settings-pane': {
      const pane=String(input.pane||'').trim().toLowerCase();
      const url=SETTINGS_PANES[pane];
      if (!url) throw new Error('SETTINGS_PANE_NOT_ALLOWED');
      await run('/usr/bin/open',[url]);
      return {ok:true,action,result:{pane,opened:true}};
    }

    case 'set-volume': {
      const volume=normalizeVolume(input.volume);
      await run('/usr/bin/osascript',['-e','set volume output volume '+volume]);
      return {ok:true,action,result:{volume}};
    }

    case 'toggle-mute': {
      const muted=Boolean(input.muted);
      await run('/usr/bin/osascript',['-e','set volume output muted '+(muted?'true':'false')]);
      return {ok:true,action,result:{muted}};
    }

    case 'finder-open-path': {
      const target=homeScopedPath(input.path);
      await run('/usr/bin/open',[target]);
      return {ok:true,action,result:{path:target,opened:true}};
    }

    case 'shortcut-run': {
      const name=safeText(input.name,160);
      await run('/usr/bin/shortcuts',['run',name]);
      return {ok:true,action,result:{name,requested:true}};
    }

    default:
      throw new Error('ACTION_NOT_IMPLEMENTED');
  }
}

export function verifyMacAction(step,result){
  if (!result?.ok) return false;
  const action=String(step?.action||'');
  const r=result.result||{};
  switch(action){
    case 'read-health': return typeof r.uptimeSeconds==='number';
    case 'read-readiness': return typeof r.ready==='boolean';
    case 'open-app': return r.opened===true;
    case 'quit-app': return r.quitRequested===true;
    case 'open-system-settings-pane': return r.opened===true;
    case 'set-volume': return r.volume===normalizeVolume(step?.input?.volume);
    case 'toggle-mute': return r.muted===Boolean(step?.input?.muted);
    case 'finder-open-path': return r.opened===true;
    case 'shortcut-run': return r.requested===true;
    default: return false;
  }
}

export const macActionPolicy=Object.freeze({
  platform:'macOS',
  execMode:'execFile-only',
  shell:false,
  arbitraryCommand:false,
  pathScope:'user-home',
  settingsPaneAllowlist:Object.keys(SETTINGS_PANES),
  approvalRequiredFor:[...MUTATING_ACTIONS],
  sipBypass:false,
  tccBypass:false,
  mdmBypass:false
});

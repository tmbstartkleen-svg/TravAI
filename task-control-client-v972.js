(()=> {
  const BASE='http://127.0.0.1:4783';
  const qs=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const auth=()=>({'content-type':'application/json','x-travai-session':sessionStorage.getItem('travai_session')||''});

  async function api(path,options={}){
    const res=await fetch(BASE+path,{...options,headers:{...auth(),...(options.headers||{})}});
    let body={}; try{body=await res.json()}catch{}
    if(!res.ok) throw new Error(body.error||('HTTP '+res.status));
    return body;
  }

  function taskMarkup(tasks=[]){
    const filter=qs('taskStatusFilter')?.value||'all';
    let visible=filter==='all'?tasks:tasks.filter(t=>t.status===filter);
    const q=(qs('taskSearch')?.value||'').trim().toLowerCase();
    if(q) visible=visible.filter(t=>[t.label,t.id,t.status].join(' ').toLowerCase().includes(q));
    const order=qs('taskSort')?.value||'newest';
    visible=[...visible].sort((a,b)=>order==='oldest'?(a.createdAt||0)-(b.createdAt||0):(b.createdAt||0)-(a.createdAt||0));
    const count=qs('taskVisibleCount'); if(count) count.textContent=visible.length+' / '+tasks.length+' tasks';
    if(!visible.length) return '<div class="muted">No tasks match the current filters.</div>';
    return visible.map(t=>{
      const all=t.steps||[], completed=all.filter(s=>s.status==='completed').length;
      const steps=all.map((s,i)=>'<div class="step"><span>'+(i+1)+'. '+esc(s.action)+(s.error?' · '+esc(s.error):'')+'</span><span class="state '+esc(s.status||'pending')+'">'+esc(s.status||'pending')+'</span></div>').join('');
      return '<div class="task"><div class="taskhead"><strong>'+esc(t.label||t.id)+'</strong><span>'+esc(t.status||'pending')+' · '+completed+'/'+all.length+' steps</span></div>'+steps+'<div class="actions">'+((t.status==='failed'||t.status==='retry-pending')?'<button class="retry-task" data-id="'+esc(t.id)+'">Retry</button>':'')+'<button class="secondary cancel-task" data-id="'+esc(t.id)+'">Cancel</button></div></div>';
    }).join('');
  }

  function scheduleMarkup(items=[]){
    if(!items.length) return '<div class="muted">No schedules configured.</div>';
    return items.map(s=>'<div class="task"><div class="taskhead"><strong>'+esc(s.label||s.id)+'</strong><span>'+esc(s.status||'scheduled')+'</span></div><div class="muted">Runs: '+esc(s.runCount||0)+(s.nextRunAt?' · Next: '+new Date(s.nextRunAt).toLocaleString():'')+'</div><div class="actions">'+(s.paused?'<button class="resume-schedule" data-id="'+esc(s.id)+'">Resume</button>':'<button class="secondary pause-schedule" data-id="'+esc(s.id)+'">Pause</button>')+'<button class="secondary cancel-schedule" data-id="'+esc(s.id)+'">Cancel</button></div></div>').join('');
  }

  function favoriteIds(){try{return JSON.parse(localStorage.getItem('travai_favorites')||'["health-check"]')}catch{return ['health-check']}}
  function toggleFavorite(id){const set=new Set(favoriteIds());set.has(id)?set.delete(id):set.add(id);localStorage.setItem('travai_favorites',JSON.stringify([...set]));refresh();}
  function templateMarkup(items=[]){
    if(!items.length) return '<div class="muted">No quick actions available.</div>';
    const fav=new Set(favoriteIds());
    const q=(qs('templateSearch')?.value||'').trim().toLowerCase();
    const cat=qs('templateCategory')?.value||'all';
    const filtered=items.filter(t=>(!q||[t.label,t.description,t.category].join(' ').toLowerCase().includes(q))&&(cat==='all'||t.category===cat));
    if(!filtered.length) return '<div class="muted">No quick actions match this filter.</div>';
    return [...filtered].sort((a,b)=>Number(fav.has(b.id))-Number(fav.has(a.id))).map(t=>'<div class="task"><div class="taskhead"><strong>'+(fav.has(t.id)?'★ ':'☆ ')+esc(t.label)+'</strong><span>'+esc(t.category||'other')+' · '+(t.requiresApproval?'approval required':'read-only')+'</span></div><div class="muted">'+esc(t.description||'')+'</div><div class="actions"><button class="template-run" data-id="'+esc(t.id)+'">Create Task</button><button class="secondary template-favorite" data-id="'+esc(t.id)+'">'+(fav.has(t.id)?'Unfavorite':'Favorite')+'</button></div></div>').join('');
  }

  function approvalMarkup(items=[]){
    const pending=items.filter(x=>x.status==='pending');
    if(!pending.length) return '<div class="muted">No approvals waiting.</div>';
    return pending.map(a=>'<div class="approval"><div><strong>'+esc(a.action)+'</strong><div class="muted">Task '+esc(a.taskId)+' · Step '+esc(a.stepId)+'</div></div><div class="actions"><button class="approve" data-id="'+esc(a.id)+'">Approve</button><button class="secondary deny" data-id="'+esc(a.id)+'">Deny</button></div></div>').join('');
  }

  function randomPairId(){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');}
  async function requestPairing(){
    try{
      const requestId=randomPairId();
      const body=await api('/api/v1300/pairing/request',{method:'POST',body:JSON.stringify({requestId,label:'TravAI Control Surface'})});
      sessionStorage.setItem('travai_pair_request',requestId);
      const el=qs('pairingStatus'); if(el) el.textContent='WAITING FOR LOCAL APPROVAL · '+requestId;
      return body;
    }catch(error){const el=qs('pairingStatus');if(el)el.textContent='PAIRING REQUEST FAILED · '+error.message;}
  }
  async function claimPairing(){
    const requestId=sessionStorage.getItem('travai_pair_request')||'';
    const secret=(qs('pairingClaimSecret')?.value||'').trim();
    if(!requestId||!secret){alert('Request pairing first, then enter the one-time claim secret from the local approval terminal.');return;}
    try{
      const body=await api('/api/v1300/pairing/'+encodeURIComponent(requestId)+'/claim',{method:'POST',body:JSON.stringify({claimSecret:secret})});
      sessionStorage.setItem('travai_session',body.sessionToken);
      sessionStorage.removeItem('travai_pair_request');
      if(qs('pairingClaimSecret'))qs('pairingClaimSecret').value='';
      await refreshSessionState(); await refresh();
    }catch(error){alert('Pairing claim failed: '+error.message);}
  }
  async function revokeOwnSession(){
    try{await api('/api/v1300/session/revoke',{method:'POST',body:'{}'});}catch{}
    sessionStorage.removeItem('travai_session'); await refreshSessionState(); await refresh();
  }
  function sessionCountdown(expiresAt){
    const ms=Math.max(0,Number(expiresAt||0)-Date.now());
    const min=Math.floor(ms/60000), sec=Math.floor((ms%60000)/1000);
    return min+'m '+String(sec).padStart(2,'0')+'s';
  }
  async function refreshPairingDiagnostics(){
    const el=qs('pairingDiagnostics'); if(!el)return;
    try{
      const d=await api('/api/v1300/pairing/diagnostics');
      el.textContent='Pending '+(d.counts?.pending||0)+' · Approved '+(d.counts?.approved||0)+' · Local approval required';
    }catch{el.textContent='Pairing diagnostics unavailable';}
  }
  async function refreshSessionState(){
    const el=qs('pairingStatus'); if(!el)return;
    const token=sessionStorage.getItem('travai_session')||'';
    if(!token){el.textContent=sessionStorage.getItem('travai_pair_request')?'WAITING FOR LOCAL APPROVAL':'NOT PAIRED';return;}
    try{
      const state=await api('/api/v1300/session/check');
      el.textContent='PAIRED · '+sessionCountdown(state.expiresAt)+' remaining · expires '+new Date(state.expiresAt).toLocaleTimeString();
    }catch{sessionStorage.removeItem('travai_session');el.textContent='SESSION EXPIRED OR REVOKED';}
  }

  async function refresh(){
    const status=qs('taskApiStatus'), tasksEl=qs('taskList'), approvalsEl=qs('approvalList'), schedulesEl=qs('scheduleList'), diagEl=qs('diagnosticList'), templatesEl=qs('templateList'), queueEl=qs('queueSummary');
    if(!status||!tasksEl||!approvalsEl) return;
    try{
      const [tasks,approvals,schedules,diagnostics,templates,queue]=await Promise.all([
        api('/api/v974/tasks'),
        api('/api/v974/approvals'),
        api('/api/v974/schedules'),
        api('/api/v974/diagnostics'),
        api('/api/v974/templates'),
        api('/api/v974/queue-summary')
      ]);
      status.textContent='CONNECTED';
      status.className='big ok';
      tasksEl.innerHTML=taskMarkup(tasks.tasks||[]);
      approvalsEl.innerHTML=approvalMarkup(approvals.approvals||[]);
      if(schedulesEl) schedulesEl.innerHTML=scheduleMarkup(schedules.schedules||[]);
      if(diagEl){const d=diagnostics.diagnostics||{};diagEl.innerHTML='<div class="muted">Tasks: '+esc(d.totalTasks||0)+' · Retries: '+esc(d.retries||0)+' · Failed steps: '+esc(d.failedSteps||0)+' · Completed steps: '+esc(d.completedSteps||0)+'</div>'+(d.recentHistory||[]).slice(0,10).map(x=>'<div class="step"><span>'+esc(x.label||x.taskId)+' · '+esc(x.event)+'</span><span>'+new Date(x.at).toLocaleTimeString()+'</span></div>').join('');}
      if(templatesEl) templatesEl.innerHTML=templateMarkup(templates.templates||[]);
      if(queueEl){const s=queue.summary||{},x=s.counts||{};queueEl.innerHTML='<div class="step"><span>Total tasks</span><strong>'+esc(s.total||0)+'</strong></div><div class="step"><span>Needs attention</span><strong>'+esc(s.actionable||0)+'</strong></div><div class="step"><span>Pending / Running</span><span>'+esc(x.pending||0)+' / '+esc(x.running||0)+'</span></div><div class="step"><span>Retry / Failed</span><span>'+esc(x['retry-pending']||0)+' / '+esc(x.failed||0)+'</span></div><div class="step"><span>Completed / Cancelled</span><span>'+esc(x.completed||0)+' / '+esc(x.cancelled||0)+'</span></div>';}
      bind();
    }catch(error){
      status.textContent='API UNAVAILABLE';
      status.className='big warn';
      tasksEl.innerHTML='<div class="muted">Local task API unavailable: '+esc(error.message)+'</div>';
      approvalsEl.innerHTML='<div class="muted">Approval controls appear when the local v9.7.4 API is running.</div>';
      if(schedulesEl) schedulesEl.innerHTML='<div class="muted">Scheduler status appears when the local API is running.</div>';
      if(diagEl) diagEl.innerHTML='<div class="muted">Diagnostics unavailable while the local API is offline.</div>';
      if(templatesEl) templatesEl.innerHTML='<div class="muted">Quick actions unavailable while the local API is offline.</div>';
      if(queueEl) queueEl.innerHTML='<div class="muted">Queue summary unavailable while the local API is offline.</div>';
    }
  }

  async function decide(id,decision){
    try{
      const updated=await api('/api/v974/approvals/'+encodeURIComponent(id),{method:'POST',body:JSON.stringify({decision})});
      if(decision==='approve' && updated.approval){
        await api('/api/v974/tasks/'+encodeURIComponent(updated.approval.taskId)+'/execute',{
          method:'POST',
          body:JSON.stringify({approvalId:updated.approval.id})
        });
      }
      await refresh();
    }catch(error){ alert('Approval/execution failed: '+error.message); }
  }

  async function retry(id){
    try{
      await api('/api/v974/tasks/'+encodeURIComponent(id)+'/retry',{method:'POST',body:'{}'});
      await refresh();
    }catch(error){ alert('Retry failed: '+error.message); }
  }

  async function cancel(id){
    try{
      await api('/api/v974/tasks/'+encodeURIComponent(id)+'/cancel',{method:'POST',body:'{}'});
      await refresh();
    }catch(error){ alert('Cancel failed: '+error.message); }
  }

  async function scheduleAction(id,action){
    try{
      await api('/api/v974/schedules/'+encodeURIComponent(id)+'/'+action,{method:'POST',body:'{}'});
      await refresh();
    }catch(error){ alert('Schedule update failed: '+error.message); }
  }

  async function createFromTemplate(id){
    try{
      await api('/api/v974/templates/'+encodeURIComponent(id)+'/create',{method:'POST',body:'{}'});
      await refresh();
    }catch(error){ alert('Quick action failed: '+error.message); }
  }

  function bind(){
    document.querySelectorAll('.approve').forEach(b=>b.onclick=()=>decide(b.dataset.id,'approve'));
    document.querySelectorAll('.deny').forEach(b=>b.onclick=()=>decide(b.dataset.id,'deny'));
    document.querySelectorAll('.retry-task').forEach(b=>b.onclick=()=>retry(b.dataset.id));
    document.querySelectorAll('.cancel-task').forEach(b=>b.onclick=()=>cancel(b.dataset.id));
    document.querySelectorAll('.pause-schedule').forEach(b=>b.onclick=()=>scheduleAction(b.dataset.id,'pause'));
    document.querySelectorAll('.resume-schedule').forEach(b=>b.onclick=()=>scheduleAction(b.dataset.id,'resume'));
    document.querySelectorAll('.cancel-schedule').forEach(b=>b.onclick=()=>scheduleAction(b.dataset.id,'cancel'));
    document.querySelectorAll('.template-run').forEach(b=>b.onclick=()=>createFromTemplate(b.dataset.id));
    document.querySelectorAll('.template-favorite').forEach(b=>b.onclick=()=>toggleFavorite(b.dataset.id));
  }

  window.TravAITaskControl={refresh};
  window.addEventListener('load',()=>{
    refresh();
    setInterval(refresh,5000);
    const btn=qs('refreshTasks'); if(btn) btn.onclick=refresh;
    const search=qs('templateSearch'); if(search) search.oninput=refresh;
    const category=qs('templateCategory'); if(category) category.onchange=refresh;
    const taskFilter=qs('taskStatusFilter'); if(taskFilter) taskFilter.onchange=refresh;
    const taskSort=qs('taskSort'); if(taskSort) taskSort.onchange=refresh;
    const taskSearch=qs('taskSearch'); if(taskSearch) taskSearch.oninput=refresh;
    const reset=qs('resetTaskFilters'); if(reset) reset.onclick=()=>{if(taskSearch)taskSearch.value='';if(taskFilter)taskFilter.value='all';if(taskSort)taskSort.value='newest';refresh();};
    const pair=qs('requestPairing'); if(pair) pair.onclick=requestPairing;
    const claim=qs('claimPairing'); if(claim) claim.onclick=claimPairing;
    const revoke=qs('revokeSession'); if(revoke) revoke.onclick=revokeOwnSession;
    refreshSessionState(); refreshPairingDiagnostics(); setInterval(refreshSessionState,5000); setInterval(refreshPairingDiagnostics,15000);
  });
})();

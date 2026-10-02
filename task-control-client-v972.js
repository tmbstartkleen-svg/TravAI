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
    if(!tasks.length) return '<div class="muted">No active tasks.</div>';
    return tasks.map(t=>{
      const steps=(t.steps||[]).map((s,i)=>'<div class="step"><span>'+(i+1)+'. '+esc(s.action)+'</span><span class="state '+esc(s.status||'pending')+'">'+esc(s.status||'pending')+'</span></div>').join('');
      return '<div class="task"><div class="taskhead"><strong>'+esc(t.label||t.id)+'</strong><span>'+esc(t.status||'pending')+'</span></div>'+steps+'<div class="actions"><button class="secondary cancel-task" data-id="'+esc(t.id)+'">Cancel</button></div></div>';
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
    return [...items].sort((a,b)=>Number(fav.has(b.id))-Number(fav.has(a.id))).map(t=>'<div class="task"><div class="taskhead"><strong>'+(fav.has(t.id)?'★ ':'☆ ')+esc(t.label)+'</strong><span>'+(t.requiresApproval?'approval required':'read-only')+'</span></div><div class="muted">'+esc(t.description||'')+'</div><div class="actions"><button class="template-run" data-id="'+esc(t.id)+'">Create Task</button><button class="secondary template-favorite" data-id="'+esc(t.id)+'">'+(fav.has(t.id)?'Unfavorite':'Favorite')+'</button></div></div>').join('');
  }

  function approvalMarkup(items=[]){
    const pending=items.filter(x=>x.status==='pending');
    if(!pending.length) return '<div class="muted">No approvals waiting.</div>';
    return pending.map(a=>'<div class="approval"><div><strong>'+esc(a.action)+'</strong><div class="muted">Task '+esc(a.taskId)+' · Step '+esc(a.stepId)+'</div></div><div class="actions"><button class="approve" data-id="'+esc(a.id)+'">Approve</button><button class="secondary deny" data-id="'+esc(a.id)+'">Deny</button></div></div>').join('');
  }

  async function refresh(){
    const status=qs('taskApiStatus'), tasksEl=qs('taskList'), approvalsEl=qs('approvalList'), schedulesEl=qs('scheduleList'), diagEl=qs('diagnosticList'), templatesEl=qs('templateList');
    if(!status||!tasksEl||!approvalsEl) return;
    try{
      const [tasks,approvals,schedules,diagnostics,templates]=await Promise.all([
        api('/api/v974/tasks'),
        api('/api/v974/approvals'),
        api('/api/v974/schedules'),
        api('/api/v974/diagnostics'),
        api('/api/v974/templates')
      ]);
      status.textContent='CONNECTED';
      status.className='big ok';
      tasksEl.innerHTML=taskMarkup(tasks.tasks||[]);
      approvalsEl.innerHTML=approvalMarkup(approvals.approvals||[]);
      if(schedulesEl) schedulesEl.innerHTML=scheduleMarkup(schedules.schedules||[]);
      if(diagEl){const d=diagnostics.diagnostics||{};diagEl.innerHTML='<div class="muted">Tasks: '+esc(d.totalTasks||0)+' · Retries: '+esc(d.retries||0)+' · Failed steps: '+esc(d.failedSteps||0)+' · Completed steps: '+esc(d.completedSteps||0)+'</div>'+(d.recentHistory||[]).slice(0,10).map(x=>'<div class="step"><span>'+esc(x.label||x.taskId)+' · '+esc(x.event)+'</span><span>'+new Date(x.at).toLocaleTimeString()+'</span></div>').join('');}
      if(templatesEl) templatesEl.innerHTML=templateMarkup(templates.templates||[]);
      bind();
    }catch(error){
      status.textContent='API UNAVAILABLE';
      status.className='big warn';
      tasksEl.innerHTML='<div class="muted">Local task API unavailable: '+esc(error.message)+'</div>';
      approvalsEl.innerHTML='<div class="muted">Approval controls appear when the local v9.7.4 API is running.</div>';
      if(schedulesEl) schedulesEl.innerHTML='<div class="muted">Scheduler status appears when the local API is running.</div>';
      if(diagEl) diagEl.innerHTML='<div class="muted">Diagnostics unavailable while the local API is offline.</div>';
      if(templatesEl) templatesEl.innerHTML='<div class="muted">Quick actions unavailable while the local API is offline.</div>';
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
  });
})();

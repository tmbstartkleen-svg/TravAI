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

  function approvalMarkup(items=[]){
    const pending=items.filter(x=>x.status==='pending');
    if(!pending.length) return '<div class="muted">No approvals waiting.</div>';
    return pending.map(a=>'<div class="approval"><div><strong>'+esc(a.action)+'</strong><div class="muted">Task '+esc(a.taskId)+' · Step '+esc(a.stepId)+'</div></div><div class="actions"><button class="approve" data-id="'+esc(a.id)+'">Approve</button><button class="secondary deny" data-id="'+esc(a.id)+'">Deny</button></div></div>').join('');
  }

  async function refresh(){
    const status=qs('taskApiStatus'), tasksEl=qs('taskList'), approvalsEl=qs('approvalList');
    if(!status||!tasksEl||!approvalsEl) return;
    try{
      const [tasks,approvals]=await Promise.all([
        api('/api/v974/tasks'),
        api('/api/v974/approvals')
      ]);
      status.textContent='CONNECTED';
      status.className='big ok';
      tasksEl.innerHTML=taskMarkup(tasks.tasks||[]);
      approvalsEl.innerHTML=approvalMarkup(approvals.approvals||[]);
      bind();
    }catch(error){
      status.textContent='API UNAVAILABLE';
      status.className='big warn';
      tasksEl.innerHTML='<div class="muted">Local task API unavailable: '+esc(error.message)+'</div>';
      approvalsEl.innerHTML='<div class="muted">Approval controls appear when the local v9.7.4 API is running.</div>';
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

  function bind(){
    document.querySelectorAll('.approve').forEach(b=>b.onclick=()=>decide(b.dataset.id,'approve'));
    document.querySelectorAll('.deny').forEach(b=>b.onclick=()=>decide(b.dataset.id,'deny'));
    document.querySelectorAll('.cancel-task').forEach(b=>b.onclick=()=>cancel(b.dataset.id));
  }

  window.TravAITaskControl={refresh};
  window.addEventListener('load',()=>{
    refresh();
    setInterval(refresh,5000);
    const btn=qs('refreshTasks'); if(btn) btn.onclick=refresh;
  });
})();

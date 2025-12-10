
document.addEventListener('DOMContentLoaded', ()=>{
  const user = getCurrentUser(); if(!user){ window.location.href='index.html'; return; }
  document.getElementById('user-name').textContent = user.username;
  refresh();
});
function refresh(){
  const apps=getUserArray('appliances'); const maint=getUserArray('maintenance'); const inv=getUserArray('invoices'); 
  document.getElementById('cnt-appliances').textContent=apps.length;
  document.getElementById('cnt-maint').textContent=maint.length;
  document.getElementById('cnt-inv').textContent=inv.length;
  // show recent maintenance (last 5)
  const recent=document.getElementById('recent-maint'); recent.innerHTML='';
  const sorted = maint.slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,5);
  if(sorted.length===0) recent.innerHTML='<li class="muted">No recent maintenance</li>';
  sorted.forEach(r=>{ const li=document.createElement('li'); li.textContent = `${r.appliance} — ${r.issue} (${fmt(r.date)})`; recent.appendChild(li); });
  // warranty alerts (<=30 days)
  const warranties = getUserArray('warranties'); const alertsDiv=document.getElementById('alerts'); alertsDiv.innerHTML='';
  warranties.forEach(w=>{ const days=daysBetween(w.end); if(days<=30){ const el=document.createElement('div'); el.className='card'; el.style.background='var(--yellow)'; el.textContent = `${w.appliance} warranty expires in ${days} day(s) (${fmt(w.end)})`; alertsDiv.appendChild(el); } });
}

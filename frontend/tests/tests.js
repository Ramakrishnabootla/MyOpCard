document.addEventListener('DOMContentLoaded', () => {
  const API = '/api/requests';
  const form = document.getElementById('testsForm');
  const list = document.getElementById('testsList');
  function toast(msg){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.classList.add('toast','show'); setTimeout(()=>t.classList.remove('show'),2000); }
  function validate(){ const test=document.getElementById('test').value.trim(); const date=document.getElementById('date').value; return test && date; }
  async function api(path, options={}){
    const res = await fetch(`http://localhost:5000${API}${path}`, { method: options.method||'GET', headers:{'Content-Type':'application/json'}, credentials:'include', body: options.body?JSON.stringify(options.body):undefined });
    let data=null; try{data=await res.json();}catch(_){ }
    if(!res.ok) throw new Error(data?.error || data?.errors?.[0]?.msg || 'Request failed');
    return data;
  }
  async function load(){ const items = await api(`?type=test`); list.innerHTML = items.map(i=>`<li>${new Date(i.createdAt).toLocaleDateString()} • ${i.payload.test} — <span class="muted">${i.status}</span></li>`).join('') || '<li class="muted">No test requests yet</li>'; }
  form?.addEventListener('submit', async (e)=>{ e.preventDefault(); if(!validate()){ toast('Enter test name and date'); return; } const body={ type:'test', payload:{ test: document.getElementById('test').value.trim(), date: document.getElementById('date').value, notes: document.getElementById('notes').value.trim() } }; try{ await api('/create',{ method:'POST', body }); toast('Test request submitted'); form.reset(); load(); }catch(err){ toast(err.message);} });
  load();
});



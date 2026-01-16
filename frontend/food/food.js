document.addEventListener('DOMContentLoaded', () => {
  const API = '/api/requests';
  const form = document.getElementById('foodForm');
  const list = document.getElementById('foodList');
  function toast(msg){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.classList.add('toast','show'); setTimeout(()=>t.classList.remove('show'),2000); }
  function validate(){ const ward=document.getElementById('ward').value.trim(); const item=document.getElementById('item').value.trim(); return ward && item; }
  async function api(path, options={}){
    const res = await fetch(`http://localhost:5000${API}${path}`, { method: options.method||'GET', headers:{'Content-Type':'application/json'}, credentials:'include', body: options.body?JSON.stringify(options.body):undefined });
    let data=null; try{data=await res.json();}catch(_){ }
    if(!res.ok) throw new Error(data?.error || data?.errors?.[0]?.msg || 'Request failed');
    return data;
  }
  async function load(){ const items = await api(`?type=food`); list.innerHTML = items.map(i=>`<li>${new Date(i.createdAt).toLocaleTimeString()} • ${i.payload.item} to Ward ${i.payload.ward} — <span class="muted">${i.status}</span></li>`).join('') || '<li class="muted">No requests yet</li>'; }
  form?.addEventListener('submit', async (e)=>{ e.preventDefault(); if(!validate()){ toast('Enter ward and item'); return; } const body={ type:'food', payload:{ ward: document.getElementById('ward').value.trim(), item: document.getElementById('item').value.trim(), notes: document.getElementById('notes').value.trim() } }; try{ await api('/create',{ method:'POST', body }); toast('Food order placed'); form.reset(); load(); }catch(err){ toast(err.message);} });
  load();
});



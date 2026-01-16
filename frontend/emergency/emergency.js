document.addEventListener('DOMContentLoaded', () => {
  const API = '/api/requests';
  const form = document.getElementById('emForm');
  const list = document.getElementById('emList');
  function toast(msg){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.classList.add('toast','show'); setTimeout(()=>t.classList.remove('show'),2000); }
  function validate(){ const type=document.getElementById('type').value; const location=document.getElementById('location').value.trim(); return type && location; }
  async function api(path, options={}){
    const res = await fetch(`http://localhost:5000${API}${path}`, { method: options.method||'GET', headers:{'Content-Type':'application/json'}, credentials:'include', body: options.body?JSON.stringify(options.body):undefined });
    let data=null; try{data=await res.json();}catch(_){ }
    if(!res.ok) throw new Error(data?.error || data?.errors?.[0]?.msg || 'Request failed');
    return data;
  }
  async function load(){ const items = await api(`?type=emergency`); list.innerHTML = items.map(i=>`<li>${new Date(i.createdAt).toLocaleTimeString()} • ${i.payload.type} at ${i.payload.location} — <span class=\"muted\">${i.status}</span></li>`).join('') || '<li class=\"muted\">No emergency requests yet</li>'; }
  form?.addEventListener('submit', async (e)=>{ e.preventDefault(); if(!validate()){ toast('Select type and enter location'); return; } const body={ type:'emergency', payload:{ type: document.getElementById('type').value, location: document.getElementById('location').value.trim(), notes: document.getElementById('notes').value.trim() } }; try{ await api('/create',{ method:'POST', body }); toast('Emergency request sent'); form.reset(); load(); }catch(err){ toast(err.message);} });
  load();
});


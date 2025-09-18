const API_BASE = 'http://localhost:5000/api';

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) throw new Error(data?.error || (data?.errors?.[0]?.msg) || 'Request failed');
  return data;
}

function toast(message, isError=false) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.style.background = isError ? '#b91c1c' : '#111827';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

function validate(form) {
  const required = ['patientName','age','gender','mobile','department','doctor','opNumber','visitDate'];
  for (const name of required) {
    const val = form[name].value?.trim?.() ?? form[name].value;
    if (!val) return `${name} is required`;
  }
  if (!/^\+?[0-9]{10,15}$/.test(form.mobile.value.trim())) return 'Invalid mobile number';
  const age = Number(form.age.value);
  if (Number.isNaN(age) || age < 0 || age > 150) return 'Invalid age';
  return null;
}

async function loadPage(page = 1) {
  const limit = 9;
  const { items, total, totalPages } = await api(`/opcards?page=${page}&limit=${limit}`);
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (const it of items) {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <h3>${it.patientName} <span class="muted">${it.opNumber}</span></h3>
      <div class="muted">${new Date(it.visitDate).toLocaleDateString()} • ${it.department} • Dr. ${it.doctor}</div>
      <div class="row" style="margin-top:.6rem">
        <button class="btn secondary" data-action="view" data-id="${it._id}">View</button>
        <button class="btn secondary" data-action="edit" data-id="${it._id}">Edit</button>
        <button class="btn" style="background:#dc2626" data-action="delete" data-id="${it._id}">Delete</button>
      </div>
    `;
    grid.appendChild(div);
  }
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';
  for (let p = 1; p <= totalPages; p++) {
    const b = document.createElement('button');
    b.className = 'btn secondary';
    b.textContent = p;
    if (p === page) { b.className = 'btn'; }
    b.addEventListener('click', () => loadPage(p));
    pag.appendChild(b);
  }
}

function fillForm(form, data) {
  for (const key of ['patientName','age','gender','mobile','department','doctor','opNumber','visitDate','notes']) {
    if (data[key] != null) form[key].value = key === 'visitDate' ? data[key].slice(0,10) : data[key];
  }
}

async function openCreate() {
  const form = document.getElementById('form');
  form.reset();
  form.dataset.id = '';
  document.getElementById('modalTitle').textContent = 'Add OP Card';
  document.getElementById('modal').style.display = 'block';
}

async function openEdit(id) {
  const data = await api(`/opcards/${id}`);
  const form = document.getElementById('form');
  form.dataset.id = id;
  fillForm(form, data);
  document.getElementById('modalTitle').textContent = 'Edit OP Card';
  document.getElementById('modal').style.display = 'block';
}

async function openView(id) {
  const data = await api(`/opcards/${id}`);
  const view = document.getElementById('view');
  view.innerHTML = `
    <div class="card">
      <h3>${data.patientName} <span class="muted">${data.opNumber}</span></h3>
      <div class="muted">${new Date(data.visitDate).toLocaleString()}</div>
      <p>Age: ${data.age} • Gender: ${data.gender}</p>
      <p>Mobile: ${data.mobile}</p>
      <p>Department: ${data.department}</p>
      <p>Doctor: ${data.doctor}</p>
      ${data.notes ? `<p>Notes: ${data.notes}</p>` : ''}
    </div>
  `;
  document.getElementById('viewModal').style.display = 'block';
}

async function remove(id) {
  if (!confirm('Delete this record?')) return;
  await api(`/opcards/${id}`, { method: 'DELETE' });
  toast('Deleted');
  loadPage();
}

function closeModals() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('viewModal').style.display = 'none';
}

async function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const err = validate(form);
  const errorEl = document.getElementById('error');
  if (err) { errorEl.textContent = err; errorEl.style.display = 'block'; return; }
  errorEl.style.display = 'none';
  const payload = Object.fromEntries(new FormData(form).entries());
  const body = { ...payload, age: Number(payload.age) };
  const id = form.dataset.id;
  try {
    if (!id) {
      await api('/opcards', { method: 'POST', body });
      toast('Created');
    } else {
      await api(`/opcards/${id}`, { method: 'PUT', body });
      toast('Updated');
    }
    closeModals();
    form.reset();
    loadPage();
  } catch (err) {
    toast(err.message, true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add').addEventListener('click', openCreate);
  document.getElementById('close').addEventListener('click', closeModals);
  document.getElementById('closeView').addEventListener('click', closeModals);
  document.getElementById('form').addEventListener('submit', submitForm);
  document.getElementById('grid').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'edit') openEdit(id);
    if (action === 'view') openView(id);
    if (action === 'delete') remove(id);
  });
  loadPage();
});



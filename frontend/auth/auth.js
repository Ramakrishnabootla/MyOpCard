const API_BASE = 'http://localhost:5000/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    throw new Error(data?.error || (data?.errors?.[0]?.msg) || 'Request failed');
  }
  return data;
}

function show(el, show) { el.style.display = show ? 'block' : 'none'; }

function validateEmail(email) { return /.+@.+\..+/.test(email); }

async function handleSignup(form, errorEl) {
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  if (!validateEmail(email) || password.length < 8) {
    errorEl.textContent = 'Enter a valid email and password (min 8 chars).';
    show(errorEl, true); return;
  }
  const res = await apiRequest('/auth/signup', { method: 'POST', body: { name, email, password } });
  window.location.href = '/frontend/dashboard.html';
}

async function handleLogin(form, errorEl) {
  const email = form.email.value.trim();
  const password = form.password.value;
  if (!validateEmail(email) || !password) {
    errorEl.textContent = 'Enter email and password.';
    show(errorEl, true); return;
  }
  await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
  window.location.href = '/frontend/dashboard.html';
}

async function handleForgot(form, successEl, errorEl) {
  const email = form.email.value.trim();
  if (!validateEmail(email)) { errorEl.textContent = 'Enter a valid email.'; show(errorEl, true); return; }
  await apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
  show(successEl, true);
}

async function handleReset(form, successEl, errorEl) {
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  const password = form.password.value;
  const confirm = form.confirm.value;
  if (!token) { errorEl.textContent = 'Missing token.'; show(errorEl, true); return; }
  if (password.length < 8 || password !== confirm) {
    errorEl.textContent = 'Passwords must match and be at least 8 characters.';
    show(errorEl, true); return;
  }
  await apiRequest('/auth/reset-password', { method: 'POST', body: { token, password } });
  show(successEl, true);
}

async function logout() {
  await apiRequest('/auth/logout', { method: 'POST' });
  window.location.href = '/frontend/auth/login.html';
}

window.Auth = { handleSignup, handleLogin, handleForgot, handleReset, logout };



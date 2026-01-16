const API_BASE = 'http://localhost:5500/api';

async function apiRequest(path, options = {}) {
  const btn = options.buttonEl;
  if (btn) { btn.disabled = true; btn.dataset.prevText = btn.textContent; btn.textContent = 'Loading...'; }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      credentials: 'include',
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    let data = null; try { data = await res.json(); } catch (_) {}
    if (!res.ok) throw new Error(data?.error || data?.errors?.[0]?.msg || 'Request failed');
    return data;
  } catch (err) {
    showGlobalToast(err.message || 'Something went wrong');
    throw err;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.prevText || 'Submit'; }
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function initThemeToggle() {
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(current);
    });
  }
}

async function logoutAndRedirect() {
  try { await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }); } catch (_) {}
  window.location.href = '/frontend/auth/login.html';
}

function activeNav(path) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(a => { if (a.getAttribute('href') && window.location.pathname.endsWith(a.getAttribute('href'))) a.classList.add('active'); });
}

function renderNavbar() {
  const nav = document.createElement('div');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="nav-inner" role="navigation" aria-label="Main">
      <div class="brand">MyOpCard</div>
      <div class="spacer"></div>
      <div class="nav-links">
        <a class="nav-link" href="/frontend/dashboard.html">Dashboard</a>
        <a class="nav-link" href="/frontend/opcards/index.html">OP Cards</a>
        <a class="nav-link" href="/frontend/opbooking/opbooking.html">Appointments</a>
  <a class="nav-link" href="/frontend/auth/profile.html">Profile</a>
        <button id="themeToggle" class="theme-toggle" aria-label="Toggle color theme">🌓</button>
        <button id="logoutBtn" class="btn secondary" aria-label="Logout">Logout</button>
      </div>
    </div>`;
  document.body.prepend(nav);
  initThemeToggle();
  activeNav(window.location.pathname);
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logoutAndRedirect);
}


// Global toast
function ensureToast() {
  let t = document.getElementById('globalToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'globalToast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  return t;
}

function showGlobalToast(message, isError = true) {
  const t = ensureToast();
  t.textContent = message;
  t.style.background = isError ? '#b91c1c' : '#111827';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}



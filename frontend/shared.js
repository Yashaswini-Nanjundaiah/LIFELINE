// shared.js — LIFELINE NDMIS v3.0 — Role-Based Access Control

// ═══════════════════════════════════════════════════════════════
// ROLE DEFINITIONS & PAGE ACCESS
// ═══════════════════════════════════════════════════════════════
const ROLES = {
  admin: {
    label: 'System Administrator',
    icon: '🛡️',
    color: '#b388ff',
    pages: ['dashboard','disasters','victims','relief','resources','agencies','volunteers','alerts','admin']
  },
  coordinator: {
    label: 'District Coordinator',
    icon: '📋',
    color: '#00c8ff',
    pages: ['dashboard','disasters','victims','relief','alerts']
  },
  agency: {
    label: 'Agency Officer',
    icon: '🏢',
    color: '#ffb347',
    pages: ['dashboard','resources','relief','volunteers']
  },
  volunteer: {
    label: 'Volunteer Supervisor',
    icon: '🤝',
    color: '#00e676',
    pages: ['dashboard','volunteers','relief']
  }
};

// ═══════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function getSession() {
  try {
    const s = sessionStorage.getItem('lifeline_session');
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}

function setSession(role, name, uid) {
  sessionStorage.setItem('lifeline_session', JSON.stringify({ role, name, uid, ts: Date.now() }));
}

function clearSession() {
  sessionStorage.removeItem('lifeline_session');
}

function requireAuth(pageId) {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  const roleDef = ROLES[session.role];
  if (!roleDef || !roleDef.pages.includes(pageId)) {
    return { session, denied: true };
  }
  return { session, denied: false };
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR BUILDER
// ═══════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { section: 'Overview', items: [
    { id:'dashboard', icon:'🏠', label:'Dashboard', href:'dashboard.html' },
  ]},
  { section: 'Core Entities', items: [
    { id:'disasters',  icon:'🌪️', label:'Disasters',    href:'disasters.html' },
    { id:'victims',    icon:'👥', label:'Victims',       href:'victims.html' },
    { id:'relief',     icon:'🏕️', label:'Relief Camps', href:'relief_camps.html' },
    { id:'resources',  icon:'📦', label:'Resources',     href:'resources.html' },
    { id:'agencies',   icon:'🏢', label:'Agencies',      href:'agencies.html' },
    { id:'volunteers', icon:'🤝', label:'Volunteers',    href:'volunteers.html' },
  ]},
  { section: 'Operations', items: [
    { id:'alerts', icon:'🚨', label:'Alerts', href:'alerts.html', badge:3 },
  ]},
  { section: 'Administration', items: [
    { id:'admin', icon:'🛡️', label:'Admin Panel', href:'admin.html' },
  ]},
];

function buildSidebar(activePage) {
  const session = getSession();
  if (!session) return '';
  const roleDef = ROLES[session.role];
  const allowed = roleDef ? roleDef.pages : [];

  let html = `
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="logo-mark">⚡</div>
        <div class="logo-text">
          <strong>LIFELINE</strong>
          <small>Disaster Mgmt System</small>
        </div>
      </div>
    </div>
    <div class="role-chip">${roleDef?.icon || '👤'} ${roleDef?.label || session.role}</div>
  `;

  NAV_ITEMS.forEach(section => {
    const visibleItems = section.items.filter(i => allowed.includes(i.id));
    if (!visibleItems.length) return;
    html += `<div class="nav-section">
      <div class="nav-label">${section.section}</div>`;
    visibleItems.forEach(item => {
      const isActive = item.id === activePage ? ' active' : '';
      const badgeHtml = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
      html += `<a href="${item.href}" class="nav-item${isActive}">
        <span class="nav-icon">${item.icon}</span>${item.label}${badgeHtml}
      </a>`;
    });
    html += `</div>`;
  });

  html += `
    <div class="sidebar-footer">
      <div class="user-card">
        <div class="avatar">👤</div>
        <div class="user-info">
          <div class="uname">${session.name || 'Officer'}</div>
          <div class="urole">${roleDef?.label || ''}</div>
        </div>
      </div>
      <a href="login.html" class="btn-logout" onclick="clearSession()">⏻ &nbsp;Sign Out</a>
    </div>
  </div>`;
  return html;
}

// ═══════════════════════════════════════════════════════════════
// TOPBAR BUILDER
// ═══════════════════════════════════════════════════════════════
function buildTopbar(title, sub) {
  const session = getSession();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
  const allowed = session ? (ROLES[session.role]?.pages || []) : [];
  const alertLink = allowed.includes('alerts') ? `<a href="alerts.html" class="notif-btn">🔔<span class="num">3</span></a>` : '';

  return `
  <div class="topbar">
    <div class="topbar-left">
      <span class="topbar-title">${title}</span>
      <span class="breadcrumb">/ ${sub}</span>
    </div>
    <div class="topbar-right">
      <div class="live-dot"><span class="dot-live"></span>Live</div>
      <span class="topbar-date">📅 ${dateStr}</span>
      ${alertLink}
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// ACCESS DENIED RENDERER
// ═══════════════════════════════════════════════════════════════
function renderAccessDenied(pageName) {
  return `
  <div class="access-denied">
    <div class="icon">🔒</div>
    <h3>Access Restricted</h3>
    <p>Your role does not have permission to view <strong>${pageName}</strong>.<br>
    Contact your system administrator for access.</p>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════
function showToast(msg, type='success') {
  let t = document.getElementById('global-toast');
  if (!t) { t = document.createElement('div'); t.id='global-toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function filterTable(inputId, tableId) {
  const q = document.getElementById(inputId).value.toLowerCase();
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function animateCount(el, target, duration=1200) {
  if (!el) return;
  let start = 0;
  const step = target / (duration / 16);
  const tick = () => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString('en-IN');
    if (start < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Audit log (stored in sessionStorage for demo)
function logAudit(action, details) {
  const session = getSession();
  if (!session) return;
  const logs = JSON.parse(sessionStorage.getItem('audit_log') || '[]');
  logs.unshift({
    ts: new Date().toISOString(),
    user: session.name || session.uid,
    role: session.role,
    action,
    details
  });
  if (logs.length > 200) logs.pop();
  sessionStorage.setItem('audit_log', JSON.stringify(logs));
}
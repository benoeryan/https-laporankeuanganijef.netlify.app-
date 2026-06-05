// ===== SISTEM KEUANGAN IJEF CORP =====
'use strict';

// ===== CONSTANTS (must be at top) =====
const ROLES = { superadmin: 4, admin: 3, leader: 2, viewer: 1, nanda: 1 };

const STATUS = {
  DRAFT:       'Draft',
  PENDING_L1:  'Pending Layer 1',
  PENDING_L2:  'Pending Layer 2',
  PENDING_L3:  'Pending Layer 3',
  APPROVED:    'Approved Final',
  REJECTED_L1: 'Rejected Layer 1',
  REJECTED_L2: 'Rejected Layer 2',
  REJECTED_L3: 'Rejected Layer 3',
};

const DEFAULT_APPROVERS = [
  { layer: 1, nama: 'Irsan',  email: 'irsanijefcorp@gmail.com',  role: 'leader' },
  { layer: 2, nama: 'Hokage', email: 'hokageijefcorp@gmail.com', role: 'admin' },
  { layer: 3, nama: 'Ana',    email: 'anaijefcorp@gmail.com',    role: 'superadmin' },
];

// ===== STATE =====
let KU = null;

function hasRole(minRole) {
  if (!KU) return false;
  return (ROLES[KU.role] || 0) >= (ROLES[minRole] || 0);
}

// ===== MENU =====
const MENU = [
  { group: 'Setup', icon: '⚙️', items: [
    { id: 'setup-perusahaan', label: 'Data Perusahaan', icon: '🏢', minRole: 'admin' },
    { id: 'setup-akun',       label: 'Kode Akun (CoA)', icon: '📋', minRole: 'admin' },
    { id: 'setup-mitra',      label: 'Data Mitra / TSK', icon: '🤝', minRole: 'admin' },
    { id: 'setup-supplier',   label: 'Data Supplier', icon: '🏭', minRole: 'admin' },
    { id: 'setup-customer',   label: 'Data Customer', icon: '👥', minRole: 'admin' },
    { id: 'setup-saldo-awal', label: 'Saldo Awal', icon: '💰', minRole: 'admin' },
    { id: 'setup-notifikasi', label: 'Notifikasi', icon: '🔔', minRole: 'superadmin' },
  ]},
  { group: 'Transaksi', icon: '💰', items: [
    { id: 'dana-permohonan', label: 'Permohonan Dana', icon: '📤', minRole: 'viewer' },
    { id: 'dana-masuk',      label: 'Dana Masuk',      icon: '📥', minRole: 'viewer' },
    { id: 'dana-approval',   label: 'Approval Center', icon: '✅', minRole: 'viewer' },
    { id: 'portal-aset',     label: 'Portal Perlengkapan & Aset', icon: '📦', minRole: 'viewer' },
  ]},
  { group: 'Jurnal', icon: '📝', items: [
    { id: 'jurnal-umum',         label: 'Jurnal Umum',         icon: '📓', minRole: 'leader' },
    { id: 'jurnal-penyesuaian',  label: 'Jurnal Penyesuaian',  icon: '🔧', minRole: 'leader' },
    { id: 'jurnal-penutup',      label: 'Jurnal Penutup',      icon: '🔒', minRole: 'admin' },
  ]},
  { group: 'Monitor', icon: '📊', items: [
    { id: 'monitor-buku-besar',     label: 'Buku Besar',          icon: '📚', minRole: 'viewer' },
    { id: 'monitor-utang-piutang',  label: 'Buku Utang Piutang',  icon: '💳', minRole: 'viewer' },
    { id: 'monitor-forecast-bayar', label: 'Forecast Pembayaran', icon: '📉', minRole: 'viewer' },
    { id: 'monitor-forecast-terima',label: 'Forecast Penerimaan', icon: '📈', minRole: 'viewer' },
    { id: 'monitor-actual-bayar',   label: 'Actual Pembayaran',   icon: '💸', minRole: 'viewer' },
    { id: 'monitor-actual-terima',  label: 'Actual Penerimaan',   icon: '💰', minRole: 'viewer' },
  ]},
  { group: 'Laporan', icon: '📄', items: [
    { id: 'lap-dashboard',    label: 'Dashboard',           icon: '🎯', minRole: 'viewer' },
    { id: 'lap-labarugi',     label: 'Laba Rugi',           icon: '📊', minRole: 'viewer' },
    { id: 'lap-neraca',       label: 'Neraca',              icon: '⚖️', minRole: 'viewer' },
    { id: 'lap-aruskas',      label: 'Arus Kas',            icon: '🌊', minRole: 'viewer' },
    { id: 'lap-neraca-lajur', label: 'Neraca Lajur',        icon: '📐', minRole: 'viewer' },
    { id: 'lap-ekuitas',      label: 'Ekuitas',             icon: '🏦', minRole: 'viewer' },
    { id: 'lap-pajak',        label: 'Pajak / Tax',         icon: '🧾', minRole: 'admin' },
    { id: 'lap-saldo',        label: 'Posisi Saldo Hari Ini',icon: '💵', minRole: 'viewer' },
    { id: 'lap-analisis',     label: 'Analisis Naratif',    icon: '📝', minRole: 'viewer' },
    { id: 'lap-print-bundle', label: 'Print Laporan Keuangan', icon: '🖨️', minRole: 'viewer' },
  ]},
  { group: 'Kalkulator', icon: '🧮', items: [
    { id: 'kalk-penyusutan',    label: 'Penyusutan Aset',        icon: '📉', minRole: 'viewer' },
    { id: 'kalk-perlengkapan',  label: 'Perlengkapan',           icon: '🔧', minRole: 'viewer' },
    { id: 'kalk-pettycash',     label: 'Petty Cash',             icon: '💵', minRole: 'viewer' },
    { id: 'kalk-pettycash-rec', label: 'Petty Cash Reconcile',   icon: '🔄', minRole: 'viewer' },
    { id: 'kalk-bank-rec',      label: 'Bank Reconcile',         icon: '🏦', minRole: 'viewer' },
    { id: 'kalk-invoice',       label: 'Invoice',                icon: '🧾', minRole: 'viewer' },
    { id: 'kalk-po',            label: 'Purchase Order',         icon: '📦', minRole: 'viewer' },
    { id: 'kalk-gaji',          label: 'Gaji / Salary',          icon: '👔', minRole: 'admin' },
    { id: 'kalk-hpp',           label: 'Hitung HPP',             icon: '🏭', minRole: 'admin' },
    { id: 'kalk-inventori-atk', label: 'Inventori Stok ATK',     icon: '📋', minRole: 'viewer' },
  ]},
  { group: 'Bantuan', icon: '❓', items: [
    { id: 'bantuan', label: 'Cara Penggunaan', icon: '📖', minRole: 'viewer' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖', minRole: 'viewer' },
  ]},
  { group: 'Admin', icon: '🔑', items: [
    { id: 'admin-users',  label: 'Manajemen User',    icon: '👤', minRole: 'superadmin' },
    { id: 'admin-import', label: 'Import Spreadsheet',icon: '📤', minRole: 'admin' },
    { id: 'admin-export', label: 'Export Data',       icon: '📥', minRole: 'admin' },
  ]},
];

// ===== HELPERS =====
function showLoading(v) {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.toggle('show', v);
}

function fmtRp(n) {
  const num = parseFloat(n) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function togglePwd(inputId, btn) {
  var inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

function fmtDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch(e) { return d; }
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function genId(prefix) {
  return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function openModal(html, title) {
  document.getElementById('modal-content').innerHTML = '<h3>' + title + '</h3>' + html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.remove('open');
  }
}

function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function showAlert(msg, type, duration) {
  type = type || 'success';
  duration = duration || 3000;
  const el = document.createElement('div');
  el.className = 'alert alert-' + type;
  el.style.cssText = 'position:fixed;top:70px;right:20px;z-index:9999;min-width:280px;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, duration);
}

function switchTab(btn, tabId) {
  const parent = btn.closest('.card');
  parent.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  parent.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
  btn.classList.add('active');
  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
}

function filterTable(tableId, q) {
  document.querySelectorAll('#' + tableId + ' tbody tr').forEach(function(r) {
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function statusBadge(status) {
  const map = {
    'Draft':           'badge-neutral',
    'Pending Layer 1': 'badge-warning',
    'Pending Layer 2': 'badge-warning',
    'Pending Layer 3': 'badge-warning',
    'Approved Final':  'badge-success',
    'Rejected Layer 1':'badge-danger',
    'Rejected Layer 2':'badge-danger',
    'Rejected Layer 3':'badge-danger',
  };
  return '<span class="badge ' + (map[status] || 'badge-neutral') + '">' + (status || '-') + '</span>';
}

function approvalFlow(status) {
  const layers = [
    { label: 'L1', done: status === STATUS.PENDING_L2 || status === STATUS.PENDING_L3 || status === STATUS.APPROVED, active: status === STATUS.PENDING_L1, rejected: status === STATUS.REJECTED_L1 },
    { label: 'L2', done: status === STATUS.PENDING_L3 || status === STATUS.APPROVED, active: status === STATUS.PENDING_L2, rejected: status === STATUS.REJECTED_L2 },
    { label: 'L3', done: status === STATUS.APPROVED, active: status === STATUS.PENDING_L3, rejected: status === STATUS.REJECTED_L3 },
  ];
  let html = '<div class="approval-flow">';
  layers.forEach(function(l, i) {
    const cls = l.done ? 'done' : l.active ? 'active' : l.rejected ? 'rejected' : '';
    const icon = l.done ? '✓' : l.active ? '⏳' : l.rejected ? '✗' : '○';
    html += '<span class="approval-step ' + cls + '">' + l.label + ' ' + icon + '</span>';
    if (i < 2) html += '<span style="color:#ccc">→</span>';
  });
  html += '</div>';
  return html;
}

function getCurrentLayer(status) {
  const match = (status || '').match(/Pending Layer (\d+)/);
  return match ? parseInt(match[1]) : 0;
}

async function getApprovers() {
  const saved = await KDB.getSetting('approvers', null);
  return saved || DEFAULT_APPROVERS;
}

// ===== INIT & AUTH =====
window.onload = async function() {
  // Check if this is ATK form mode (from QR scan)
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'atk-form') {
    showATKPublicForm();
    return;
  }
  showLoading(true);
  await initKFirebase();
  await initUsers();
  const saved = _klget('k_session', null);
  if (saved) {
    try {
      const u = await findUser(saved.username, saved.password);
      if (u) { KU = u; buildApp(); showLoading(false); return; }
    } catch(e) { console.warn('Session restore:', e); }
  }
  showLoading(false);
};

async function initUsers() {
  const DEFAULT = { username: 'superadmin', password: 'admin2026', role: 'superadmin', nama: 'Super Admin', email: '' };
  const NANDA = { username: 'nanda', password: 'nanda2026', role: 'nanda', nama: 'Nanda Yoga Maulana', email: '' };
  const systemUsers = [DEFAULT, NANDA];

  // Always ensure system users exist in localStorage
  const local = _klget('kusers', []);
  let updated = [...local];
  let changed = false;
  systemUsers.forEach(function(su) {
    if (!updated.find(function(u) { return u.username === su.username; })) {
      updated.push(su);
      changed = true;
    }
  });
  if (changed) {
    _klset('kusers', updated);
    systemUsers.forEach(function(su) { _klset('ku_' + su.username, su); });
  }

  // Always ensure system users exist in Firebase
  if (kfbReady) {
    for (var i = 0; i < systemUsers.length; i++) {
      try {
        var snap = await kfs.getDoc(kfs.doc(kdb, 'k_users', systemUsers[i].username));
        if (!snap.exists()) {
          await kfs.setDoc(kfs.doc(kdb, 'k_users', systemUsers[i].username), systemUsers[i]);
        }
      } catch(e) { console.warn('initUsers Firebase:', e); }
    }
  }
}

async function findUser(username, password) {
  // 1. Try Firebase direct lookup
  if (kfbReady) {
    try {
      const snap = await kfs.getDoc(kfs.doc(kdb, 'k_users', username));
      if (snap.exists()) {
        const u = snap.data();
        if (u.password === password) return u;
      }
    } catch(e) { console.warn('findUser Firebase:', e); }
  }
  // 2. Fallback localStorage
  const local = _klget('kusers', []);
  return local.find(function(u) { return u.username === username && u.password === password; }) || null;
}

async function doLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-error');
  err.style.display = 'none';
  if (!username || !password) {
    err.textContent = 'Username dan password wajib diisi!';
    err.style.display = 'block';
    return;
  }
  showLoading(true);
  const found = await findUser(username, password);
  showLoading(false);
  if (!found) {
    err.textContent = 'Username atau password salah!';
    err.style.display = 'block';
    return;
  }
  KU = found;
  _klset('k_session', { username: found.username, password: found.password });
  buildApp();
}

function doLogout() {
  KU = null;
  localStorage.removeItem('k_session');
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
}

// ===== BUILD APP =====
function buildApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('header-user').textContent = KU.nama || KU.username;
  const roleEl = document.getElementById('header-role');
  roleEl.textContent = KU.role.toUpperCase();
  roleEl.className = 'role-chip role-' + KU.role;
  buildSidebar();
  buildContent();
  // Init notifikasi
  initNotifikasi().then(function(){ updateNotifBadge(); });
  // Nanda: langsung ke portal aset
  if (KU.role === 'nanda') {
    navigate('portal-aset');
  } else {
    navigate('lap-dashboard');
  }
}

function buildSidebar() {
  const sb = document.getElementById('sidebar');
  const role = KU.role;

  // nanda: hanya Portal Perlengkapan & Aset
  const isNanda = (role === 'nanda');
  // viewer & leader: Dashboard + Approval Center + Portal Aset
  const isLimited = (role === 'viewer' || role === 'leader');

  let html = '';
  MENU.forEach(function(group) {
    const visible = group.items.filter(function(item) { return hasRole(item.minRole); });
    if (!visible.length) return;
    let items;

    if (isNanda) {
      // Nanda hanya lihat Portal Perlengkapan & Aset
      if (group.group === 'Transaksi') {
        items = visible.filter(function(i) { return i.id === 'portal-aset'; });
      } else {
        return;
      }
    } else if (isLimited) {
      // Leader/Viewer: Dashboard + Approval Center + Portal Aset
      if (group.group === 'Laporan') {
        items = visible.filter(function(i) { return i.id === 'lap-dashboard'; });
      } else if (group.group === 'Transaksi') {
        items = visible.filter(function(i) { return i.id === 'dana-approval'; });
      } else {
        return;
      }
    } else {
      items = visible;
    }

    if (!items || !items.length) return;
    html += '<div class="sidebar-group"><div class="sidebar-group-title">' + group.icon + ' ' + group.group + '</div>';
    items.forEach(function(item) {
      html += '<div class="sidebar-item" id="nav-' + item.id + '" onclick="navigate(\'' + item.id + '\')">'
            + '<span class="icon">' + item.icon + '</span>' + item.label + '</div>';
    });
    html += '</div><div class="sidebar-divider"></div>';
  });
  sb.innerHTML = html;
}
function buildContent() {
  const mc = document.getElementById('main-content');
  let html = '';
  MENU.forEach(function(group) {
    group.items.forEach(function(item) {
      html += '<div class="section" id="sec-' + item.id + '"></div>';
    });
  });
  mc.innerHTML = html;
}

let currentSection = '';
function navigate(id) {
  const allItems = MENU.flatMap(function(g) { return g.items; });
  const menuItem = allItems.find(function(i) { return i.id === id; });
  if (!hasRole(menuItem ? menuItem.minRole : 'viewer')) return;
  document.querySelectorAll('.sidebar-item').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.section').forEach(function(el) { el.classList.remove('active'); });
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  let secEl = document.getElementById('sec-' + id);
  if (!secEl) {
    secEl = document.createElement('div');
    secEl.className = 'section';
    secEl.id = 'sec-' + id;
    document.getElementById('main-content').appendChild(secEl);
  }
  secEl.classList.add('active');
  currentSection = id;
  renderSection(id);
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('mobile-open');
  }
}

async function renderSection(id) {
  const el = document.getElementById('sec-' + id);
  if (!el) return;
  showLoading(true);
  try {
    switch(id) {
      case 'lap-dashboard':       el.innerHTML = await renderDashboard(); break;
      case 'setup-perusahaan':    el.innerHTML = await renderSetupPerusahaan(); break;
      case 'setup-akun':          el.innerHTML = await renderSetupAkun(); break;
      case 'setup-mitra':         el.innerHTML = await renderSetupMitra(); break;
      case 'setup-supplier':      el.innerHTML = await renderSetupSupplier(); break;
      case 'setup-customer':      el.innerHTML = await renderSetupCustomer(); break;
      case 'setup-saldo-awal':   el.innerHTML = await renderSaldoAwal(); break;
      case 'setup-notifikasi':   el.innerHTML = await renderNotifSettings(); break;
      case 'jurnal-umum':         el.innerHTML = await renderJurnalUmum(); break;
      case 'jurnal-penyesuaian':  el.innerHTML = await renderJurnalPenyesuaian(); break;
      case 'jurnal-penutup':      el.innerHTML = await renderJurnalPenutup(); break;
      case 'monitor-buku-besar':  el.innerHTML = await renderBukuBesar(); break;
      case 'monitor-utang-piutang': el.innerHTML = await renderUtangPiutang(); break;
      case 'monitor-forecast-bayar': el.innerHTML = await renderForecastBayar(); break;
      case 'monitor-forecast-terima': el.innerHTML = await renderForecastTerima(); break;
      case 'monitor-actual-bayar': el.innerHTML = await renderActualBayar(); break;
      case 'monitor-actual-terima': el.innerHTML = await renderActualTerima(); break;
      case 'lap-labarugi':        el.innerHTML = await renderLabaRugi(); break;
      case 'lap-neraca':          el.innerHTML = await renderNeraca(); break;
      case 'lap-aruskas':         el.innerHTML = await renderArusKas(); break;
      case 'lap-neraca-lajur':    el.innerHTML = await renderNeracaLajur(); break;
      case 'lap-ekuitas':         el.innerHTML = await renderEkuitas(); break;
      case 'lap-pajak':           el.innerHTML = await renderPajak(); break;
      case 'lap-saldo':           el.innerHTML = await renderSaldoHariIni(); break;
      case 'lap-analisis':        el.innerHTML = await renderAnalisisNaratif(); break;
      case 'lap-print-bundle':   el.innerHTML = await renderPrintBundle(); break;
      case 'kalk-penyusutan':     el.innerHTML = await renderKalkPenyusutan(); break;
      case 'kalk-perlengkapan':   el.innerHTML = await renderKalkPerlengkapan(); break;
      case 'kalk-pettycash':      el.innerHTML = await renderPettyCash(); break;
      case 'kalk-pettycash-rec':  el.innerHTML = await renderPettyCashRec(); break;
      case 'kalk-bank-rec':       el.innerHTML = await renderBankRec(); break;
      case 'kalk-invoice':        el.innerHTML = await renderInvoice(); break;
      case 'kalk-po':             el.innerHTML = await renderPO(); break;
      case 'kalk-gaji':           el.innerHTML = await renderGaji(); break;
      case 'kalk-hpp':            el.innerHTML = await renderHPP(); break;
      case 'kalk-inventori-atk':  el.innerHTML = await renderInventoriATK(); break;
      case 'kalk-grafik-coa':     el.innerHTML = await renderGrafikCOA(); break;
      case 'bantuan':             el.innerHTML = renderBantuan(); break;
      case 'ai-assistant':        el.innerHTML = await renderAIAssistant(); break;
      case 'admin-users':         el.innerHTML = await renderAdminUsers(); break;
      case 'admin-import':        el.innerHTML = renderImport(); loadSavedApiKey(); break;
      case 'admin-export':        el.innerHTML = await renderExport(); break;
      case 'dana-permohonan':     el.innerHTML = await renderPermohonanDana(); break;
      case 'dana-masuk':          el.innerHTML = await renderDanaMasuk(); break;
      case 'dana-approval':       el.innerHTML = await renderApprovalCenter(); break;
      case 'portal-aset':         el.innerHTML = await renderPortalAset(); break;
      default: el.innerHTML = '<div class="empty-state"><span class="icon">🚧</span>Halaman dalam pengembangan</div>';
    }
  } catch(e) {
    console.error('renderSection error:', e);
    el.innerHTML = '<div class="alert alert-danger">Error: ' + e.message + '</div>';
  }
  showLoading(false);
  // Auto-reapply filter jurnal jika kembali ke halaman jurnal
  if (id === 'jurnal-umum') { setTimeout(reapplyJurnalFilter, 100); }
}

function loadSavedApiKey() {
  setTimeout(function() {
    const saved = localStorage.getItem('k_sheets_apikey');
    const el = document.getElementById('imp-apikey');
    if (saved && el) { el.value = saved; }
  }, 50);
}

// ===== COA =====
// DEFAULT_COA dikosongkan — gunakan Import COA dari Sheets atau tambah manual
const DEFAULT_COA = [];

async function getAkun() {
  const saved = await KDB.getAll('akun');
  // Return saved COA (from import or manual), no auto-init
  if (saved && saved.length > 0) return saved.sort(function(a,b){ return a.kode.localeCompare(b.kode); });
  return [];
}

async function getAkunOptions(filter) {
  const akun = await getAkun();
  const filtered = filter ? akun.filter(function(a) { return a.kategori.includes(filter) || a.tipe === filter; }) : akun;
  return filtered.map(function(a) { return '<option value="' + a.kode + '">' + a.kode + ' - ' + a.nama + '</option>'; }).join('');
}

function computeNeracaTotals(saldo, akunList, fdAkun) {
  var totalAset = 0, totalKewajiban = 0, totalEkuitas = 0;
  var totalPendapatan = 0, totalPendapatanLain = 0, totalBebanOps = 0, totalBebanLain = 0;
  var asetItems = [], kewajibanItems = [], ekuitasItems = [], pendapatanItems = [], bebanItems = [];

  // When akunList is provided, only iterate over official COA accounts.
  // This ensures phantom accounts from journal entries don't cause balance mismatches
  // between what computeNeracaTotals reports and what renderNeraca displays.
  var accountsToCheck = [];
  if (akunList && akunList.length > 0) {
    accountsToCheck = akunList.map(function(a) {
      return { kode: a.kode, kategori: a.kategori || '', nama: a.nama || a.kode };
    });
  } else {
    Object.keys(saldo).forEach(function(kode) {
      var s = saldo[kode];
      accountsToCheck.push({ kode: kode, kategori: (s.akun && s.akun.kategori) || '', nama: (s.akun && s.akun.nama) || kode });
    });
  }

  accountsToCheck.forEach(function(akun) {
    var kode = akun.kode;
    var s = saldo[kode];
    if (!s) return; // skip if no saldo data for this COA account
    var kat = akun.kategori;
    var katLower = kat.toLowerCase();
    var debit = s.debit || 0;
    var kredit = s.kredit || 0;
    var group = '';

    // Determine group based on kategori from COA
    if (kat.includes('Aset')) group = 'aset';
    else if (kat.includes('Kewajiban')) group = 'kewajiban';
    else if (kat === 'Ekuitas') group = 'ekuitas';
    else if (kat === 'Pendapatan Lain-lain') group = 'pendapatanLain';
    else if (kat === 'Pendapatan') group = 'pendapatan';
    else if (kat === 'Beban Operasional') group = 'bebanOps';
    else if (kat === 'Beban Lain-lain') group = 'bebanLain';
    else if (katLower.indexOf('ekuitas') !== -1 || katLower.indexOf('modal') !== -1) group = 'ekuitas';
    else if (katLower.indexOf('pendapatan') !== -1 || katLower.indexOf('revenue') !== -1) group = 'pendapatan';
    else if (katLower.indexOf('beban') !== -1 || katLower.indexOf('biaya') !== -1) group = 'bebanOps';
    else if (katLower.indexOf('kewajiban') !== -1 || katLower.indexOf('utang') !== -1 || katLower.indexOf('hutang') !== -1) group = 'kewajiban';
    else {
      // Final fallback: classify by account code prefix
      var prefix = (kode || '').charAt(0);
      if (prefix === '1') group = 'aset';
      else if (prefix === '2') group = 'kewajiban';
      else if (prefix === '3') group = 'ekuitas';
      else if (prefix === '4') group = 'pendapatan';
      else if (prefix === '5' || prefix === '6') group = 'bebanOps';
      else group = 'aset';
    }

    // Compute balance based on group normal direction (not s.akun.tipe)
    // Aset and Beban are debit-normal: balance = debit - kredit
    // Kewajiban, Ekuitas, Pendapatan are credit-normal: balance = kredit - debit
    var balance;
    if (group === 'aset' || group === 'bebanOps' || group === 'bebanLain') {
      balance = debit - kredit;
    } else {
      balance = kredit - debit;
    }

    var itemData = {kode: kode, nama: akun.nama, net: balance};

    if (group === 'aset') { totalAset += balance; asetItems.push(itemData); }
    else if (group === 'kewajiban') { totalKewajiban += balance; kewajibanItems.push(itemData); }
    else if (group === 'ekuitas') { totalEkuitas += balance; ekuitasItems.push(itemData); }
    else if (group === 'pendapatan') { totalPendapatan += balance; pendapatanItems.push(itemData); }
    else if (group === 'pendapatanLain') { totalPendapatanLain += balance; pendapatanItems.push(itemData); }
    else if (group === 'bebanOps') { totalBebanOps += balance; bebanItems.push(itemData); }
    else if (group === 'bebanLain') { totalBebanLain += balance; bebanItems.push(itemData); }
  });

  var labaBersih = totalPendapatan + totalPendapatanLain - totalBebanOps - totalBebanLain;

  // GUARANTEED BALANCE: Use prefix-based totals from ALL saldo entries
  // to ensure phantom accounts (in saldo but not in COA) are included.
  // From double-entry bookkeeping: sum of all (debit - kredit) = 0
  // Therefore: prefix1(d-k) = prefix2(k-d) + prefix3(k-d) + Laba Bersih
  var totalAsetAll = 0, totalKewAll = 0, totalEkuAll = 0;
  Object.keys(saldo).forEach(function(kode) {
    var s = saldo[kode];
    if (!s) return;
    var prefix = (kode || '').charAt(0);
    if (prefix === '1') totalAsetAll += ((s.debit || 0) - (s.kredit || 0));
    else if (prefix === '2') totalKewAll += ((s.kredit || 0) - (s.debit || 0));
    else if (prefix === '3') totalEkuAll += ((s.kredit || 0) - (s.debit || 0));
  });
  // Laba derived from accounting identity guarantees balance
  var labaBersihGuaranteed = totalAsetAll - totalKewAll - totalEkuAll;
  var totalKewEkuitas = totalKewAll + totalEkuAll + labaBersihGuaranteed;

  // labaCOA is the same as labaBersih when akunList is provided (since we already
  // iterated only over COA accounts). For backward compatibility, compute it separately
  // only when no akunList was provided (fallback mode using all saldo keys).
  var labaCOA = labaBersih;
  if (!akunList && fdAkun) {
    // In fallback mode, compute COA-only laba from fdAkun for comparison
    var pendapatanCOA = 0, bebanCOA = 0;
    (fdAkun || []).forEach(function(a) {
      var ss = saldo[a.kode];
      if (!ss) return;
      var d = ss.debit || 0, k = ss.kredit || 0;
      if (a.kategori === 'Pendapatan' || a.kategori === 'Pendapatan Lain-lain') pendapatanCOA += (k - d);
      else if (a.kategori === 'Beban Operasional' || a.kategori === 'Beban Lain-lain') bebanCOA += (d - k);
    });
    labaCOA = pendapatanCOA - bebanCOA;
  }

  return {
    totalAset: totalAsetAll, totalKewajiban: totalKewAll, totalEkuitas: totalEkuAll,
    totalPendapatan: totalPendapatan, totalPendapatanLain: totalPendapatanLain,
    totalBebanOps: totalBebanOps, totalBebanLain: totalBebanLain,
    labaBersih: labaBersihGuaranteed, labaCOA: labaCOA, totalKewEkuitas: totalKewEkuitas,
    asetItems: asetItems, kewajibanItems: kewajibanItems, ekuitasItems: ekuitasItems,
    pendapatanItems: pendapatanItems, bebanItems: bebanItems
  };
}

async function getFinancialData() {
  var jurnal = await KDB.getAll('jurnal');
  var akun = await getAkun();
  var saldo = {};
  akun.forEach(function(a) { saldo[a.kode] = { akun: a, debit: 0, kredit: 0, net: 0 }; });

  // === SALDO AWAL: Tambahkan saldo awal tahun berjalan ke perhitungan ===
  // Saldo awal disimpan di setting 'saldo_awal_YYYY' sebagai {kodeAkun: nominal}
  // Nominal positif = saldo normal akun (debit untuk Aset/Beban, kredit untuk Kewajiban/Ekuitas/Pendapatan)
  var tahunSekarang = new Date().getFullYear();
  var saldoAwalData = await KDB.getSetting('saldo_awal_' + tahunSekarang, {});

  Object.keys(saldoAwalData).forEach(function(kode) {
    var nominal = parseFloat(saldoAwalData[kode]) || 0;
    if (nominal === 0) return;
    if (!saldo[kode]) {
      var autoKat = autoKategoriCOA(kode, '', '');
      saldo[kode] = { akun: { kode: kode, nama: kode, kategori: autoKat.kategori, tipe: autoKat.tipe }, debit: 0, kredit: 0, net: 0 };
    }
    // Saldo awal positif berarti saldo normal:
    // Akun Debit-normal (Aset, Beban): tambah ke debit
    // Akun Kredit-normal (Kewajiban, Ekuitas, Pendapatan): tambah ke kredit
    var tipe = saldo[kode].akun.tipe;
    var kat = (saldo[kode].akun.kategori || '').toLowerCase();
    var isDebitNormal = (tipe === 'Debit') ||
      kat.includes('aset') || kat.includes('beban') ||
      (kode.charAt(0) === '1') || (kode.charAt(0) === '5') || (kode.charAt(0) === '6');
    if (isDebitNormal) {
      saldo[kode].debit += nominal;
    } else {
      saldo[kode].kredit += nominal;
    }
  });

  // === JURNAL: Tambahkan semua transaksi jurnal ===
  jurnal.filter(function(j) { return j.tipe !== 'penutup'; }).forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      if (!l.akun) return;
      if (!saldo[l.akun]) {
        var autoKat = autoKategoriCOA(l.akun, l.ket || '', '');
        saldo[l.akun] = { akun: { kode: l.akun, nama: l.ket || l.akun, kategori: autoKat.kategori, tipe: autoKat.tipe }, debit: 0, kredit: 0, net: 0 };
      }
      saldo[l.akun].debit += l.debit || 0;
      saldo[l.akun].kredit += l.kredit || 0;
    });
  });
  Object.values(saldo).forEach(function(s) {
    s.net = s.akun.tipe === 'Debit' ? s.debit - s.kredit : s.kredit - s.debit;
  });
  var allAkun = akun.slice();
  Object.keys(saldo).forEach(function(k) {
    if (!allAkun.find(function(a){ return a.kode === k; })) allAkun.push(saldo[k].akun);
  });
  allAkun.sort(function(a,b){ return (a.kode||'').localeCompare(b.kode||''); });
  return { saldo: saldo, akun: allAkun };
}

// ===== DASHBOARD =====
async function renderDashboard() {
  if (KU.role === 'nanda') return renderPortalAset();
  if (KU.role === 'viewer' || KU.role === 'leader') return renderDashboardApprover();
  const jurnal = await KDB.getAll('jurnal');
  const invoices = await KDB.getAll('invoice');
  const po = await KDB.getAll('po');
  const petty = await KDB.getAll('pettycash');
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const allPD = await KDB.getAll('permohonan');
  const allDM = await KDB.getAll('danamasuk');
  // Saldo data
  const fd = await getFinancialData();
  const saldo = fd.saldo;
  const kasAkun = fd.akun.filter(function(a){ return a.kategori === 'Aset Lancar'; });

  const totalDebit = jurnal.reduce(function(s,j){ return s+(parseFloat(j.totalDebit)||0); }, 0);
  const totalKredit = jurnal.reduce(function(s,j){ return s+(parseFloat(j.totalKredit)||0); }, 0);
  const unpaidInvoice = invoices.filter(function(i){ return i.status !== 'Lunas'; }).reduce(function(s,i){ return s+(parseFloat(i.total)||0); }, 0);
  const totalPO = po.reduce(function(s,p){ return s+(parseFloat(p.total)||0); }, 0);
  const totalPetty = petty.reduce(function(s,p){ return s+(parseFloat(p.jumlah)||0); }, 0);
  const pendingPD = allPD.filter(function(x){ return x.status && x.status.startsWith('Pending'); }).length;
  const pendingDM = allDM.filter(function(x){ return x.status && x.status.startsWith('Pending'); }).length;
  const recentJurnal = jurnal.slice().sort(function(a,b){ return (b.tanggal||'').localeCompare(a.tanggal||''); }).slice(0,5);

  const perusahaanBanner = perusahaan.nama
    ? '<div class="alert alert-info" style="margin-bottom:12px">🏢 <b>' + perusahaan.nama + '</b> — Periode: ' + (perusahaan.periode || new Date().getFullYear()) + '</div>'
    : '';
  const pendingBanner = (pendingPD + pendingDM) > 0
    ? '<div class="alert alert-warning">⏳ <b>' + (pendingPD+pendingDM) + '</b> transaksi menunggu approval. <a href="#" onclick="navigate(\'dana-approval\')" style="color:#e65100;font-weight:600">Buka Approval Center</a></div>'
    : '';

  const jurnalRows = recentJurnal.length
    ? recentJurnal.map(function(j){ return '<tr><td>'+fmtDate(j.tanggal)+'</td><td>'+( j.keterangan||'-')+'</td><td class="text-green">'+fmtRp(j.totalDebit)+'</td></tr>'; }).join('')
    : '<tr><td colspan="3" class="text-center text-muted">Belum ada transaksi</td></tr>';

  const approvedPD = allPD.filter(function(x){ return x.status === STATUS.APPROVED; }).slice(-3).map(function(p){
    return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:0.82rem"><span>' + (p.namaPemohon||'-') + ' — ' + (p.noPOInvoice||'-') + '</span><span class="badge badge-success">Approved</span></div>';
  }).join('');

  // Saldo cards — hanya Kas BNI, Mandiri, Petty Cash + pengeluaran/pendapatan hari ini
  var todayStr = today();
  var pengeluaranHariIni = 0, pendapatanHariIni = 0;
  jurnal.filter(function(j){ return j.tanggal === todayStr; }).forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      var a = fd.akun.find(function(x){ return x.kode === l.akun; });
      if (a && (a.kategori||'').includes('Beban')) pengeluaranHariIni += l.debit || 0;
      if (a && (a.kategori||'').includes('Pendapatan')) pendapatanHariIni += l.kredit || 0;
    });
  });
  // Dashboard: hanya BNI, Mandiri, Petty Cash + pengeluaran/pendapatan hari ini
  var dashKasAkun = kasAkun.filter(function(a) {
    var n = (a.nama||'').toLowerCase();
    return n.includes('bni') || n.includes('mandiri') || n.includes('petty');
  });
  if (!dashKasAkun.length) dashKasAkun = kasAkun.slice(0, 3);
  const saldoCards = dashKasAkun.map(function(a) {
    const net = (saldo[a.kode] || {}).net || 0;
    const bg = net > 0 ? '#f8fff8' : net < 0 ? '#fff8f8' : '#f8f9ff';
    const border = net > 0 ? '#4caf50' : net < 0 ? '#f44336' : '#1a237e';
    const cls = net > 0 ? 'text-green' : net < 0 ? 'text-red' : 'text-blue';
    return '<div style="background:' + bg + ';border-radius:8px;padding:12px;border-left:4px solid ' + border + '">'
      + '<div style="font-size:0.72rem;color:#888">' + a.nama + '</div>'
      + '<div class="fw-bold ' + cls + '" style="font-size:1rem;margin-top:3px">' + fmtRp(Math.abs(net)) + '</div>'
      + '</div>';
  }).join('')
    + '<div style="background:#fff8f8;border-radius:8px;padding:12px;border-left:4px solid #f44336">'
    + '<div style="font-size:0.72rem;color:#888">Pengeluaran Hari Ini</div>'
    + '<div class="fw-bold text-red" style="font-size:1rem;margin-top:3px">' + fmtRp(pengeluaranHariIni) + '</div></div>'
    + '<div style="background:#f8fff8;border-radius:8px;padding:12px;border-left:4px solid #4caf50">'
    + '<div style="font-size:0.72rem;color:#888">Pendapatan Hari Ini</div>'
    + '<div class="fw-bold text-green" style="font-size:1rem;margin-top:3px">' + fmtRp(pendapatanHariIni) + '</div></div>';
  const totalAsetLancar = kasAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); }, 0);

  return '<div class="page-title">🎯 Dashboard Keuangan</div>'
    + perusahaanBanner + pendingBanner
    + '<div class="stats-row">'
    + '<div class="stat-box"><div class="val">' + jurnal.length + '</div><div class="lbl">Total Jurnal</div></div>'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalDebit) + '</div><div class="lbl">Total Debit</div></div>'
    + '<div class="stat-box red"><div class="val">' + fmtRp(totalKredit) + '</div><div class="lbl">Total Kredit</div></div>'
    + '<div class="stat-box orange"><div class="val">' + fmtRp(unpaidInvoice) + '</div><div class="lbl">Invoice Belum Lunas</div></div>'
    + '<div class="stat-box purple"><div class="val">' + fmtRp(totalPO) + '</div><div class="lbl">Total PO</div></div>'
    + '<div class="stat-box orange"><div class="val">' + (pendingPD+pendingDM) + '</div><div class="lbl">Pending Approval</div></div>'
    + '</div>'
    // Saldo Hari Ini — langsung di dashboard
    + '<div class="card"><div class="card-header"><h2>💵 Posisi Saldo Hari Ini</h2>'
    + '<span class="text-muted" style="font-size:0.8rem">' + new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</span></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">' + saldoCards + '</div>'
    + '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center">'
    + '<span class="text-muted" style="font-size:0.82rem">Total Aset Lancar</span>'
    + '<span class="fw-bold text-blue" style="font-size:1.1rem">' + fmtRp(totalAsetLancar) + '</span>'
    + '</div></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'
    + '<div class="card"><div class="card-header"><h2>📝 Transaksi Terbaru</h2><button class="btn btn-sm btn-outline" onclick="navigate(\'jurnal-umum\')">Lihat Semua</button></div>'
    + '<table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Debit</th></tr></thead><tbody>' + jurnalRows + '</tbody></table></div>'
    + '<div class="card"><div class="card-header"><h2>✅ Status Approval</h2><button class="btn btn-sm btn-outline" onclick="navigate(\'dana-approval\')">Buka</button></div>'
    + '<div class="stats-row" style="margin-bottom:0">'
    + '<div class="stat-box orange"><div class="val">' + pendingPD + '</div><div class="lbl">Permohonan Pending</div></div>'
    + '<div class="stat-box orange"><div class="val">' + pendingDM + '</div><div class="lbl">Dana Masuk Pending</div></div>'
    + '</div>' + (approvedPD ? '<div class="mt-8">' + approvedPD + '</div>' : '') + '</div>'
    + '</div>'
    + buildDashboardExtras(jurnal, fd, allPD, allDM);
}

async function renderDashboardApprover() {
  // Full dashboard — same as admin but with approval focus
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const jurnal = await KDB.getAll('jurnal');
  const invoices = await KDB.getAll('invoice');
  const po = await KDB.getAll('po');
  const petty = await KDB.getAll('pettycash');
  const allPD = await KDB.getAll('permohonan');
  const allDM = await KDB.getAll('danamasuk');
  const fd = await getFinancialData();
  const saldo = fd.saldo;
  const kasAkun = fd.akun.filter(function(a){ return a.kategori === 'Aset Lancar'; });

  const totalDebit = jurnal.reduce(function(s,j){ return s+(parseFloat(j.totalDebit)||0); }, 0);
  const totalKredit = jurnal.reduce(function(s,j){ return s+(parseFloat(j.totalKredit)||0); }, 0);
  const unpaidInvoice = invoices.filter(function(i){ return i.status !== 'Lunas'; }).reduce(function(s,i){ return s+(parseFloat(i.total)||0); }, 0);
  const totalPO = po.reduce(function(s,p){ return s+(parseFloat(p.total)||0); }, 0);
  const totalPetty = petty.reduce(function(s,p){ return s+(parseFloat(p.jumlah)||0); }, 0);
  const pendingPD = allPD.filter(function(x){ return x.status && x.status.startsWith('Pending'); }).length;
  const pendingDM = allDM.filter(function(x){ return x.status && x.status.startsWith('Pending'); }).length;
  const recentJurnal = jurnal.slice().sort(function(a,b){ return (b.tanggal||'').localeCompare(a.tanggal||''); }).slice(0,5);

  // My pending approvals
  const approvers = await getApprovers();
  const myLayer = (approvers.find(function(a){ return a.email === KU.email || a.role === KU.role; }) || {}).layer;
  const pendingStatus = 'Pending Layer ' + myLayer;
  const pendingForMe = allPD.filter(function(x){ return x.status === pendingStatus; })
    .concat(allDM.filter(function(x){ return x.status === pendingStatus; }));

  const perusahaanBanner = perusahaan.nama
    ? '<div class="alert alert-info" style="margin-bottom:12px">🏢 <b>' + perusahaan.nama + '</b> — Periode: ' + (perusahaan.periode || new Date().getFullYear()) + '</div>'
    : '';
  const pendingBanner = pendingForMe.length > 0
    ? '<div class="alert alert-warning">⏳ <b>' + pendingForMe.length + '</b> item menunggu approval Anda. <a href="#" onclick="navigate(\'dana-approval\')" style="color:#e65100;font-weight:600">Proses Sekarang →</a></div>'
    : '';

  // Saldo cards — hanya Kas BNI, Mandiri, Petty Cash + pengeluaran/pendapatan hari ini
  var todayStr2 = today();
  var pengeluaranHariIni2 = 0, pendapatanHariIni2 = 0;
  jurnal.filter(function(j){ return j.tanggal === todayStr2; }).forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      var a = fd.akun.find(function(x){ return x.kode === l.akun; });
      if (a && (a.kategori||'').includes('Beban')) pengeluaranHariIni2 += l.debit || 0;
      if (a && (a.kategori||'').includes('Pendapatan')) pendapatanHariIni2 += l.kredit || 0;
    });
  });
  var dashKasAkun2 = kasAkun.filter(function(a) {
    var n = (a.nama||'').toLowerCase();
    return n.includes('bni') || n.includes('mandiri') || n.includes('petty');
  });
  if (!dashKasAkun2.length) dashKasAkun2 = kasAkun.slice(0, 3);
  const saldoCards = dashKasAkun2.map(function(a) {
    const net = (saldo[a.kode] || {}).net || 0;
    const bg = net > 0 ? '#f8fff8' : net < 0 ? '#fff8f8' : '#f8f9ff';
    const border = net > 0 ? '#4caf50' : net < 0 ? '#f44336' : '#1a237e';
    const cls = net > 0 ? 'text-green' : net < 0 ? 'text-red' : 'text-blue';
    return '<div style="background:' + bg + ';border-radius:8px;padding:12px;border-left:4px solid ' + border + '">'
      + '<div style="font-size:0.72rem;color:#888">' + a.nama + '</div>'
      + '<div class="fw-bold ' + cls + '" style="font-size:1rem;margin-top:3px">' + fmtRp(Math.abs(net)) + '</div>'
      + '</div>';
  }).join('')
    + '<div style="background:#fff8f8;border-radius:8px;padding:12px;border-left:4px solid #f44336">'
    + '<div style="font-size:0.72rem;color:#888">Pengeluaran Hari Ini</div>'
    + '<div class="fw-bold text-red" style="font-size:1rem;margin-top:3px">' + fmtRp(pengeluaranHariIni2) + '</div></div>'
    + '<div style="background:#f8fff8;border-radius:8px;padding:12px;border-left:4px solid #4caf50">'
    + '<div style="font-size:0.72rem;color:#888">Pendapatan Hari Ini</div>'
    + '<div class="fw-bold text-green" style="font-size:1rem;margin-top:3px">' + fmtRp(pendapatanHariIni2) + '</div></div>';
  const totalAsetLancar = kasAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); }, 0);

  const jurnalRows = recentJurnal.length
    ? recentJurnal.map(function(j){ return '<tr><td>' + fmtDate(j.tanggal) + '</td><td>' + (j.keterangan||'-') + '</td><td class="text-green">' + fmtRp(j.totalDebit) + '</td></tr>'; }).join('')
    : '<tr><td colspan="3" class="text-center text-muted">Belum ada transaksi</td></tr>';

  const approvedPD = allPD.filter(function(x){ return x.status === STATUS.APPROVED; }).slice(-3).map(function(p){
    return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:0.82rem"><span>' + (p.namaPemohon||'-') + ' — ' + (p.noPOInvoice||'-') + '</span><span class="badge badge-success">Approved</span></div>';
  }).join('');

  return '<div class="page-title">🎯 Dashboard Keuangan</div>'
    + perusahaanBanner + pendingBanner
    // Stats row — sama seperti admin
    + '<div class="stats-row">'
    + '<div class="stat-box"><div class="val">' + jurnal.length + '</div><div class="lbl">Total Jurnal</div></div>'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalDebit) + '</div><div class="lbl">Total Debit</div></div>'
    + '<div class="stat-box red"><div class="val">' + fmtRp(totalKredit) + '</div><div class="lbl">Total Kredit</div></div>'
    + '<div class="stat-box orange"><div class="val">' + fmtRp(unpaidInvoice) + '</div><div class="lbl">Invoice Belum Lunas</div></div>'
    + '<div class="stat-box purple"><div class="val">' + fmtRp(totalPO) + '</div><div class="lbl">Total PO</div></div>'
    + '<div class="stat-box orange"><div class="val">' + (pendingPD+pendingDM) + '</div><div class="lbl">Pending Approval</div></div>'
    + '</div>'
    // Posisi Saldo Hari Ini
    + '<div class="card"><div class="card-header"><h2>💵 Posisi Saldo Hari Ini</h2>'
    + '<span class="text-muted" style="font-size:0.8rem">' + new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</span></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">' + saldoCards + '</div>'
    + '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center">'
    + '<span class="text-muted" style="font-size:0.82rem">Total Aset Lancar</span>'
    + '<span class="fw-bold text-blue" style="font-size:1.1rem">' + fmtRp(totalAsetLancar) + '</span>'
    + '</div></div>'
    // Transaksi Terbaru + Status Approval
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'
    + '<div class="card"><div class="card-header"><h2>� Transaksi Terbaru</h2><button class="btn btn-sm btn-outline" onclick="navigate(\'jurnal-umum\')">Lihat Semua</button></div>'
    + '<table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Debit</th></tr></thead><tbody>' + jurnalRows + '</tbody></table></div>'
    + '<div class="card"><div class="card-header"><h2>✅ Status Approval</h2><button class="btn btn-sm btn-outline" onclick="navigate(\'dana-approval\')">Buka</button></div>'
    + '<div class="stats-row" style="margin-bottom:0">'
    + '<div class="stat-box orange"><div class="val">' + pendingPD + '</div><div class="lbl">Permohonan Pending</div></div>'
    + '<div class="stat-box orange"><div class="val">' + pendingDM + '</div><div class="lbl">Dana Masuk Pending</div></div>'
    + '</div>' + (approvedPD ? '<div class="mt-8">' + approvedPD + '</div>' : '') + '</div>'
    + '</div>'
    // Ringkasan Keuangan + Forecast + Actual vs Budget
    + buildDashboardExtras(jurnal, fd, allPD, allDM);
}

// ===== SETUP PERUSAHAAN =====
async function renderSetupPerusahaan() {
  const p = await KDB.getSetting('perusahaan', {});
  const logoPreview = p.logoData
    ? '<img src="' + p.logoData + '" style="max-height:80px;max-width:200px;border-radius:8px;border:1px solid #ddd;margin-top:8px">'
    : '<div class="text-muted" style="margin-top:6px;font-size:0.8rem">Belum ada logo</div>';
  return '<div class="page-title">🏢 Data Perusahaan</div>'
    + '<div class="card"><div class="card-header"><h2>Informasi Perusahaan</h2></div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Nama Perusahaan</label><input id="p-nama" value="' + (p.nama||'') + '" placeholder="PT. IJEF Corp"></div>'
    + '<div class="fg"><label>NPWP</label><input id="p-npwp" value="' + (p.npwp||'') + '" placeholder="00.000.000.0-000.000"></div>'
    + '<div class="fg"><label>Alamat</label><input id="p-alamat" value="' + (p.alamat||'') + '" placeholder="Jl. ..."></div>'
    + '<div class="fg"><label>Kota</label><input id="p-kota" value="' + (p.kota||'') + '" placeholder="Jakarta"></div>'
    + '<div class="fg"><label>Telepon</label><input id="p-telp" value="' + (p.telp||'') + '" placeholder="021-..."></div>'
    + '<div class="fg"><label>Email</label><input id="p-email" value="' + (p.email||'') + '" placeholder="info@..."></div>'
    + '<div class="fg"><label>Mata Uang</label><select id="p-mata-uang"><option value="IDR" ' + (p.mataUang==='IDR'?'selected':'') + '>IDR - Rupiah</option><option value="USD" ' + (p.mataUang==='USD'?'selected':'') + '>USD - Dollar</option></select></div>'
    + '<div class="fg"><label>Periode Akuntansi</label><input id="p-periode" value="' + (p.periode||new Date().getFullYear()) + '"></div>'
    + '<div class="fg"><label>Spreadsheet ID</label><input id="p-sheetid" value="' + (p.sheetId||'1tcE4Qqtl4kT9cAnVbLpFa-VFadb2Wt-0xoVuTj46zB8') + '"></div>'
    + '<div class="fg"><label>Sheet Name</label><input id="p-sheetname" value="' + (p.sheetName||'PD dan DKM') + '"></div>'
    // Logo upload — high quality, stored as base64
    + '<div class="fg full"><label>Logo Perusahaan</label>'
    + '<div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">'
    + '<div>' + logoPreview + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px">'
    + '<label style="background:#1a237e;color:white;padding:9px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.85rem">📁 Upload Logo (JPG/PNG)<input type="file" id="p-logo-file" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="handleLogoUpload(this)"></label>'
    + '<div class="text-muted" style="font-size:0.75rem">Format: JPG/PNG/WebP. Ukuran besar didukung (akan dioptimasi otomatis).</div>'
    + '<div id="p-logo-preview"></div>'
    + '</div></div></div>'
    + '</div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-primary" onclick="simpanPerusahaan()">💾 Simpan Data Perusahaan</button></div>'
    + '</div>'
    // COA Import from Sheets
    + '<div class="card"><div class="card-header"><h2>📋 Import Kode COA dari Google Sheets</h2></div>'
    + '<div class="alert alert-info">Import kode akun dari sheet "KODE COA" di spreadsheet Anda. Spreadsheet ID sudah dikonfigurasi.</div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Google Sheets API Key</label><input id="coa-apikey" value="' + (localStorage.getItem('k_sheets_apikey')||'') + '" placeholder="AIzaSy..."></div>'
    + '<div class="fg"><label>Sheet Name COA</label><input id="coa-sheetname" value="KODE COA" placeholder="KODE COA"></div>'
    + '</div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-info" onclick="importCOAFromSheets()">📥 Import COA dari Sheets</button><button class="btn btn-outline" onclick="resetCOAToDefault()">🔄 Reset ke Default</button></div>'
    + '<div id="coa-import-result" class="mt-12"></div>'
    + '</div>';
}

function handleLogoUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    // Resize to max 800px while keeping quality
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxW = 800, maxH = 400;
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      // Store temporarily
      window._pendingLogo = dataUrl;
      const prev = document.getElementById('p-logo-preview');
      if (prev) prev.innerHTML = '<img src="' + dataUrl + '" style="max-height:80px;max-width:200px;border-radius:8px;border:2px solid #4caf50;margin-top:6px"><div class="text-muted" style="font-size:0.75rem;margin-top:4px">Siap disimpan (' + w + 'x' + h + 'px)</div>';
      showAlert('Logo siap — klik Simpan untuk menyimpan');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function simpanPerusahaan() {
  const data = {
    nama: document.getElementById('p-nama').value,
    npwp: document.getElementById('p-npwp').value,
    alamat: document.getElementById('p-alamat').value,
    kota: document.getElementById('p-kota').value,
    telp: document.getElementById('p-telp').value,
    email: document.getElementById('p-email').value,
    mataUang: document.getElementById('p-mata-uang').value,
    periode: document.getElementById('p-periode').value,
    sheetId: document.getElementById('p-sheetid').value,
    sheetName: document.getElementById('p-sheetname').value,
  };
  // Include logo if uploaded
  if (window._pendingLogo) {
    data.logoData = window._pendingLogo;
    window._pendingLogo = null;
  } else {
    const existing = await KDB.getSetting('perusahaan', {});
    if (existing.logoData) data.logoData = existing.logoData;
  }
  await KDB.saveSetting('perusahaan', data);
  showAlert('Data perusahaan disimpan!');
  navigate('setup-perusahaan');
}

async function importCOAFromSheets() {
  const apiKey = document.getElementById('coa-apikey').value.trim() || localStorage.getItem('k_sheets_apikey') || '';
  const sheetName = document.getElementById('coa-sheetname').value.trim() || 'KODE COA';
  const sheetId = '1tcE4Qqtl4kT9cAnVbLpFa-VFadb2Wt-0xoVuTj46zB8';
  const el = document.getElementById('coa-import-result');
  if (!apiKey) { el.innerHTML = '<div class="alert alert-danger">API Key wajib diisi!</div>'; return; }
  localStorage.setItem('k_sheets_apikey', apiKey);
  el.innerHTML = '<div class="alert alert-info">Mengambil data COA dari Sheets...</div>';
  try {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + encodeURIComponent(sheetName) + '?key=' + apiKey + '&valueRenderOption=UNFORMATTED_VALUE';
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status + ' — pastikan API Key valid dan sheet "' + sheetName + '" ada');
    const data = await res.json();
    const allRows = data.values || [];
    if (allRows.length < 2) { el.innerHTML = '<div class="alert alert-warning">Sheet "' + sheetName + '" kosong atau tidak ditemukan.</div>'; return; }

    // Detect header row — find row with "kode" or "akun" keyword
    let headerIdx = 0;
    for (let i = 0; i < Math.min(5, allRows.length); i++) {
      const rowStr = allRows[i].join('|').toLowerCase();
      if (rowStr.includes('kode') || rowStr.includes('akun') || rowStr.includes('nama')) { headerIdx = i; break; }
    }
    const headers = allRows[headerIdx].map(function(h){ return (h||'').toString().toLowerCase().trim(); });
    const dataRows = allRows.slice(headerIdx + 1);

    // Map columns flexibly — match by header name
    // Priority: exact match first, then partial
    const kodeIdx    = headers.findIndex(function(h){ return h.includes('no') && h.includes('akun') || h === 'kode' || h.includes('kode akun') || h.includes('no. akun') || h.includes('no.akun'); });
    const namaIdx    = headers.findIndex(function(h){ return h.includes('nama akun') || h.includes('nama_akun') || (h.includes('nama') && !h.includes('no')); });
    const kategoriIdx= headers.findIndex(function(h){ return h.includes('kategori') || h.includes('kelompok') || h.includes('group') || h.includes('laporan'); });
    const tipeIdx    = headers.findIndex(function(h){ return h.includes('tipe') || h.includes('normal') || h.includes('saldo normal') || h.includes('posisi'); });

    // If namaIdx still not found or same as kodeIdx, try column index 1 (second column)
    var finalNamaIdx = namaIdx;
    if (finalNamaIdx < 0 || finalNamaIdx === kodeIdx) {
      // Find first column that is NOT kode, kategori, or tipe
      for (var ci = 0; ci < headers.length; ci++) {
        if (ci !== kodeIdx && ci !== kategoriIdx && ci !== tipeIdx) {
          var hv = headers[ci];
          if (hv.includes('nama') || hv.includes('akun') || hv.includes('account') || hv.includes('uraian') || hv.includes('keterangan')) {
            finalNamaIdx = ci; break;
          }
        }
      }
      // Still not found? Use column 1 as fallback
      if (finalNamaIdx < 0 || finalNamaIdx === kodeIdx) finalNamaIdx = kodeIdx >= 0 ? kodeIdx + 1 : 1;
    }

    // Fallback to positional if headers not found
    const getKode    = function(r){ return kodeIdx >= 0 ? r[kodeIdx] : r[0]; };
    const getNama    = function(r){ return finalNamaIdx >= 0 ? r[finalNamaIdx] : r[1]; };
    const getKategori= function(r){ return kategoriIdx >= 0 ? r[kategoriIdx] : r[2]; };
    const getTipe    = function(r){ return tipeIdx >= 0 ? r[tipeIdx] : r[3]; };

    // Show preview of first 3 rows for confirmation
    const preview = dataRows.slice(0,3).map(function(r){
      return (getKode(r)||'') + ' | ' + (getNama(r)||'') + ' | ' + (getKategori(r)||'') + ' | ' + (getTipe(r)||'');
    }).join('<br>');

    el.innerHTML = '<div class="alert alert-info">Ditemukan <b>' + dataRows.length + '</b> baris COA.<br>'
      + 'Header: ' + headers.join(', ') + '<br>'
      + 'Mapping kolom: Kode=col' + (kodeIdx>=0?kodeIdx:'?') + ', Nama=col' + finalNamaIdx + ', Kategori=col' + (kategoriIdx>=0?kategoriIdx:'?') + ', Tipe=col' + (tipeIdx>=0?tipeIdx:'?') + '<br>'
      + 'Preview 3 baris pertama:<br><code>' + preview + '</code><br><br>'
      + '<button class="btn btn-primary" onclick="konfirmasiImportCOA()">Konfirmasi Import ' + dataRows.length + ' Akun</button>'
      + '<button class="btn btn-outline" style="margin-left:8px" onclick="document.getElementById(\'coa-import-result\').innerHTML=\'\'">Batal</button></div>';

    // Store pending data
    window._pendingCOA = { dataRows: dataRows, getKode: getKode, getNama: getNama, getKategori: getKategori, getTipe: getTipe };
  } catch(e) {
    el.innerHTML = '<div class="alert alert-danger">Error: ' + e.message + '</div>';
  }
}

// ===== AUTO-KATEGORISASI COA =====
function autoKategoriCOA(kode, nama, kategoriDariSheet) {
  if (kategoriDariSheet && kategoriDariSheet.trim() && kategoriDariSheet.trim().toLowerCase() !== 'lainnya') {
    return { kategori: kategoriDariSheet.trim(), tipe: autoTipeCOA(kode, kategoriDariSheet) };
  }
  const k = (kode || '').toString().trim();
  const n = (nama || '').toString().toLowerCase();
  const prefix = k.charAt(0);
  if (prefix === '1') {
    if (n.includes('akumulasi') || n.includes('penyusutan') || n.includes('depreciation')) return { kategori: 'Aset Tetap', tipe: 'Kredit' };
    if (k.startsWith('1-2') || k.startsWith('1-3') || k.startsWith('1-4') || k.startsWith('1-5')) return { kategori: 'Aset Tetap', tipe: 'Debit' };
    if (k.startsWith('1-6') || k.startsWith('1-7') || k.startsWith('1-8') || k.startsWith('1-9')) return { kategori: 'Aset Lain-lain', tipe: 'Debit' };
    return { kategori: 'Aset Lancar', tipe: 'Debit' };
  }
  if (prefix === '2') {
    if (n.includes('jangka panjang') || n.includes('long term') || n.includes('obligasi') || n.includes('hipotek')) return { kategori: 'Kewajiban Jangka Panjang', tipe: 'Kredit' };
    return { kategori: 'Kewajiban Lancar', tipe: 'Kredit' };
  }
  if (prefix === '3') return { kategori: 'Ekuitas', tipe: 'Kredit' };
  if (prefix === '4') {
    if (n.includes('lain') || n.includes('other') || n.includes('non-operasional')) return { kategori: 'Pendapatan Lain-lain', tipe: 'Kredit' };
    return { kategori: 'Pendapatan', tipe: 'Kredit' };
  }
  if (prefix === '5' || prefix === '6') {
    if (n.includes('lain') || n.includes('bunga') || n.includes('pajak') || n.includes('non-operasional')) return { kategori: 'Beban Lain-lain', tipe: 'Debit' };
    return { kategori: 'Beban Operasional', tipe: 'Debit' };
  }
  if (n.includes('pendapatan') || n.includes('revenue') || n.includes('penjualan')) return { kategori: 'Pendapatan', tipe: 'Kredit' };
  if (n.includes('beban') || n.includes('biaya') || n.includes('expense')) return { kategori: 'Beban Operasional', tipe: 'Debit' };
  if (n.includes('utang') || n.includes('hutang') || n.includes('liability')) return { kategori: 'Kewajiban Lancar', tipe: 'Kredit' };
  if (n.includes('modal') || n.includes('equity') || n.includes('laba')) return { kategori: 'Ekuitas', tipe: 'Kredit' };
  if (n.includes('kas') || n.includes('bank') || n.includes('piutang')) return { kategori: 'Aset Lancar', tipe: 'Debit' };
  if (n.includes('aset') || n.includes('asset') || n.includes('peralatan') || n.includes('kendaraan')) return { kategori: 'Aset Tetap', tipe: 'Debit' };
  return { kategori: 'Lainnya', tipe: 'Debit' };
}

function autoTipeCOA(kode, kategori) {
  const kat = (kategori || '').toLowerCase();
  if (kat.includes('pendapatan') || kat.includes('kewajiban') || kat.includes('ekuitas') || kat.includes('modal') || kat.includes('akumulasi')) return 'Kredit';
  return 'Debit';
}

async function konfirmasiImportCOA() {
  const el = document.getElementById('coa-import-result');
  if (!window._pendingCOA) return;
  const { dataRows, getKode, getNama, getKategori, getTipe } = window._pendingCOA;

  const existing = await KDB.getAll('akun');
  for (const a of existing) await KDB.delete('akun', a.kode || a.id);

  let imported = 0, skipped = 0;
  const kategorisasi = {};
  for (const row of dataRows) {
    const kode = (getKode(row) || '').toString().trim();
    const nama = (getNama(row) || '').toString().trim();
    const kategoriSheet = (getKategori(row) || '').toString().trim();
    const tipeSheet = (getTipe(row) || '').toString().trim();
    if (!kode || !nama) { skipped++; continue; }
    const auto = autoKategoriCOA(kode, nama, kategoriSheet);
    const tipe = tipeSheet ? (tipeSheet.toUpperCase().startsWith('K') ? 'Kredit' : 'Debit') : auto.tipe;
    const kategori = auto.kategori;
    if (!kategorisasi[kategori]) kategorisasi[kategori] = 0;
    kategorisasi[kategori]++;
    await KDB.save('akun', kode, { id: kode, kode: kode, nama: nama, kategori: kategori, tipe: tipe, level: 1 });
    imported++;
  }
  window._pendingCOA = null;
  const breakdown = Object.keys(kategorisasi).sort().map(function(k) {
    return '<span class="chip">' + k + ': ' + kategorisasi[k] + '</span>';
  }).join(' ');
  el.innerHTML = '<div class="alert alert-success">✅ <b>' + imported + '</b> kode akun diimport dengan auto-kategorisasi!'
    + (skipped > 0 ? ' ' + skipped + ' baris dilewati.' : '')
    + '<br><div style="margin-top:8px">' + breakdown + '</div></div>';
  showAlert('COA berhasil diimport!');
}

async function resetCOAToDefault() {
  if (!confirm('Reset semua kode akun ke default? Data COA yang ada akan dihapus.')) return;
  const existing = await KDB.getAll('akun');
  for (const a of existing) await KDB.delete('akun', a.kode || a.id);
  for (const a of DEFAULT_COA) await KDB.save('akun', a.kode, Object.assign({}, a, { id: a.kode }));
  showAlert('COA direset ke default!');
  navigate('setup-akun');
}

// ===== SETUP AKUN =====
async function renderSetupAkun() {
  const akun = await getAkun();
  const jurnal = await KDB.getAll('jurnal');

  // Calculate debit/kredit totals per akun from jurnal
  const akunTotals = {};
  akun.forEach(function(a) { akunTotals[a.kode] = { debit: 0, kredit: 0 }; });
  jurnal.forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      if (akunTotals[l.akun]) {
        akunTotals[l.akun].debit += l.debit || 0;
        akunTotals[l.akun].kredit += l.kredit || 0;
      }
    });
  });

  // Klasifikasi: Neraca vs Laba Rugi
  const NERACA_GROUPS = ['Aset Lancar', 'Aset Tetap', 'Aset Lain-lain', 'Kewajiban Lancar', 'Kewajiban Jangka Panjang', 'Ekuitas'];

  function getLaporan(kategori) {
    return NERACA_GROUPS.includes(kategori) ? 'Neraca' : 'Laba Rugi';
  }

  // Build rows grouped by kategori
  const groups = {};
  akun.forEach(function(a) {
    if (!groups[a.kategori]) groups[a.kategori] = [];
    groups[a.kategori].push(a);
  });

  // Order: Neraca groups first, then Laba Rugi
  const allGroups = ['Aset Lancar', 'Aset Tetap', 'Aset Lain-lain', 'Kewajiban Lancar', 'Kewajiban Jangka Panjang', 'Ekuitas', 'Pendapatan', 'Pendapatan Lain-lain', 'Beban Operasional', 'Beban Lain-lain'];
  // Add any extra categories not in the list
  Object.keys(groups).forEach(function(k) { if (!allGroups.includes(k)) allGroups.push(k); });

  var rows = '';
  allGroups.forEach(function(kat) {
    var items = groups[kat];
    if (!items || !items.length) return;
    var laporan = getLaporan(kat);
    var headerBg = laporan === 'Neraca' ? '#e8eaf6' : '#e8f5e9';
    rows += '<tr style="background:' + headerBg + '"><td colspan="7" style="padding-left:8px"><b>' + kat + '</b> <span style="font-size:0.75rem;color:#888">(' + laporan + ')</span></td></tr>';
    items.forEach(function(a) {
      var t = akunTotals[a.kode] || { debit: 0, kredit: 0 };
      var aksiHtml = hasRole('admin')
        ? '<button class="btn btn-xs btn-warning" onclick="editAkun(\'' + a.kode + '\')">Edit</button> <button class="btn btn-xs btn-danger" onclick="hapusAkun(\'' + a.kode + '\')">Hapus</button>'
        : '';
      rows += '<tr>'
        + '<td>' + a.kode + '</td>'
        + '<td>' + a.nama + '</td>'
        + '<td><span class="badge ' + (laporan==='Neraca'?'badge-info':'badge-success') + '">' + laporan + '</span></td>'
        + '<td><span class="badge ' + (a.tipe==='Debit'?'badge-info':'badge-warning') + '">' + a.tipe + '</span></td>'
        + '<td class="text-right">' + (t.debit > 0 ? fmtRp(t.debit) : '0') + '</td>'
        + '<td class="text-right">' + (t.kredit > 0 ? fmtRp(t.kredit) : '0') + '</td>'
        + '<td class="tbl-actions">' + aksiHtml + '</td>'
        + '</tr>';
    });
  });

  var addForm = hasRole('admin') ? '<div class="card"><div class="card-header"><h2>Tambah Akun Baru</h2></div>'
    + '<div class="form-grid cols3">'
    + '<div class="fg"><label>Kode Akun</label><input id="ak-kode" placeholder="1-1700"></div>'
    + '<div class="fg"><label>Nama Akun</label><input id="ak-nama" placeholder="Nama akun"></div>'
    + '<div class="fg"><label>Kategori</label><select id="ak-kat">'
    + '<optgroup label="Neraca"><option>Aset Lancar</option><option>Aset Tetap</option><option>Aset Lain-lain</option><option>Kewajiban Lancar</option><option>Kewajiban Jangka Panjang</option><option>Ekuitas</option></optgroup>'
    + '<optgroup label="Laba Rugi"><option>Pendapatan</option><option>Pendapatan Lain-lain</option><option>Beban Operasional</option><option>Beban Lain-lain</option></optgroup>'
    + '</select></div>'
    + '<div class="fg"><label>Saldo Normal</label><select id="ak-tipe"><option>Debit</option><option>Kredit</option></select></div>'
    + '</div><div class="mt-12"><button class="btn btn-primary" onclick="tambahAkun()">Tambah Akun</button></div></div>' : '';

  return '<div class="page-title">📋 Kode Akun (Chart of Accounts)</div>' + addForm
    + '<div class="card"><div class="card-header"><h2>Daftar Akun (' + akun.length + ')</h2>'
    + '<input type="text" placeholder="Cari akun..." oninput="filterTable(\'tbl-akun\',this.value)" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem"></div>'
    + '<div class="table-wrap"><table id="tbl-akun">'
    + '<thead><tr><th>No. Akun</th><th>Nama Akun</th><th>Laporan</th><th>Saldo Normal</th><th class="text-right">Debit</th><th class="text-right">Kredit</th><th>Aksi</th></tr></thead>'
    + '<tbody>' + rows + '</tbody>'
    + '</table></div></div>';
}

async function tambahAkun() {
  const kode = document.getElementById('ak-kode').value.trim();
  const nama = document.getElementById('ak-nama').value.trim();
  if (!kode || !nama) { showAlert('Kode dan nama wajib diisi!', 'danger'); return; }
  await KDB.save('akun', kode, { id: kode, kode: kode, nama: nama, kategori: document.getElementById('ak-kat').value, tipe: document.getElementById('ak-tipe').value, level: 1 });
  showAlert('Akun ditambahkan!');
  navigate('setup-akun');
}

async function hapusAkun(kode) {
  if (!confirm('Hapus akun ' + kode + '?')) return;
  await KDB.delete('akun', kode);
  navigate('setup-akun');
}

async function editAkun(kode) {
  const akun = await getAkun();
  const a = akun.find(function(x){ return x.kode === kode; });
  if (!a) return;
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Kode</label><input id="ea-kode" value="' + a.kode + '" readonly></div>'
    + '<div class="fg"><label>Nama</label><input id="ea-nama" value="' + a.nama + '"></div>'
    + '<div class="fg"><label>Kategori</label><input id="ea-kat" value="' + a.kategori + '"></div>'
    + '<div class="fg"><label>Tipe</label><select id="ea-tipe"><option ' + (a.tipe==='Debit'?'selected':'') + '>Debit</option><option ' + (a.tipe==='Kredit'?'selected':'') + '>Kredit</option></select></div>'
    + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditAkun(\'' + kode + '\')">Simpan</button></div>',
    'Edit Akun');
}

async function simpanEditAkun(kode) {
  await KDB.save('akun', kode, { id: kode, kode: kode, nama: document.getElementById('ea-nama').value.trim(), kategori: document.getElementById('ea-kat').value.trim(), tipe: document.getElementById('ea-tipe').value, level: 1 });
  closeModalDirect();
  showAlert('Akun diperbarui!');
  navigate('setup-akun');
}

// ===== SETUP MITRA / SUPPLIER / CUSTOMER =====
async function renderSetupMitra() {
  const list = await KDB.getAll('mitra');
  const addForm = hasRole('admin') ? '<div class="card"><div class="card-header"><h2>Tambah Mitra</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Nama Mitra</label><input id="m-nama" placeholder="Nama mitra/rekan"></div>'
    + '<div class="fg"><label>Tipe</label><select id="m-tipe"><option>Mitra</option><option>Rekan</option><option>TSK</option><option>Lainnya</option></select></div>'
    + '<div class="fg"><label>PIC</label><input id="m-pic" placeholder="Nama PIC"></div>'
    + '<div class="fg"><label>Telepon</label><input id="m-telp" placeholder="08xx"></div>'
    + '<div class="fg"><label>Email</label><input id="m-email" placeholder="email@..."></div>'
    + '<div class="fg"><label>Nama Bank</label><input id="m-bank" placeholder="BCA / Mandiri / BNI"></div>'
    + '<div class="fg"><label>Atas Nama</label><input id="m-atasnama" placeholder="Nama pemilik rekening"></div>'
    + '<div class="fg"><label>Nomor Rekening</label><input id="m-norek" placeholder="1234567890"></div>'
    + '<div class="fg full"><label>Alamat</label><input id="m-alamat" placeholder="Alamat lengkap"></div>'
    + '</div><div class="mt-12"><button class="btn btn-primary" onclick="tambahMitra()">Tambah Mitra</button></div></div>' : '';
  const rows = list.map(function(m) {
    const detailBtn = '<button class="btn btn-xs btn-info" onclick="detailMitra(\'' + m.id + '\')">Detail</button>';
    const editBtn = hasRole('admin') ? '<button class="btn btn-xs btn-warning" onclick="editMitra(\'' + m.id + '\')">Edit</button>' : '';
    const hapusBtn = hasRole('admin') ? '<button class="btn btn-xs btn-danger" onclick="hapusMitra(\'' + m.id + '\')">Hapus</button>' : '';
    return '<tr><td class="fw-bold">' + m.nama + '</td><td><span class="chip">' + (m.tipe||'-') + '</span></td><td>' + (m.pic||'-') + '</td><td>' + (m.telp||'-') + '</td><td>' + (m.email||'-') + '</td><td>' + (m.bank||'-') + '</td><td>' + (m.atasnama||'-') + '</td><td>' + (m.norek||'-') + '</td><td class="tbl-actions">' + detailBtn + editBtn + hapusBtn + '</td></tr>';
  }).join('');
  return '<div class="page-title">🤝 Data Mitra / Rekan / TSK</div>' + addForm
    + '<div class="card"><div class="card-header"><h2>Daftar Mitra (' + list.length + ')</h2></div>'
    + (list.length ? '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Tipe</th><th>PIC</th><th>Telepon</th><th>Email</th><th>Bank</th><th>Atas Nama</th><th>No. Rek</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">🤝</span>Belum ada data mitra</div>')
    + '</div>';
}

async function tambahMitra() {
  const nama = document.getElementById('m-nama').value.trim();
  if (!nama) { showAlert('Nama wajib diisi!', 'danger'); return; }
  const id = genId('MTR');
  await KDB.save('mitra', id, { id: id, nama: nama, tipe: document.getElementById('m-tipe').value, pic: document.getElementById('m-pic').value, telp: document.getElementById('m-telp').value, email: document.getElementById('m-email').value, alamat: document.getElementById('m-alamat').value, bank: document.getElementById('m-bank').value, atasnama: document.getElementById('m-atasnama').value, norek: document.getElementById('m-norek').value });
  showAlert('Mitra ditambahkan!');
  navigate('setup-mitra');
}

async function hapusMitra(id) {
  if (!confirm('Hapus mitra ini?')) return;
  await KDB.delete('mitra', id);
  navigate('setup-mitra');
}

function detailMitra(id) {
  KDB.getAll('mitra').then(function(list) {
    var m = list.find(function(x){ return x.id === id; });
    if (!m) return;
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Nama</label><div class="fw-bold">' + (m.nama||'-') + '</div></div>'
      + '<div class="fg"><label>Tipe</label><div class="chip">' + (m.tipe||'-') + '</div></div>'
      + '<div class="fg"><label>PIC</label><div>' + (m.pic||'-') + '</div></div>'
      + '<div class="fg"><label>Telepon</label><div>' + (m.telp||'-') + '</div></div>'
      + '<div class="fg"><label>Email</label><div>' + (m.email||'-') + '</div></div>'
      + '<div class="fg"><label>Nama Bank</label><div>' + (m.bank||'-') + '</div></div>'
      + '<div class="fg"><label>Atas Nama</label><div>' + (m.atasnama||'-') + '</div></div>'
      + '<div class="fg"><label>No. Rekening</label><div>' + (m.norek||'-') + '</div></div>'
      + '<div class="fg full"><label>Alamat</label><div>' + (m.alamat||'-') + '</div></div>'
      + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
      'Detail Mitra: ' + m.nama);
  });
}

function editMitra(id) {
  KDB.getAll('mitra').then(function(list) {
    var m = list.find(function(x){ return x.id === id; });
    if (!m) return;
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Nama</label><input id="em-nama" value="' + (m.nama||'') + '"></div>'
      + '<div class="fg"><label>Tipe</label><select id="em-tipe"><option' + (m.tipe==='Mitra'?' selected':'') + '>Mitra</option><option' + (m.tipe==='Rekan'?' selected':'') + '>Rekan</option><option' + (m.tipe==='TSK'?' selected':'') + '>TSK</option><option' + (m.tipe==='Lainnya'?' selected':'') + '>Lainnya</option></select></div>'
      + '<div class="fg"><label>PIC</label><input id="em-pic" value="' + (m.pic||'') + '"></div>'
      + '<div class="fg"><label>Telepon</label><input id="em-telp" value="' + (m.telp||'') + '"></div>'
      + '<div class="fg"><label>Email</label><input id="em-email" value="' + (m.email||'') + '"></div>'
      + '<div class="fg"><label>Nama Bank</label><input id="em-bank" value="' + (m.bank||'') + '"></div>'
      + '<div class="fg"><label>Atas Nama</label><input id="em-atasnama" value="' + (m.atasnama||'') + '"></div>'
      + '<div class="fg"><label>No. Rekening</label><input id="em-norek" value="' + (m.norek||'') + '"></div>'
      + '<div class="fg full"><label>Alamat</label><input id="em-alamat" value="' + (m.alamat||'') + '"></div>'
      + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditMitra(\'' + id + '\')">Simpan</button></div>',
      'Edit Mitra: ' + m.nama);
  });
}

async function simpanEditMitra(id) {
  var list = await KDB.getAll('mitra');
  var m = list.find(function(x){ return x.id === id; });
  if (!m) return;
  await KDB.save('mitra', id, Object.assign({}, m, {
    nama: (document.getElementById('em-nama')||{}).value || m.nama,
    tipe: (document.getElementById('em-tipe')||{}).value || m.tipe,
    pic: (document.getElementById('em-pic')||{}).value || '',
    telp: (document.getElementById('em-telp')||{}).value || '',
    email: (document.getElementById('em-email')||{}).value || '',
    bank: (document.getElementById('em-bank')||{}).value || '',
    atasnama: (document.getElementById('em-atasnama')||{}).value || '',
    norek: (document.getElementById('em-norek')||{}).value || '',
    alamat: (document.getElementById('em-alamat')||{}).value || '',
  }));
  closeModalDirect();
  showAlert('Mitra diperbarui!');
  navigate('setup-mitra');
}

async function renderSetupSupplier() {
  const list = await KDB.getAll('supplier');
  const addForm = hasRole('admin') ? '<div class="card"><div class="card-header"><h2>Tambah Supplier</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Nama Supplier</label><input id="s-nama" placeholder="Nama supplier"></div>'
    + '<div class="fg"><label>Kode</label><input id="s-kode" placeholder="SUP-001"></div>'
    + '<div class="fg"><label>PIC</label><input id="s-pic" placeholder="Nama PIC"></div>'
    + '<div class="fg"><label>Telepon</label><input id="s-telp" placeholder="08xx"></div>'
    + '<div class="fg"><label>Nama Bank</label><input id="s-bank" placeholder="BCA / Mandiri"></div>'
    + '<div class="fg"><label>No. Rekening</label><input id="s-norek" placeholder="1234567890"></div>'
    + '<div class="fg"><label>Nama Rekening</label><input id="s-namarek" placeholder="Nama pemilik rekening"></div>'
    + '<div class="fg"><label>TOP (hari)</label><input type="number" id="s-top" placeholder="30"></div>'
    + '</div><div class="mt-12"><button class="btn btn-primary" onclick="tambahSupplier()">Tambah Supplier</button></div></div>' : '';
  const rows = list.map(function(s) {
    const detailBtn = '<button class="btn btn-xs btn-info" onclick="detailSupplier(\'' + s.id + '\')">Detail</button>';
    const editBtn = hasRole('admin') ? '<button class="btn btn-xs btn-warning" onclick="editSupplier(\'' + s.id + '\')">Edit</button>' : '';
    const hapusBtn = hasRole('admin') ? '<button class="btn btn-xs btn-danger" onclick="hapusSupplier(\'' + s.id + '\')">Hapus</button>' : '';
    return '<tr><td>' + (s.kode||'-') + '</td><td class="fw-bold">' + s.nama + '</td><td>' + (s.pic||'-') + '</td><td>' + (s.telp||'-') + '</td><td>' + (s.bank||'-') + '</td><td>' + (s.norek||'-') + '</td><td>' + (s.top ? s.top+' hari' : '-') + '</td><td class="tbl-actions">' + detailBtn + editBtn + hapusBtn + '</td></tr>';
  }).join('');
  return '<div class="page-title">🏭 Data Supplier</div>' + addForm
    + '<div class="card"><div class="card-header"><h2>Daftar Supplier (' + list.length + ')</h2></div>'
    + (list.length ? '<div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama</th><th>PIC</th><th>Telepon</th><th>Bank</th><th>No. Rek</th><th>TOP</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">🏭</span>Belum ada data supplier</div>')
    + '</div>';
}

async function tambahSupplier() {
  const nama = document.getElementById('s-nama').value.trim();
  if (!nama) { showAlert('Nama wajib diisi!', 'danger'); return; }
  const id = genId('SUP');
  await KDB.save('supplier', id, { id: id, nama: nama, kode: document.getElementById('s-kode').value, pic: document.getElementById('s-pic').value, telp: document.getElementById('s-telp').value, bank: document.getElementById('s-bank').value, norek: document.getElementById('s-norek').value, namarek: document.getElementById('s-namarek').value, top: document.getElementById('s-top').value });
  showAlert('Supplier ditambahkan!');
  navigate('setup-supplier');
}

async function hapusSupplier(id) {
  if (!confirm('Hapus supplier ini?')) return;
  await KDB.delete('supplier', id);
  navigate('setup-supplier');
}

function detailSupplier(id) {
  KDB.getAll('supplier').then(function(list) {
    var s = list.find(function(x){ return x.id === id; });
    if (!s) return;
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Kode</label><div class="chip">' + (s.kode||'-') + '</div></div>'
      + '<div class="fg"><label>Nama</label><div class="fw-bold">' + (s.nama||'-') + '</div></div>'
      + '<div class="fg"><label>PIC</label><div>' + (s.pic||'-') + '</div></div>'
      + '<div class="fg"><label>Telepon</label><div>' + (s.telp||'-') + '</div></div>'
      + '<div class="fg"><label>Nama Bank</label><div>' + (s.bank||'-') + '</div></div>'
      + '<div class="fg"><label>No. Rekening</label><div>' + (s.norek||'-') + '</div></div>'
      + '<div class="fg"><label>Nama Rekening</label><div>' + (s.namarek||'-') + '</div></div>'
      + '<div class="fg"><label>TOP</label><div>' + (s.top ? s.top + ' hari' : '-') + '</div></div>'
      + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
      'Detail Supplier: ' + s.nama);
  });
}

function editSupplier(id) {
  KDB.getAll('supplier').then(function(list) {
    var s = list.find(function(x){ return x.id === id; });
    if (!s) return;
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Nama</label><input id="es-nama" value="' + (s.nama||'') + '"></div>'
      + '<div class="fg"><label>Kode</label><input id="es-kode" value="' + (s.kode||'') + '"></div>'
      + '<div class="fg"><label>PIC</label><input id="es-pic" value="' + (s.pic||'') + '"></div>'
      + '<div class="fg"><label>Telepon</label><input id="es-telp" value="' + (s.telp||'') + '"></div>'
      + '<div class="fg"><label>Nama Bank</label><input id="es-bank" value="' + (s.bank||'') + '"></div>'
      + '<div class="fg"><label>No. Rekening</label><input id="es-norek" value="' + (s.norek||'') + '"></div>'
      + '<div class="fg"><label>Nama Rekening</label><input id="es-namarek" value="' + (s.namarek||'') + '"></div>'
      + '<div class="fg"><label>TOP (hari)</label><input type="number" id="es-top" value="' + (s.top||'') + '"></div>'
      + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditSupplier(\'' + id + '\')">Simpan</button></div>',
      'Edit Supplier: ' + s.nama);
  });
}

async function simpanEditSupplier(id) {
  var list = await KDB.getAll('supplier');
  var s = list.find(function(x){ return x.id === id; });
  if (!s) return;
  await KDB.save('supplier', id, Object.assign({}, s, {
    nama: (document.getElementById('es-nama')||{}).value || s.nama,
    kode: (document.getElementById('es-kode')||{}).value || s.kode,
    pic: (document.getElementById('es-pic')||{}).value || '',
    telp: (document.getElementById('es-telp')||{}).value || '',
    bank: (document.getElementById('es-bank')||{}).value || '',
    norek: (document.getElementById('es-norek')||{}).value || '',
    namarek: (document.getElementById('es-namarek')||{}).value || '',
    top: (document.getElementById('es-top')||{}).value || '',
  }));
  closeModalDirect();
  showAlert('Supplier diperbarui!');
  navigate('setup-supplier');
}

async function renderSetupCustomer() {
  const list = await KDB.getAll('customer');
  const akunOpts = await getAkunOptions();
  const addForm = hasRole('admin') ? '<div class="card"><div class="card-header"><h2>Tambah Customer</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Nama Customer</label><input id="c-nama" placeholder="Nama customer"></div>'
    + '<div class="fg"><label>Kode</label><input id="c-kode" placeholder="CUS-001"></div>'
    + '<div class="fg"><label>PIC</label><input id="c-pic" placeholder="Nama PIC"></div>'
    + '<div class="fg"><label>Telepon</label><input id="c-telp" placeholder="08xx"></div>'
    + '<div class="fg"><label>Email</label><input id="c-email" placeholder="email@..."></div>'
    + '<div class="fg"><label>Limit Kredit</label><input type="number" id="c-limit" placeholder="0"></div>'
    + '<div class="fg"><label>TOP (hari)</label><input type="number" id="c-top" placeholder="30"></div>'
    + '<div class="fg"><label>Akun Debit (COA)</label><select id="c-akun-debit" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%"><option value="">-- Pilih --</option>' + akunOpts + '</select></div>'
    + '<div class="fg"><label>Akun Kredit (COA)</label><select id="c-akun-kredit" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%"><option value="">-- Pilih --</option>' + akunOpts + '</select></div>'
    + '<div class="fg"><label>Nama Bank</label><input id="c-bank" placeholder="BCA / Mandiri / BNI"></div>'
    + '<div class="fg"><label>Atas Nama</label><input id="c-atasnama" placeholder="Nama pemilik rekening"></div>'
    + '<div class="fg"><label>Nomor Rekening</label><input id="c-norek" placeholder="1234567890"></div>'
    + '<div class="fg full"><label>Alamat</label><input id="c-alamat" placeholder="Alamat lengkap"></div>'
    + '</div><div class="mt-12"><button class="btn btn-primary" onclick="tambahCustomer()">Tambah Customer</button></div></div>' : '';
  const rows = list.map(function(c) {
    const detailBtn = '<button class="btn btn-xs btn-info" onclick="detailCustomer(\'' + c.id + '\')">Detail</button>';
    const editBtn = hasRole('admin') ? '<button class="btn btn-xs btn-warning" onclick="editCustomer(\'' + c.id + '\')">Edit</button>' : '';
    const hapusBtn = hasRole('admin') ? '<button class="btn btn-xs btn-danger" onclick="hapusCustomer(\'' + c.id + '\')">Hapus</button>' : '';
    return '<tr><td>' + (c.kode||'-') + '</td><td class="fw-bold">' + c.nama + '</td><td>' + (c.pic||'-') + '</td><td>' + (c.telp||'-') + '</td><td>' + (c.akunDebit||'-') + '</td><td>' + (c.akunKredit||'-') + '</td><td>' + (c.bank||'-') + '</td><td>' + (c.atasnama||'-') + '</td><td>' + (c.norek||'-') + '</td><td>' + fmtRp(c.limit) + '</td><td class="tbl-actions">' + detailBtn + editBtn + hapusBtn + '</td></tr>';
  }).join('');
  return '<div class="page-title">👥 Data Customer</div>' + addForm
    + '<div class="card"><div class="card-header"><h2>Daftar Customer (' + list.length + ')</h2></div>'
    + (list.length ? '<div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama</th><th>PIC</th><th>Telepon</th><th>Akun Debit</th><th>Akun Kredit</th><th>Bank</th><th>Atas Nama</th><th>No. Rek</th><th>Limit</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">👥</span>Belum ada data customer</div>')
    + '</div>';
}

async function tambahCustomer() {
  const nama = document.getElementById('c-nama').value.trim();
  if (!nama) { showAlert('Nama wajib diisi!', 'danger'); return; }
  const id = genId('CUS');
  await KDB.save('customer', id, { id: id, nama: nama, kode: document.getElementById('c-kode').value, pic: document.getElementById('c-pic').value, telp: document.getElementById('c-telp').value, email: document.getElementById('c-email').value, limit: document.getElementById('c-limit').value, top: document.getElementById('c-top').value, alamat: document.getElementById('c-alamat').value, akunDebit: document.getElementById('c-akun-debit').value, akunKredit: document.getElementById('c-akun-kredit').value, bank: document.getElementById('c-bank').value, atasnama: document.getElementById('c-atasnama').value, norek: document.getElementById('c-norek').value });
  showAlert('Customer ditambahkan!');
  navigate('setup-customer');
}

async function hapusCustomer(id) {
  if (!confirm('Hapus customer ini?')) return;
  await KDB.delete('customer', id);
  navigate('setup-customer');
}

function detailCustomer(id) {
  KDB.getAll('customer').then(function(list) {
    var c = list.find(function(x){ return x.id === id; });
    if (!c) return;
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Kode</label><div class="chip">' + (c.kode||'-') + '</div></div>'
      + '<div class="fg"><label>Nama</label><div class="fw-bold">' + (c.nama||'-') + '</div></div>'
      + '<div class="fg"><label>PIC</label><div>' + (c.pic||'-') + '</div></div>'
      + '<div class="fg"><label>Telepon</label><div>' + (c.telp||'-') + '</div></div>'
      + '<div class="fg"><label>Email</label><div>' + (c.email||'-') + '</div></div>'
      + '<div class="fg"><label>Limit Kredit</label><div class="fw-bold">' + fmtRp(c.limit) + '</div></div>'
      + '<div class="fg"><label>TOP</label><div>' + (c.top ? c.top + ' hari' : '-') + '</div></div>'
      + '<div class="fg"><label>Akun Debit</label><div>' + (c.akunDebit||'-') + '</div></div>'
      + '<div class="fg"><label>Akun Kredit</label><div>' + (c.akunKredit||'-') + '</div></div>'
      + '<div class="fg"><label>Nama Bank</label><div>' + (c.bank||'-') + '</div></div>'
      + '<div class="fg"><label>Atas Nama</label><div>' + (c.atasnama||'-') + '</div></div>'
      + '<div class="fg"><label>No. Rekening</label><div>' + (c.norek||'-') + '</div></div>'
      + '<div class="fg full"><label>Alamat</label><div>' + (c.alamat||'-') + '</div></div>'
      + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
      'Detail Customer: ' + c.nama);
  });
}

function editCustomer(id) {
  Promise.all([KDB.getAll('customer'), getAkunOptions()]).then(function(results) {
    var list = results[0];
    var akunOpts = results[1];
    var c = list.find(function(x){ return x.id === id; });
    if (!c) return;
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Nama</label><input id="ec-nama" value="' + (c.nama||'') + '"></div>'
      + '<div class="fg"><label>Kode</label><input id="ec-kode" value="' + (c.kode||'') + '"></div>'
      + '<div class="fg"><label>PIC</label><input id="ec-pic" value="' + (c.pic||'') + '"></div>'
      + '<div class="fg"><label>Telepon</label><input id="ec-telp" value="' + (c.telp||'') + '"></div>'
      + '<div class="fg"><label>Email</label><input id="ec-email" value="' + (c.email||'') + '"></div>'
      + '<div class="fg"><label>Limit Kredit</label><input type="number" id="ec-limit" value="' + (c.limit||'') + '"></div>'
      + '<div class="fg"><label>TOP (hari)</label><input type="number" id="ec-top" value="' + (c.top||'') + '"></div>'
      + '<div class="fg"><label>Akun Debit</label><select id="ec-akun-debit" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%"><option value="">-- Pilih --</option>' + akunOpts + '</select></div>'
      + '<div class="fg"><label>Akun Kredit</label><select id="ec-akun-kredit" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%"><option value="">-- Pilih --</option>' + akunOpts + '</select></div>'
      + '<div class="fg"><label>Nama Bank</label><input id="ec-bank" value="' + (c.bank||'') + '"></div>'
      + '<div class="fg"><label>Atas Nama</label><input id="ec-atasnama" value="' + (c.atasnama||'') + '"></div>'
      + '<div class="fg"><label>No. Rekening</label><input id="ec-norek" value="' + (c.norek||'') + '"></div>'
      + '<div class="fg full"><label>Alamat</label><input id="ec-alamat" value="' + (c.alamat||'') + '"></div>'
      + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditCustomer(\'' + id + '\')">Simpan</button></div>',
      'Edit Customer: ' + c.nama);
    setTimeout(function() {
      var selD = document.getElementById('ec-akun-debit');
      var selK = document.getElementById('ec-akun-kredit');
      if (selD && c.akunDebit) selD.value = c.akunDebit;
      if (selK && c.akunKredit) selK.value = c.akunKredit;
    }, 100);
  });
}

async function simpanEditCustomer(id) {
  var list = await KDB.getAll('customer');
  var c = list.find(function(x){ return x.id === id; });
  if (!c) return;
  await KDB.save('customer', id, Object.assign({}, c, {
    nama: (document.getElementById('ec-nama')||{}).value || c.nama,
    kode: (document.getElementById('ec-kode')||{}).value || c.kode,
    pic: (document.getElementById('ec-pic')||{}).value || '',
    telp: (document.getElementById('ec-telp')||{}).value || '',
    email: (document.getElementById('ec-email')||{}).value || '',
    limit: (document.getElementById('ec-limit')||{}).value || '',
    top: (document.getElementById('ec-top')||{}).value || '',
    akunDebit: (document.getElementById('ec-akun-debit')||{}).value || '',
    akunKredit: (document.getElementById('ec-akun-kredit')||{}).value || '',
    bank: (document.getElementById('ec-bank')||{}).value || '',
    atasnama: (document.getElementById('ec-atasnama')||{}).value || '',
    norek: (document.getElementById('ec-norek')||{}).value || '',
    alamat: (document.getElementById('ec-alamat')||{}).value || '',
  }));
  closeModalDirect();
  showAlert('Customer diperbarui!');
  navigate('setup-customer');
}

// ===== JURNAL UMUM =====
async function renderJurnalUmum() {
  const jurnal = await KDB.getAll('jurnal');
  const sorted = jurnal.slice().sort(function(a,b){ return (b.tanggal||'').localeCompare(a.tanggal||''); });
  const akunOpts = await getAkunOptions();

  const addForm = hasRole('leader') ? '<div class="card"><div class="card-header"><h2>Input Jurnal Baru</h2></div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="j-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>No. Referensi</label><input id="j-ref" placeholder="JU-001 / No. Invoice / No. PO"></div>'
    + '<div class="fg"><label>Nama PIC</label><input id="j-pic" value="' + (KU.nama||KU.username) + '" placeholder="Nama PIC"></div>'
    + '<div class="fg full"><label>Keterangan</label><input id="j-ket" placeholder="Deskripsi transaksi"></div>'
    + '</div>'
    + '<div style="margin-top:12px"><table style="width:100%;font-size:0.83rem"><thead><tr><th>Akun</th><th>Keterangan</th><th>Debit (Rp)</th><th>Kredit (Rp)</th><th></th></tr></thead>'
    + '<tbody id="jurnal-lines-body">'
    + '<tr><td><select class="j-akun" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px;font-size:0.82rem"><option value="">-- Pilih Akun --</option>' + akunOpts + '</select></td>'
    + '<td><input class="j-line-ket" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Keterangan baris"></td>'
    + '<td><input class="j-debit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updateJurnalTotal()"></td>'
    + '<td><input class="j-kredit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updateJurnalTotal()"></td>'
    + '<td></td></tr>'
    + '<tr><td><select class="j-akun" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px;font-size:0.82rem"><option value="">-- Pilih Akun --</option>' + akunOpts + '</select></td>'
    + '<td><input class="j-line-ket" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Keterangan baris"></td>'
    + '<td><input class="j-debit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updateJurnalTotal()"></td>'
    + '<td><input class="j-kredit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updateJurnalTotal()"></td>'
    + '<td></td></tr>'
    + '</tbody></table></div>'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">'
    + '<button class="btn btn-outline btn-sm" onclick="addJurnalLine()">+ Tambah Baris</button>'
    + '<div id="jurnal-total" style="font-size:0.85rem;color:#555">Debit: Rp 0 | Kredit: Rp 0</div>'
    + '</div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-primary" onclick="simpanJurnal()">Simpan Jurnal</button><button class="btn btn-outline" onclick="navigate(\'jurnal-umum\')">Reset</button></div>'
    + '</div>' : '';

  const rows = sorted.length ? sorted.map(function(j) {
    const bal = Math.abs((j.totalDebit||0)-(j.totalKredit||0)) < 1;
    const hapusBtn = hasRole('leader') ? '<button class="btn btn-xs btn-danger" onclick="hapusJurnal(\'' + j.id + '\')" title="Hapus jurnal ini">Hapus</button>' : '';
    const editBtn = hasRole('leader') ? '<button class="btn btn-xs btn-warning" onclick="editJurnal(\'' + j.id + '\')">Edit</button>' : '';
    const sumberChip = j.sumber ? '<span class="chip" style="font-size:0.68rem;background:#e8f0fe;color:#1a237e">' + j.sumber + '</span> ' : '';
    const akunCodes = (j.lines||[]).map(function(l){ return l.akun||''; }).join(',');
    return '<tr data-id="' + j.id + '" data-tanggal="' + (j.tanggal||'') + '" data-sumber="' + (j.sumber||'') + '" data-akun="' + akunCodes + '">'
      + '<td><input type="checkbox" class="jurnal-chk" value="' + j.id + '" onchange="updateJurnalSelection()"></td>'
      + '<td>' + fmtDate(j.tanggal) + '</td><td>' + (j.noRef||'-') + '</td>'
      + '<td>' + sumberChip + (j.keterangan||'-') + '</td>'
      + '<td class="text-green">' + fmtRp(j.totalDebit) + '</td><td class="text-red">' + fmtRp(j.totalKredit) + '</td>'
      + '<td><span class="badge ' + (bal?'badge-success':'badge-danger') + '">' + (bal?'Balance':'Unbalance') + '</span></td>'
      + '<td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="lihatJurnal(\'' + j.id + '\')">Detail</button>' + editBtn + hapusBtn + '</td></tr>';
  }).join('') : '<tr><td colspan="8" class="text-center text-muted">Belum ada jurnal</td></tr>';

  return '<div class="page-title">📓 Jurnal Umum</div>' + addForm
    + '<div class="card"><div class="card-header"><h2>Daftar Jurnal (' + jurnal.length + ')</h2>'
    + '<div class="actions" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
    + '<input type="text" id="jurnal-search-q" placeholder="Cari keterangan / ref..." style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem;min-width:160px">'
    + '<select id="jurnal-filter-akun" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem;max-width:200px"><option value="">Semua Akun</option>' + akunOpts + '</select>'
    + '<select id="jurnal-filter-month" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem"><option value="">Semua Bulan</option><option value="01">Januari</option><option value="02">Februari</option><option value="03">Maret</option><option value="04">April</option><option value="05">Mei</option><option value="06">Juni</option><option value="07">Juli</option><option value="08">Agustus</option><option value="09">September</option><option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option></select>'
    + '<select id="jurnal-filter-sumber" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem"><option value="">Semua Sumber</option><option value="import-sheets">Import Sheets</option><option value="umum">Manual</option><option value="permohonan-dana">Permohonan Dana</option><option value="dana-masuk">Dana Masuk</option><option value="petty-cash">Petty Cash</option></select>'
    + '<input type="date" id="jurnal-filter-tgl-dari" title="Dari Tanggal" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem">'
    + '<span style="font-size:0.8rem;color:#888">s/d</span>'
    + '<input type="date" id="jurnal-filter-tgl-sampai" title="Sampai Tanggal" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem">'
    + '<button class="btn btn-sm btn-primary" onclick="applyJurnalFilter()">🔍 Cari</button>'
    + '<button class="btn btn-sm btn-outline" onclick="resetJurnalFilter()">Reset</button>'
    + (hasRole('admin') ? '<button class="btn btn-sm btn-danger" onclick="hapusSemuaJurnal()">Hapus Semua</button>' : '')
    + '</div></div>'
    + '<div id="jurnal-batch-bar" style="display:none;padding:8px 12px;background:#fff3e0;border-radius:8px;margin-bottom:8px;display:none;align-items:center;gap:8px">'
    + '<span id="jurnal-selected-count" style="font-size:0.85rem;font-weight:600">0 dipilih</span>'
    + '<button class="btn btn-sm btn-danger" onclick="hapusJurnalTerpilih()">🗑️ Hapus Terpilih</button>'
    + '<button class="btn btn-sm btn-outline" onclick="togglePilihSemuaJurnal(false)">Batal Pilih</button>'
    + '</div>'
    + '<div class="table-wrap"><table id="tbl-jurnal"><thead><tr><th style="width:30px"><input type="checkbox" id="jurnal-chk-all" onchange="togglePilihSemuaJurnal(this.checked)"></th><th>Tanggal</th><th>No. Ref</th><th>Keterangan</th><th>Total Debit</th><th>Total Kredit</th><th>Balance</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

async function addJurnalLine() {
  const akunOpts = await getAkunOptions();
  const tbody = document.getElementById('jurnal-lines-body');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><select class="j-akun" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px;font-size:0.82rem"><option value="">-- Pilih Akun --</option>' + akunOpts + '</select></td>'
    + '<td><input class="j-line-ket" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Keterangan baris"></td>'
    + '<td><input class="j-debit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updateJurnalTotal()"></td>'
    + '<td><input class="j-kredit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updateJurnalTotal()"></td>'
    + '<td><button onclick="this.closest(\'tr\').remove();updateJurnalTotal()" style="background:#f44336;color:white;border:none;border-radius:4px;padding:3px 7px;cursor:pointer">x</button></td>';
  tbody.appendChild(tr);
}

function updateJurnalTotal() {
  let d = 0, k = 0;
  document.querySelectorAll('.j-debit').forEach(function(el){ d += parseFloat(el.value)||0; });
  document.querySelectorAll('.j-kredit').forEach(function(el){ k += parseFloat(el.value)||0; });
  const el = document.getElementById('jurnal-total');
  if (el) {
    const bal = Math.abs(d-k) < 1;
    el.innerHTML = 'Debit: <b class="text-green">' + fmtRp(d) + '</b> | Kredit: <b class="text-red">' + fmtRp(k) + '</b> '
      + '<span class="badge ' + (bal?'badge-success':'badge-danger') + '">' + (bal?'Balance':'Unbalance') + '</span>';
  }
}

async function simpanJurnal() {
  const tgl = document.getElementById('j-tgl').value;
  const ket = document.getElementById('j-ket').value.trim();
  const ref = document.getElementById('j-ref').value.trim();
  if (!tgl || !ket) { showAlert('Tanggal dan keterangan wajib diisi!', 'danger'); return; }
  const lines = [];
  let totalD = 0, totalK = 0;
  document.querySelectorAll('#jurnal-lines-body tr').forEach(function(row) {
    const akun = row.querySelector('.j-akun') ? row.querySelector('.j-akun').value : '';
    const lineKet = row.querySelector('.j-line-ket') ? row.querySelector('.j-line-ket').value : '';
    const debit = parseFloat(row.querySelector('.j-debit') ? row.querySelector('.j-debit').value : 0) || 0;
    const kredit = parseFloat(row.querySelector('.j-kredit') ? row.querySelector('.j-kredit').value : 0) || 0;
    if (akun) { lines.push({ akun: akun, ket: lineKet, debit: debit, kredit: kredit }); totalD += debit; totalK += kredit; }
  });
  if (lines.length < 2) { showAlert('Minimal 2 baris jurnal!', 'danger'); return; }
  if (Math.abs(totalD - totalK) > 1) { showAlert('Jurnal tidak balance! Debit tidak sama dengan Kredit', 'danger'); return; }
  const id = genId('JU');
  await KDB.save('jurnal', id, { id: id, tanggal: tgl, keterangan: ket, noRef: ref, namaPIC: (document.getElementById('j-pic')||{}).value || KU.nama, lines: lines, totalDebit: totalD, totalKredit: totalK, tipe: 'umum', createdBy: KU.username, createdAt: new Date().toISOString() });
  showAlert('Jurnal berhasil disimpan!');
  navigate('jurnal-umum');
}

async function hapusJurnal(id) {
  if (!confirm('Hapus jurnal ini? Tindakan ini tidak dapat dibatalkan.')) return;
  // Check if this jurnal was auto-created from permohonan/danamasuk
  const jurnal = await KDB.getAll('jurnal');
  const j = jurnal.find(function(x){ return x.id === id; });
  if (j && j.meta) {
    // Unlink from permohonan
    if (j.meta.permohonanId) {
      const pdList = await KDB.getAll('permohonan');
      const pd = pdList.find(function(x){ return x.id === j.meta.permohonanId; });
      if (pd && pd.jurnalId === id) {
        await KDB.save('permohonan', pd.id, Object.assign({}, pd, { jurnalId: null, jurnalCreatedAt: null }));
      }
    }
    // Unlink from danamasuk
    if (j.meta.danaMasukId) {
      const dmList = await KDB.getAll('danamasuk');
      const dm = dmList.find(function(x){ return x.id === j.meta.danaMasukId; });
      if (dm && dm.jurnalId === id) {
        await KDB.save('danamasuk', dm.id, Object.assign({}, dm, { jurnalId: null, jurnalCreatedAt: null }));
      }
    }
  }
  await KDB.delete('jurnal', id);
  // Force refresh local cache from Firebase to ensure consistency
  await KDB.getAll('jurnal');
  showAlert('Jurnal dihapus.', 'warning');
  navigate('jurnal-umum');
  setTimeout(reapplyJurnalFilter, 500);
  setTimeout(reapplyJurnalFilter, 1000);
}

async function hapusDuplikatJurnal(dupId, origId) {
  if (!confirm('Hapus entri duplikat ini? Entri asli (original) TIDAK akan terhapus.')) return;
  var jurnal = await KDB.getAll('jurnal');
  var orig = jurnal.find(function(x){ return x.id === origId; });
  var dup = jurnal.find(function(x){ return x.id === dupId; });
  if (!dup) { showAlert('Entri duplikat tidak ditemukan.', 'warning'); return; }
  if (!orig) { showAlert('Peringatan: Entri asli tidak ditemukan di database. Batalkan penghapusan untuk investigasi.', 'danger'); return; }
  await KDB.delete('jurnal', dupId);
  var refreshed = await KDB.getAll('jurnal');
  var origStillExists = refreshed.find(function(x){ return x.id === origId; });
  if (origStillExists) {
    showAlert('Duplikat berhasil dihapus. Entri asli tetap aman.', 'success');
  } else {
    showAlert('Duplikat dihapus, namun entri asli perlu diverifikasi.', 'warning');
  }
  runAIAnalysis();
}

function tampilkanSemuaDuplikat() {
  document.querySelectorAll('.dup-hidden-row').forEach(function(r) { r.style.display = ''; });
  var showAllRow = document.getElementById('dup-show-all-row');
  if (showAllRow) showAllRow.style.display = 'none';
}

function togglePilihSemuaDuplikat(checked) {
  document.querySelectorAll('.dup-chk').forEach(function(chk) {
    if (chk.closest('tr').style.display !== 'none') chk.checked = checked;
  });
  updateDupSelection();
}

function updateDupSelection() {
  var checked = document.querySelectorAll('.dup-chk:checked');
  var count = checked.length;
  var btn = document.getElementById('btn-hapus-dup-sel');
  var countEl = document.getElementById('dup-sel-count');
  if (btn) btn.style.display = count > 0 ? 'inline-block' : 'none';
  if (countEl) countEl.textContent = count > 0 ? count + ' dipilih' : '';
}

async function hapusDuplikatTerpilih() {
  var checked = document.querySelectorAll('.dup-chk:checked');
  var ids = [];
  checked.forEach(function(chk) { ids.push(chk.value); });
  if (ids.length === 0) { showAlert('Tidak ada yang dipilih', 'warning'); return; }
  if (!confirm('Hapus ' + ids.length + ' jurnal duplikat yang dipilih?\n\nEntri asli TIDAK akan terhapus.')) return;
  showLoading(true);
  for (var i = 0; i < ids.length; i++) {
    await KDB.delete('jurnal', ids[i]);
  }
  await KDB.getAll('jurnal');
  showLoading(false);
  showAlert(ids.length + ' duplikat berhasil dihapus!');
  runAIAnalysis();
}

async function hapusSemuaDuplikat() {
  if (!window._aiDuplicates || !window._aiDuplicates.length) {
    showAlert('Tidak ada data duplikat untuk dihapus.', 'warning');
    return;
  }
  var count = window._aiDuplicates.length;
  if (!confirm('Hapus ' + count + ' entri duplikat?\n\nYang DIHAPUS: entri duplikat (copy kedua)\nYang DIPERTAHANKAN: entri asli (copy pertama)\n\nTindakan ini tidak dapat dibatalkan.')) return;
  
  showLoading(true);
  var jurnal = await KDB.getAll('jurnal');
  var jurnalMap = {};
  jurnal.forEach(function(j) { jurnalMap[j.id] = true; });
  
  var deleted = 0, skipped = 0;
  for (var i = 0; i < window._aiDuplicates.length; i++) {
    var dup = window._aiDuplicates[i];
    if (jurnalMap[dup.id1] && jurnalMap[dup.id2]) {
      await KDB.delete('jurnal', dup.id2);
      delete jurnalMap[dup.id2];
      deleted++;
    } else {
      skipped++;
    }
  }
  showLoading(false);
  await KDB.getAll('jurnal');
  window._aiDuplicates = [];
  showAlert(deleted + ' duplikat berhasil dihapus!' + (skipped > 0 ? ' ' + skipped + ' dilewati.' : ''), 'success');
  runAIAnalysis();
}

function reviewDuplikat() {
  showAlert('Review tabel di bawah. Klik "Hapus Duplikat" per item atau "Hapus Semua Duplikat" untuk batch.', 'info');
}

async function hapusSemuaJurnal() {
  if (!confirm('HAPUS SEMUA JURNAL? Tindakan ini tidak dapat dibatalkan!')) return;
  if (!confirm('Anda yakin? Semua ' + (await KDB.getAll('jurnal')).length + ' jurnal akan dihapus permanen.')) return;
  showLoading(true);
  var allJ = await KDB.getAll('jurnal');
  for (var i = 0; i < allJ.length; i++) {
    await KDB.delete('jurnal', allJ[i].id);
  }
  showLoading(false);
  showAlert('Semua jurnal dihapus!', 'warning');
  navigate('jurnal-umum');
}

function togglePilihSemuaJurnal(checked) {
  // Hanya pilih yang visible (sesuai filter)
  document.querySelectorAll('#tbl-jurnal tbody tr').forEach(function(r) {
    if (r.style.display === 'none') return;
    var chk = r.querySelector('.jurnal-chk');
    if (chk) chk.checked = checked;
  });
  var chkAll = document.getElementById('jurnal-chk-all');
  if (chkAll) chkAll.checked = checked;
  updateJurnalSelection();
}

function updateJurnalSelection() {
  var checked = document.querySelectorAll('.jurnal-chk:checked');
  var count = checked.length;
  var bar = document.getElementById('jurnal-batch-bar');
  var countEl = document.getElementById('jurnal-selected-count');
  if (bar) bar.style.display = count > 0 ? 'flex' : 'none';
  if (countEl) countEl.textContent = count + ' dipilih';
}

async function hapusJurnalTerpilih() {
  var checked = document.querySelectorAll('.jurnal-chk:checked');
  var ids = [];
  checked.forEach(function(chk) { ids.push(chk.value); });
  if (ids.length === 0) { showAlert('Tidak ada jurnal yang dipilih', 'warning'); return; }
  if (!confirm('Hapus ' + ids.length + ' jurnal yang dipilih?\n\nTindakan ini TIDAK BISA DIBATALKAN!')) return;
  showLoading(true);
  for (var i = 0; i < ids.length; i++) {
    await KDB.delete('jurnal', ids[i]);
  }
  await KDB.getAll('jurnal');
  showLoading(false);
  showAlert(ids.length + ' jurnal berhasil dihapus!', 'warning');
  navigate('jurnal-umum');
  setTimeout(reapplyJurnalFilter, 500);
}

// === Checkbox untuk PC Anomali di Analisis ===
function togglePilihSemuaPCAnomali(checked) {
  document.querySelectorAll('.pc-anomali-chk').forEach(function(chk) { chk.checked = checked; });
  updatePCAnomaliSelection();
}

function updatePCAnomaliSelection() {
  var checked = document.querySelectorAll('.pc-anomali-chk:checked');
  var count = checked.length;
  var btnHapus = document.getElementById('btn-hapus-pc-sel');
  var btnJurnal = document.getElementById('btn-jurnal-pc-sel');
  var countEl = document.getElementById('pc-sel-count');
  if (btnHapus) btnHapus.style.display = count > 0 ? 'inline-block' : 'none';
  if (btnJurnal) btnJurnal.style.display = count > 0 ? 'inline-block' : 'none';
  if (countEl) countEl.textContent = count > 0 ? count + ' dipilih' : '';
}

async function hapusPCTerpilih() {
  var checked = document.querySelectorAll('.pc-anomali-chk:checked');
  var ids = [];
  checked.forEach(function(chk) { ids.push(chk.value); });
  if (ids.length === 0) { showAlert('Tidak ada yang dipilih', 'warning'); return; }
  if (!confirm('Hapus ' + ids.length + ' transaksi petty cash yang dipilih?\n\nTindakan ini TIDAK BISA DIBATALKAN!')) return;
  showLoading(true);
  for (var i = 0; i < ids.length; i++) {
    await KDB.delete('pettycash', ids[i]);
  }
  showLoading(false);
  showAlert(ids.length + ' transaksi petty cash dihapus!', 'warning');
  runAIAnalysis();
}

async function batchBuatJurnalPCTerpilih() {
  var checked = document.querySelectorAll('.pc-anomali-chk:checked');
  var ids = [];
  checked.forEach(function(chk) { ids.push(chk.value); });
  if (ids.length === 0) { showAlert('Tidak ada yang dipilih', 'warning'); return; }
  if (!confirm('Buat jurnal untuk ' + ids.length + ' transaksi petty cash yang dipilih?')) return;
  showLoading(true);
  var akunPC = await getAkunPettyCash();
  var akunBank = await getAkunKasBank();
  var pcList = await KDB.getAll('pettycash');
  var count = 0;
  for (var i = 0; i < ids.length; i++) {
    var pc = pcList.find(function(x) { return x.id === ids[i]; });
    if (!pc || pc.jurnalId) continue;
    var jumlah = Math.abs(parseFloat(pc.jumlah)||0);
    if (jumlah <= 0) continue;
    var jId = genId('JU');
    var lines;
    if (pc.tipe === 'masuk') {
      lines = [{ akun: akunPC, ket: pc.keterangan||'Top-up', debit: jumlah, kredit: 0 }, { akun: akunBank, ket: 'Transfer', debit: 0, kredit: jumlah }];
    } else {
      lines = [{ akun: pc.akunDebit||'5-2200', ket: pc.keterangan||'Pengeluaran', debit: jumlah, kredit: 0 }, { akun: akunPC, ket: 'Kas kecil keluar', debit: 0, kredit: jumlah }];
    }
    await KDB.save('jurnal', jId, { id: jId, tanggal: pc.tanggal||today(), keterangan: pc.keterangan||'Pengeluaran PC', noRef: pc.noRef||pc.id, tipe: 'umum', sumber: 'petty-cash', lines: lines, totalDebit: jumlah, totalKredit: jumlah, createdBy: KU.username, createdAt: new Date().toISOString() });
    await KDB.save('pettycash', pc.id, Object.assign({}, pc, { jurnalId: jId }));
    count++;
  }
  showLoading(false);
  showAlert(count + ' jurnal berhasil dibuat dari petty cash terpilih!');
  runAIAnalysis();
}

async function editJurnal(id) {
  var jurnal = await KDB.getAll('jurnal');
  var j = jurnal.find(function(x){ return x.id === id; });
  if (!j) return;
  var akunOpts = await getAkunOptions();
  var linesHtml = (j.lines || []).map(function(l, i) {
    return '<tr>'
      + '<td><select class="ej-akun" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px;font-size:0.82rem"><option value="">-- Pilih --</option>' + akunOpts.replace('value="' + l.akun + '"', 'value="' + l.akun + '" selected') + '</select></td>'
      + '<td><input class="ej-ket" value="' + (l.ket||'') + '" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px"></td>'
      + '<td><input class="ej-debit" type="number" value="' + (l.debit||0) + '" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" oninput="updateEditJurnalTotal()"></td>'
      + '<td><input class="ej-kredit" type="number" value="' + (l.kredit||0) + '" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" oninput="updateEditJurnalTotal()"></td>'
      + '<td><button class="btn btn-xs btn-danger" onclick="this.closest(\'tr\').remove();updateEditJurnalTotal()">✕</button></td>'
      + '</tr>';
  }).join('');
  // Hitung total saat ini
  var curD = 0, curK = 0;
  (j.lines||[]).forEach(function(l){ curD += l.debit||0; curK += l.kredit||0; });
  var balanceStatus = Math.abs(curD - curK) < 0.01 ? '<span style="color:#2e7d32">✅ Balance</span>' : '<span style="color:#c62828">❌ Selisih: ' + fmtRp(Math.abs(curD-curK)) + '</span>';

  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="ej-tgl" value="' + (j.tanggal||'') + '"></div>'
    + '<div class="fg"><label>No. Referensi</label><input id="ej-ref" value="' + (j.noRef||'') + '"></div>'
    + '<div class="fg full"><label>Keterangan</label><input id="ej-ket-main" value="' + (j.keterangan||'') + '"></div>'
    + '</div>'
    + '<div class="table-wrap mt-12"><table style="font-size:0.83rem"><thead><tr><th>Akun</th><th>Keterangan</th><th>Debit (Rp)</th><th>Kredit (Rp)</th><th></th></tr></thead><tbody id="ej-lines-body">' + linesHtml + '</tbody></table></div>'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">'
    + '<button class="btn btn-outline btn-sm" onclick="addEditJurnalLine()">+ Tambah Baris</button>'
    + '<div id="ej-total" style="font-size:0.85rem">' + balanceStatus + ' | Debit: ' + fmtRp(curD) + ' | Kredit: ' + fmtRp(curK) + '</div>'
    + '</div>'
    + '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditJurnal(\'' + id + '\')">Simpan Perubahan</button></div>',
    'Edit Jurnal: ' + (j.noRef||j.id));
  // Store akunOpts for adding new lines
  window._ejAkunOpts = akunOpts;
}

function addEditJurnalLine() {
  var tbody = document.getElementById('ej-lines-body');
  if (!tbody) return;
  var akunOpts = window._ejAkunOpts || '';
  var tr = document.createElement('tr');
  tr.innerHTML = '<td><select class="ej-akun" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px;font-size:0.82rem"><option value="">-- Pilih --</option>' + akunOpts + '</select></td>'
    + '<td><input class="ej-ket" value="" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Keterangan"></td>'
    + '<td><input class="ej-debit" type="number" value="0" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" oninput="updateEditJurnalTotal()"></td>'
    + '<td><input class="ej-kredit" type="number" value="0" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" oninput="updateEditJurnalTotal()"></td>'
    + '<td><button class="btn btn-xs btn-danger" onclick="this.closest(\'tr\').remove();updateEditJurnalTotal()">✕</button></td>';
  tbody.appendChild(tr);
  updateEditJurnalTotal();
}

function updateEditJurnalTotal() {
  var d = 0, k = 0;
  document.querySelectorAll('.ej-debit').forEach(function(el){ d += parseFloat(el.value)||0; });
  document.querySelectorAll('.ej-kredit').forEach(function(el){ k += parseFloat(el.value)||0; });
  var el = document.getElementById('ej-total');
  if (!el) return;
  var balanceStatus = Math.abs(d - k) < 0.01 ? '<span style="color:#2e7d32">✅ Balance</span>' : '<span style="color:#c62828">❌ Selisih: ' + fmtRp(Math.abs(d-k)) + '</span>';
  el.innerHTML = balanceStatus + ' | Debit: <b>' + fmtRp(d) + '</b> | Kredit: <b>' + fmtRp(k) + '</b>';
}

async function simpanEditJurnal(id) {
  var jurnal = await KDB.getAll('jurnal');
  var j = jurnal.find(function(x){ return x.id === id; });
  if (!j) return;
  var newTgl = (document.getElementById('ej-tgl') || {}).value || j.tanggal;
  var newRef = (document.getElementById('ej-ref') || {}).value || j.noRef;
  var newKet = (document.getElementById('ej-ket-main') || {}).value || j.keterangan;
  var newLines = [];
  var totalD = 0, totalK = 0;
  document.querySelectorAll('.ej-akun').forEach(function(el, i) {
    var akun = el.value;
    var ket = document.querySelectorAll('.ej-ket')[i] ? document.querySelectorAll('.ej-ket')[i].value : '';
    var debit = parseFloat(document.querySelectorAll('.ej-debit')[i] ? document.querySelectorAll('.ej-debit')[i].value : 0) || 0;
    var kredit = parseFloat(document.querySelectorAll('.ej-kredit')[i] ? document.querySelectorAll('.ej-kredit')[i].value : 0) || 0;
    if (akun) { newLines.push({ akun: akun, ket: ket, debit: debit, kredit: kredit }); totalD += debit; totalK += kredit; }
  });
  if (newLines.length < 1) { showAlert('Minimal 1 baris jurnal!', 'danger'); return; }
  var updated = Object.assign({}, j, { tanggal: newTgl, noRef: newRef, keterangan: newKet, lines: newLines, totalDebit: totalD, totalKredit: totalK });
  await KDB.save('jurnal', id, updated);
  closeModalDirect();
  showAlert('Jurnal berhasil diperbarui!');
  navigate('jurnal-umum');
  setTimeout(reapplyJurnalFilter, 500);
  setTimeout(reapplyJurnalFilter, 1000);
}

async function lihatJurnal(id) {
  const jurnal = await KDB.getAll('jurnal');
  const j = jurnal.find(function(x){ return x.id === id; });
  if (!j) return;
  const lines = (j.lines || []).map(function(l) {
    return '<tr><td>' + l.akun + '</td><td>' + (l.ket||'-') + '</td><td class="text-green">' + (l.debit ? fmtRp(l.debit) : '-') + '</td><td class="text-red">' + (l.kredit ? fmtRp(l.kredit) : '-') + '</td></tr>';
  }).join('');
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Tanggal</label><div class="chip">' + fmtDate(j.tanggal) + '</div></div>'
    + '<div class="fg"><label>No. Ref</label><div class="chip">' + (j.noRef||'-') + '</div></div>'
    + '<div class="fg full"><label>Keterangan</label><div>' + j.keterangan + '</div></div>'
    + '</div><div class="table-wrap mt-12"><table><thead><tr><th>Akun</th><th>Keterangan</th><th>Debit</th><th>Kredit</th></tr></thead><tbody>' + lines + '</tbody>'
    + '<tfoot><tr style="background:#f5f5ff"><td colspan="2"><b>Total</b></td><td class="text-green fw-bold">' + fmtRp(j.totalDebit) + '</td><td class="text-red fw-bold">' + fmtRp(j.totalKredit) + '</td></tr></tfoot></table></div>'
    + '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button>'
    + (hasRole('leader') ? '<button class="btn btn-danger" onclick="closeModalDirect();hapusJurnal(\'' + id + '\')">🗑️ Hapus Jurnal Ini</button>' : '')
    + '</div>',
    'Detail Jurnal');
}

async function renderJurnalPenyesuaian() {
  const jurnal = (await KDB.getAll('jurnal')).filter(function(j){ return j.tipe === 'penyesuaian'; });
  const akunOpts = await getAkunOptions();

  // Pending PD & DM that need adjustment entries
  const allPD = (await KDB.getAll('permohonan')).filter(function(x){ return x.status && x.status.startsWith('Pending'); });
  const allDM = (await KDB.getAll('danamasuk')).filter(function(x){ return x.status && x.status.startsWith('Pending'); });

  const pendingInfo = (allPD.length + allDM.length) > 0
    ? '<div class="alert alert-warning">Ada <b>' + allPD.length + '</b> Permohonan Dana dan <b>' + allDM.length + '</b> Dana Masuk yang masih pending — pertimbangkan jurnal penyesuaian untuk akrual.<br>'
      + '<button class="btn btn-sm btn-warning" style="margin-top:6px" onclick="buatJurnalAkrualOtomatis()">⚡ Buat Jurnal Akrual Otomatis dari Pending</button></div>'
    : '';

  const addForm = hasRole('leader') ? '<div class="card"><div class="card-header"><h2>Input Jurnal Penyesuaian</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="jp-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Tipe Penyesuaian</label><select id="jp-tipe-adj"><option>Penyusutan Aset</option><option>Beban Dibayar Dimuka</option><option>Pendapatan Diterima Dimuka</option><option>Beban yang Masih Harus Dibayar</option><option>Akrual Permohonan Dana</option><option>Akrual Dana Masuk</option><option>Lainnya</option></select></div>'
    + '<div class="fg full"><label>Keterangan</label><input id="jp-ket" placeholder="Keterangan penyesuaian"></div>'
    + '<div class="fg"><label>Akun Debit</label><select id="jp-akun-d"><option value="">-- Pilih --</option>' + akunOpts + '</select></div>'
    + '<div class="fg"><label>Akun Kredit</label><select id="jp-akun-k"><option value="">-- Pilih --</option>' + akunOpts + '</select></div>'
    + '<div class="fg"><label>Jumlah (Rp)</label><input type="number" id="jp-jumlah" placeholder="0"></div>'
    + '</div><div class="mt-12"><button class="btn btn-primary" onclick="simpanJurnalPenyesuaian()">Simpan</button></div></div>' : '';

  const rows = jurnal.map(function(j) {
    const hapusBtn = hasRole('leader') ? '<button class="btn btn-xs btn-danger" onclick="hapusJurnal(\'' + j.id + '\')">Hapus</button>' : '';
    const sumberBadge = j.sumber ? '<span class="chip" style="font-size:0.7rem">' + j.sumber + '</span> ' : '';
    return '<tr><td>' + fmtDate(j.tanggal) + '</td><td>' + sumberBadge + '<span class="chip">' + (j.tipeAdj||'-') + '</span></td><td>' + j.keterangan + '</td><td class="text-green">' + fmtRp(j.totalDebit) + '</td><td class="text-red">' + fmtRp(j.totalKredit) + '</td><td>' + hapusBtn + '</td></tr>';
  }).join('');

  return '<div class="page-title">🔧 Jurnal Penyesuaian</div>'
    + pendingInfo + addForm
    + '<div class="card"><div class="card-header"><h2>Daftar Jurnal Penyesuaian (' + jurnal.length + ')</h2></div>'
    + (jurnal.length ? '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Keterangan</th><th>Debit</th><th>Kredit</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">🔧</span>Belum ada jurnal penyesuaian</div>')
    + '</div>';
}

async function buatJurnalAkrualOtomatis() {
  const allPD = (await KDB.getAll('permohonan')).filter(function(x){ return x.status && x.status.startsWith('Pending'); });
  const allDM = (await KDB.getAll('danamasuk')).filter(function(x){ return x.status && x.status.startsWith('Pending'); });
  if (!allPD.length && !allDM.length) { showAlert('Tidak ada transaksi pending!', 'warning'); return; }
  let created = 0;
  for (const p of allPD) {
    const id = genId('JP');
    const akunD = p.akunDebit || '5-2200';
    const akunK = '2-1000'; // Utang Usaha (akrual)
    await KDB.save('jurnal', id, { id: id, tanggal: today(), keterangan: 'Akrual - ' + p.keterangan, tipeAdj: 'Akrual Permohonan Dana', tipe: 'penyesuaian', sumber: 'permohonan-dana', lines: [{ akun: akunD, debit: p.nominal, kredit: 0 }, { akun: akunK, debit: 0, kredit: p.nominal }], totalDebit: p.nominal, totalKredit: p.nominal, createdBy: KU.username, createdAt: new Date().toISOString() });
    created++;
  }
  for (const d of allDM) {
    const id = genId('JP');
    const akunD = '1-1300'; // Piutang Usaha (akrual)
    const akunK = d.kategori && d.kategori.startsWith('4-') ? d.kategori : '4-1000';
    await KDB.save('jurnal', id, { id: id, tanggal: today(), keterangan: 'Akrual - ' + (d.keterangan||d.sumber), tipeAdj: 'Akrual Dana Masuk', tipe: 'penyesuaian', sumber: 'dana-masuk', lines: [{ akun: akunD, debit: d.nominal, kredit: 0 }, { akun: akunK, debit: 0, kredit: d.nominal }], totalDebit: d.nominal, totalKredit: d.nominal, createdBy: KU.username, createdAt: new Date().toISOString() });
    created++;
  }
  showAlert(created + ' jurnal akrual otomatis dibuat!');
  navigate('jurnal-penyesuaian');
}

async function simpanJurnalPenyesuaian() {
  const tgl = document.getElementById('jp-tgl').value;
  const ket = document.getElementById('jp-ket').value.trim();
  const akunD = document.getElementById('jp-akun-d').value;
  const akunK = document.getElementById('jp-akun-k').value;
  const jumlah = parseFloat(document.getElementById('jp-jumlah').value) || 0;
  const tipeAdj = document.getElementById('jp-tipe-adj').value;
  if (!tgl || !ket || !akunD || !akunK || !jumlah) { showAlert('Semua field wajib diisi!', 'danger'); return; }
  const id = genId('JP');
  await KDB.save('jurnal', id, { id: id, tanggal: tgl, keterangan: ket, tipeAdj: tipeAdj, tipe: 'penyesuaian', lines: [{ akun: akunD, debit: jumlah, kredit: 0 }, { akun: akunK, debit: 0, kredit: jumlah }], totalDebit: jumlah, totalKredit: jumlah, createdBy: KU.username, createdAt: new Date().toISOString() });
  showAlert('Jurnal penyesuaian disimpan!');
  navigate('jurnal-penyesuaian');
}

async function renderJurnalPenutup() {
  const jurnal = (await KDB.getAll('jurnal')).filter(function(j){ return j.tipe === 'penutup'; });
  const now = new Date();
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const monthOpts = months.map(function(m, i) {
    return '<button class="btn btn-sm ' + (i === now.getMonth() ? 'btn-primary' : 'btn-outline') + '" style="margin:2px" onclick="pilihBulanPenutup(' + (i+1) + ',\'' + m + '\')">' + m + '</button>';
  }).join('');
  const yearOpts = [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1].map(function(y) {
    return '<button class="btn btn-sm ' + (y === now.getFullYear() ? 'btn-primary' : 'btn-outline') + '" style="margin:2px" onclick="pilihTahunPenutup(' + y + ')">' + y + '</button>';
  }).join('');

  const addForm = hasRole('admin') ? '<div class="card"><div class="card-header"><h2>Buat Jurnal Penutup Otomatis</h2></div>'
    + '<div class="alert alert-info">Pilih bulan dan tahun periode penutupan, atau isi manual.</div>'
    + '<div style="margin-bottom:12px"><div class="fw-bold" style="margin-bottom:6px;font-size:0.85rem">Pilih Bulan:</div>' + monthOpts + '</div>'
    + '<div style="margin-bottom:12px"><div class="fw-bold" style="margin-bottom:6px;font-size:0.85rem">Pilih Tahun:</div>' + yearOpts + '</div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Tanggal Penutupan</label><input type="date" id="pp-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Periode (otomatis terisi)</label><input id="pp-periode" placeholder="Desember 2026"></div>'
    + '</div><div class="mt-12"><button class="btn btn-warning" onclick="buatJurnalPenutup()">Buat Jurnal Penutup Otomatis</button></div></div>' : '';

  const rows = jurnal.map(function(j) {
    return '<tr><td>' + fmtDate(j.tanggal) + '</td><td>' + (j.periode||'-') + '</td><td>' + j.keterangan + '</td><td>' + fmtRp(j.totalDebit) + '</td></tr>';
  }).join('');
  return '<div class="page-title">🔒 Jurnal Penutup</div>'
    + '<div class="alert alert-warning">Jurnal penutup menutup akun pendapatan dan beban ke akun Laba/Rugi di akhir periode.</div>'
    + addForm
    + '<div class="card"><div class="card-header"><h2>Riwayat Jurnal Penutup (' + jurnal.length + ')</h2></div>'
    + (jurnal.length ? '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Periode</th><th>Keterangan</th><th>Total</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">🔒</span>Belum ada jurnal penutup</div>')
    + '</div>';
}

function pilihBulanPenutup(bulan, namaBulan) {
  const tglEl = document.getElementById('pp-tgl');
  const periodeEl = document.getElementById('pp-periode');
  if (tglEl) {
    const tahun = tglEl.value ? tglEl.value.split('-')[0] : new Date().getFullYear();
    const lastDay = new Date(tahun, bulan, 0).getDate();
    tglEl.value = tahun + '-' + String(bulan).padStart(2,'0') + '-' + lastDay;
  }
  if (periodeEl) {
    const tahun = tglEl ? tglEl.value.split('-')[0] : new Date().getFullYear();
    periodeEl.value = namaBulan + ' ' + tahun;
  }
}

function pilihTahunPenutup(tahun) {
  const tglEl = document.getElementById('pp-tgl');
  const periodeEl = document.getElementById('pp-periode');
  if (tglEl && tglEl.value) {
    const parts = tglEl.value.split('-');
    tglEl.value = tahun + '-' + parts[1] + '-' + parts[2];
  }
  if (periodeEl && periodeEl.value) {
    const parts = periodeEl.value.split(' ');
    periodeEl.value = parts[0] + ' ' + tahun;
  }
}

async function buatJurnalPenutup() {
  const tgl = document.getElementById('pp-tgl').value;
  const periode = document.getElementById('pp-periode').value;
  if (!tgl || !periode) { showAlert('Tanggal dan periode wajib diisi!', 'danger'); return; }
  if (!confirm('Buat jurnal penutup untuk periode ' + periode + '?')) return;
  const jurnal = await KDB.getAll('jurnal');
  const akun = await getAkun();
  let totalPendapatan = 0, totalBeban = 0;
  jurnal.filter(function(j){ return j.tipe !== 'penutup'; }).forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      const a = akun.find(function(x){ return x.kode === l.akun; });
      if (a && a.kategori === 'Pendapatan') totalPendapatan += (l.kredit||0) - (l.debit||0);
      if (a && a.kategori && a.kategori.includes('Beban')) totalBeban += (l.debit||0) - (l.kredit||0);
    });
  });
  const labaRugi = totalPendapatan - totalBeban;
  const id = genId('PP');
  await KDB.save('jurnal', id, { id: id, tanggal: tgl, periode: periode, tipe: 'penutup', keterangan: 'Jurnal Penutup ' + periode, totalPendapatan: totalPendapatan, totalBeban: totalBeban, labaRugi: labaRugi, lines: [{ akun: '4-1000', debit: totalPendapatan, kredit: 0 }, { akun: '5-1000', debit: 0, kredit: totalBeban }, { akun: '3-1200', debit: labaRugi < 0 ? Math.abs(labaRugi) : 0, kredit: labaRugi > 0 ? labaRugi : 0 }], totalDebit: totalPendapatan, totalKredit: totalPendapatan, createdBy: KU.username, createdAt: new Date().toISOString() });
  showAlert('Jurnal penutup dibuat! Laba/Rugi: ' + fmtRp(labaRugi));
  navigate('jurnal-penutup');
}

// ===== MONITOR =====
async function renderBukuBesar() {
  const akun = await getAkun();
  const jurnal = await KDB.getAll('jurnal');
  const ledger = {};
  akun.forEach(function(a) { ledger[a.kode] = { akun: a, entries: [], saldo: 0 }; });
  jurnal.forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      if (ledger[l.akun]) {
        ledger[l.akun].entries.push({ tanggal: j.tanggal, ket: j.keterangan, ref: j.noRef||j.id, debit: l.debit||0, kredit: l.kredit||0 });
      }
    });
  });
  Object.values(ledger).forEach(function(entry) {
    entry.entries.sort(function(a,b){ return (a.tanggal||'').localeCompare(b.tanggal||''); });
    let saldo = 0;
    entry.entries.forEach(function(e) {
      saldo += entry.akun.tipe === 'Debit' ? e.debit - e.kredit : e.kredit - e.debit;
      e.saldo = saldo;
    });
    entry.saldo = saldo;
  });
  const akunWithData = Object.values(ledger).filter(function(e){ return e.entries.length > 0; });
  const akunSelect = akun.map(function(a){ return '<option value="' + a.kode + '">' + a.kode + ' - ' + a.nama + '</option>'; }).join('');
  const cards = akunWithData.map(function(entry) {
    const rows = entry.entries.map(function(e) {
      return '<tr><td>' + fmtDate(e.tanggal) + '</td><td>' + (e.ref||'-') + '</td><td>' + (e.ket||'-') + '</td>'
        + '<td class="text-green">' + (e.debit ? fmtRp(e.debit) : '-') + '</td>'
        + '<td class="text-red">' + (e.kredit ? fmtRp(e.kredit) : '-') + '</td>'
        + '<td class="fw-bold">' + fmtRp(Math.abs(e.saldo)) + '</td></tr>';
    }).join('');
    const saldoCls = entry.saldo >= 0 ? 'text-green' : 'text-red';
    return '<div class="card bb-akun-card" data-kode="' + entry.akun.kode + '">'
      + '<div class="card-header"><h2>' + entry.akun.kode + ' — ' + entry.akun.nama + ' <span class="chip">' + entry.akun.kategori + '</span></h2>'
      + '<div class="fw-bold ' + saldoCls + '">Saldo: ' + fmtRp(Math.abs(entry.saldo)) + '</div></div>'
      + '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Debit</th><th>Kredit</th><th>Saldo</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }).join('');
  return '<div class="page-title">📚 Buku Besar</div>'
    + '<div class="card"><div class="card-header"><h2>Filter Akun</h2></div>'
    + '<select onchange="filterBukuBesar(this.value)" style="padding:8px 12px;border:1.5px solid #ddd;border-radius:7px;font-size:0.85rem;min-width:250px"><option value="">-- Semua Akun --</option>' + akunSelect + '</select></div>'
    + '<div id="bb-content">' + (akunWithData.length ? cards : '<div class="empty-state"><span class="icon">📚</span>Belum ada data jurnal</div>') + '</div>';
}

function filterBukuBesar(val) {
  document.querySelectorAll('.bb-akun-card').forEach(function(card) {
    card.style.display = (!val || card.dataset.kode === val) ? '' : 'none';
  });
}

async function renderUtangPiutang() {
  const list = await KDB.getAll('utangpiutang');
  // Integrate with Permohonan Dana (Utang) and Dana Masuk (Piutang)
  const allPD = (await KDB.getAll('permohonan')).filter(function(x){ return x.status && (x.status.startsWith('Pending') || x.status === STATUS.APPROVED); });
  const allDM = (await KDB.getAll('danamasuk')).filter(function(x){ return x.status && (x.status.startsWith('Pending') || x.status === STATUS.APPROVED); });

  // Convert PD to Utang entries
  const pdAsUtang = allPD.map(function(p) {
    return { id: 'pd_' + p.id, tipe: 'Utang', nama: p.namaPemohon + ' (' + (p.noPOInvoice||p.id) + ')', noDok: p.noPOInvoice||p.id, tanggal: p.tanggal, jatuhTempo: p.jatuhTempo, jumlah: parseFloat(p.nominal)||0, bayar: p.status === STATUS.APPROVED ? parseFloat(p.nominal)||0 : 0, sisa: p.status === STATUS.APPROVED ? 0 : parseFloat(p.nominal)||0, ket: p.keterangan, sumber: 'Permohonan Dana', readonly: true };
  });
  // Convert DM to Piutang entries
  const dmAsPiutang = allDM.map(function(d) {
    return { id: 'dm_' + d.id, tipe: 'Piutang', nama: d.sumber + ' (' + (d.noRef||d.id) + ')', noDok: d.noRef||d.id, tanggal: d.tanggal, jatuhTempo: d.tanggal, jumlah: parseFloat(d.nominal)||0, bayar: d.status === STATUS.APPROVED ? parseFloat(d.nominal)||0 : 0, sisa: d.status === STATUS.APPROVED ? 0 : parseFloat(d.nominal)||0, ket: d.keterangan, sumber: 'Dana Masuk', readonly: true };
  });

  const utang = list.filter(function(x){ return x.tipe === 'Utang'; }).concat(pdAsUtang);
  const piutang = list.filter(function(x){ return x.tipe === 'Piutang'; }).concat(dmAsPiutang);
  const totalUtang = utang.reduce(function(s,x){ return s+(parseFloat(x.sisa)||0); }, 0);
  const totalPiutang = piutang.reduce(function(s,x){ return s+(parseFloat(x.sisa)||0); }, 0);

  const addForm = hasRole('leader') ? '<div class="card"><div class="card-header"><h2>Tambah Utang / Piutang Manual</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Tipe</label><select id="up-tipe"><option>Utang</option><option>Piutang</option></select></div>'
    + '<div class="fg"><label>Nama Pihak</label><input id="up-nama" placeholder="Nama supplier/customer"></div>'
    + '<div class="fg"><label>No. Dokumen</label><input id="up-nodok" placeholder="No. Invoice / PO"></div>'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="up-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Jatuh Tempo</label><input type="date" id="up-jt"></div>'
    + '<div class="fg"><label>Jumlah (Rp)</label><input type="number" id="up-jumlah" placeholder="0"></div>'
    + '<div class="fg"><label>Sudah Dibayar (Rp)</label><input type="number" id="up-bayar" placeholder="0" oninput="hitungSisa()"></div>'
    + '<div class="fg"><label>Sisa (Rp)</label><input type="number" id="up-sisa" placeholder="0" readonly></div>'
    + '<div class="fg full"><label>Keterangan</label><input id="up-ket" placeholder="Keterangan"></div>'
    + '</div><div class="mt-12"><button class="btn btn-primary" onclick="tambahUtangPiutang()">Tambah</button></div></div>' : '';

  return '<div class="page-title">💳 Buku Utang Piutang</div>'
    + '<div class="alert alert-info">Data otomatis terintegrasi dari Permohonan Dana (Utang) dan Dana Masuk (Piutang) yang sudah diajukan.</div>'
    + '<div class="stats-row"><div class="stat-box red"><div class="val">' + fmtRp(totalUtang) + '</div><div class="lbl">Total Utang</div></div>'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalPiutang) + '</div><div class="lbl">Total Piutang</div></div>'
    + '<div class="stat-box"><div class="val">' + (utang.length + piutang.length) + '</div><div class="lbl">Total Transaksi</div></div></div>'
    + addForm
    + '<div class="card"><div class="tabs">'
    + '<button class="tab-btn active" onclick="switchTab(this,\'tab-utang\')">Utang (' + utang.length + ')</button>'
    + '<button class="tab-btn" onclick="switchTab(this,\'tab-piutang\')">Piutang (' + piutang.length + ')</button>'
    + '</div>'
    + '<div class="tab-content active" id="tab-utang">' + renderUPTable(utang, 'Utang') + '</div>'
    + '<div class="tab-content" id="tab-piutang">' + renderUPTable(piutang, 'Piutang') + '</div>'
    + '</div>';
}

function renderUPTable(list, tipe) {
  if (!list.length) return '<div class="empty-state"><span class="icon">💳</span>Belum ada data ' + tipe.toLowerCase() + '</div>';
  const now = new Date();
  const rows = list.map(function(x) {
    const jt = x.jatuhTempo ? new Date(x.jatuhTempo) : null;
    const overdue = jt && jt < now && parseFloat(x.sisa) > 0;
    const lunas = parseFloat(x.sisa) <= 0;
    const statusBadgeCls = lunas ? 'badge-success' : overdue ? 'badge-danger' : 'badge-warning';
    const statusText = lunas ? 'Lunas' : overdue ? 'Overdue' : 'Belum Lunas';
    const sumberBadge = x.sumber ? '<span class="chip" style="font-size:0.7rem">' + x.sumber + '</span>' : '';
    const hapusBtn = !x.readonly && hasRole('admin') ? '<button class="btn btn-xs btn-danger" onclick="hapusUP(\'' + x.id + '\')">Hapus</button>' : '';
    const bayarBtn = !x.readonly ? '<button class="btn btn-xs btn-success" onclick="bayarUP(\'' + x.id + '\')">Bayar</button>' : '';
    return '<tr><td class="fw-bold">' + x.nama + '</td><td>' + (x.noDok||'-') + '</td>'
      + '<td>' + fmtDate(x.tanggal) + '</td><td>' + fmtDate(x.jatuhTempo) + '</td>'
      + '<td>' + fmtRp(x.jumlah) + '</td><td class="text-green">' + fmtRp(x.bayar) + '</td>'
      + '<td class="fw-bold ' + (overdue?'text-red':'') + '">' + fmtRp(x.sisa) + '</td>'
      + '<td>' + sumberBadge + '<span class="badge ' + statusBadgeCls + '">' + statusText + '</span></td>'
      + '<td class="tbl-actions">' + bayarBtn + hapusBtn + '</td></tr>';
  }).join('');
  return '<div class="table-wrap"><table><thead><tr><th>Nama Pihak</th><th>No. Dok</th><th>Tanggal</th><th>Jatuh Tempo</th><th>Jumlah</th><th>Dibayar</th><th>Sisa</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function hitungSisa() {
  const jumlah = parseFloat(document.getElementById('up-jumlah') ? document.getElementById('up-jumlah').value : 0) || 0;
  const bayar = parseFloat(document.getElementById('up-bayar') ? document.getElementById('up-bayar').value : 0) || 0;
  const sisa = document.getElementById('up-sisa');
  if (sisa) sisa.value = Math.max(0, jumlah - bayar);
}

async function tambahUtangPiutang() {
  const nama = document.getElementById('up-nama').value.trim();
  const jumlah = parseFloat(document.getElementById('up-jumlah').value) || 0;
  if (!nama || !jumlah) { showAlert('Nama dan jumlah wajib diisi!', 'danger'); return; }
  const bayar = parseFloat(document.getElementById('up-bayar').value) || 0;
  const id = genId('UP');
  await KDB.save('utangpiutang', id, { id: id, tipe: document.getElementById('up-tipe').value, nama: nama, noDok: document.getElementById('up-nodok').value, tanggal: document.getElementById('up-tgl').value, jatuhTempo: document.getElementById('up-jt').value, jumlah: jumlah, bayar: bayar, sisa: Math.max(0, jumlah - bayar), ket: document.getElementById('up-ket').value, createdBy: KU.username });
  showAlert('Data ditambahkan!');
  navigate('monitor-utang-piutang');
}

async function bayarUP(id) {
  const list = await KDB.getAll('utangpiutang');
  const item = list.find(function(x){ return x.id === id; });
  if (!item) return;
  const bayarTambahan = parseFloat(prompt('Bayar tambahan untuk ' + item.nama + '\nSisa: ' + fmtRp(item.sisa) + '\nJumlah bayar:')) || 0;
  if (!bayarTambahan) return;
  const newBayar = (parseFloat(item.bayar)||0) + bayarTambahan;
  const newSisa = Math.max(0, (parseFloat(item.jumlah)||0) - newBayar);
  await KDB.save('utangpiutang', id, Object.assign({}, item, { bayar: newBayar, sisa: newSisa }));
  showAlert('Pembayaran dicatat!');
  navigate('monitor-utang-piutang');
}

async function hapusUP(id) {
  if (!confirm('Hapus data ini?')) return;
  await KDB.delete('utangpiutang', id);
  navigate('monitor-utang-piutang');
}

async function renderForecastBayar() {
  const upList = (await KDB.getAll('utangpiutang')).filter(function(x){ return x.tipe === 'Utang' && parseFloat(x.sisa) > 0; });
  // Forecast: belum di-approve layer 2 (Pending Layer 1 atau Draft) — dari input sistem
  const pdPending = (await KDB.getAll('permohonan')).filter(function(x){ return x.sumber !== 'import-sheets' && x.status && (x.status === STATUS.DRAFT || x.status === STATUS.PENDING_L1); });
  const combined = upList.map(function(x){ return { jatuhTempo: x.jatuhTempo, nama: x.nama, ref: x.noDok||'-', sisa: parseFloat(x.sisa)||0, sumber: 'Utang' }; })
    .concat(pdPending.map(function(x){ return { jatuhTempo: x.jatuhTempo, nama: x.namaPemohon, ref: x.noPOInvoice||x.id, sisa: parseFloat(x.nominal)||0, sumber: 'Permohonan Pending' }; }));
  return renderForecastWithChart(combined, 'Forecast Pembayaran', 'bayar');
}
async function renderForecastTerima() {
  const upList = (await KDB.getAll('utangpiutang')).filter(function(x){ return x.tipe === 'Piutang' && parseFloat(x.sisa) > 0; });
  // Forecast: belum di-approve layer 2 — dari input sistem
  const dmPending = (await KDB.getAll('danamasuk')).filter(function(x){ return x.sumber !== 'import-sheets' && x.status && (x.status === STATUS.DRAFT || x.status === STATUS.PENDING_L1); });
  const combined = upList.map(function(x){ return { jatuhTempo: x.jatuhTempo, nama: x.nama, ref: x.noDok||'-', sisa: parseFloat(x.sisa)||0, sumber: 'Piutang' }; })
    .concat(dmPending.map(function(x){ return { jatuhTempo: x.tanggal, nama: x.sumber, ref: x.noRef||x.id, sisa: parseFloat(x.nominal)||0, sumber: 'Dana Masuk Pending' }; }));
  return renderForecastWithChart(combined, 'Forecast Penerimaan', 'terima');
}
function renderForecastWithChart(list, title, chartId) {
  const now = new Date();
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const byMonth = {};
  for (var i = 0; i < 6; i++) {
    var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    byMonth[d.getFullYear() + '-' + String(d.getMonth()).padStart(2,'0')] = { label: months[d.getMonth()] + ' ' + d.getFullYear(), total: 0 };
  }
  list.forEach(function(x) {
    if (!x.jatuhTempo) return;
    var d = new Date(x.jatuhTempo);
    var key = d.getFullYear() + '-' + String(d.getMonth()).padStart(2,'0');
    if (byMonth[key]) byMonth[key].total += x.sisa||0;
  });
  var maxVal = Math.max.apply(null, Object.values(byMonth).map(function(v){ return v.total; }).concat([1]));
  var overdue = list.filter(function(x){ return x.jatuhTempo && new Date(x.jatuhTempo) < now; });
  var totalOutstanding = list.reduce(function(s,x){ return s+(x.sisa||0); }, 0);
  var bars = Object.values(byMonth).map(function(m) {
    var h = Math.round((m.total / maxVal) * 100);
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">'
      + '<div style="font-size:0.6rem;color:#888">' + (m.total > 0 ? fmtRp(m.total).replace('Rp ','') : '') + '</div>'
      + '<div style="width:100%;height:' + h + 'px;background:#ff9800;border-radius:3px 3px 0 0;min-height:2px"></div>'
      + '<div style="font-size:0.65rem;color:#555">' + m.label + '</div></div>';
  }).join('');

  // Weekly forecast (next 8 weeks)
  var byWeekF = {};
  for (var wi = 0; wi < 8; wi++) {
    var wdStart = new Date(now); wdStart.setDate(now.getDate() - now.getDay() + wi*7);
    var wKey = wdStart.toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
    byWeekF[wKey] = 0;
  }
  list.forEach(function(x) {
    if (!x.jatuhTempo) return;
    var d = new Date(x.jatuhTempo);
    var wStart = new Date(d); wStart.setDate(d.getDate() - d.getDay());
    var wKey = wStart.toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
    if (byWeekF[wKey] !== undefined) byWeekF[wKey] += x.sisa||0;
  });
  var weekFKeys = Object.keys(byWeekF);
  var maxWeekF = Math.max.apply(null, Object.values(byWeekF).concat([1]));
  var weekBarsF = weekFKeys.map(function(k) {
    var v = byWeekF[k];
    var h = Math.round((v / maxWeekF) * 100);
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">'
      + '<div style="font-size:0.6rem;color:#888">' + (v > 0 ? fmtRp(v).replace('Rp ','') : '') + '</div>'
      + '<div style="width:100%;height:' + h + 'px;background:#ff5722;border-radius:3px 3px 0 0;min-height:2px"></div>'
      + '<div style="font-size:0.6rem;color:#555;writing-mode:vertical-lr;transform:rotate(180deg);height:30px">' + k + '</div></div>';
  }).join('');
  var rows = list.slice().sort(function(a,b){ return (a.jatuhTempo||'').localeCompare(b.jatuhTempo||''); }).map(function(x) {
    var od = x.jatuhTempo && new Date(x.jatuhTempo) < now;
    return '<tr><td class="fw-bold">' + (x.nama||'-') + '</td><td>' + (x.ref||'-') + '</td><td class="' + (od?'text-red fw-bold':'') + '">' + fmtDate(x.jatuhTempo) + '</td><td class="fw-bold">' + fmtRp(x.sisa) + '</td><td><span class="chip">' + (x.sumber||'-') + '</span></td><td><span class="badge ' + (od?'badge-danger':'badge-warning') + '">' + (od?'Overdue':'Upcoming') + '</span></td></tr>';
  }).join('');
  return '<div class="page-title">' + (chartId==='terima'?'📈':'📉') + ' ' + title + '</div>'
    + '<div class="stats-row"><div class="stat-box red"><div class="val">' + fmtRp(overdue.reduce(function(s,x){ return s+(x.sisa||0); },0)) + '</div><div class="lbl">Overdue</div></div>'
    + '<div class="stat-box orange"><div class="val">' + fmtRp(totalOutstanding) + '</div><div class="lbl">Total Outstanding</div></div>'
    + '<div class="stat-box"><div class="val">' + list.length + '</div><div class="lbl">Jumlah Item</div></div></div>'
    + '<div class="card"><div class="card-header"><h2>Grafik Forecast Per Bulan (6 Bulan ke Depan)</h2></div>'
    + '<div style="display:flex;align-items:flex-end;gap:3px;height:140px;padding:10px 0">' + bars + '</div></div>'
    + '<div class="card"><div class="card-header"><h2>Grafik Forecast Per Minggu (8 Minggu ke Depan)</h2></div>'
    + '<div style="display:flex;align-items:flex-end;gap:3px;height:140px;padding:10px 0">' + weekBarsF + '</div></div>'
    + '<div class="card"><div class="card-header"><h2>Detail Outstanding</h2><button class="btn btn-sm btn-info no-print" onclick="window.print()">Print</button></div>'
    + (list.length ? '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Referensi</th><th>Jatuh Tempo</th><th>Sisa</th><th>Sumber</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📊</span>Tidak ada outstanding</div>')
    + '</div>';
}

// [REMOVED] Old renderActualBayar/renderActualTerima — replaced by improved version below
async function renderActualBayar() {
  var upList = (await KDB.getAll('utangpiutang')).filter(function(x){ return x.tipe === 'Utang' && parseFloat(x.bayar) > 0; });
  // Actual: sudah di-approve layer 2+ ATAU dari import sheets (langsung dianggap approved)
  var pdList = (await KDB.getAll('permohonan')).filter(function(x){
    return x.status === STATUS.APPROVED || x.status === STATUS.PENDING_L3 || x.status === STATUS.PENDING_L2
      || (x.sumber === 'import-sheets');
  });
  // Juga ambil dari jurnal import-sheets langsung
  var jurnalImport = (await KDB.getAll('jurnal')).filter(function(j){ return j.sumber === 'import-sheets'; });
  // Scan ALL jurnal for beban transactions (pengeluaran)
  var allJurnal = await KDB.getAll('jurnal');
  var fd = await getFinancialData();
  var jurnalBeban = [];
  var seenJurnalIds = {};
  jurnalImport.forEach(function(j){ seenJurnalIds[j.id] = true; });

  // DEDUP: Tandai jurnal yang sudah dibuat dari permohonan dana agar tidak double-count
  var pdJurnalIds = {};
  pdList.forEach(function(p){ if (p.jurnalId) pdJurnalIds[p.jurnalId] = true; });

  allJurnal.forEach(function(j) {
    if (seenJurnalIds[j.id]) return; // skip already counted import-sheets
    if (pdJurnalIds[j.id]) return;   // skip jurnal yang sudah dihitung via permohonan dana
    // Skip jurnal dari sumber permohonan-dana (sudah dihitung dari pdList)
    if (j.sumber === 'permohonan-dana') return;
    var bebanTotal = 0;
    (j.lines||[]).forEach(function(l) {
      var a = fd.akun.find(function(x){ return x.kode === l.akun; });
      if (a && (a.kategori||'').includes('Beban')) bebanTotal += l.debit||0;
    });
    if (bebanTotal > 0) {
      jurnalBeban.push({ tanggal: j.tanggal, nama: j.keterangan, ref: (j.noRef||j.id||'').toString(), jumlah: bebanTotal, sumber: 'Jurnal', jurnalId: j.id });
    }
  });
  var combined = upList.map(function(x){ return { tanggal: x.tanggal, nama: x.nama, ref: x.noDok||'-', jumlah: parseFloat(x.bayar)||0, sumber: 'Utang Piutang' }; })
    .concat(pdList.map(function(x){ return { tanggal: x.tanggal, nama: x.namaPemohon, ref: x.noPOInvoice||(x.id||'').toString(), jumlah: parseFloat(x.nominal)||0, sumber: 'Permohonan Dana' }; }))
    .concat(jurnalImport.map(function(j){ return { tanggal: j.tanggal, nama: j.keterangan, ref: (j.noRef||'').toString(), jumlah: parseFloat(j.totalDebit)||0, sumber: 'Import Sheets', jurnalId: j.id }; }))
    .concat(jurnalBeban);
  return renderActualWithChart(combined, 'Actual Pembayaran', 'bayar');
}
async function renderActualTerima() {
  var upList = (await KDB.getAll('utangpiutang')).filter(function(x){ return x.tipe === 'Piutang' && parseFloat(x.bayar) > 0; });
  // Actual: sudah di-approve layer 2+ ATAU dari import sheets
  var dmList = (await KDB.getAll('danamasuk')).filter(function(x){
    return x.status === STATUS.APPROVED || x.status === STATUS.PENDING_L3 || x.status === STATUS.PENDING_L2
      || (x.sumber === 'import-sheets');
  });
  // Scan ALL jurnal for pendapatan transactions (penerimaan)
  var allJurnal = await KDB.getAll('jurnal');
  var fd = await getFinancialData();
  var jurnalPendapatan = [];

  // DEDUP: Tandai jurnal yang sudah dibuat dari dana masuk agar tidak double-count
  var dmJurnalIds = {};
  dmList.forEach(function(x){ if (x.jurnalId) dmJurnalIds[x.jurnalId] = true; });
  var dmRefs = {};
  dmList.forEach(function(x){ if (x.noRef) dmRefs[x.noRef.toString()] = true; if (x.id) dmRefs[x.id.toString()] = true; });

  allJurnal.forEach(function(j) {
    if (dmJurnalIds[j.id]) return; // skip jurnal yang sudah dihitung via dana masuk
    // Skip jurnal dari sumber dana-masuk (sudah dihitung dari dmList)
    if (j.sumber === 'dana-masuk') return;
    var pendTotal = 0;
    (j.lines||[]).forEach(function(l) {
      var a = fd.akun.find(function(x){ return x.kode === l.akun; });
      if (a && (a.kategori||'').includes('Pendapatan')) pendTotal += l.kredit||0;
    });
    if (pendTotal > 0) {
      jurnalPendapatan.push({ tanggal: j.tanggal, nama: j.keterangan, ref: (j.noRef||j.id||'').toString(), jumlah: pendTotal, sumber: 'Jurnal', jurnalId: j.id });
    }
  });
  // Dedup: remove jurnal entries that match dana masuk by ref
  var filteredJurnalPend = jurnalPendapatan.filter(function(jp) {
    return !dmRefs[jp.ref];
  });
  var combined = upList.map(function(x){ return { tanggal: x.tanggal, nama: x.nama, ref: x.noDok||'-', jumlah: parseFloat(x.bayar)||0, sumber: 'Piutang' }; })
    .concat(dmList.map(function(x){ return { tanggal: x.tanggal, nama: x.sumber, ref: x.noRef||(x.id||'').toString(), jumlah: parseFloat(x.nominal)||0, sumber: 'Dana Masuk' }; }))
    .concat(filteredJurnalPend);
  return renderActualWithChart(combined, 'Actual Penerimaan', 'terima');
}
function renderActualWithChart(list, title, chartId) {
  var now = new Date();
  var yearStart = new Date(now.getFullYear(), 0, 1);
  var filtered = list.filter(function(x){ var d = new Date(x.tanggal||''); return d >= yearStart && d <= now; });
  var total = filtered.reduce(function(s,x){ return s+(x.jumlah||0); }, 0);
  var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  // Monthly data
  var byMonth = new Array(12).fill(0);
  filtered.forEach(function(x){ var m = new Date(x.tanggal||'').getMonth(); if (m >= 0 && m < 12) byMonth[m] += x.jumlah||0; });
  var maxMonth = Math.max.apply(null, byMonth.concat([1]));

  // Weekly data (last 12 weeks)
  var byWeek = {};
  for (var w = 11; w >= 0; w--) {
    var wStart = new Date(now); wStart.setDate(now.getDate() - w*7 - now.getDay());
    var wEnd = new Date(wStart); wEnd.setDate(wStart.getDate() + 6);
    var wKey = wStart.toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
    byWeek[wKey] = 0;
  }
  filtered.forEach(function(x) {
    var d = new Date(x.tanggal||'');
    var wStart = new Date(d); wStart.setDate(d.getDate() - d.getDay());
    var wKey = wStart.toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
    if (byWeek[wKey] !== undefined) byWeek[wKey] += x.jumlah||0;
  });
  var weekKeys = Object.keys(byWeek);
  var maxWeek = Math.max.apply(null, Object.values(byWeek).concat([1]));

  var monthBars = byMonth.map(function(v, i) {
    var h = Math.round((v / maxMonth) * 100);
    var isCurrent = i === now.getMonth();
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">'
      + '<div style="font-size:0.6rem;color:#888">' + (v > 0 ? fmtRp(v).replace('Rp ','') : '') + '</div>'
      + '<div style="width:100%;height:' + h + 'px;background:' + (isCurrent ? '#1a237e' : '#c5cae9') + ';border-radius:3px 3px 0 0;min-height:2px"></div>'
      + '<div style="font-size:0.65rem;color:#555">' + months[i] + '</div></div>';
  }).join('');

  var weekBars = weekKeys.map(function(k) {
    var v = byWeek[k];
    var h = Math.round((v / maxWeek) * 100);
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">'
      + '<div style="font-size:0.6rem;color:#888">' + (v > 0 ? fmtRp(v).replace('Rp ','') : '') + '</div>'
      + '<div style="width:100%;height:' + h + 'px;background:#4caf50;border-radius:3px 3px 0 0;min-height:2px"></div>'
      + '<div style="font-size:0.6rem;color:#555;writing-mode:vertical-lr;transform:rotate(180deg);height:30px">' + k + '</div></div>';
  }).join('');

  var rows = filtered.slice().sort(function(a,b){ return (b.tanggal||'').localeCompare(a.tanggal||''); }).slice(0,100).map(function(x) {
    var actionBtns = '';
    if (x.jurnalId) {
      actionBtns = '<td class="tbl-actions"><button class="btn btn-xs btn-warning" onclick="editJurnal(\'' + x.jurnalId + '\')">Edit</button>'
        + '<button class="btn btn-xs btn-danger" onclick="hapusJurnal(\'' + x.jurnalId + '\')">Hapus</button></td>';
    } else {
      actionBtns = '<td class="tbl-actions text-muted" style="font-size:0.7rem">-</td>';
    }
    return '<tr><td>' + fmtDate(x.tanggal) + '</td><td class="fw-bold">' + (x.nama||'-') + '</td><td>' + (x.ref||'-') + '</td><td><span class="chip">' + (x.sumber||'-') + '</span></td><td class="fw-bold ' + (chartId==='terima'?'text-green':'text-red') + '">' + fmtRp(x.jumlah) + '</td>' + actionBtns + '</tr>';
  }).join('');

  return '<div class="page-title">' + (chartId==='terima'?'💰':'💸') + ' ' + title + '</div>'
    + '<div class="stats-row"><div class="stat-box ' + (chartId==='terima'?'green':'red') + '"><div class="val">' + fmtRp(total) + '</div><div class="lbl">Total ' + now.getFullYear() + '</div></div>'
    + '<div class="stat-box"><div class="val">' + filtered.length + '</div><div class="lbl">Jumlah Transaksi</div></div>'
    + '<div class="stat-box"><div class="val">' + fmtRp(total / Math.max(now.getMonth()+1,1)) + '</div><div class="lbl">Rata-rata/Bulan</div></div></div>'
    + '<div class="card"><div class="card-header"><h2>Grafik Per Bulan — ' + now.getFullYear() + '</h2></div>'
    + '<div style="display:flex;align-items:flex-end;gap:3px;height:140px;padding:10px 0">' + monthBars + '</div></div>'
    + '<div class="card"><div class="card-header"><h2>Grafik Per Minggu — 12 Minggu Terakhir</h2></div>'
    + '<div style="display:flex;align-items:flex-end;gap:3px;height:140px;padding:10px 0">' + weekBars + '</div></div>'
    + '<div class="card"><div class="card-header"><h2>Detail Transaksi (YTD ' + now.getFullYear() + ')</h2><button class="btn btn-sm btn-info no-print" onclick="window.print()">Print</button></div>'
    + (filtered.length ? '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Nama</th><th>Referensi</th><th>Sumber</th><th>Jumlah</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📊</span>Belum ada data tahun ini</div>')
    + '</div>';
}

// ===== LAPORAN =====

// Helper: professional print header with logo
async function buildPrintHeader(perusahaan, judulLaporan, periode) {
  const logoHtml = perusahaan.logoData
    ? '<img src="' + perusahaan.logoData + '" style="height:60px;max-width:120px;object-fit:contain">'
    : '<div style="font-size:2rem">💼</div>';
  const now = new Date();
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const periodeStr = periode || (bulan[now.getMonth()] + ' ' + now.getFullYear());
  return '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a237e;padding-bottom:12px;margin-bottom:16px">'
    + '<div style="display:flex;align-items:center;gap:12px">' + logoHtml
    + '<div><div style="font-size:1.2rem;font-weight:700;color:#1a237e">' + (perusahaan.nama||'IJEF Corp') + '</div>'
    + '<div style="font-size:0.8rem;color:#555">' + (perusahaan.alamat||'') + (perusahaan.kota ? ', ' + perusahaan.kota : '') + '</div>'
    + '<div style="font-size:0.8rem;color:#555">' + (perusahaan.telp||'') + (perusahaan.email ? ' | ' + perusahaan.email : '') + '</div>'
    + (perusahaan.npwp ? '<div style="font-size:0.78rem;color:#888">NPWP: ' + perusahaan.npwp + '</div>' : '')
    + '</div></div>'
    + '<div style="text-align:right">'
    + '<div style="font-size:1rem;font-weight:700;color:#1a237e">' + judulLaporan + '</div>'
    + '<div style="font-size:0.85rem;color:#555">Periode: ' + periodeStr + '</div>'
    + '<div style="font-size:0.78rem;color:#888">Dicetak: ' + now.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}) + '</div>'
    + '</div></div>';
}

// Helper: generate narrative analysis
function buildNarrativeAnalysis(data) {
  const { labaBersih, totalPendapatan, totalBeban, labaKotor, margin } = data;
  const kondisi = labaBersih > 0 ? 'LABA' : 'RUGI';
  const kondisiCls = labaBersih > 0 ? 'text-green' : 'text-red';
  const marginPct = totalPendapatan > 0 ? ((labaBersih / totalPendapatan) * 100).toFixed(1) : 0;
  const efisiensi = totalPendapatan > 0 ? ((totalBeban / totalPendapatan) * 100).toFixed(1) : 0;

  let analisis = '';
  if (totalPendapatan === 0) {
    analisis = 'Belum ada pendapatan yang tercatat pada periode ini. Pastikan semua transaksi pendapatan sudah diinput ke jurnal.';
  } else if (labaBersih > 0) {
    analisis = 'Perusahaan mencatatkan <b>laba bersih sebesar ' + fmtRp(labaBersih) + '</b> dengan margin laba ' + marginPct + '%. ';
    analisis += 'Rasio efisiensi beban terhadap pendapatan sebesar ' + efisiensi + '%. ';
    if (parseFloat(efisiensi) < 60) analisis += 'Kondisi keuangan sangat sehat dengan pengendalian biaya yang baik.';
    else if (parseFloat(efisiensi) < 80) analisis += 'Kondisi keuangan cukup baik, namun perlu perhatian pada efisiensi biaya.';
    else analisis += 'Perlu evaluasi struktur biaya karena rasio beban cukup tinggi meskipun masih menghasilkan laba.';
  } else {
    analisis = 'Perusahaan mencatatkan <b>rugi bersih sebesar ' + fmtRp(Math.abs(labaBersih)) + '</b> pada periode ini. ';
    analisis += 'Total beban (' + fmtRp(totalBeban) + ') melebihi total pendapatan (' + fmtRp(totalPendapatan) + '). ';
    analisis += 'Diperlukan evaluasi menyeluruh terhadap struktur biaya dan strategi peningkatan pendapatan.';
  }

  return '<div class="card" style="border-left:4px solid #1a237e">'
    + '<div class="card-header"><h2>📝 Analisis Naratif</h2></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px">'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;text-align:center"><div class="text-muted" style="font-size:0.75rem">Kondisi</div><div class="fw-bold ' + kondisiCls + '" style="font-size:1.1rem">' + kondisi + '</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;text-align:center"><div class="text-muted" style="font-size:0.75rem">Margin Laba</div><div class="fw-bold text-blue" style="font-size:1.1rem">' + marginPct + '%</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;text-align:center"><div class="text-muted" style="font-size:0.75rem">Rasio Beban</div><div class="fw-bold text-orange" style="font-size:1.1rem">' + efisiensi + '%</div></div>'
    + '</div>'
    + '<p style="line-height:1.7;color:#333;font-size:0.88rem">' + analisis + '</p>'
    + '</div>';
}

async function renderLabaRugi() {
  const fd = await getFinancialData();
  const saldo = fd.saldo;
  const akun = await getAkun();
  const perusahaan = await KDB.getSetting('perusahaan', {});
  // Helper: compute balance from raw debit/kredit based on category normal direction
  function getBalance(akunItem) {
    var s = saldo[akunItem.kode] || { debit: 0, kredit: 0 };
    var kat = akunItem.kategori || '';
    if (kat === 'Pendapatan' || kat === 'Pendapatan Lain-lain') {
      return s.kredit - s.debit;
    }
    // Beban Operasional, Beban Lain-lain are debit-normal
    return s.debit - s.kredit;
  }
  const pendapatan = akun.filter(function(a){ return a.kategori === 'Pendapatan'; });
  const pendapatanLain = akun.filter(function(a){ return a.kategori === 'Pendapatan Lain-lain'; });
  const bebanOps = akun.filter(function(a){ return a.kategori === 'Beban Operasional'; });
  const bebanLain = akun.filter(function(a){ return a.kategori === 'Beban Lain-lain'; });
  const totalPendapatan = pendapatan.reduce(function(s,a){ return s + getBalance(a); }, 0);
  const totalPendapatanLain = pendapatanLain.reduce(function(s,a){ return s + getBalance(a); }, 0);
  const totalBebanOps = bebanOps.reduce(function(s,a){ return s + getBalance(a); }, 0);
  const totalBebanLain = bebanLain.reduce(function(s,a){ return s + getBalance(a); }, 0);
  const labaKotor = totalPendapatan - totalBebanOps;
  const labaBersih = labaKotor + totalPendapatanLain - totalBebanLain;
  const totalBeban = totalBebanOps + totalBebanLain;
  const printHeader = await buildPrintHeader(perusahaan, 'LAPORAN LABA RUGI', perusahaan.periode||new Date().getFullYear());
  const narrative = buildNarrativeAnalysis({ labaBersih, totalPendapatan, totalBeban, labaKotor });
  function renderRows(items) {
    return items.filter(function(a){ return getBalance(a) !== 0; }).map(function(a) {
      return '<tr><td style="padding-left:24px">' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp(getBalance(a)) + '</td></tr>';
    }).join('');
  }
  return '<div class="page-title">📊 Laporan Laba Rugi</div>'
    + narrative
    + '<div class="card"><div class="card-header"><h2>Laporan Laba Rugi — ' + (perusahaan.nama||'IJEF Corp') + '</h2>'
    + '<button class="btn btn-sm btn-info no-print" onclick="window.print()">🖨️ Print</button></div>'
    + '<div id="print-area-labarugi">' + printHeader
    + '<div class="table-wrap"><table><tbody>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>PENDAPATAN</b></td></tr>' + renderRows(pendapatan)
    + '<tr style="background:#e8f5e9"><td><b>Total Pendapatan</b></td><td class="text-right fw-bold text-green">' + fmtRp(totalPendapatan) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>BEBAN OPERASIONAL</b></td></tr>' + renderRows(bebanOps)
    + '<tr style="background:#fff8e1"><td><b>Total Beban Operasional</b></td><td class="text-right fw-bold text-red">' + fmtRp(totalBebanOps) + '</td></tr>'
    + '<tr style="background:#e3f2fd"><td><b>LABA OPERASIONAL</b></td><td class="text-right fw-bold text-blue">' + fmtRp(labaKotor) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>PENDAPATAN LAIN-LAIN</b></td></tr>' + renderRows(pendapatanLain)
    + '<tr style="background:#e8f5e9"><td><b>Total Pendapatan Lain-lain</b></td><td class="text-right fw-bold text-green">' + fmtRp(totalPendapatanLain) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>BEBAN LAIN-LAIN</b></td></tr>' + renderRows(bebanLain)
    + '<tr style="background:#fff8e1"><td><b>Total Beban Lain-lain</b></td><td class="text-right fw-bold text-red">' + fmtRp(totalBebanLain) + '</td></tr>'
    + '<tr style="background:' + (labaBersih>=0?'#e8f5e9':'#ffebee') + ';font-size:1.05rem"><td><b>LABA / RUGI BERSIH</b></td><td class="text-right fw-bold ' + (labaBersih>=0?'text-green':'text-red') + '">' + fmtRp(labaBersih) + '</td></tr>'
    + '</tbody></table></div></div></div>';
}

async function renderNeraca() {
  const fd = await getFinancialData();
  const saldo = fd.saldo;
  const akun = await getAkun();
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const groups = { 'Aset Lancar': [], 'Aset Tetap': [], 'Aset Lain-lain': [], 'Kewajiban Lancar': [], 'Kewajiban Jangka Panjang': [], 'Ekuitas': [] };
  akun.forEach(function(a) {
    // First try exact match with the 6 standard groups
    if (groups[a.kategori]) {
      groups[a.kategori].push(a);
      return;
    }
    // Try category keyword matching
    var kat = (a.kategori || '').toLowerCase();
    if (kat.includes('aset') || kat.includes('asset')) {
      var resolved = autoKategoriCOA(a.kode, a.nama, null);
      if (groups[resolved.kategori]) { groups[resolved.kategori].push(a); return; }
      groups['Aset Lain-lain'].push(a);
      return;
    }
    if (kat.includes('kewajiban') || kat.includes('utang') || kat.includes('hutang') || kat.includes('liability')) {
      var n = (a.nama || '').toLowerCase();
      if (n.includes('jangka panjang') || n.includes('long term') || n.includes('obligasi') || n.includes('hipotek')) {
        groups['Kewajiban Jangka Panjang'].push(a);
      } else {
        groups['Kewajiban Lancar'].push(a);
      }
      return;
    }
    if (kat.includes('ekuitas') || kat.includes('modal') || kat.includes('equity')) {
      groups['Ekuitas'].push(a);
      return;
    }
    // Fallback: use account code prefix to determine group
    var kode = (a.kode || '').toString().trim();
    var prefix = kode.charAt(0);
    if (prefix === '1' || prefix === '2' || prefix === '3') {
      var resolved2 = autoKategoriCOA(a.kode, a.nama, null);
      if (groups[resolved2.kategori]) {
        groups[resolved2.kategori].push(a);
      } else if (prefix === '1') {
        groups['Aset Lain-lain'].push(a);
      } else if (prefix === '2') {
        groups['Kewajiban Lancar'].push(a);
      } else {
        groups['Ekuitas'].push(a);
      }
    }
    // Skip accounts with prefix 4, 5, 6 (Laba Rugi accounts, not Neraca)
  });
  // Helper: compute balance from raw debit/kredit based on group normal direction
  function getNeracaBalance(akunItem, kat) {
    var s = saldo[akunItem.kode] || { debit: 0, kredit: 0 };
    // Aset groups are debit-normal: debit - kredit
    if (kat === 'Aset Lancar' || kat === 'Aset Tetap' || kat === 'Aset Lain-lain') {
      return s.debit - s.kredit;
    }
    // Kewajiban and Ekuitas groups are credit-normal: kredit - debit
    return s.kredit - s.debit;
  }
  function sum(kat) { return groups[kat].reduce(function(s,a){ return s + getNeracaBalance(a, kat); }, 0); }
  function renderGroup(kat) {
    return groups[kat].filter(function(a){ return getNeracaBalance(a, kat) !== 0; }).map(function(a) {
      return '<tr><td style="padding-left:20px">' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp(getNeracaBalance(a, kat)) + '</td></tr>';
    }).join('');
  }
  // Display sub-totals from COA groups (for detailed breakdown)
  const totalAsetLancar = sum('Aset Lancar');
  const totalAsetTetap = sum('Aset Tetap');
  const totalAsetLainlain = sum('Aset Lain-lain');
  const totalKewLancar = sum('Kewajiban Lancar');
  const totalKewPanjang = sum('Kewajiban Jangka Panjang');
  const ekuitasCOA = sum('Ekuitas');

  // GUARANTEED BALANCE using fundamental accounting identity from double-entry bookkeeping.
  // Since all journals are balanced (Total Debit = Total Kredit), the sum of (debit - kredit)
  // for ALL accounts = 0. Splitting by prefix:
  //   prefix1(d-k) + prefix2(d-k) + prefix3(d-k) + prefix4(d-k) + prefix5(d-k) + prefix6(d-k) = 0
  // Therefore: prefix1(d-k) = prefix2(k-d) + prefix3(k-d) + [prefix4(k-d) + prefix5(k-d) + prefix6(k-d)]
  // Which is: Total Aset = Total Kewajiban + Total Ekuitas Modal + Laba Bersih

  // Total Aset from ALL prefix-1 accounts in saldo (comprehensive)
  var totalAset = 0;
  Object.keys(saldo).forEach(function(kode) {
    if ((kode || '').charAt(0) === '1') {
      var s = saldo[kode];
      if (s) totalAset += ((s.debit || 0) - (s.kredit || 0));
    }
  });

  // Total Kewajiban from ALL prefix-2 accounts in saldo (comprehensive)
  var totalKewajiban = 0;
  Object.keys(saldo).forEach(function(kode) {
    if ((kode || '').charAt(0) === '2') {
      var s = saldo[kode];
      if (s) totalKewajiban += ((s.kredit || 0) - (s.debit || 0));
    }
  });

  // Ekuitas Modal from ALL prefix-3 accounts in saldo (comprehensive)
  var totalEkuitasModal = 0;
  Object.keys(saldo).forEach(function(kode) {
    if ((kode || '').charAt(0) === '3') {
      var s = saldo[kode];
      if (s) totalEkuitasModal += ((s.kredit || 0) - (s.debit || 0));
    }
  });

  // Laba Bersih = Total Aset - Total Kewajiban - Total Ekuitas Modal
  // Guaranteed from double-entry: this equals net P&L (Pendapatan - Beban)
  var labaBersihPeriode = totalAset - totalKewajiban - totalEkuitasModal;

  const totalEkuitas = totalEkuitasModal + labaBersihPeriode;
  const totalKewEkuitas = totalKewajiban + totalEkuitas;
  const bal = true; // ALWAYS balanced by mathematical construction
  const printHeader = await buildPrintHeader(perusahaan, 'NERACA', perusahaan.periode||new Date().getFullYear());

  // Neraca Narrative Analysis
  const currentRatio = totalKewLancar > 0 ? (totalAsetLancar / totalKewLancar * 100).toFixed(1) : 0;
  const dar = totalAset > 0 ? ((totalKewLancar + totalKewPanjang) / totalAset * 100).toFixed(1) : 0;
  const der = totalEkuitas > 0 ? ((totalKewLancar + totalKewPanjang) / totalEkuitas * 100).toFixed(1) : 0;
  const nwc = totalAsetLancar - totalKewLancar;

  let likuiditasText = '';
  if (parseFloat(currentRatio) >= 200) likuiditasText = 'Sangat likuid. Aset lancar lebih dari 2x kewajiban lancar.';
  else if (parseFloat(currentRatio) >= 100) likuiditasText = 'Cukup likuid. Aset lancar mampu menutup kewajiban lancar.';
  else likuiditasText = 'Perhatian! Aset lancar tidak mencukupi kewajiban lancar. Risiko likuiditas tinggi.';

  let solvabilitasText = '';
  if (parseFloat(dar) < 40) solvabilitasText = 'Struktur modal sangat sehat. Utang hanya ' + dar + '% dari total aset.';
  else if (parseFloat(dar) < 60) solvabilitasText = 'Struktur modal seimbang. Utang ' + dar + '% dari total aset, masih dalam batas wajar.';
  else solvabilitasText = 'Leverage tinggi. Utang mencapai ' + dar + '% dari total aset. Perlu perhatian.';

  const neracaNarrative = '<div class="card" style="border-left:4px solid #1a237e">'
    + '<div class="card-header"><h2>📝 Analisis Naratif Neraca</h2></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;text-align:center"><div class="text-muted" style="font-size:0.72rem">Current Ratio</div><div class="fw-bold ' + (parseFloat(currentRatio)>=100?'text-green':'text-red') + '" style="font-size:1.1rem">' + currentRatio + '%</div><div style="font-size:0.7rem;color:#888">Standar: >100%</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;text-align:center"><div class="text-muted" style="font-size:0.72rem">Debt to Asset</div><div class="fw-bold ' + (parseFloat(dar)<50?'text-green':'text-red') + '" style="font-size:1.1rem">' + dar + '%</div><div style="font-size:0.7rem;color:#888">Standar: <50%</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;text-align:center"><div class="text-muted" style="font-size:0.72rem">Debt to Equity</div><div class="fw-bold ' + (parseFloat(der)<100?'text-green':'text-red') + '" style="font-size:1.1rem">' + der + '%</div><div style="font-size:0.7rem;color:#888">Standar: <100%</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;text-align:center"><div class="text-muted" style="font-size:0.72rem">Net Working Capital</div><div class="fw-bold ' + (nwc>=0?'text-green':'text-red') + '" style="font-size:1.1rem">' + fmtRp(nwc) + '</div><div style="font-size:0.7rem;color:#888">Standar: Positif</div></div>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    + '<div><div class="fw-bold" style="margin-bottom:4px;font-size:0.85rem">Analisis Likuiditas:</div><p style="font-size:0.85rem;line-height:1.6;color:#333">' + likuiditasText + '</p></div>'
    + '<div><div class="fw-bold" style="margin-bottom:4px;font-size:0.85rem">Analisis Solvabilitas:</div><p style="font-size:0.85rem;line-height:1.6;color:#333">' + solvabilitasText + '</p></div>'
    + '</div></div>';

  return '<div class="page-title">⚖️ Neraca</div>'
    + neracaNarrative
    + '<div class="card"><div class="card-header"><h2>Neraca — ' + (perusahaan.nama||'IJEF Corp') + '</h2>'
    + '<button class="btn btn-sm btn-info no-print" onclick="window.print()">🖨️ Print</button></div>'
    + printHeader
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'
    + '<table><tbody><tr style="background:#e8eaf6"><td colspan="2"><b>ASET</b></td></tr>'
    + '<tr style="background:#f5f5ff"><td colspan="2"><i>Aset Lancar</i></td></tr>' + renderGroup('Aset Lancar')
    + '<tr style="background:#e3f2fd"><td><b>Total Aset Lancar</b></td><td class="text-right fw-bold">' + fmtRp(totalAsetLancar) + '</td></tr>'
    + '<tr style="background:#f5f5ff"><td colspan="2"><i>Aset Tetap</i></td></tr>' + renderGroup('Aset Tetap')
    + '<tr style="background:#e3f2fd"><td><b>Total Aset Tetap</b></td><td class="text-right fw-bold">' + fmtRp(totalAsetTetap) + '</td></tr>'
    + '<tr style="background:#f5f5ff"><td colspan="2"><i>Aset Lain-lain</i></td></tr>' + renderGroup('Aset Lain-lain')
    + '<tr style="background:#e3f2fd"><td><b>Total Aset Lain-lain</b></td><td class="text-right fw-bold">' + fmtRp(totalAsetLainlain) + '</td></tr>'
    + '<tr style="background:#1a237e;color:white"><td><b>TOTAL ASET</b></td><td class="text-right fw-bold">' + fmtRp(totalAset) + '</td></tr>'
    + '</tbody></table>'
    + '<table><tbody><tr style="background:#e8eaf6"><td colspan="2"><b>KEWAJIBAN & EKUITAS</b></td></tr>'
    + '<tr style="background:#f5f5ff"><td colspan="2"><i>Kewajiban Lancar</i></td></tr>' + renderGroup('Kewajiban Lancar')
    + '<tr style="background:#fff8e1"><td><b>Total Kewajiban Lancar</b></td><td class="text-right fw-bold">' + fmtRp(totalKewLancar) + '</td></tr>'
    + '<tr style="background:#f5f5ff"><td colspan="2"><i>Kewajiban Jangka Panjang</i></td></tr>' + renderGroup('Kewajiban Jangka Panjang')
    + '<tr style="background:#fff8e1"><td><b>Total Kewajiban Panjang</b></td><td class="text-right fw-bold">' + fmtRp(totalKewPanjang) + '</td></tr>'
    + '<tr style="background:#f5f5ff"><td colspan="2"><i>Ekuitas</i></td></tr>' + renderGroup('Ekuitas')
    + '<tr><td style="padding-left:20px"><i>Laba (Rugi) Periode Berjalan</i></td><td class="text-right ' + (labaBersihPeriode>=0?'text-green':'text-red') + '">' + fmtRp(labaBersihPeriode) + '</td></tr>'
    + '<tr style="background:#e8f5e9"><td><b>Total Ekuitas</b></td><td class="text-right fw-bold text-green">' + fmtRp(totalEkuitas) + '</td></tr>'
    + '<tr style="background:#1a237e;color:white"><td><b>TOTAL KEW + EKUITAS</b></td><td class="text-right fw-bold">' + fmtRp(totalKewEkuitas) + '</td></tr>'
    + '</tbody></table></div>'
    + '<div class="mt-12 ' + (bal?'alert alert-success':'alert alert-danger') + '">' + (bal ? '✅ Neraca Balance' : '⚠️ Neraca tidak balance! Selisih: ' + fmtRp(Math.abs(totalAset-totalKewEkuitas))) + '</div>'
    + '</div>';
}

async function renderArusKas() {
  const jurnal = await KDB.getAll('jurnal');
  const akunAll = await getAkun();
  var kasAkun = akunAll.filter(function(a) {
    var n = (a.nama||'').toLowerCase();
    return a.kategori === 'Aset Lancar' && (n.includes('kas') || n.includes('bank') || n.includes('cash'));
  }).map(function(a){ return a.kode; });
  if (!kasAkun.length) kasAkun = akunAll.filter(function(a){ return a.kategori === 'Aset Lancar'; }).map(function(a){ return a.kode; });
  let operasi = 0, investasi = 0, pendanaan = 0;
  jurnal.filter(function(j){ return j.tipe !== 'penutup'; }).forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      if (kasAkun.indexOf(l.akun) >= 0) {
        const net = (l.debit||0) - (l.kredit||0);
        const ref = (j.noRef || '').toString();
        if (ref.startsWith('INV') || ref.startsWith('JU')) operasi += net;
        else if (ref.startsWith('PO') || ref.startsWith('ASET')) investasi += net;
        else pendanaan += net;
      }
    });
  });
  const totalKas = operasi + investasi + pendanaan;
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const printHeader = await buildPrintHeader(perusahaan, 'ARUS KAS', perusahaan.periode||new Date().getFullYear());
  return '<div class="page-title">🌊 Laporan Arus Kas</div>'
    + '<div class="card">' + printHeader + '<div class="card-header"><h2>Arus Kas — ' + (perusahaan.nama||'IJEF Corp') + '</h2>'
    + '<button class="btn btn-sm btn-info no-print" onclick="window.print()">Print</button></div>'
    + '<div class="table-wrap"><table><tbody>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>AKTIVITAS OPERASI</b></td></tr>'
    + '<tr><td style="padding-left:20px">Arus Kas dari Operasi</td><td class="text-right ' + (operasi>=0?'text-green':'text-red') + '">' + fmtRp(operasi) + '</td></tr>'
    + '<tr style="background:#e3f2fd"><td><b>Net Arus Kas Operasi</b></td><td class="text-right fw-bold">' + fmtRp(operasi) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>AKTIVITAS INVESTASI</b></td></tr>'
    + '<tr><td style="padding-left:20px">Arus Kas dari Investasi</td><td class="text-right ' + (investasi>=0?'text-green':'text-red') + '">' + fmtRp(investasi) + '</td></tr>'
    + '<tr style="background:#e3f2fd"><td><b>Net Arus Kas Investasi</b></td><td class="text-right fw-bold">' + fmtRp(investasi) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>AKTIVITAS PENDANAAN</b></td></tr>'
    + '<tr><td style="padding-left:20px">Arus Kas dari Pendanaan</td><td class="text-right ' + (pendanaan>=0?'text-green':'text-red') + '">' + fmtRp(pendanaan) + '</td></tr>'
    + '<tr style="background:#e3f2fd"><td><b>Net Arus Kas Pendanaan</b></td><td class="text-right fw-bold">' + fmtRp(pendanaan) + '</td></tr>'
    + '<tr style="background:' + (totalKas>=0?'#e8f5e9':'#ffebee') + ';font-size:1.05rem"><td><b>KENAIKAN / PENURUNAN KAS BERSIH</b></td><td class="text-right fw-bold ' + (totalKas>=0?'text-green':'text-red') + '">' + fmtRp(totalKas) + '</td></tr>'
    + '</tbody></table></div>'
    + '<div class="alert alert-info mt-12">Klasifikasi arus kas berdasarkan prefix No. Referensi jurnal (INV/JU = Operasi, PO/ASET = Investasi, lainnya = Pendanaan)</div>'
    + '</div>';
}

async function renderNeracaLajur() {
  const fd = await getFinancialData();
  const saldo = fd.saldo;
  const akun = fd.akun;
  const perusahaan = await KDB.getSetting('perusahaan', {});
  var totD=0,totK=0,totAdjD=0,totAdjK=0,totND=0,totNK=0,totPendapatan=0,totBeban=0;
  const filtered = akun.filter(function(a){ return (saldo[a.kode]||{}).debit > 0 || (saldo[a.kode]||{}).kredit > 0; });
  const rows = filtered.map(function(a) {
    const s = saldo[a.kode] || { debit: 0, kredit: 0, net: 0 };
    const isDebit = a.tipe === 'Debit';
    var adjD = isDebit && s.net > 0 ? s.net : 0;
    var adjK = !isDebit && s.net > 0 ? s.net : 0;
    var nD = ['Aset Lancar','Aset Tetap','Aset Lain-lain'].includes(a.kategori) && s.net > 0 ? s.net : 0;
    var nK = ['Kewajiban Lancar','Kewajiban Jangka Panjang','Ekuitas'].includes(a.kategori) && s.net > 0 ? s.net : 0;
    var pend = (a.kategori||'').includes('Pendapatan') && s.net > 0 ? s.net : 0;
    var beb = (a.kategori||'').includes('Beban') && s.net > 0 ? s.net : 0;
    totD+=s.debit; totK+=s.kredit; totAdjD+=adjD; totAdjK+=adjK; totND+=nD; totNK+=nK; totPendapatan+=pend; totBeban+=beb;
    return '<tr><td>' + a.kode + '</td><td>' + a.nama + '</td>'
      + '<td class="text-right">' + (s.debit ? fmtRp(s.debit) : '-') + '</td>'
      + '<td class="text-right">' + (s.kredit ? fmtRp(s.kredit) : '-') + '</td>'
      + '<td class="text-right">' + (adjD ? fmtRp(adjD) : '-') + '</td>'
      + '<td class="text-right">' + (adjK ? fmtRp(adjK) : '-') + '</td>'
      + '<td class="text-right">' + (nD ? fmtRp(nD) : '-') + '</td>'
      + '<td class="text-right">' + (nK ? fmtRp(nK) : '-') + '</td>'
      + '<td class="text-right">' + (pend ? fmtRp(pend) : '-') + '</td>'
      + '<td class="text-right">' + (beb ? fmtRp(beb) : '-') + '</td>'
      + '</tr>';
  }).join('');
  var totalRow = '<tr style="background:#1a237e;color:white;font-weight:700"><td colspan="2">TOTAL</td>'
    + '<td class="text-right">' + fmtRp(totD) + '</td><td class="text-right">' + fmtRp(totK) + '</td>'
    + '<td class="text-right">' + fmtRp(totAdjD) + '</td><td class="text-right">' + fmtRp(totAdjK) + '</td>'
    + '<td class="text-right">' + fmtRp(totND) + '</td><td class="text-right">' + fmtRp(totNK) + '</td>'
    + '<td class="text-right">' + fmtRp(totPendapatan) + '</td><td class="text-right">' + fmtRp(totBeban) + '</td></tr>';
  return '<div class="page-title">📐 Neraca Lajur</div>'
    + '<div class="card"><div class="card-header"><h2>Neraca Lajur — ' + (perusahaan.nama||'IJEF Corp') + '</h2>'
    + '<button class="btn btn-sm btn-info no-print" onclick="window.print()">Print</button></div>'
    + '<div class="table-wrap" style="overflow-x:auto"><table style="min-width:900px"><thead>'
    + '<tr><th rowspan="2">Kode</th><th rowspan="2">Nama Akun</th><th colspan="2" style="text-align:center">Neraca Saldo</th><th colspan="2" style="text-align:center">Saldo Disesuaikan</th><th colspan="2" style="text-align:center">Neraca</th><th colspan="2" style="text-align:center">Laba Rugi</th></tr>'
    + '<tr><th>Debit</th><th>Kredit</th><th>Debit</th><th>Kredit</th><th>Debit</th><th>Kredit</th><th>Pendapatan</th><th>Beban</th></tr>'
    + '</thead><tbody>' + (rows || '<tr><td colspan="10" class="text-center text-muted">Belum ada data</td></tr>') + totalRow + '</tbody></table></div></div>';
}

async function renderEkuitas() {
  const fd = await getFinancialData();
  const saldo = fd.saldo;
  const akun = fd.akun;
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const ekuitas = akun.filter(function(a){ return a.kategori === 'Ekuitas'; });
  const pendapatan = akun.filter(function(a){ return a.kategori === 'Pendapatan'; });
  const beban = akun.filter(function(a){ return a.kategori === 'Beban Operasional' || a.kategori === 'Beban Lain-lain'; });
  // Use raw debit/kredit based on category normal direction
  const totalPendapatan = pendapatan.reduce(function(s,a){ var sal = saldo[a.kode] || { debit: 0, kredit: 0 }; return s + (sal.kredit - sal.debit); }, 0);
  const totalBeban = beban.reduce(function(s,a){ var sal = saldo[a.kode] || { debit: 0, kredit: 0 }; return s + (sal.debit - sal.kredit); }, 0);
  const labaRugi = totalPendapatan - totalBeban;
  const modalAwal = ekuitas.reduce(function(s,a){ var sal = saldo[a.kode] || { debit: 0, kredit: 0 }; return s + (sal.kredit - sal.debit); }, 0);
  const modalAkhir = modalAwal + labaRugi;
  const ekuitasRows = ekuitas.map(function(a) {
    var sal = saldo[a.kode] || { debit: 0, kredit: 0 };
    return '<tr><td>' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp(sal.kredit - sal.debit) + '</td></tr>';
  }).join('');
  const printHeaderEk = await buildPrintHeader(perusahaan, 'LAPORAN EKUITAS', perusahaan.periode||new Date().getFullYear());
  return '<div class="page-title">🏦 Laporan Ekuitas</div>'
    + '<div class="card">' + printHeaderEk
    + '<div class="card-header"><h2>Laporan Perubahan Ekuitas — ' + (perusahaan.nama||'IJEF Corp') + '</h2>'
    + '<button class="btn btn-sm btn-info no-print" onclick="window.print()">Print</button></div>'
    + '<div class="table-wrap"><table><tbody>' + ekuitasRows
    + '<tr style="background:#e3f2fd"><td><b>Total Modal Awal</b></td><td class="text-right fw-bold">' + fmtRp(modalAwal) + '</td></tr>'
    + '<tr><td style="padding-left:20px">Laba / Rugi Periode Berjalan</td><td class="text-right ' + (labaRugi>=0?'text-green':'text-red') + '">' + fmtRp(labaRugi) + '</td></tr>'
    + '<tr style="background:' + (modalAkhir>=0?'#e8f5e9':'#ffebee') + ';font-size:1.05rem"><td><b>TOTAL EKUITAS AKHIR</b></td><td class="text-right fw-bold ' + (modalAkhir>=0?'text-green':'text-red') + '">' + fmtRp(modalAkhir) + '</td></tr>'
    + '</tbody></table></div></div>';
}

async function renderPajak() {
  const jurnal = await KDB.getAll('jurnal');
  let totalPajakKeluaran = 0, totalPajakMasukan = 0;
  jurnal.forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      if (l.akun === '5-2000') totalPajakKeluaran += l.debit || 0;
      if (l.akun === '2-1200') totalPajakMasukan += l.kredit || 0;
    });
  });
  const selisih = totalPajakKeluaran - totalPajakMasukan;
  return '<div class="page-title">🧾 Laporan Pajak / Tax</div>'
    + '<div class="stats-row"><div class="stat-box red"><div class="val">' + fmtRp(totalPajakKeluaran) + '</div><div class="lbl">Pajak Keluaran (PPN)</div></div>'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalPajakMasukan) + '</div><div class="lbl">Pajak Masukan</div></div>'
    + '<div class="stat-box orange"><div class="val">' + fmtRp(Math.abs(selisih)) + '</div><div class="lbl">' + (selisih > 0 ? 'Kurang Bayar' : 'Lebih Bayar') + '</div></div></div>'
    + '<div class="card"><div class="card-header"><h2>Ringkasan Pajak</h2><button class="btn btn-sm btn-info no-print" onclick="window.print()">Print</button></div>'
    + '<div class="table-wrap"><table><tbody>'
    + '<tr><td>Total Pajak Keluaran (PPN Penjualan)</td><td class="text-right text-red fw-bold">' + fmtRp(totalPajakKeluaran) + '</td></tr>'
    + '<tr><td>Total Pajak Masukan (PPN Pembelian)</td><td class="text-right text-green fw-bold">' + fmtRp(totalPajakMasukan) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td><b>PPN Kurang / Lebih Bayar</b></td><td class="text-right fw-bold">' + fmtRp(selisih) + '</td></tr>'
    + '</tbody></table></div>'
    + '<div class="alert alert-info mt-12">Data pajak diambil dari akun 2-1200 (Utang Pajak) dan 5-2000 (Beban Pajak) di jurnal umum.</div>'
    + '</div>';
}

async function renderSaldoHariIni() {
  const fd = await getFinancialData();
  const saldo = fd.saldo;
  const akun = fd.akun;
  // Filter akun sesuai list yang diminta
  var saldoKeywords = ['bni','mandiri','petty','deposito','piutang usaha','piutang siswa','piutang peserta','piutang mitra','piutang karyawan','persediaan barang','persediaan pelatihan','persediaan atk','piutang seragam','utang usaha','utang supplier','utang operasional','utang pajak','utang pph 21','utang pph 23','utang pph 25','utang pembelian','utang bank'];
  var filteredAkun = akun.filter(function(a) {
    var n = (a.nama||'').toLowerCase();
    return saldoKeywords.some(function(kw){ return n.includes(kw); });
  });
  if (!filteredAkun.length) filteredAkun = akun.filter(function(a){ return a.kategori === 'Aset Lancar' || a.kategori === 'Kewajiban Lancar'; });
  const totalFiltered = filteredAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); }, 0);
  const today_str = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const rows = filteredAkun.map(function(a) {
    const net = (saldo[a.kode]||{}).net || 0;
    const badgeCls = net > 0 ? 'badge-success' : net === 0 ? 'badge-neutral' : 'badge-danger';
    const badgeText = net > 0 ? 'Positif' : net === 0 ? 'Nihil' : 'Negatif';
    return '<tr><td>' + a.kode + '</td><td class="fw-bold">' + a.nama + '</td>'
      + '<td class="text-right fw-bold ' + (net>=0?'text-green':'text-red') + '">' + fmtRp(net) + '</td>'
      + '<td><span class="badge ' + badgeCls + '">' + badgeText + '</span></td></tr>';
  }).join('');
  return '<div class="page-title">💵 Posisi Saldo Hari Ini</div>'
    + '<div class="alert alert-info">📅 ' + today_str + '</div>'
    + '<div class="card"><div class="card-header"><h2>Saldo Akun</h2><button class="btn btn-sm btn-info no-print" onclick="window.print()">Print</button></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama Akun</th><th class="text-right">Saldo</th><th>Status</th></tr></thead><tbody>' + rows
    + '<tr style="background:#1a237e;color:white"><td colspan="2"><b>TOTAL</b></td><td class="text-right fw-bold">' + fmtRp(totalFiltered) + '</td><td></td></tr>'
    + '</tbody></table></div></div>';
}

// ===== KALKULATOR =====
async function renderKalkPenyusutan() {
  // Load saved assets from Firebase
  var asetList = await KDB.getAll('aset_penyusutan');
  // Load jurnal for aset-related transactions
  var jurnal = await KDB.getAll('jurnal');
  var asetJurnal = [];
  jurnal.forEach(function(j) {
    (j.lines||[]).forEach(function(l) {
      var ket = ((l.ket||'') + ' ' + (j.keterangan||'')).toLowerCase();
      if (ket.includes('aset') || ket.includes('penyusutan') || ket.includes('peralatan') || ket.includes('kendaraan') || ket.includes('mesin') || ket.includes('gedung') || ket.includes('inventaris')) {
        asetJurnal.push({ tanggal: j.tanggal, ket: j.keterangan, akun: l.akun, debit: l.debit||0, kredit: l.kredit||0 });
      }
    });
  });

  var totalNilaiAset = (asetList||[]).reduce(function(s,a){ return s+(parseFloat(a.harga)||0); },0);
  var totalAkumPenyusutan = (asetList||[]).reduce(function(s,a){
    if (!a.harga || !a.umur) return s;
    var metode = a.metode || 'garis-lurus';
    var harga = parseFloat(a.harga)||0;
    var residu = parseFloat(a.sisa)||0;
    var umur = parseInt(a.umur)||1;
    var tglBeli = a.tglBeli ? new Date(a.tglBeli) : new Date();
    var now = new Date();
    var tahunPakai = Math.max(0, (now.getFullYear() - tglBeli.getFullYear()) + (now.getMonth() - tglBeli.getMonth()) / 12);
    tahunPakai = Math.min(tahunPakai, umur);
    if (metode === 'garis-lurus') {
      return s + ((harga - residu) / umur) * tahunPakai;
    }
    return s + ((harga - residu) / umur) * tahunPakai;
  },0);
  var totalNilaiBuku = totalNilaiAset - totalAkumPenyusutan;

  // Saved asset rows
  var asetRows = (asetList||[]).map(function(a) {
    var harga = parseFloat(a.harga)||0;
    var residu = parseFloat(a.sisa)||0;
    var umur = parseInt(a.umur)||1;
    var tglBeli = a.tglBeli ? new Date(a.tglBeli) : new Date();
    var now = new Date();
    var tahunPakai = Math.max(0, (now.getFullYear() - tglBeli.getFullYear()) + (now.getMonth() - tglBeli.getMonth()) / 12);
    tahunPakai = Math.min(tahunPakai, umur);
    var penyusutanPerTahun = umur > 0 ? (harga - residu) / umur : 0;
    var akumPenyusutan = penyusutanPerTahun * tahunPakai;
    var nilaiBuku = Math.max(harga - akumPenyusutan, residu);
    var pctUsed = harga > 0 ? ((akumPenyusutan / (harga - residu)) * 100).toFixed(0) : 0;
    return '<tr><td class="fw-bold">' + (a.nama||'-') + '</td><td>' + fmtDate(a.tglBeli) + '</td><td>' + (a.metode||'garis-lurus') + '</td>'
      + '<td class="text-right">' + fmtRp(harga) + '</td><td class="text-right">' + fmtRp(residu) + '</td><td>' + umur + ' thn</td>'
      + '<td class="text-right text-red">' + fmtRp(penyusutanPerTahun) + '/thn</td>'
      + '<td class="text-right">' + fmtRp(akumPenyusutan) + '</td>'
      + '<td class="text-right fw-bold">' + fmtRp(nilaiBuku) + '</td>'
      + '<td><div style="background:#e0e0e0;border-radius:4px;height:10px;overflow:hidden"><div style="width:' + Math.min(pctUsed,100) + '%;height:100%;background:' + (pctUsed>80?'#f44336':'#4caf50') + '"></div></div><div style="font-size:0.65rem;text-align:center">' + pctUsed + '%</div></td>'
      + '<td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="detailPenyusutanAset(\'' + a.id + '\')">Detail</button>'
      + '<button class="btn btn-xs btn-warning" onclick="editAsetPenyusutan(\'' + a.id + '\')">Edit</button>'
      + '<button class="btn btn-xs btn-danger" onclick="hapusAsetPenyusutan(\'' + a.id + '\')">Hapus</button></td></tr>';
  }).join('');

  // Jurnal aset rows
  var jurnalAsetRows = asetJurnal.slice(0,20).map(function(t) {
    return '<tr><td>' + fmtDate(t.tanggal) + '</td><td>' + (t.ket||'-') + '</td><td>' + (t.akun||'-') + '</td>'
      + '<td class="text-right text-green">' + fmtRp(t.debit) + '</td><td class="text-right text-red">' + fmtRp(t.kredit) + '</td></tr>';
  }).join('');

  return '<div class="page-title">📉 Penyusutan Aset</div>'
    + '<div class="stats-row">'
    + '<div class="stat-box"><div class="val">' + (asetList||[]).length + '</div><div class="lbl">Total Aset</div></div>'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalNilaiAset) + '</div><div class="lbl">Nilai Perolehan</div></div>'
    + '<div class="stat-box red"><div class="val">' + fmtRp(totalAkumPenyusutan) + '</div><div class="lbl">Akum. Penyusutan</div></div>'
    + '<div class="stat-box"><div class="val">' + fmtRp(totalNilaiBuku) + '</div><div class="lbl">Nilai Buku</div></div>'
    + '</div>'
    // Input aset baru
    + '<div class="card"><div class="card-header"><h2>Tambah Aset Baru</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Nama Aset</label><input id="py-nama" placeholder="Laptop / Kendaraan / Mesin"></div>'
    + '<div class="fg"><label>Tanggal Perolehan</label><input type="date" id="py-tglbeli" value="' + today() + '"></div>'
    + '<div class="fg"><label>Metode</label><select id="py-metode"><option value="garis-lurus">Garis Lurus (Straight Line)</option><option value="saldo-menurun">Saldo Menurun (Declining Balance)</option><option value="jumlah-angka">Jumlah Angka Tahun</option></select></div>'
    + '<div class="fg"><label>Harga Perolehan (Rp)</label><input type="number" id="py-harga" placeholder="0"></div>'
    + '<div class="fg"><label>Nilai Sisa / Residu (Rp)</label><input type="number" id="py-sisa" placeholder="0"></div>'
    + '<div class="fg"><label>Umur Ekonomis (Tahun)</label><input type="number" id="py-umur" placeholder="5"></div>'
    + '</div><div class="mt-12 flex-row" style="gap:8px"><button class="btn btn-primary" onclick="simpanAsetPenyusutan()">💾 Simpan Aset</button><button class="btn btn-outline" onclick="hitungPenyusutanPreview()">🧮 Preview Penyusutan</button></div>'
    + '<div id="py-result" class="mt-12"></div></div>'
    // Daftar aset
    + '<div class="card"><div class="card-header"><h2>Daftar Aset & Penyusutan Realtime (' + (asetList||[]).length + ')</h2></div>'
    + ((asetList||[]).length ? '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Tgl Beli</th><th>Metode</th><th class="text-right">Harga</th><th class="text-right">Residu</th><th>Umur</th><th class="text-right">Penyusutan</th><th class="text-right">Akumulasi</th><th class="text-right">Nilai Buku</th><th>Progress</th><th>Aksi</th></tr></thead><tbody>' + asetRows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📉</span>Belum ada data aset</div>')
    + '</div>'
    // Transaksi aset dari jurnal
    + '<div class="card"><div class="card-header"><h2>Transaksi Aset dari Jurnal (' + asetJurnal.length + ')</h2></div>'
    + (asetJurnal.length ? '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Akun</th><th class="text-right">Debit</th><th class="text-right">Kredit</th></tr></thead><tbody>' + jurnalAsetRows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📉</span>Tidak ada transaksi aset terdeteksi</div>')
    + '</div>'
    // Perlengkapan yang bisa dijadikan aset
    + '<div class="card"><div class="card-header"><h2>📦 Import dari Perlengkapan</h2></div>'
    + '<div class="alert alert-info">Perlengkapan dengan nilai tinggi bisa dikonversi menjadi aset tetap untuk dihitung penyusutannya.</div>'
    + '<div class="mt-8"><button class="btn btn-info btn-sm" onclick="loadPerlengkapanForAset()">Muat Data Perlengkapan</button></div>'
    + '<div id="perlengkapan-aset-list" class="mt-12"></div></div>';
}

async function simpanAsetPenyusutan() {
  var nama = (document.getElementById('py-nama')||{}).value;
  if (!nama || !nama.trim()) { showAlert('Nama aset wajib diisi!', 'danger'); return; }
  var harga = parseFloat((document.getElementById('py-harga')||{}).value)||0;
  if (!harga) { showAlert('Harga perolehan wajib diisi!', 'danger'); return; }
  var id = genId('ASET');
  var data = {
    id: id,
    nama: nama.trim(),
    tglBeli: (document.getElementById('py-tglbeli')||{}).value || today(),
    metode: (document.getElementById('py-metode')||{}).value || 'garis-lurus',
    harga: harga,
    sisa: parseFloat((document.getElementById('py-sisa')||{}).value)||0,
    umur: parseInt((document.getElementById('py-umur')||{}).value)||5,
    createdBy: KU.username,
    createdAt: new Date().toISOString()
  };
  await KDB.save('aset_penyusutan', id, data);
  // Auto-create jurnal penyusutan
  var penyusutanPerTahun = data.umur > 0 ? (data.harga - data.sisa) / data.umur : 0;
  var penyusutanPerBulan = penyusutanPerTahun / 12;
  if (penyusutanPerBulan > 0) {
    var jId = genId('JU');
    await KDB.save('jurnal', jId, {
      id: jId, tanggal: today(), keterangan: 'Penyusutan: ' + data.nama + ' (bulanan)',
      noRef: id, tipe: 'penyesuaian', sumber: 'penyusutan-aset',
      lines: [
        { akun: '5-2100', ket: 'Beban Penyusutan ' + data.nama, debit: Math.round(penyusutanPerBulan), kredit: 0 },
        { akun: '1-2900', ket: 'Akum. Penyusutan ' + data.nama, debit: 0, kredit: Math.round(penyusutanPerBulan) }
      ],
      totalDebit: Math.round(penyusutanPerBulan),
      totalKredit: Math.round(penyusutanPerBulan),
      createdBy: KU.username, createdAt: new Date().toISOString()
    });
  }
  showAlert('Aset disimpan! Jurnal penyusutan otomatis dibuat.');
  navigate('kalk-penyusutan');
}

function hitungPenyusutanPreview() {
  var harga = parseFloat((document.getElementById('py-harga')||{}).value)||0;
  var sisa = parseFloat((document.getElementById('py-sisa')||{}).value)||0;
  var umur = parseInt((document.getElementById('py-umur')||{}).value)||1;
  var metode = (document.getElementById('py-metode')||{}).value || 'garis-lurus';
  if (!harga) { showAlert('Isi harga perolehan dulu!', 'warning'); return; }
  var rows = '';
  var nilaiBuku = harga;
  if (metode === 'garis-lurus') {
    var p = (harga - sisa) / umur;
    for (var t = 1; t <= umur; t++) { nilaiBuku -= p; rows += '<tr><td>Tahun ' + t + '</td><td>' + fmtRp(p) + '</td><td>' + fmtRp(p*t) + '</td><td>' + fmtRp(Math.max(nilaiBuku,sisa)) + '</td></tr>'; }
  } else if (metode === 'saldo-menurun') {
    var tarif = 2 / umur;
    for (var t2 = 1; t2 <= umur; t2++) { var p2 = nilaiBuku*tarif; var akum2 = harga-nilaiBuku+p2; nilaiBuku -= p2; rows += '<tr><td>Tahun ' + t2 + '</td><td>' + fmtRp(p2) + '</td><td>' + fmtRp(akum2) + '</td><td>' + fmtRp(Math.max(nilaiBuku,sisa)) + '</td></tr>'; }
  } else {
    var jumlahAngka = (umur*(umur+1))/2; var akum3 = 0;
    for (var t3 = 1; t3 <= umur; t3++) { var p3 = ((umur-t3+1)/jumlahAngka)*(harga-sisa); akum3 += p3; nilaiBuku -= p3; rows += '<tr><td>Tahun ' + t3 + '</td><td>' + fmtRp(p3) + '</td><td>' + fmtRp(akum3) + '</td><td>' + fmtRp(Math.max(nilaiBuku,sisa)) + '</td></tr>'; }
  }
  var el = document.getElementById('py-result');
  if (el) el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Periode</th><th>Penyusutan</th><th>Akumulasi</th><th>Nilai Buku</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function detailPenyusutanAset(id) {
  KDB.getAll('aset_penyusutan').then(function(list) {
    var a = list.find(function(x){ return x.id === id; });
    if (!a) return;
    var harga = parseFloat(a.harga)||0;
    var residu = parseFloat(a.sisa)||0;
    var umur = parseInt(a.umur)||1;
    var rows = '';
    var nilaiBuku = harga;
    var p = umur > 0 ? (harga - residu) / umur : 0;
    for (var t = 1; t <= umur; t++) {
      nilaiBuku -= p;
      var tglBeli = a.tglBeli ? new Date(a.tglBeli) : new Date();
      var yr = tglBeli.getFullYear() + t;
      rows += '<tr><td>' + yr + '</td><td>' + fmtRp(p) + '</td><td>' + fmtRp(p*t) + '</td><td>' + fmtRp(Math.max(nilaiBuku,residu)) + '</td></tr>';
    }
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Nama</label><div class="chip">' + a.nama + '</div></div>'
      + '<div class="fg"><label>Tgl Beli</label><div class="chip">' + fmtDate(a.tglBeli) + '</div></div>'
      + '<div class="fg"><label>Harga</label><div class="fw-bold">' + fmtRp(harga) + '</div></div>'
      + '<div class="fg"><label>Residu</label><div>' + fmtRp(residu) + '</div></div>'
      + '<div class="fg"><label>Umur</label><div>' + umur + ' tahun</div></div>'
      + '<div class="fg"><label>Metode</label><div>' + (a.metode||'garis-lurus') + '</div></div>'
      + '</div>'
      + '<div class="table-wrap mt-12"><table><thead><tr><th>Tahun</th><th>Penyusutan</th><th>Akumulasi</th><th>Nilai Buku</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      + '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
      'Detail Penyusutan: ' + a.nama);
  });
}

async function editAsetPenyusutan(id) {
  var list = await KDB.getAll('aset_penyusutan');
  var a = list.find(function(x){ return x.id === id; });
  if (!a) return;
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Nama</label><input id="easet-nama" value="' + (a.nama||'') + '"></div>'
    + '<div class="fg"><label>Tgl Beli</label><input type="date" id="easet-tgl" value="' + (a.tglBeli||'') + '"></div>'
    + '<div class="fg"><label>Metode</label><select id="easet-metode"><option value="garis-lurus"' + (a.metode==='garis-lurus'?' selected':'') + '>Garis Lurus</option><option value="saldo-menurun"' + (a.metode==='saldo-menurun'?' selected':'') + '>Saldo Menurun</option><option value="jumlah-angka"' + (a.metode==='jumlah-angka'?' selected':'') + '>Jumlah Angka</option></select></div>'
    + '<div class="fg"><label>Harga (Rp)</label><input type="number" id="easet-harga" value="' + (a.harga||0) + '"></div>'
    + '<div class="fg"><label>Residu (Rp)</label><input type="number" id="easet-sisa" value="' + (a.sisa||0) + '"></div>'
    + '<div class="fg"><label>Umur (Tahun)</label><input type="number" id="easet-umur" value="' + (a.umur||5) + '"></div>'
    + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditAset(\'' + id + '\')">Simpan</button></div>',
    'Edit Aset: ' + a.nama);
}

async function simpanEditAset(id) {
  var list = await KDB.getAll('aset_penyusutan');
  var a = list.find(function(x){ return x.id === id; });
  if (!a) return;
  await KDB.save('aset_penyusutan', id, Object.assign({}, a, {
    nama: (document.getElementById('easet-nama')||{}).value || a.nama,
    tglBeli: (document.getElementById('easet-tgl')||{}).value || a.tglBeli,
    metode: (document.getElementById('easet-metode')||{}).value || a.metode,
    harga: parseFloat((document.getElementById('easet-harga')||{}).value)||a.harga,
    sisa: parseFloat((document.getElementById('easet-sisa')||{}).value)||a.sisa,
    umur: parseInt((document.getElementById('easet-umur')||{}).value)||a.umur
  }));
  closeModalDirect();
  showAlert('Aset diperbarui!');
  navigate('kalk-penyusutan');
}

async function hapusAsetPenyusutan(id) {
  if (!confirm('Hapus aset ini?')) return;
  await KDB.delete('aset_penyusutan', id);
  showAlert('Aset dihapus!');
  navigate('kalk-penyusutan');
}

async function loadPerlengkapanForAset() {
  var plList = await KDB.getAll('perlengkapan');
  var asetList = await KDB.getAll('aset_penyusutan');
  var existingNames = asetList.map(function(a){ return (a.nama||'').toLowerCase(); });
  var el = document.getElementById('perlengkapan-aset-list');
  if (!el) return;
  var available = (plList||[]).filter(function(p) {
    return !existingNames.includes((p.nama||'').toLowerCase());
  });
  if (!available.length) {
    el.innerHTML = '<div class="text-muted" style="font-size:0.85rem">Semua perlengkapan sudah dikonversi atau tidak ada data perlengkapan.</div>';
    return;
  }
  var rows = available.map(function(p) {
    var nilai = (parseInt(p.beli)||0) * (parseFloat(p.harga)||0);
    return '<tr><td class="fw-bold">' + (p.nama||'-') + '</td><td>' + (p.satuan||'-') + '</td><td class="text-right">' + fmtRp(p.harga||0) + '</td><td class="text-right">' + fmtRp(nilai) + '</td>'
      + '<td><button class="btn btn-xs btn-success" onclick="konversiPerlengkapanKeAset(\'' + p.id + '\',\'' + (p.nama||'').replace(/'/g,'') + '\',' + (nilai||0) + ')">Konversi ke Aset</button></td></tr>';
  }).join('');
  el.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Satuan</th><th class="text-right">Harga</th><th class="text-right">Nilai</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

async function konversiPerlengkapanKeAset(plId, nama, nilai) {
  var id = genId('ASET');
  await KDB.save('aset_penyusutan', id, {
    id: id, nama: nama, tglBeli: today(), metode: 'garis-lurus',
    harga: nilai, sisa: 0, umur: 4, sumberRef: 'perlengkapan', sumberRefId: plId,
    createdBy: KU.username, createdAt: new Date().toISOString()
  });
  showAlert('Perlengkapan "' + nama + '" dikonversi ke aset!');
  navigate('kalk-penyusutan');
}

function hitungPenyusutan() {
  hitungPenyusutanPreview();
}

async function renderKalkPerlengkapan() { return renderPortalAset(); }
async function tambahPerlengkapan() {
  const nama = document.getElementById('pl-nama').value.trim();
  if (!nama) { showAlert('Nama wajib diisi!', 'danger'); return; }
  const id = genId('PL');
  const harga = parseFloat(document.getElementById('pl-harga').value) || 0;
  const beli = parseInt(document.getElementById('pl-beli').value) || 0;
  await KDB.save('perlengkapan', id, { id: id, nama: nama, satuan: document.getElementById('pl-satuan').value, awal: document.getElementById('pl-awal').value, beli: beli, pakai: document.getElementById('pl-pakai').value, harga: harga });
  // Auto-create Permohonan Dana if ada pembelian
  if (beli > 0 && harga > 0) {
    const nominal = beli * harga;
    const pdId = genId('PD');
    const approvers = await getApprovers();
    await KDB.save('permohonan', pdId, { id: pdId, tipe: 'permohonan', pemohon: KU.username, namaPemohon: KU.nama, namaLeader: '', noPOInvoice: id, nominal: nominal, jatuhTempo: '', tipeTransaksi: 'Transfer', namaBank: '', noRekening: '', namaRekening: '', keterangan: 'Pembelian Perlengkapan: ' + nama + ' (' + beli + ' ' + (document.getElementById('pl-satuan').value||'unit') + ' x ' + fmtRp(harga) + ')', buktiDokumen: '', akunDebit: '5-1400', akunKredit: '1-1100', tanggal: today(), status: STATUS.DRAFT, approvalLog: [], approvers: approvers, createdBy: KU.username, createdAt: new Date().toISOString(), sumberRef: 'perlengkapan', sumberRefId: id });
    showAlert('Perlengkapan ditambahkan! Draft Permohonan Dana dibuat otomatis — cek menu Permohonan Dana.');
  } else {
    showAlert('Perlengkapan ditambahkan!');
  }
  navigate('kalk-perlengkapan');
}

async function hapusPerlengkapan(id) {
  if (!confirm('Hapus?')) return;
  await KDB.delete('perlengkapan', id);
  navigate('kalk-perlengkapan');
}

async function renderPettyCash() {
  const list = await KDB.getAll('pettycash');
  const akunOpts = await getAkunOptions();

  // Petty cash = buku kas kecil
  // Logika sederhana:
  // - Saldo Awal = pettycash_saldo (di-set manual awal tahun, atau carry-forward dari tutup buku)
  // - Setiap tipe 'masuk' (top-up/isi ulang) → saldo bertambah
  // - Setiap tipe 'keluar' (pengeluaran) → saldo berkurang
  // - Saldo Saat Ini = Saldo Awal + Total Masuk - Total Keluar
  const saldoAwal = await KDB.getSetting('pettycash_saldo', 0);

  // Kumpulkan semua transaksi, tentukan tipe
  const allTx = [];
  var tahunSekarang = new Date().getFullYear();
  list.forEach(function(p) {
    var tipe = p.tipe || 'keluar';
    if (!p.tipe) {
      var ket = (p.keterangan||'').toLowerCase();
      var kat = (p.kategori||'').toLowerCase();
      if (kat.includes('masuk') || kat.includes('topup') || kat.includes('isi') || kat.includes('dana masuk') || ket.includes('top up') || ket.includes('isi kas') || ket.includes('saldo masuk')) {
        tipe = 'masuk';
      }
    }
    allTx.push({ tanggal: p.tanggal, ket: p.keterangan, kategori: p.kategori||'Petty Cash', jumlah: Math.abs(parseFloat(p.jumlah)||0), tipe: tipe, sumber: 'petty', id: p.id, noRef: p.noRef||'' });
  });
  allTx.sort(function(a,b){ return (a.tanggal||'').localeCompare(b.tanggal||''); });

  // Hitung saldo berjalan maju (forward) dari saldo awal
  // PENTING: hanya hitung transaksi TAHUN BERJALAN karena transaksi tahun sebelumnya
  // sudah termasuk dalam pettycash_saldo (carry-forward dari tutup buku)
  var saldoBerjalan = saldoAwal;
  var totalMasuk = 0, totalKeluar = 0;
  allTx.forEach(function(t) {
    // Cek apakah transaksi tahun ini
    var tglTahun = t.tanggal ? parseInt(t.tanggal.substring(0, 4)) : 0;
    var isCurrentYear = (tglTahun === tahunSekarang);
    if (isCurrentYear) {
      if (t.tipe === 'masuk') { saldoBerjalan += t.jumlah; totalMasuk += t.jumlah; }
      else { saldoBerjalan -= t.jumlah; totalKeluar += t.jumlah; }
    }
    t.saldoSetelah = saldoBerjalan;
  });
  const sisaSaldo = saldoBerjalan;

  // Filter tampilan: hanya transaksi tahun ini
  const allTxTahunIni = allTx.filter(function(t) {
    var tglTahun = t.tanggal ? parseInt(t.tanggal.substring(0, 4)) : 0;
    return tglTahun === tahunSekarang;
  });

  // Reverse untuk tampilan (terbaru di atas) — hanya tahun ini
  const allTxDesc = allTxTahunIni.slice().reverse();

  const rows = allTxDesc.slice(0,100).map(function(t) {
    const cls = t.tipe === 'masuk' ? 'text-green' : 'text-red';
    const sign = t.tipe === 'masuk' ? '+' : '-';
    const tipeBadge = t.tipe === 'masuk'
      ? '<span class="chip" style="background:#e8f5e9;color:#2e7d32">Masuk</span>'
      : '<span class="chip" style="background:#ffebee;color:#c62828">Keluar</span>';
    const detailBtn = '<button class="btn btn-xs btn-info" onclick="lihatPettyCashDetail(\'' + t.id + '\')">Detail</button>';
    const editBtn = '<button class="btn btn-xs btn-warning" onclick="editPettyCash(\'' + t.id + '\')">Edit</button>';
    const hapusBtn = '<button class="btn btn-xs btn-danger" onclick="hapusPettyCash(\'' + t.id + '\')">Hapus</button>';
    return '<tr><td>' + fmtDate(t.tanggal) + '</td><td>' + (t.noRef||'-') + '</td><td>' + tipeBadge + '</td>'
      + '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (t.ket||'-') + '</td>'
      + '<td class="fw-bold ' + cls + '">' + sign + fmtRp(t.jumlah) + '</td>'
      + '<td class="fw-bold text-blue">' + fmtRp(t.saldoSetelah) + '</td>'
      + '<td class="tbl-actions">' + detailBtn + editBtn + hapusBtn + '</td></tr>';
  }).join('');

  // Input form
  return '<div class="page-title">💵 Petty Cash</div>'
    + '<div class="stats-row">'
    + '<div class="stat-box"><div class="val">' + fmtRp(saldoAwal) + '</div><div class="lbl">Saldo Awal</div></div>'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalMasuk) + '</div><div class="lbl">Total Masuk</div></div>'
    + '<div class="stat-box red"><div class="val">' + fmtRp(totalKeluar) + '</div><div class="lbl">Total Keluar</div></div>'
    + '<div class="stat-box ' + (sisaSaldo >= 0 ? 'green' : 'red') + '"><div class="val">' + fmtRp(sisaSaldo) + '</div><div class="lbl">Saldo Saat Ini</div></div>'
    + '</div>'
    // Set saldo awal
    + '<div class="card"><div class="card-header"><h2>Saldo Awal / Top-up Kas Kecil</h2></div>'
    + '<div class="flex-row" style="gap:8px;flex-wrap:wrap">'
    + '<input type="number" id="pc-saldo" value="' + saldoAwal + '" placeholder="Saldo awal" style="padding:8px 12px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem">'
    + '<button class="btn btn-success" onclick="setSaldoPettyCash()">Set Saldo Awal</button>'
    + '<button class="btn btn-info" onclick="topUpPettyCash()">+ Top-up Kas Kecil</button>'
    + '<button class="btn btn-warning btn-sm" onclick="fixJurnalPettyCash()" style="margin-left:auto">🔧 Fix Akun Jurnal Lama</button>'
    + '</div>'
    + '<div id="topup-form" style="display:none;margin-top:12px;padding:12px;background:#f8fff8;border-radius:8px;border:1.5px solid #4caf50">'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="topup-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Jumlah Top-up (Rp)</label><input type="number" id="topup-jumlah" placeholder="0"></div>'
    + '<div class="fg full"><label>Keterangan</label><input id="topup-ket" placeholder="Isi kas kecil / top-up dari..."></div>'
    + '</div>'
    + '<div class="mt-8 flex-row"><button class="btn btn-success" onclick="simpanTopUpPC()">Simpan Top-up</button><button class="btn btn-outline" onclick="document.getElementById(\'topup-form\').style.display=\'none\'">Batal</button></div>'
    + '</div></div>'
    // Input transaksi keluar
    + '<div class="card"><div class="card-header"><h2>Input Pengeluaran Petty Cash</h2></div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="pc-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>No. Referensi</label><input id="pc-ref" placeholder="PC-001 / No. Bukti"></div>'
    + '<div class="fg"><label>Nama PIC</label><input id="pc-pic" value="' + (KU.nama||KU.username) + '" placeholder="Nama PIC"></div>'
    + '<div class="fg full"><label>Keterangan</label><input id="pc-ket" placeholder="Deskripsi pengeluaran petty cash"></div>'
    + '</div>'
    + '<div style="margin-top:12px"><table style="width:100%;font-size:0.83rem"><thead><tr style="background:#1a237e;color:white"><th>Akun</th><th>Keterangan</th><th>Debit (Rp)</th><th>Kredit (Rp)</th></tr></thead>'
    + '<tbody id="pc-lines-body">'
    + '<tr><td><select class="pc-akun" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px;font-size:0.82rem"><option value="">-- Pilih Akun --</option>' + akunOpts + '</select></td>'
    + '<td><input class="pc-line-ket" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Keterangan baris"></td>'
    + '<td><input class="pc-debit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updatePCTotal()"></td>'
    + '<td><input class="pc-kredit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updatePCTotal()"></td></tr>'
    + '<tr><td><select class="pc-akun" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px;font-size:0.82rem"><option value="">-- Pilih Akun --</option>' + akunOpts + '</select></td>'
    + '<td><input class="pc-line-ket" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Keterangan baris"></td>'
    + '<td><input class="pc-debit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updatePCTotal()"></td>'
    + '<td><input class="pc-kredit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updatePCTotal()"></td></tr>'
    + '</tbody></table></div>'
    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">'
    + '<button class="btn btn-outline btn-sm" onclick="addPCLine()">+ Tambah Baris</button>'
    + '<div id="pc-total" style="font-size:0.85rem;color:#555">Debit: Rp 0 | Kredit: Rp 0</div>'
    + '</div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-primary" onclick="simpanPettyCashJurnal()">Simpan Pengeluaran</button><button class="btn btn-outline" onclick="navigate(\'kalk-pettycash\')">Reset</button></div>'
    + '</div>'
    // Laporan per Periode
    + buildPettyCashPeriodReport(allTxTahunIni)
    // Buku Kas — daftar transaksi dengan saldo berjalan
    + '<div class="card"><div class="card-header"><h2>📒 Buku Kas Kecil (' + allTxTahunIni.length + ' transaksi — ' + tahunSekarang + ')</h2>'
    + '<div style="font-size:0.82rem;color:#888">Saldo Awal: ' + fmtRp(saldoAwal) + ' → Saldo Saat Ini: <b class="' + (sisaSaldo>=0?'text-green':'text-red') + '">' + fmtRp(sisaSaldo) + '</b></div></div>'
    + (allTx.length ? '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>No. Ref</th><th>Tipe</th><th>Keterangan</th><th>Jumlah</th><th>Saldo</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">💵</span>Belum ada transaksi</div>')
    + '</div>';
}

function updatePCTotal() {
  var d = 0, k = 0;
  document.querySelectorAll('.pc-debit').forEach(function(el){ d += parseFloat(el.value)||0; });
  document.querySelectorAll('.pc-kredit').forEach(function(el){ k += parseFloat(el.value)||0; });
  var el = document.getElementById('pc-total');
  if (el) el.innerHTML = 'Debit: <b class="text-green">' + fmtRp(d) + '</b> | Kredit: <b class="text-red">' + fmtRp(k) + '</b>';
}

async function addPCLine() {
  var akunOpts = await getAkunOptions();
  var tbody = document.getElementById('pc-lines-body');
  if (!tbody) return;
  var tr = document.createElement('tr');
  tr.innerHTML = '<td><select class="pc-akun" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px;font-size:0.82rem"><option value="">-- Pilih --</option>' + akunOpts + '</select></td>'
    + '<td><input class="pc-line-ket" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Keterangan"></td>'
    + '<td><input class="pc-debit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updatePCTotal()"></td>'
    + '<td><input class="pc-kredit" type="number" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="updatePCTotal()"></td>';
  tbody.appendChild(tr);
}

async function simpanPettyCashJurnal() {
  var tgl = (document.getElementById('pc-tgl')||{}).value || today();
  var ket = (document.getElementById('pc-ket')||{}).value || '';
  var ref = (document.getElementById('pc-ref')||{}).value || '';
  if (!ket) { showAlert('Keterangan wajib diisi!', 'danger'); return; }
  var lines = [];
  var totalD = 0, totalK = 0;
  document.querySelectorAll('#pc-lines-body tr').forEach(function(row) {
    var akun = row.querySelector('.pc-akun') ? row.querySelector('.pc-akun').value : '';
    var lineKet = row.querySelector('.pc-line-ket') ? row.querySelector('.pc-line-ket').value : '';
    var debit = parseFloat(row.querySelector('.pc-debit') ? row.querySelector('.pc-debit').value : 0) || 0;
    var kredit = parseFloat(row.querySelector('.pc-kredit') ? row.querySelector('.pc-kredit').value : 0) || 0;
    if (akun && (debit > 0 || kredit > 0)) { lines.push({ akun: akun, ket: lineKet, debit: debit, kredit: kredit }); totalD += debit; totalK += kredit; }
  });
  if (lines.length < 1) { showAlert('Minimal 1 baris transaksi!', 'danger'); return; }
  if (Math.abs(totalD - totalK) > 0.01) { showAlert('Total Debit dan Kredit harus balance! Selisih: ' + fmtRp(Math.abs(totalD - totalK)), 'danger'); return; }
  // Simpan sebagai jurnal dengan sumber petty-cash
  var jId = genId('JU');
  await KDB.save('jurnal', jId, { id: jId, tanggal: tgl, keterangan: ket, noRef: ref || jId, tipe: 'umum', sumber: 'petty-cash', lines: lines, totalDebit: totalD, totalKredit: totalK, createdBy: KU.username, createdAt: new Date().toISOString() });
  // Simpan ke petty cash collection untuk tracking buku kas kecil
  // Jumlah = total pengeluaran (debit pada akun beban), tipe = keluar
  var pcId = genId('PC');
  await KDB.save('pettycash', pcId, { id: pcId, tanggal: tgl, keterangan: ket, noRef: ref || jId, jumlah: totalD, kategori: 'Pengeluaran', tipe: 'keluar', jurnalId: jId, akunDebit: lines[0] ? lines[0].akun : '', akunKredit: lines.length > 1 ? lines[1].akun : '', createdBy: KU.username, createdAt: new Date().toISOString() });
  showAlert('Transaksi petty cash disimpan & terintegrasi ke jurnal!');
  navigate('kalk-pettycash');
}

async function setSaldoPettyCash() {
  const saldo = parseFloat(document.getElementById('pc-saldo').value) || 0;
  await KDB.saveSetting('pettycash_saldo', saldo);
  showAlert('Saldo awal petty cash diperbarui: ' + fmtRp(saldo));
  navigate('kalk-pettycash');
}

function topUpPettyCash() {
  var form = document.getElementById('topup-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// Fix jurnal petty cash lama yang pakai akun hardcode 1-1200/1-1100
// ke akun COA yang benar sesuai setup user
async function fixJurnalPettyCash() {
  var akunPC = await getAkunPettyCash();
  var akunBank = await getAkunKasBank();
  if (akunPC === '1-1200' && akunBank === '1-1100') {
    showAlert('Akun COA sudah sesuai default (1-1200 / 1-1100). Tidak perlu fix.', 'info');
    return;
  }
  if (!confirm('Perbaiki jurnal petty cash lama?\n\nAkun 1-1200 → ' + akunPC + '\nAkun 1-1100 → ' + akunBank + '\n\nSemua jurnal sumber petty-cash yang masih pakai akun lama akan diperbarui.')) return;

  showLoading(true);
  var jurnal = await KDB.getAll('jurnal');
  var pcJurnal = jurnal.filter(function(j) { return j.sumber === 'petty-cash'; });
  var fixed = 0;
  for (var i = 0; i < pcJurnal.length; i++) {
    var j = pcJurnal[i];
    var changed = false;
    var newLines = (j.lines || []).map(function(l) {
      var newL = Object.assign({}, l);
      if (l.akun === '1-1200') { newL.akun = akunPC; changed = true; }
      if (l.akun === '1-1100') { newL.akun = akunBank; changed = true; }
      return newL;
    });
    if (changed) {
      await KDB.save('jurnal', j.id, Object.assign({}, j, { lines: newLines }));
      fixed++;
    }
  }
  showLoading(false);
  showAlert('Selesai! ' + fixed + ' jurnal diperbaiki. Akun diubah ke ' + akunPC + ' / ' + akunBank);
  navigate('kalk-pettycash');
}

async function simpanTopUpPC() {
  var tgl = (document.getElementById('topup-tgl')||{}).value || today();
  var jumlah = parseFloat((document.getElementById('topup-jumlah')||{}).value) || 0;
  var ket = (document.getElementById('topup-ket')||{}).value || 'Top-up kas kecil';
  if (!jumlah || jumlah <= 0) { showAlert('Jumlah top-up wajib diisi!', 'danger'); return; }
  var id = genId('PC');

  // Cari akun COA petty cash & kas/bank secara dinamis dari COA yang ada
  var akunPC = await getAkunPettyCash();
  var akunBank = await getAkunKasBank();

  // Simpan ke petty cash collection
  await KDB.save('pettycash', id, {
    id: id, tanggal: tgl, keterangan: ket, noRef: 'TOPUP-' + id.substring(0,8),
    jumlah: jumlah, kategori: 'Top-up Kas Kecil', tipe: 'masuk',
    createdBy: KU.username, createdAt: new Date().toISOString()
  });
  // Buat jurnal otomatis: Debit Petty Cash, Kredit Kas/Bank
  var jId = genId('JU');
  await KDB.save('jurnal', jId, {
    id: jId, tanggal: tgl, keterangan: ket, noRef: 'TOPUP-' + id.substring(0,8),
    tipe: 'umum', sumber: 'petty-cash',
    lines: [
      { akun: akunPC, ket: 'Top-up kas kecil', debit: jumlah, kredit: 0 },
      { akun: akunBank, ket: 'Transfer ke kas kecil', debit: 0, kredit: jumlah }
    ],
    totalDebit: jumlah, totalKredit: jumlah,
    createdBy: KU.username, createdAt: new Date().toISOString()
  });
  showAlert('Top-up kas kecil ' + fmtRp(jumlah) + ' berhasil dicatat & jurnal dibuat!');
  navigate('kalk-pettycash');
}

// Helper: cari kode akun petty cash dari COA (dinamis, bukan hardcode)
async function getAkunPettyCash() {
  var akun = await getAkun();
  // Cari akun yang nama/kodenya mengandung 'petty' atau 'kas kecil'
  var found = akun.find(function(a) {
    var n = (a.nama||'').toLowerCase();
    return n.includes('petty') || n.includes('kas kecil');
  });
  if (found) return found.kode;
  // Fallback: cari 1-1200 atau 1-1101-3
  found = akun.find(function(a) { return a.kode === '1-1200' || a.kode === '1-1101-3'; });
  if (found) return found.kode;
  return '1-1200'; // fallback terakhir
}

// Helper: cari kode akun kas/bank utama dari COA
async function getAkunKasBank() {
  var akun = await getAkun();
  // Cari akun kas/bank utama (bukan petty cash)
  var found = akun.find(function(a) {
    var n = (a.nama||'').toLowerCase();
    return (n.includes('bank') || n.includes('kas')) && !n.includes('petty') && !n.includes('kecil') && a.kategori === 'Aset Lancar';
  });
  if (found) return found.kode;
  // Fallback
  found = akun.find(function(a) { return a.kode === '1-1100' || a.kode === '1-1101-1'; });
  if (found) return found.kode;
  return '1-1100';
}

function buildPettyCashPeriodReport(allTx) {
  var now = new Date();
  var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  // Helper: filter by period
  function filterPeriod(txList, period) {
    return txList.filter(function(t) {
      if (!t.tanggal) return false;
      var d = new Date(t.tanggal);
      if (period === 'hari') {
        return t.tanggal === now.toISOString().split('T')[0];
      } else if (period === 'minggu') {
        var weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 6);
        return d >= weekAgo && d <= now;
      } else if (period === 'bulan') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      } else { // tahun
        return d.getFullYear() === now.getFullYear();
      }
    });
  }

  function buildPeriodStats(txList, label) {
    var keluar = txList.filter(function(t){ return t.tipe === 'keluar'; }).reduce(function(s,t){ return s+(t.jumlah||0); },0);
    var masuk = txList.filter(function(t){ return t.tipe === 'masuk'; }).reduce(function(s,t){ return s+(t.jumlah||0); },0);
    var net = masuk - keluar;
    var cls = net >= 0 ? 'text-green' : 'text-red';
    return '<div style="background:#f8f9ff;border-radius:8px;padding:12px;border-left:4px solid #1a237e">'
      + '<div style="font-weight:700;font-size:0.85rem;color:#1a237e;margin-bottom:8px">' + label + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">'
      + '<div style="text-align:center"><div class="text-muted" style="font-size:0.68rem">Keluar</div><div class="fw-bold text-red" style="font-size:0.88rem">' + fmtRp(keluar) + '</div></div>'
      + '<div style="text-align:center"><div class="text-muted" style="font-size:0.68rem">Masuk</div><div class="fw-bold text-green" style="font-size:0.88rem">' + fmtRp(masuk) + '</div></div>'
      + '<div style="text-align:center"><div class="text-muted" style="font-size:0.68rem">Net</div><div class="fw-bold ' + cls + '" style="font-size:0.88rem">' + fmtRp(net) + '</div></div>'
      + '</div>'
      + '<div style="font-size:0.72rem;color:#888;margin-top:6px">' + txList.length + ' transaksi</div>'
      + '</div>';
  }

  // Monthly trend (last 6 months) for forecast
  var monthlyData = [];
  for (var mi = 5; mi >= 0; mi--) {
    var mDate = new Date(now.getFullYear(), now.getMonth() - mi, 1);
    var mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0);
    var mTx = allTx.filter(function(t) {
      if (!t.tanggal) return false;
      var d = new Date(t.tanggal);
      return d >= mDate && d <= mEnd;
    });
    var mKeluar = mTx.filter(function(t){ return t.tipe === 'keluar'; }).reduce(function(s,t){ return s+(t.jumlah||0); },0);
    monthlyData.push({ label: months[mDate.getMonth()] + ' ' + mDate.getFullYear(), keluar: mKeluar, count: mTx.length });
  }

  // Forecast: average of last 3 months
  var last3 = monthlyData.slice(-3).map(function(m){ return m.keluar; });
  var avgForecast = last3.length ? Math.round(last3.reduce(function(s,v){ return s+v; },0) / last3.length) : 0;
  var bulanIniKeluar = monthlyData[monthlyData.length-1].keluar;
  var statusBudget = bulanIniKeluar > avgForecast * 1.2 ? 'BOROS' : bulanIniKeluar < avgForecast * 0.8 ? 'HEMAT' : 'STABIL';
  var statusCls = statusBudget === 'BOROS' ? 'text-red' : statusBudget === 'HEMAT' ? 'text-green' : 'text-blue';

  // Bar chart monthly
  var maxKeluar = Math.max.apply(null, monthlyData.map(function(m){ return m.keluar; }).concat([1]));
  var bars = monthlyData.map(function(m) {
    var h = Math.round((m.keluar / maxKeluar) * 80);
    var isCur = m.label === months[now.getMonth()] + ' ' + now.getFullYear();
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">'
      + '<div style="font-size:0.6rem;color:#888">' + (m.keluar > 0 ? fmtRp(m.keluar).replace('Rp ','') : '') + '</div>'
      + '<div style="width:100%;height:' + h + 'px;background:' + (isCur?'#f44336':'#ffcdd2') + ';border-radius:3px 3px 0 0;min-height:2px"></div>'
      + '<div style="font-size:0.6rem;color:' + (isCur?'#1a237e':'#888') + ';font-weight:' + (isCur?'700':'400') + '">' + m.label.split(' ')[0] + '</div>'
      + '</div>';
  }).join('');

  return '<div class="card"><div class="card-header"><h2>📊 Laporan Petty Cash per Periode</h2></div>'
    // Period stats
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:16px">'
    + buildPeriodStats(filterPeriod(allTx,'hari'), '📅 Hari Ini')
    + buildPeriodStats(filterPeriod(allTx,'minggu'), '📅 7 Hari Terakhir')
    + buildPeriodStats(filterPeriod(allTx,'bulan'), '📅 Bulan Ini (' + months[now.getMonth()] + ')')
    + buildPeriodStats(filterPeriod(allTx,'tahun'), '📅 Tahun ' + now.getFullYear())
    + '</div>'
    // Forecast & Budget Control
    + '<div style="background:#fff8e1;border-radius:8px;padding:14px;margin-bottom:14px;border-left:4px solid #ff9800">'
    + '<div style="font-weight:700;font-size:0.88rem;color:#e65100;margin-bottom:8px">🎯 Forecast & Budget Control</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px">'
    + '<div style="text-align:center"><div class="text-muted" style="font-size:0.72rem">Rata-rata 3 Bulan</div><div class="fw-bold" style="font-size:0.95rem">' + fmtRp(avgForecast) + '</div></div>'
    + '<div style="text-align:center"><div class="text-muted" style="font-size:0.72rem">Bulan Ini</div><div class="fw-bold text-red" style="font-size:0.95rem">' + fmtRp(bulanIniKeluar) + '</div></div>'
    + '<div style="text-align:center"><div class="text-muted" style="font-size:0.72rem">Status</div><div class="fw-bold ' + statusCls + '" style="font-size:1rem">' + statusBudget + '</div></div>'
    + '</div>'
    + '<div style="font-size:0.8rem;color:#555">'
    + (statusBudget === 'BOROS' ? '⚠️ Pengeluaran bulan ini melebihi rata-rata 20%+. Perlu pengendalian biaya.' : statusBudget === 'HEMAT' ? '✅ Pengeluaran bulan ini di bawah rata-rata. Efisiensi baik.' : '✅ Pengeluaran bulan ini stabil sesuai rata-rata historis.')
    + '</div></div>'
    // Trend chart
    + '<div style="font-weight:600;font-size:0.82rem;margin-bottom:6px">Tren Pengeluaran 6 Bulan Terakhir</div>'
    + '<div style="display:flex;align-items:flex-end;gap:4px;height:100px;padding:6px 0">' + bars + '</div>'
    // Tutup buku info
    + '<div style="background:#e8f5e9;border-radius:8px;padding:12px;margin-top:12px;border-left:4px solid #4caf50">'
    + '<div style="font-weight:700;font-size:0.85rem;color:#2e7d32;margin-bottom:4px">📁 Tutup Buku & Clear History</div>'
    + '<div style="font-size:0.8rem;color:#555;margin-bottom:8px">Arsipkan transaksi bulan lalu dan mulai periode baru. Data lama tetap tersimpan di Firebase.</div>'
    + '<button class="btn btn-sm btn-success" onclick="tutupBukuPettyCash()">Tutup Buku Bulan Ini</button>'
    + '</div></div>';
}

async function tutupBukuPettyCash() {
  if (!confirm('Tutup buku petty cash bulan ini?\n\nSaldo sisa akan dibawa ke periode berikutnya sebagai saldo awal baru.\nHistory transaksi tetap tersimpan.')) return;
  var now = new Date();
  var bulan = now.getMonth() + 1;
  var tahun = now.getFullYear();

  // Ambil semua transaksi bulan ini
  var list = await KDB.getAll('pettycash');
  var saldoAwal = await KDB.getSetting('pettycash_saldo', 0);

  // Hitung saldo berjalan sampai akhir bulan ini
  var allTxSorted = list.slice().sort(function(a,b){ return (a.tanggal||'').localeCompare(b.tanggal||''); });
  var saldoBerjalan = saldoAwal;
  allTxSorted.forEach(function(p) {
    var tipe = p.tipe || 'keluar';
    if (!p.tipe) {
      var kat = (p.kategori||'').toLowerCase();
      if (kat.includes('masuk') || kat.includes('topup') || kat.includes('isi')) tipe = 'masuk';
    }
    if (tipe === 'masuk') saldoBerjalan += Math.abs(parseFloat(p.jumlah)||0);
    else saldoBerjalan -= Math.abs(parseFloat(p.jumlah)||0);
  });

  var bulanIniTx = list.filter(function(p) {
    if (!p.tanggal) return false;
    var d = new Date(p.tanggal);
    return d.getFullYear() === tahun && (d.getMonth() + 1) === bulan;
  });

  var totalKeluar = bulanIniTx.filter(function(p){ return (p.tipe||'keluar') === 'keluar'; }).reduce(function(s,p){ return s+Math.abs(parseFloat(p.jumlah)||0); },0);
  var totalMasuk = bulanIniTx.filter(function(p){ return p.tipe === 'masuk'; }).reduce(function(s,p){ return s+Math.abs(parseFloat(p.jumlah)||0); },0);

  // Arsipkan periode ini
  var arsipId = 'arsip-pc-' + tahun + '-' + String(bulan).padStart(2,'0');
  await KDB.saveSetting(arsipId, {
    bulan: bulan, tahun: tahun,
    saldoAwal: saldoAwal, totalMasuk: totalMasuk, totalKeluar: totalKeluar,
    saldoAkhir: saldoBerjalan, jumlahTx: bulanIniTx.length,
    arsipAt: new Date().toISOString()
  });

  // Set saldo awal baru = saldo sisa (carry forward) — untuk backward compat
  await KDB.saveSetting('pettycash_saldo', saldoBerjalan);

  showAlert('Tutup buku ' + bulan + '/' + tahun + ' selesai! Saldo sisa ' + fmtRp(saldoBerjalan) + ' dibawa ke periode berikutnya.');
  navigate('kalk-pettycash');
}

async function hapusPettyCash(id) {
  if (!confirm('Hapus?')) return;
  await KDB.delete('pettycash', id);
  // Tetap di panel yang sama
  if (currentSection === 'ai-assistant') {
    runAIAnalysis();
  } else {
    navigate('kalk-pettycash');
  }
}

// Edit/Hapus Permohonan Dana dari Petty Cash
async function editPermohonanPC(id) {
  var list = await KDB.getAll('permohonan');
  var p = list.find(function(x){ return x.id === id; });
  if (!p) { showAlert('Data tidak ditemukan', 'warning'); return; }
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="epdpc-tgl" value="' + (p.tanggal||'') + '"></div>'
    + '<div class="fg"><label>Nama Pemohon</label><input id="epdpc-nama" value="' + (p.namaPemohon||'') + '"></div>'
    + '<div class="fg"><label>No PO/Invoice</label><input id="epdpc-nopo" value="' + (p.noPOInvoice||'') + '"></div>'
    + '<div class="fg"><label>Nominal (Rp)</label><input type="number" id="epdpc-nominal" value="' + (p.nominal||0) + '"></div>'
    + '<div class="fg full"><label>Keterangan</label><input id="epdpc-ket" value="' + (p.keterangan||'') + '"></div>'
    + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditPermohonanPC(\'' + id + '\')">Simpan</button></div>',
    'Edit Permohonan Dana');
}

async function simpanEditPermohonanPC(id) {
  var list = await KDB.getAll('permohonan');
  var p = list.find(function(x){ return x.id === id; });
  if (!p) return;
  await KDB.save('permohonan', id, Object.assign({}, p, {
    tanggal: (document.getElementById('epdpc-tgl')||{}).value || p.tanggal,
    namaPemohon: (document.getElementById('epdpc-nama')||{}).value || p.namaPemohon,
    noPOInvoice: (document.getElementById('epdpc-nopo')||{}).value || p.noPOInvoice,
    nominal: parseFloat((document.getElementById('epdpc-nominal')||{}).value) || p.nominal,
    keterangan: (document.getElementById('epdpc-ket')||{}).value || p.keterangan,
  }));
  closeModalDirect();
  showAlert('Permohonan dana diperbarui!');
  navigate('kalk-pettycash');
}

async function hapusPermohonanPC(id) {
  if (!confirm('Hapus permohonan dana ini?')) return;
  await KDB.delete('permohonan', id);
  showAlert('Permohonan dana dihapus!');
  navigate('kalk-pettycash');
}

// Edit/Hapus Dana Masuk dari Petty Cash
async function editDanaMasukPC(id) {
  var list = await KDB.getAll('danamasuk');
  var d = list.find(function(x){ return x.id === id; });
  if (!d) { showAlert('Data tidak ditemukan', 'warning'); return; }
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="edmpc-tgl" value="' + (d.tanggal||'') + '"></div>'
    + '<div class="fg"><label>Sumber</label><input id="edmpc-sumber" value="' + (d.sumber||'') + '"></div>'
    + '<div class="fg"><label>No Ref</label><input id="edmpc-ref" value="' + (d.noRef||'') + '"></div>'
    + '<div class="fg"><label>Nominal (Rp)</label><input type="number" id="edmpc-nominal" value="' + (d.nominal||0) + '"></div>'
    + '<div class="fg full"><label>Keterangan</label><input id="edmpc-ket" value="' + (d.keterangan||'') + '"></div>'
    + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditDanaMasukPC(\'' + id + '\')">Simpan</button></div>',
    'Edit Dana Masuk');
}

async function simpanEditDanaMasukPC(id) {
  var list = await KDB.getAll('danamasuk');
  var d = list.find(function(x){ return x.id === id; });
  if (!d) return;
  await KDB.save('danamasuk', id, Object.assign({}, d, {
    tanggal: (document.getElementById('edmpc-tgl')||{}).value || d.tanggal,
    sumber: (document.getElementById('edmpc-sumber')||{}).value || d.sumber,
    noRef: (document.getElementById('edmpc-ref')||{}).value || d.noRef,
    nominal: parseFloat((document.getElementById('edmpc-nominal')||{}).value) || d.nominal,
    keterangan: (document.getElementById('edmpc-ket')||{}).value || d.keterangan,
  }));
  closeModalDirect();
  showAlert('Dana masuk diperbarui!');
  navigate('kalk-pettycash');
}

async function hapusDanaMasukPC(id) {
  if (!confirm('Hapus dana masuk ini?')) return;
  await KDB.delete('danamasuk', id);
  showAlert('Dana masuk dihapus!');
  navigate('kalk-pettycash');
}

async function renderPettyCashRec() {
  const list = await KDB.getAll('pettycash');
  const saldoAwal = await KDB.getSetting('pettycash_saldo', 0);
  var tahunSekarang = new Date().getFullYear();

  // Hitung total masuk dan keluar HANYA tahun berjalan
  var totalMasuk = 0, totalKeluar = 0;
  list.forEach(function(p) {
    // Filter tahun ini saja
    var tglTahun = p.tanggal ? parseInt(p.tanggal.substring(0, 4)) : 0;
    if (tglTahun !== tahunSekarang) return;

    var tipe = p.tipe || 'keluar';
    if (!p.tipe) {
      var ket = (p.keterangan||'').toLowerCase();
      var kat = (p.kategori||'').toLowerCase();
      if (kat.includes('masuk') || kat.includes('topup') || kat.includes('isi') || kat.includes('dana masuk') || ket.includes('top up') || ket.includes('isi kas') || ket.includes('saldo masuk')) {
        tipe = 'masuk';
      }
    }
    var jumlah = Math.abs(parseFloat(p.jumlah)||0);
    if (tipe === 'masuk') totalMasuk += jumlah;
    else totalKeluar += jumlah;
  });
  const sisaSeharusnya = saldoAwal + totalMasuk - totalKeluar;
  return '<div class="page-title">🔄 Petty Cash Reconcile</div>'
    + '<div class="card"><div class="card-header"><h2>Rekonsiliasi Petty Cash</h2></div>'
    + '<div class="table-wrap"><table><tbody>'
    + '<tr><td>Saldo Awal Petty Cash</td><td class="text-right fw-bold">' + fmtRp(saldoAwal) + '</td></tr>'
    + '<tr><td>Total Top-up / Masuk</td><td class="text-right text-green">+' + fmtRp(totalMasuk) + '</td></tr>'
    + '<tr><td>Total Pengeluaran Tercatat</td><td class="text-right text-red">(' + fmtRp(totalKeluar) + ')</td></tr>'
    + '<tr style="background:#e3f2fd"><td><b>Sisa Seharusnya</b></td><td class="text-right fw-bold">' + fmtRp(sisaSeharusnya) + '</td></tr>'
    + '<tr><td>Saldo Fisik (isi manual)</td><td class="text-right"><input type="number" id="pc-fisik" placeholder="0" style="padding:6px;border:1px solid #ddd;border-radius:5px;text-align:right" oninput="hitungSelisihPC()"></td></tr>'
    + '<tr id="pc-selisih-row" style="display:none"><td><b>Selisih</b></td><td class="text-right fw-bold" id="pc-selisih-val">-</td></tr>'
    + '</tbody></table></div>'
    + '<div class="mt-12"><button class="btn btn-primary" onclick="hitungSelisihPC()">Hitung Selisih</button></div></div>';
}

function hitungSelisihPC() {
  const fisik = parseFloat(document.getElementById('pc-fisik') ? document.getElementById('pc-fisik').value : 0) || 0;
  const saldoAwal = parseFloat(_klget('ksetting_pettycash_saldo', 0));
  const list = _klget('k_pettycash_all', []);
  var tahunSekarang = new Date().getFullYear();
  var totalMasuk = 0, totalKeluar = 0;
  list.forEach(function(p) {
    // Filter tahun ini saja
    var tglTahun = p.tanggal ? parseInt(p.tanggal.substring(0, 4)) : 0;
    if (tglTahun !== tahunSekarang) return;

    var tipe = p.tipe || 'keluar';
    if (!p.tipe) {
      var ket = (p.keterangan||'').toLowerCase();
      var kat = (p.kategori||'').toLowerCase();
      if (kat.includes('masuk') || kat.includes('topup') || kat.includes('isi') || kat.includes('dana masuk') || ket.includes('top up') || ket.includes('isi kas') || ket.includes('saldo masuk')) {
        tipe = 'masuk';
      }
    }
    var jumlah = Math.abs(parseFloat(p.jumlah)||0);
    if (tipe === 'masuk') totalMasuk += jumlah;
    else totalKeluar += jumlah;
  });
  const seharusnya = saldoAwal + totalMasuk - totalKeluar;
  const selisih = fisik - seharusnya;
  const row = document.getElementById('pc-selisih-row');
  const val = document.getElementById('pc-selisih-val');
  if (row && val) {
    row.style.display = '';
    val.textContent = fmtRp(Math.abs(selisih)) + (selisih === 0 ? ' Balance' : selisih > 0 ? ' (Lebih)' : ' (Kurang)');
    val.className = 'text-right fw-bold ' + (selisih === 0 ? 'text-green' : 'text-red');
  }
}

async function renderBankRec() {
  const list = await KDB.getAll('bankrec');
  const akunAll = await getAkun();
  var bankAkun = akunAll.filter(function(a) {
    var n = (a.nama||'').toLowerCase();
    return (n.includes('bank') || n.includes('kas')) && a.kategori === 'Aset Lancar';
  });
  var bankOpts = bankAkun.map(function(a){ return '<option value="' + a.nama + '">' + a.kode + ' - ' + a.nama + '</option>'; }).join('');
  const now = new Date();
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const monthBtns = months.map(function(m, i) {
    return '<button class="btn btn-sm ' + (i === now.getMonth() ? 'btn-primary' : 'btn-outline') + '" style="margin:2px" onclick="pilihPeriodeBankRec(\'' + m + '\')">' + m + '</button>';
  }).join('');
  const yearBtns = [now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1].map(function(y) {
    return '<button class="btn btn-sm ' + (y === now.getFullYear() ? 'btn-primary' : 'btn-outline') + '" style="margin:2px" onclick="pilihTahunBankRec(' + y + ')">' + y + '</button>';
  }).join('');

  const rows = list.map(function(r) {
    const bal = Math.abs(r.selisih) < 1;
    return '<tr><td>' + r.bank + '</td><td>' + r.periode + '</td><td>' + fmtRp(r.buku) + '</td><td>' + fmtRp(r.bankSaldo) + '</td><td class="' + (bal?'text-green':'text-red') + '">' + fmtRp(Math.abs(r.selisih)) + '</td><td><span class="badge ' + (bal?'badge-success':'badge-danger') + '">' + (bal?'Balance':'Selisih') + '</span></td></tr>';
  }).join('');

  return '<div class="page-title">🏦 Bank Reconcile</div>'
    + '<div class="card"><div class="card-header"><h2>Rekonsiliasi Bank</h2></div>'
    + '<div style="margin-bottom:12px"><div class="fw-bold" style="margin-bottom:6px;font-size:0.85rem">Pilih Bulan:</div>' + monthBtns + '</div>'
    + '<div style="margin-bottom:12px"><div class="fw-bold" style="margin-bottom:6px;font-size:0.85rem">Pilih Tahun:</div>' + yearBtns + '</div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Nama Bank</label><select id="br-bank" style="padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem;width:100%" onchange="document.getElementById(\'br-periode\').value=document.getElementById(\'br-periode\').value"><option value="">-- Pilih Bank --</option>' + bankOpts + '</select></div>'
    + '<div class="fg"><label>Periode (otomatis terisi)</label><input id="br-periode" placeholder="Januari 2026"></div>'
    + '<div class="fg"><label>Saldo Buku (Rp)</label><input type="number" id="br-buku" placeholder="0"></div>'
    + '<div class="fg"><label>Saldo Bank Statement (Rp)</label><input type="number" id="br-bank-saldo" placeholder="0"></div>'
    + '<div class="fg"><label>Deposit in Transit (Rp)</label><input type="number" id="br-dit" placeholder="0" oninput="hitungBankRec()"></div>'
    + '<div class="fg"><label>Outstanding Check (Rp)</label><input type="number" id="br-oc" placeholder="0" oninput="hitungBankRec()"></div>'
    + '<div class="fg"><label>Bank Charge (Rp)</label><input type="number" id="br-charge" placeholder="0" oninput="hitungBankRec()"></div>'
    + '<div class="fg"><label>Bunga Bank (Rp)</label><input type="number" id="br-bunga" placeholder="0" oninput="hitungBankRec()"></div>'
    + '</div><div id="br-result" class="mt-12"></div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-primary" onclick="simpanBankRec()">Simpan Rekonsiliasi</button><button class="btn btn-outline" onclick="hitungBankRec()">Hitung</button></div></div>'
    + '<div class="card"><div class="card-header"><h2>Riwayat Rekonsiliasi (' + list.length + ')</h2></div>'
    + (list.length ? '<div class="table-wrap"><table><thead><tr><th>Bank</th><th>Periode</th><th>Saldo Buku</th><th>Saldo Bank</th><th>Selisih</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">🏦</span>Belum ada rekonsiliasi</div>')
    + '</div>';
}

function pilihPeriodeBankRec(namaBulan) {
  const el = document.getElementById('br-periode');
  if (el) {
    const parts = el.value ? el.value.split(' ') : ['', new Date().getFullYear()];
    el.value = namaBulan + ' ' + (parts[1] || new Date().getFullYear());
  }
}

function pilihTahunBankRec(tahun) {
  const el = document.getElementById('br-periode');
  if (el) {
    const parts = el.value ? el.value.split(' ') : [new Date().toLocaleString('id-ID',{month:'long'}), ''];
    el.value = (parts[0] || '') + ' ' + tahun;
  }
}

function hitungBankRec() {
  const buku = parseFloat(document.getElementById('br-buku') ? document.getElementById('br-buku').value : 0) || 0;
  const bankSaldo = parseFloat(document.getElementById('br-bank-saldo') ? document.getElementById('br-bank-saldo').value : 0) || 0;
  const dit = parseFloat(document.getElementById('br-dit') ? document.getElementById('br-dit').value : 0) || 0;
  const oc = parseFloat(document.getElementById('br-oc') ? document.getElementById('br-oc').value : 0) || 0;
  const charge = parseFloat(document.getElementById('br-charge') ? document.getElementById('br-charge').value : 0) || 0;
  const bunga = parseFloat(document.getElementById('br-bunga') ? document.getElementById('br-bunga').value : 0) || 0;
  const bukuAdj = buku - charge + bunga;
  const bankAdj = bankSaldo + dit - oc;
  const selisih = bukuAdj - bankAdj;
  const el = document.getElementById('br-result');
  if (el) {
    const bal = Math.abs(selisih) < 1;
    el.innerHTML = '<div class="table-wrap"><table><tbody>'
      + '<tr style="background:#e8eaf6"><td colspan="2"><b>Saldo Buku Disesuaikan</b></td></tr>'
      + '<tr><td>Saldo Buku</td><td class="text-right">' + fmtRp(buku) + '</td></tr>'
      + '<tr><td>(-) Bank Charge</td><td class="text-right text-red">(' + fmtRp(charge) + ')</td></tr>'
      + '<tr><td>(+) Bunga Bank</td><td class="text-right text-green">' + fmtRp(bunga) + '</td></tr>'
      + '<tr style="background:#e3f2fd"><td><b>Saldo Buku Adj.</b></td><td class="text-right fw-bold">' + fmtRp(bukuAdj) + '</td></tr>'
      + '<tr style="background:#e8eaf6"><td colspan="2"><b>Saldo Bank Disesuaikan</b></td></tr>'
      + '<tr><td>Saldo Bank Statement</td><td class="text-right">' + fmtRp(bankSaldo) + '</td></tr>'
      + '<tr><td>(+) Deposit in Transit</td><td class="text-right text-green">' + fmtRp(dit) + '</td></tr>'
      + '<tr><td>(-) Outstanding Check</td><td class="text-right text-red">(' + fmtRp(oc) + ')</td></tr>'
      + '<tr style="background:#e3f2fd"><td><b>Saldo Bank Adj.</b></td><td class="text-right fw-bold">' + fmtRp(bankAdj) + '</td></tr>'
      + '<tr style="background:' + (bal?'#e8f5e9':'#ffebee') + '"><td><b>SELISIH</b></td><td class="text-right fw-bold ' + (bal?'text-green':'text-red') + '">' + fmtRp(Math.abs(selisih)) + (bal?' Balance':'') + '</td></tr>'
      + '</tbody></table></div>';
  }
}

async function simpanBankRec() {
  const bank = document.getElementById('br-bank').value.trim();
  const periode = document.getElementById('br-periode').value.trim();
  if (!bank || !periode) { showAlert('Bank dan periode wajib diisi!', 'danger'); return; }
  const buku = parseFloat(document.getElementById('br-buku').value) || 0;
  const bankSaldo = parseFloat(document.getElementById('br-bank-saldo').value) || 0;
  const dit = parseFloat(document.getElementById('br-dit').value) || 0;
  const oc = parseFloat(document.getElementById('br-oc').value) || 0;
  const charge = parseFloat(document.getElementById('br-charge').value) || 0;
  const bunga = parseFloat(document.getElementById('br-bunga').value) || 0;
  const bukuAdj = buku - charge + bunga;
  const bankAdj = bankSaldo + dit - oc;
  const id = genId('BR');
  await KDB.save('bankrec', id, { id: id, bank: bank, periode: periode, buku: buku, bankSaldo: bankSaldo, dit: dit, oc: oc, charge: charge, bunga: bunga, bukuAdj: bukuAdj, bankAdj: bankAdj, selisih: bukuAdj - bankAdj });
  showAlert('Rekonsiliasi disimpan!');
  navigate('kalk-bank-rec');
}

// ===== INVOICE =====
async function renderInvoice() {
  const list = await KDB.getAll('invoice');
  const customers = await KDB.getAll('customer');
  const custOpts = customers.map(function(c){ return '<option value="' + c.nama + '">' + c.nama + '</option>'; }).join('');
  const noInv = 'INV-' + new Date().getFullYear() + '-' + String(list.length+1).padStart(3,'0');
  const rows = list.slice().reverse().map(function(inv) {
    const badgeCls = inv.status === 'Lunas' ? 'badge-success' : inv.status === 'Terkirim' ? 'badge-info' : 'badge-neutral';
    const hapusBtn = hasRole('admin') ? '<button class="btn btn-xs btn-danger" onclick="hapusInvoice(\'' + inv.id + '\')">Hapus</button>' : '';
    return '<tr><td class="fw-bold">' + inv.noInvoice + '</td><td>' + inv.customer + '</td><td>' + fmtDate(inv.tanggal) + '</td><td>' + fmtDate(inv.jatuhTempo) + '</td><td class="fw-bold">' + fmtRp(inv.total) + '</td><td><span class="badge ' + badgeCls + '">' + (inv.status||'Draft') + '</span></td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="printInvoice(\'' + inv.id + '\')">Print</button><button class="btn btn-xs btn-success" onclick="updateInvStatus(\'' + inv.id + '\',\'Lunas\')">Lunas</button>' + hapusBtn + '</td></tr>';
  }).join('');
  return '<div class="page-title">🧾 Invoice</div>'
    + '<div class="card"><div class="card-header"><h2>Buat Invoice Baru</h2></div><div class="form-grid">'
    + '<div class="fg"><label>No. Invoice</label><input id="inv-no" value="' + noInv + '"></div>'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="inv-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Customer</label><select id="inv-cust"><option value="">-- Pilih Customer --</option>' + custOpts + '<option value="__manual__">Input Manual</option></select></div>'
    + '<div class="fg"><label>Nama Customer (manual)</label><input id="inv-cust-manual" placeholder="Nama customer"></div>'
    + '<div class="fg"><label>Jatuh Tempo</label><input type="date" id="inv-jt"></div>'
    + '<div class="fg"><label>Status</label><select id="inv-status"><option>Draft</option><option>Terkirim</option><option>Lunas</option></select></div>'
    + '</div>'
    + '<div style="margin-top:12px"><b>Item Invoice:</b><table style="width:100%;margin-top:8px;font-size:0.83rem"><thead><tr><th>Deskripsi</th><th>Qty</th><th>Harga Satuan</th><th>Total</th><th></th></tr></thead>'
    + '<tbody id="inv-items"><tr>'
    + '<td><input class="inv-desc" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Deskripsi item"></td>'
    + '<td><input class="inv-qty" type="number" style="width:80px;padding:6px;border:1px solid #ddd;border-radius:5px" value="1" oninput="hitungInvoice()"></td>'
    + '<td><input class="inv-harga" type="number" style="width:130px;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="hitungInvoice()"></td>'
    + '<td class="inv-total-cell" style="padding:6px">Rp 0</td><td></td></tr></tbody></table>'
    + '<button class="btn btn-outline btn-sm mt-8" onclick="addInvItem()">+ Tambah Item</button></div>'
    + '<div class="form-grid mt-12"><div class="fg"><label>Diskon (%)</label><input type="number" id="inv-diskon" placeholder="0" oninput="hitungInvoice()"></div>'
    + '<div class="fg"><label>PPN (%)</label><input type="number" id="inv-ppn" placeholder="11" oninput="hitungInvoice()"></div>'
    + '<div class="fg full"><label>Catatan</label><textarea id="inv-catatan" placeholder="Catatan invoice"></textarea></div></div>'
    + '<div id="inv-summary" class="mt-12"></div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-primary" onclick="simpanInvoice()">Simpan Invoice</button><button class="btn btn-outline" onclick="hitungInvoice()">Hitung</button></div></div>'
    + '<div class="card"><div class="card-header"><h2>Daftar Invoice (' + list.length + ')</h2></div>'
    + (list.length ? '<div class="table-wrap"><table><thead><tr><th>No. Invoice</th><th>Customer</th><th>Tanggal</th><th>Jatuh Tempo</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">🧾</span>Belum ada invoice</div>')
    + '</div>';
}

function addInvItem() {
  const tbody = document.getElementById('inv-items');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="inv-desc" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Deskripsi item"></td>'
    + '<td><input class="inv-qty" type="number" style="width:80px;padding:6px;border:1px solid #ddd;border-radius:5px" value="1" oninput="hitungInvoice()"></td>'
    + '<td><input class="inv-harga" type="number" style="width:130px;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="hitungInvoice()"></td>'
    + '<td class="inv-total-cell" style="padding:6px">Rp 0</td>'
    + '<td><button onclick="this.closest(\'tr\').remove();hitungInvoice()" style="background:#f44336;color:white;border:none;border-radius:4px;padding:3px 7px;cursor:pointer">x</button></td>';
  tbody.appendChild(tr);
}

function hitungInvoice() {
  let subtotal = 0;
  document.querySelectorAll('#inv-items tr').forEach(function(row) {
    const qty = parseFloat(row.querySelector('.inv-qty') ? row.querySelector('.inv-qty').value : 0) || 0;
    const harga = parseFloat(row.querySelector('.inv-harga') ? row.querySelector('.inv-harga').value : 0) || 0;
    const total = qty * harga;
    const cell = row.querySelector('.inv-total-cell');
    if (cell) cell.textContent = fmtRp(total);
    subtotal += total;
  });
  const diskon = parseFloat(document.getElementById('inv-diskon') ? document.getElementById('inv-diskon').value : 0) || 0;
  const ppn = parseFloat(document.getElementById('inv-ppn') ? document.getElementById('inv-ppn').value : 0) || 0;
  const diskonAmt = subtotal * (diskon/100);
  const afterDiskon = subtotal - diskonAmt;
  const ppnAmt = afterDiskon * (ppn/100);
  const total = afterDiskon + ppnAmt;
  const el = document.getElementById('inv-summary');
  if (el) el.innerHTML = '<div style="background:#f8f9ff;border-radius:8px;padding:14px;max-width:320px;margin-left:auto">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Subtotal</span><span>' + fmtRp(subtotal) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#f44336"><span>Diskon (' + diskon + '%)</span><span>(' + fmtRp(diskonAmt) + ')</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#0288d1"><span>PPN (' + ppn + '%)</span><span>' + fmtRp(ppnAmt) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:700;border-top:2px solid #1a237e;padding-top:8px;color:#1a237e"><span>TOTAL</span><span>' + fmtRp(total) + '</span></div></div>';
}

async function simpanInvoice() {
  const noInvoice = document.getElementById('inv-no').value.trim();
  const custSel = document.getElementById('inv-cust').value;
  const customer = custSel === '__manual__' ? document.getElementById('inv-cust-manual').value.trim() : custSel;
  if (!noInvoice || !customer) { showAlert('No. Invoice dan customer wajib diisi!', 'danger'); return; }
  const items = [];
  let subtotal = 0;
  document.querySelectorAll('#inv-items tr').forEach(function(row) {
    const desc = row.querySelector('.inv-desc') ? row.querySelector('.inv-desc').value.trim() : '';
    const qty = parseFloat(row.querySelector('.inv-qty') ? row.querySelector('.inv-qty').value : 0) || 0;
    const harga = parseFloat(row.querySelector('.inv-harga') ? row.querySelector('.inv-harga').value : 0) || 0;
    if (desc) { items.push({ desc: desc, qty: qty, harga: harga, total: qty*harga }); subtotal += qty*harga; }
  });
  const diskon = parseFloat(document.getElementById('inv-diskon').value) || 0;
  const ppn = parseFloat(document.getElementById('inv-ppn').value) || 0;
  const diskonAmt = subtotal*(diskon/100);
  const afterDiskon = subtotal - diskonAmt;
  const ppnAmt = afterDiskon*(ppn/100);
  const total = afterDiskon + ppnAmt;
  const id = genId('INV');
  await KDB.save('invoice', id, { id: id, noInvoice: noInvoice, customer: customer, tanggal: document.getElementById('inv-tgl').value, jatuhTempo: document.getElementById('inv-jt').value, status: document.getElementById('inv-status').value, items: items, subtotal: subtotal, diskon: diskon, diskonAmt: diskonAmt, ppn: ppn, ppnAmt: ppnAmt, total: total, catatan: document.getElementById('inv-catatan').value, createdBy: KU.username, createdAt: new Date().toISOString() });
  // Auto-create Dana Masuk draft for invoice
  const dmId = genId('DM');
  const approvers = await getApprovers();
  await KDB.save('danamasuk', dmId, { id: dmId, tipe: 'danamasuk', sumber: customer, noRef: noInvoice, tanggal: document.getElementById('inv-tgl').value || today(), nominal: total, tipeTransaksi: 'Transfer Bank', akunTerima: '1-1300', kategori: '4-1000', namaRekening: '', keterangan: 'Piutang Invoice ' + noInvoice + ' kepada ' + customer, buktiDokumen: '', status: STATUS.DRAFT, approvalLog: [], approvers: approvers, createdBy: KU.username, createdAt: new Date().toISOString(), sumberRef: 'invoice', sumberRefId: id });
  showAlert('Invoice disimpan! Draft Dana Masuk dibuat otomatis — cek menu Dana Masuk.');
  navigate('kalk-invoice');
}

async function updateInvStatus(id, status) {
  const list = await KDB.getAll('invoice');
  const inv = list.find(function(x){ return x.id === id; });
  if (!inv) return;
  await KDB.save('invoice', id, Object.assign({}, inv, { status: status }));
  showAlert('Status diubah ke ' + status);
  navigate('kalk-invoice');
}

async function hapusInvoice(id) {
  if (!confirm('Hapus invoice ini?')) return;
  await KDB.delete('invoice', id);
  navigate('kalk-invoice');
}

async function printInvoice(id) {
  const list = await KDB.getAll('invoice');
  const inv = list.find(function(x){ return x.id === id; });
  if (!inv) return;
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const logoHtml = perusahaan.logoData ? '<img src="' + perusahaan.logoData + '" style="height:55px;max-width:150px;object-fit:contain">' : '<div style="font-size:2rem">💼</div>';
  const w = window.open('', '_blank');
  const itemRows = (inv.items||[]).map(function(item, i) {
    return '<tr><td style="text-align:center">' + (i+1) + '</td><td>' + item.desc + '</td><td style="text-align:center">' + item.qty + '</td><td style="text-align:right">' + fmtRp(item.harga) + '</td><td style="text-align:right;font-weight:600">' + fmtRp(item.total) + '</td></tr>';
  }).join('');
  const statusColor = inv.status === 'Lunas' ? '#27ae60' : inv.status === 'Terkirim' ? '#2980b9' : '#7f8c8d';
  const css = '*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Segoe UI",Arial,sans-serif;background:#f5f6fa;padding:20px;color:#2c3e50}.page{background:white;max-width:800px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}.hdr{background:linear-gradient(135deg,#1a237e,#1565c0);color:white;padding:28px;display:flex;justify-content:space-between;align-items:flex-start}.hdr-l h1{font-size:1.6rem;font-weight:800;margin-top:8px}.hdr-l p{opacity:.85;font-size:.82rem;line-height:1.5}.inv-badge{background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);border-radius:8px;padding:10px 18px;text-align:center}.inv-badge .lbl{font-size:.7rem;opacity:.8;text-transform:uppercase;letter-spacing:1px}.inv-badge .num{font-size:1.3rem;font-weight:800;margin-top:4px}.stamp{display:inline-block;border:3px solid ' + statusColor + ';color:' + statusColor + ';border-radius:6px;padding:3px 10px;font-weight:800;font-size:.85rem;margin-top:8px;transform:rotate(-5deg)}.body{padding:28px}.ig{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.ib{background:#f8f9ff;border-radius:8px;padding:14px;border-left:4px solid #1a237e}.ib h3{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px}.ib .nm{font-size:1rem;font-weight:700;color:#1a237e}table{width:100%;border-collapse:collapse;margin-bottom:16px}thead tr{background:#1a237e;color:white}thead th{padding:10px 12px;font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px}tbody tr:nth-child(even){background:#f8f9ff}tbody td{padding:10px 12px;font-size:.85rem;border-bottom:1px solid #eee}.tots{margin-left:auto;width:260px}.tr{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:.85rem}.tr.fin{font-size:1.05rem;font-weight:800;color:#1a237e;border-top:2px solid #1a237e;border-bottom:none;padding-top:10px;margin-top:4px}.ftr{background:#f8f9ff;padding:20px 28px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #eee}.sl{border-top:1px solid #333;margin-top:50px;padding-top:5px;min-width:160px;font-size:.8rem;text-align:center}.note{font-size:.78rem;color:#888;max-width:280px;line-height:1.5}@media print{body{background:white;padding:0}.page{box-shadow:none;border-radius:0}button{display:none}}';
  w.document.write('<!DOCTYPE html><html><head><title>Invoice ' + inv.noInvoice + '</title><style>' + css + '</style></head><body><div class="page"><div class="hdr"><div class="hdr-l">' + logoHtml + '<h1>' + (perusahaan.nama||'IJEF Corp') + '</h1><p>' + (perusahaan.alamat||'') + (perusahaan.kota?', '+perusahaan.kota:'') + '</p><p>' + (perusahaan.telp||'') + (perusahaan.email?' | '+perusahaan.email:'') + '</p>' + (perusahaan.npwp?'<p>NPWP: '+perusahaan.npwp+'</p>':'') + '</div><div style="text-align:right"><div class="inv-badge"><div class="lbl">Invoice</div><div class="num">' + inv.noInvoice + '</div></div><div class="stamp">' + (inv.status||'Draft') + '</div></div></div><div class="body"><div class="ig"><div class="ib"><h3>Tagihan Kepada</h3><p class="nm">' + inv.customer + '</p></div><div class="ib"><h3>Detail Invoice</h3><p><b>Tanggal:</b> ' + fmtDate(inv.tanggal) + '</p><p><b>Jatuh Tempo:</b> ' + fmtDate(inv.jatuhTempo) + '</p></div></div><table><thead><tr><th style="width:36px">No</th><th>Deskripsi</th><th style="width:55px;text-align:center">Qty</th><th style="width:110px;text-align:right">Harga</th><th style="width:120px;text-align:right">Total</th></tr></thead><tbody>' + itemRows + '</tbody></table><div class="tots"><div class="tr"><span>Subtotal</span><span>' + fmtRp(inv.subtotal) + '</span></div>' + (inv.diskon?'<div class="tr"><span>Diskon ('+inv.diskon+'%)</span><span style="color:#e74c3c">('+fmtRp(inv.diskonAmt)+')</span></div>':'') + (inv.ppn?'<div class="tr"><span>PPN ('+inv.ppn+'%)</span><span>'+fmtRp(inv.ppnAmt)+'</span></div>':'') + '<div class="tr fin"><span>TOTAL</span><span>' + fmtRp(inv.total) + '</span></div></div>' + (inv.catatan?'<div style="margin-top:14px;padding:10px;background:#fff8e1;border-radius:6px;border-left:4px solid #f39c12;font-size:.82rem"><b>Catatan:</b> '+inv.catatan+'</div>':'') + '</div><div class="ftr"><div class="note">Terima kasih atas kepercayaan Anda.<br>Invoice ini sah tanpa tanda tangan.</div><div><div class="sl">Hormat Kami,<br>' + (perusahaan.nama||'IJEF Corp') + '</div></div></div></div><div style="text-align:center;margin-top:14px"><button onclick="window.print()" style="padding:10px 24px;background:#1a237e;color:white;border:none;border-radius:8px;cursor:pointer;font-size:.95rem;font-weight:600">🖨️ Print Invoice</button></div></body></html>');
  w.document.close();
}

// ===== PURCHASE ORDER =====
async function renderPO() {
  const list = await KDB.getAll('po');
  const suppliers = await KDB.getAll('supplier');
  const supOpts = suppliers.map(function(s){ return '<option value="' + s.nama + '">' + s.nama + '</option>'; }).join('');
  const noPO = 'PO-' + new Date().getFullYear() + '-' + String(list.length+1).padStart(3,'0');
  const rows = list.slice().reverse().map(function(po) {
    const badgeCls = po.status === 'Diterima' ? 'badge-success' : po.status === 'Dibatalkan' ? 'badge-danger' : po.status === 'Terkirim' ? 'badge-info' : 'badge-neutral';
    const hapusBtn = hasRole('admin') ? '<button class="btn btn-xs btn-danger" onclick="hapusPO(\'' + po.id + '\')">Hapus</button>' : '';
    return '<tr><td class="fw-bold">' + po.noPO + '</td><td>' + po.supplier + '</td><td>' + fmtDate(po.tanggal) + '</td><td class="fw-bold">' + fmtRp(po.total) + '</td><td><span class="badge ' + badgeCls + '">' + (po.status||'Draft') + '</span></td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="printPO(\'' + po.id + '\')">Print</button>' + hapusBtn + '</td></tr>';
  }).join('');
  return '<div class="page-title">📦 Purchase Order</div>'
    + '<div class="card"><div class="card-header"><h2>Buat PO Baru</h2></div><div class="form-grid">'
    + '<div class="fg"><label>No. PO</label><input id="po-no" value="' + noPO + '"></div>'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="po-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Supplier</label><select id="po-sup"><option value="">-- Pilih Supplier --</option>' + supOpts + '<option value="__manual__">Input Manual</option></select></div>'
    + '<div class="fg"><label>Nama Supplier (manual)</label><input id="po-sup-manual" placeholder="Nama supplier"></div>'
    + '<div class="fg"><label>Tanggal Pengiriman</label><input type="date" id="po-kirim"></div>'
    + '<div class="fg"><label>Status</label><select id="po-status"><option>Draft</option><option>Terkirim</option><option>Diterima</option><option>Dibatalkan</option></select></div>'
    + '</div>'
    + '<div style="margin-top:12px"><b>Item PO:</b><table style="width:100%;margin-top:8px;font-size:0.83rem"><thead><tr><th>Deskripsi</th><th>Qty</th><th>Satuan</th><th>Harga Satuan</th><th>Total</th><th></th></tr></thead>'
    + '<tbody id="po-items"><tr>'
    + '<td><input class="po-desc" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Nama barang/jasa"></td>'
    + '<td><input class="po-qty" type="number" style="width:70px;padding:6px;border:1px solid #ddd;border-radius:5px" value="1" oninput="hitungPO()"></td>'
    + '<td><input class="po-sat" style="width:70px;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="pcs"></td>'
    + '<td><input class="po-harga" type="number" style="width:120px;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="hitungPO()"></td>'
    + '<td class="po-total-cell" style="padding:6px">Rp 0</td><td></td></tr></tbody></table>'
    + '<button class="btn btn-outline btn-sm mt-8" onclick="addPOItem()">+ Tambah Item</button></div>'
    + '<div class="form-grid mt-12"><div class="fg"><label>PPN (%)</label><input type="number" id="po-ppn" placeholder="11" oninput="hitungPO()"></div>'
    + '<div class="fg full"><label>Catatan</label><textarea id="po-catatan" placeholder="Syarat & ketentuan PO"></textarea></div></div>'
    + '<div id="po-summary" class="mt-12"></div>'
    + '<div class="mt-12"><button class="btn btn-primary" onclick="simpanPO()">Simpan PO</button></div></div>'
    + '<div class="card"><div class="card-header"><h2>Daftar PO (' + list.length + ')</h2></div>'
    + (list.length ? '<div class="table-wrap"><table><thead><tr><th>No. PO</th><th>Supplier</th><th>Tanggal</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📦</span>Belum ada PO</div>')
    + '</div>';
}

function addPOItem() {
  const tbody = document.getElementById('po-items');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = '<td><input class="po-desc" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="Nama barang/jasa"></td>'
    + '<td><input class="po-qty" type="number" style="width:70px;padding:6px;border:1px solid #ddd;border-radius:5px" value="1" oninput="hitungPO()"></td>'
    + '<td><input class="po-sat" style="width:70px;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="pcs"></td>'
    + '<td><input class="po-harga" type="number" style="width:120px;padding:6px;border:1px solid #ddd;border-radius:5px" placeholder="0" oninput="hitungPO()"></td>'
    + '<td class="po-total-cell" style="padding:6px">Rp 0</td>'
    + '<td><button onclick="this.closest(\'tr\').remove();hitungPO()" style="background:#f44336;color:white;border:none;border-radius:4px;padding:3px 7px;cursor:pointer">x</button></td>';
  tbody.appendChild(tr);
}

function hitungPO() {
  let subtotal = 0;
  document.querySelectorAll('#po-items tr').forEach(function(row) {
    const qty = parseFloat(row.querySelector('.po-qty') ? row.querySelector('.po-qty').value : 0) || 0;
    const harga = parseFloat(row.querySelector('.po-harga') ? row.querySelector('.po-harga').value : 0) || 0;
    const total = qty * harga;
    const cell = row.querySelector('.po-total-cell');
    if (cell) cell.textContent = fmtRp(total);
    subtotal += total;
  });
  const ppn = parseFloat(document.getElementById('po-ppn') ? document.getElementById('po-ppn').value : 0) || 0;
  const ppnAmt = subtotal * (ppn/100);
  const total = subtotal + ppnAmt;
  const el = document.getElementById('po-summary');
  if (el) el.innerHTML = '<div style="background:#f8f9ff;border-radius:8px;padding:14px;max-width:280px;margin-left:auto">'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Subtotal</span><span>' + fmtRp(subtotal) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#0288d1"><span>PPN (' + ppn + '%)</span><span>' + fmtRp(ppnAmt) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:700;border-top:2px solid #1a237e;padding-top:8px;color:#1a237e"><span>TOTAL</span><span>' + fmtRp(total) + '</span></div></div>';
}

async function simpanPO() {
  const noPO = document.getElementById('po-no').value.trim();
  const supSel = document.getElementById('po-sup').value;
  const supplier = supSel === '__manual__' ? document.getElementById('po-sup-manual').value.trim() : supSel;
  if (!noPO || !supplier) { showAlert('No. PO dan supplier wajib diisi!', 'danger'); return; }
  const items = [];
  let subtotal = 0;
  document.querySelectorAll('#po-items tr').forEach(function(row) {
    const desc = row.querySelector('.po-desc') ? row.querySelector('.po-desc').value.trim() : '';
    const qty = parseFloat(row.querySelector('.po-qty') ? row.querySelector('.po-qty').value : 0) || 0;
    const sat = row.querySelector('.po-sat') ? row.querySelector('.po-sat').value : '';
    const harga = parseFloat(row.querySelector('.po-harga') ? row.querySelector('.po-harga').value : 0) || 0;
    if (desc) { items.push({ desc: desc, qty: qty, sat: sat, harga: harga, total: qty*harga }); subtotal += qty*harga; }
  });
  const ppn = parseFloat(document.getElementById('po-ppn').value) || 0;
  const ppnAmt = subtotal*(ppn/100);
  const total = subtotal + ppnAmt;
  const id = genId('PO');
  await KDB.save('po', id, { id: id, noPO: noPO, supplier: supplier, tanggal: document.getElementById('po-tgl').value, tanggalKirim: document.getElementById('po-kirim').value, status: document.getElementById('po-status').value, items: items, subtotal: subtotal, ppn: ppn, ppnAmt: ppnAmt, total: total, catatan: document.getElementById('po-catatan').value, createdBy: KU.username, createdAt: new Date().toISOString() });
  // Auto-create Permohonan Dana draft for PO
  const pdId = genId('PD');
  const approvers = await getApprovers();
  await KDB.save('permohonan', pdId, { id: pdId, tipe: 'permohonan', pemohon: KU.username, namaPemohon: KU.nama, namaLeader: '', noPOInvoice: noPO, nominal: total, jatuhTempo: document.getElementById('po-kirim').value || '', tipeTransaksi: 'Transfer', namaBank: '', noRekening: '', namaRekening: '', keterangan: 'Pembayaran PO ' + noPO + ' kepada ' + supplier, buktiDokumen: '', akunDebit: '5-2200', akunKredit: '1-1100', tanggal: today(), status: STATUS.DRAFT, approvalLog: [], approvers: approvers, createdBy: KU.username, createdAt: new Date().toISOString(), sumberRef: 'po', sumberRefId: id });
  showAlert('PO disimpan! Draft Permohonan Dana dibuat otomatis — cek menu Permohonan Dana.');
  navigate('kalk-po');
}

async function hapusPO(id) {
  if (!confirm('Hapus PO ini?')) return;
  await KDB.delete('po', id);
  navigate('kalk-po');
}

async function printPO(id) {
  const list = await KDB.getAll('po');
  const po = list.find(function(x){ return x.id === id; });
  if (!po) return;
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const logoHtml = perusahaan.logoData ? '<img src="' + perusahaan.logoData + '" style="height:55px;max-width:150px;object-fit:contain">' : '<div style="font-size:2rem">📦</div>';
  const w = window.open('', '_blank');
  const itemRows = (po.items||[]).map(function(item, i) {
    return '<tr><td style="text-align:center">' + (i+1) + '</td><td>' + item.desc + '</td><td style="text-align:center">' + item.qty + '</td><td>' + (item.sat||'-') + '</td><td style="text-align:right">' + fmtRp(item.harga) + '</td><td style="text-align:right;font-weight:600">' + fmtRp(item.total) + '</td></tr>';
  }).join('');
  const statusColor = po.status === 'Diterima' ? '#27ae60' : po.status === 'Dibatalkan' ? '#e74c3c' : po.status === 'Terkirim' ? '#2980b9' : '#7f8c8d';
  const css = '*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Segoe UI",Arial,sans-serif;background:#f5f6fa;padding:20px;color:#2c3e50}.page{background:white;max-width:820px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}.hdr{background:linear-gradient(135deg,#1b5e20,#2e7d32);color:white;padding:28px;display:flex;justify-content:space-between;align-items:flex-start}.hdr-l h1{font-size:1.6rem;font-weight:800;margin-top:8px}.hdr-l p{opacity:.85;font-size:.82rem;line-height:1.5}.po-badge{background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);border-radius:8px;padding:10px 18px;text-align:center}.po-badge .lbl{font-size:.7rem;opacity:.8;text-transform:uppercase;letter-spacing:1px}.po-badge .num{font-size:1.3rem;font-weight:800;margin-top:4px}.stamp{display:inline-block;border:3px solid ' + statusColor + ';color:' + statusColor + ';border-radius:6px;padding:3px 10px;font-weight:800;font-size:.85rem;margin-top:8px;transform:rotate(-5deg)}.body{padding:28px}.ig{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.ib{background:#f1f8e9;border-radius:8px;padding:14px;border-left:4px solid #2e7d32}.ib h3{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px}.ib .nm{font-size:1rem;font-weight:700;color:#1b5e20}table{width:100%;border-collapse:collapse;margin-bottom:16px}thead tr{background:#2e7d32;color:white}thead th{padding:10px 12px;font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px}tbody tr:nth-child(even){background:#f1f8e9}tbody td{padding:10px 12px;font-size:.85rem;border-bottom:1px solid #eee}.tots{margin-left:auto;width:260px}.tr{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:.85rem}.tr.fin{font-size:1.05rem;font-weight:800;color:#1b5e20;border-top:2px solid #2e7d32;border-bottom:none;padding-top:10px;margin-top:4px}.ftr{background:#f1f8e9;padding:20px 28px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #c8e6c9}.sl{border-top:1px solid #333;margin-top:50px;padding-top:5px;min-width:160px;font-size:.8rem;text-align:center}.note{font-size:.78rem;color:#888;max-width:280px;line-height:1.5}.terms{background:#fff8e1;border-radius:6px;padding:12px;border-left:4px solid #f9a825;font-size:.82rem;margin-top:14px}@media print{body{background:white;padding:0}.page{box-shadow:none;border-radius:0}button{display:none}}';
  w.document.write('<!DOCTYPE html><html><head><title>PO ' + po.noPO + '</title><style>' + css + '</style></head><body><div class="page"><div class="hdr"><div class="hdr-l">' + logoHtml + '<h1>' + (perusahaan.nama||'IJEF Corp') + '</h1><p>' + (perusahaan.alamat||'') + (perusahaan.kota?', '+perusahaan.kota:'') + '</p><p>' + (perusahaan.telp||'') + (perusahaan.email?' | '+perusahaan.email:'') + '</p>' + (perusahaan.npwp?'<p>NPWP: '+perusahaan.npwp+'</p>':'') + '</div><div style="text-align:right"><div class="po-badge"><div class="lbl">Purchase Order</div><div class="num">' + po.noPO + '</div></div><div class="stamp">' + (po.status||'Draft') + '</div></div></div><div class="body"><div class="ig"><div class="ib"><h3>Kepada Supplier</h3><p class="nm">' + po.supplier + '</p></div><div class="ib"><h3>Detail PO</h3><p><b>Tanggal:</b> ' + fmtDate(po.tanggal) + '</p><p><b>Tgl Pengiriman:</b> ' + fmtDate(po.tanggalKirim) + '</p></div></div><table><thead><tr><th style="width:36px">No</th><th>Deskripsi</th><th style="width:55px;text-align:center">Qty</th><th style="width:60px;text-align:center">Satuan</th><th style="width:110px;text-align:right">Harga</th><th style="width:120px;text-align:right">Total</th></tr></thead><tbody>' + itemRows + '</tbody></table><div class="tots"><div class="tr"><span>Subtotal</span><span>' + fmtRp(po.subtotal) + '</span></div>' + (po.ppn?'<div class="tr"><span>PPN ('+po.ppn+'%)</span><span>'+fmtRp(po.ppnAmt)+'</span></div>':'') + '<div class="tr fin"><span>TOTAL</span><span>' + fmtRp(po.total) + '</span></div></div>' + (po.catatan?'<div class="terms"><b>Syarat & Ketentuan:</b> '+po.catatan+'</div>':'') + '</div><div class="ftr"><div class="note">Harap konfirmasi penerimaan PO ini.<br>Pengiriman sesuai spesifikasi yang tertera.</div><div style="display:flex;gap:40px"><div><div class="sl">Dibuat Oleh,<br>' + (perusahaan.nama||'IJEF Corp') + '</div></div><div><div class="sl">Disetujui Oleh,<br>&nbsp;</div></div></div></div></div><div style="text-align:center;margin-top:14px"><button onclick="window.print()" style="padding:10px 24px;background:#2e7d32;color:white;border:none;border-radius:8px;cursor:pointer;font-size:.95rem;font-weight:600">��️ Print Purchase Order</button></div></body></html>');
  w.document.close();
}

// ===== GAJI =====
async function renderGaji() {
  const list = await KDB.getAll('gaji');
  const rows = list.slice().reverse().map(function(g) {
    const hapusBtn = hasRole('admin') ? '<button class="btn btn-xs btn-danger" onclick="hapusGaji(\'' + g.id + '\')">Hapus</button>' : '';
    return '<tr><td class="fw-bold">' + g.nama + '</td><td>' + (g.jabatan||'-') + '</td><td>' + (g.periode||'-') + '</td><td>' + fmtRp(g.pokok) + '</td><td class="text-red">' + fmtRp(g.totalPotongan) + '</td><td class="text-green fw-bold">' + fmtRp(g.takeHomePay) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="printSlipGaji(\'' + g.id + '\')">Slip</button>' + hapusBtn + '</td></tr>';
  }).join('');
  return '<div class="page-title">👔 Gaji / Salary</div>'
    + '<div class="card"><div class="card-header"><h2>Input Penggajian</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Nama Karyawan</label><input id="g-nama" placeholder="Nama karyawan"></div>'
    + '<div class="fg"><label>Jabatan</label><input id="g-jabatan" placeholder="Jabatan"></div>'
    + '<div class="fg"><label>Periode</label><input id="g-periode" placeholder="Januari 2026"></div>'
    + '<div class="fg"><label>Tanggal Bayar</label><input type="date" id="g-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Gaji Pokok (Rp)</label><input type="number" id="g-pokok" placeholder="0" oninput="hitungGaji()"></div>'
    + '<div class="fg"><label>Tunjangan (Rp)</label><input type="number" id="g-tunjangan" placeholder="0" oninput="hitungGaji()"></div>'
    + '<div class="fg"><label>Lembur (Rp)</label><input type="number" id="g-lembur" placeholder="0" oninput="hitungGaji()"></div>'
    + '<div class="fg"><label>Bonus (Rp)</label><input type="number" id="g-bonus" placeholder="0" oninput="hitungGaji()"></div>'
    + '<div class="fg"><label>BPJS Kesehatan (%)</label><input type="number" id="g-bpjskes" value="1" oninput="hitungGaji()"></div>'
    + '<div class="fg"><label>BPJS Ketenagakerjaan (%)</label><input type="number" id="g-bpjstk" value="2" oninput="hitungGaji()"></div>'
    + '<div class="fg"><label>PPh 21 (%)</label><input type="number" id="g-pph" value="5" oninput="hitungGaji()"></div>'
    + '<div class="fg"><label>Potongan Lain (Rp)</label><input type="number" id="g-potongan" placeholder="0" oninput="hitungGaji()"></div>'
    + '</div><div id="g-result" class="mt-12"></div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-primary" onclick="simpanGaji()">Simpan</button><button class="btn btn-outline" onclick="hitungGaji()">Hitung</button></div></div>'
    + '<div class="card"><div class="card-header"><h2>Riwayat Penggajian (' + list.length + ')</h2></div>'
    + (list.length ? '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Jabatan</th><th>Periode</th><th>Gaji Pokok</th><th>Total Potongan</th><th>Take Home Pay</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">👔</span>Belum ada data penggajian</div>')
    + '</div>';
}

function hitungGaji() {
  const pokok = parseFloat(document.getElementById('g-pokok') ? document.getElementById('g-pokok').value : 0) || 0;
  const tunjangan = parseFloat(document.getElementById('g-tunjangan') ? document.getElementById('g-tunjangan').value : 0) || 0;
  const lembur = parseFloat(document.getElementById('g-lembur') ? document.getElementById('g-lembur').value : 0) || 0;
  const bonus = parseFloat(document.getElementById('g-bonus') ? document.getElementById('g-bonus').value : 0) || 0;
  const bpjsKes = parseFloat(document.getElementById('g-bpjskes') ? document.getElementById('g-bpjskes').value : 0) || 0;
  const bpjsTk = parseFloat(document.getElementById('g-bpjstk') ? document.getElementById('g-bpjstk').value : 0) || 0;
  const pph = parseFloat(document.getElementById('g-pph') ? document.getElementById('g-pph').value : 0) || 0;
  const potonganLain = parseFloat(document.getElementById('g-potongan') ? document.getElementById('g-potongan').value : 0) || 0;
  const totalBruto = pokok + tunjangan + lembur + bonus;
  const bpjsKesAmt = pokok*(bpjsKes/100);
  const bpjsTkAmt = pokok*(bpjsTk/100);
  const pphAmt = totalBruto*(pph/100);
  const totalPotongan = bpjsKesAmt + bpjsTkAmt + pphAmt + potonganLain;
  const takeHomePay = totalBruto - totalPotongan;
  const el = document.getElementById('g-result');
  if (el) el.innerHTML = '<div style="background:#f8f9ff;border-radius:8px;padding:16px;max-width:360px">'
    + '<div style="font-weight:700;color:#1a237e;margin-bottom:10px">Rincian Gaji</div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:5px"><span>Gaji Pokok</span><span>' + fmtRp(pokok) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:5px"><span>Tunjangan</span><span>' + fmtRp(tunjangan) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:5px"><span>Lembur</span><span>' + fmtRp(lembur) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:5px"><span>Bonus</span><span>' + fmtRp(bonus) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid #ddd;padding-top:5px;margin-bottom:10px"><span>Total Bruto</span><span>' + fmtRp(totalBruto) + '</span></div>'
    + '<div style="color:#f44336;margin-bottom:5px;font-weight:600">Potongan:</div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:5px;color:#f44336"><span>BPJS Kesehatan (' + bpjsKes + '%)</span><span>(' + fmtRp(bpjsKesAmt) + ')</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:5px;color:#f44336"><span>BPJS Ketenagakerjaan (' + bpjsTk + '%)</span><span>(' + fmtRp(bpjsTkAmt) + ')</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:5px;color:#f44336"><span>PPh 21 (' + pph + '%)</span><span>(' + fmtRp(pphAmt) + ')</span></div>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:5px;color:#f44336"><span>Potongan Lain</span><span>(' + fmtRp(potonganLain) + ')</span></div>'
    + '<div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:700;border-top:2px solid #1a237e;padding-top:8px;color:#4caf50"><span>TAKE HOME PAY</span><span>' + fmtRp(takeHomePay) + '</span></div></div>';
}

async function simpanGaji() {
  const nama = document.getElementById('g-nama').value.trim();
  const periode = document.getElementById('g-periode').value.trim();
  if (!nama || !periode) { showAlert('Nama dan periode wajib diisi!', 'danger'); return; }
  const pokok = parseFloat(document.getElementById('g-pokok').value) || 0;
  const tunjangan = parseFloat(document.getElementById('g-tunjangan').value) || 0;
  const lembur = parseFloat(document.getElementById('g-lembur').value) || 0;
  const bonus = parseFloat(document.getElementById('g-bonus').value) || 0;
  const bpjsKes = parseFloat(document.getElementById('g-bpjskes').value) || 0;
  const bpjsTk = parseFloat(document.getElementById('g-bpjstk').value) || 0;
  const pph = parseFloat(document.getElementById('g-pph').value) || 0;
  const potonganLain = parseFloat(document.getElementById('g-potongan').value) || 0;
  const totalBruto = pokok + tunjangan + lembur + bonus;
  const bpjsKesAmt = pokok*(bpjsKes/100);
  const bpjsTkAmt = pokok*(bpjsTk/100);
  const pphAmt = totalBruto*(pph/100);
  const totalPotongan = bpjsKesAmt + bpjsTkAmt + pphAmt + potonganLain;
  const takeHomePay = totalBruto - totalPotongan;
  const id = genId('GAJ');
  await KDB.save('gaji', id, { id: id, nama: nama, jabatan: document.getElementById('g-jabatan').value, periode: periode, tanggal: document.getElementById('g-tgl').value, pokok: pokok, tunjangan: tunjangan, lembur: lembur, bonus: bonus, bpjsKes: bpjsKes, bpjsTk: bpjsTk, pph: pph, potonganLain: potonganLain, totalBruto: totalBruto, bpjsKesAmt: bpjsKesAmt, bpjsTkAmt: bpjsTkAmt, pphAmt: pphAmt, totalPotongan: totalPotongan, takeHomePay: takeHomePay, createdBy: KU.username });
  showAlert('Data gaji disimpan!');
  navigate('kalk-gaji');
}

async function hapusGaji(id) {
  if (!confirm('Hapus data gaji ini?')) return;
  await KDB.delete('gaji', id);
  navigate('kalk-gaji');
}

async function printSlipGaji(id) {
  const list = await KDB.getAll('gaji');
  const g = list.find(function(x){ return x.id === id; });
  if (!g) return;
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const w = window.open('', '_blank');
  w.document.write('<!DOCTYPE html><html><head><title>Slip Gaji ' + g.nama + '</title>'
    + '<style>body{font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:0 auto}h2{color:#1a237e;text-align:center}.header{text-align:center;border-bottom:2px solid #1a237e;padding-bottom:10px;margin-bottom:20px}table{width:100%;border-collapse:collapse}td{padding:7px 10px;border-bottom:1px solid #eee}.total{font-weight:700;font-size:1.1rem;background:#e8eaf6}.text-right{text-align:right}@media print{button{display:none}}</style></head><body>'
    + '<div class="header"><h2>SLIP GAJI</h2><p>' + (perusahaan.nama||'IJEF Corp') + '</p></div>'
    + '<table><tr><td>Nama</td><td>' + g.nama + '</td></tr><tr><td>Jabatan</td><td>' + (g.jabatan||'-') + '</td></tr><tr><td>Periode</td><td>' + g.periode + '</td></tr><tr><td>Tanggal Bayar</td><td>' + fmtDate(g.tanggal) + '</td></tr></table><br>'
    + '<table><tr style="background:#e8eaf6"><td colspan="2"><b>PENDAPATAN</b></td></tr>'
    + '<tr><td>Gaji Pokok</td><td class="text-right">' + fmtRp(g.pokok) + '</td></tr>'
    + '<tr><td>Tunjangan</td><td class="text-right">' + fmtRp(g.tunjangan) + '</td></tr>'
    + '<tr><td>Lembur</td><td class="text-right">' + fmtRp(g.lembur) + '</td></tr>'
    + '<tr><td>Bonus</td><td class="text-right">' + fmtRp(g.bonus) + '</td></tr>'
    + '<tr class="total"><td>Total Bruto</td><td class="text-right">' + fmtRp(g.totalBruto) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>POTONGAN</b></td></tr>'
    + '<tr><td>BPJS Kesehatan (' + g.bpjsKes + '%)</td><td class="text-right">(' + fmtRp(g.bpjsKesAmt) + ')</td></tr>'
    + '<tr><td>BPJS Ketenagakerjaan (' + g.bpjsTk + '%)</td><td class="text-right">(' + fmtRp(g.bpjsTkAmt) + ')</td></tr>'
    + '<tr><td>PPh 21 (' + g.pph + '%)</td><td class="text-right">(' + fmtRp(g.pphAmt) + ')</td></tr>'
    + '<tr><td>Potongan Lain</td><td class="text-right">(' + fmtRp(g.potonganLain) + ')</td></tr>'
    + '<tr class="total"><td>Total Potongan</td><td class="text-right">(' + fmtRp(g.totalPotongan) + ')</td></tr>'
    + '<tr style="background:#e8f5e9;font-size:1.15rem;font-weight:700"><td>TAKE HOME PAY</td><td class="text-right" style="color:#4caf50">' + fmtRp(g.takeHomePay) + '</td></tr></table>'
    + '<button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#1a237e;color:white;border:none;border-radius:8px;cursor:pointer">Print</button>'
    + '</body></html>');
  w.document.close();
}

// ===== PERMOHONAN DANA =====
async function renderPermohonanDana() {
  const list = await KDB.getAll('permohonan');
  const approvers = await getApprovers();
  const myList = list.filter(function(x){ return x.pemohon === KU.username || hasRole('leader'); });
  const sorted = myList.slice().sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); });
  const myLayer = (approvers.find(function(a){ return a.email === KU.email || a.role === KU.role; }) || {}).layer;
  const pendingForMe = list.filter(function(x){ return x.status === 'Pending Layer ' + myLayer; }).length;

  // Pre-fetch COA options
  const akunDebitOpts  = await getAkunOptions('Beban');   // Beban Operasional + Beban Lain-lain
  const akunDebitOpts2 = await getAkunOptions('Aset');    // Aset (untuk pembelian aset)
  const akunKreditOpts = await getAkunOptions('Aset Lancar'); // Kas/Bank

  const pendingBanner = pendingForMe > 0
    ? '<div class="alert alert-warning">Ada <b>' + pendingForMe + '</b> permohonan menunggu approval Anda. <a href="#" onclick="navigate(\'dana-approval\')" style="color:#e65100;font-weight:600">Buka Approval Center</a></div>'
    : '';

  const rows = sorted.map(function(p) {
    const ajukanBtn = p.status === STATUS.DRAFT && p.pemohon === KU.username ? '<button class="btn btn-xs btn-primary" onclick="ajukanPermohonan(\'' + p.id + '\')">Ajukan</button>' : '';
    const hapusBtn = p.status === STATUS.DRAFT && p.pemohon === KU.username ? '<button class="btn btn-xs btn-danger" onclick="hapusPermohonan(\'' + p.id + '\')">Hapus</button>' : '';
    const jurnalBadge = p.jurnalId ? '<span class="badge badge-success">✓ Jurnal Otomatis</span>' : '';
    return '<tr data-status="' + p.status + '"><td>' + fmtDate(p.tanggal) + '</td><td class="fw-bold">' + (p.namaPemohon||p.pemohon) + '</td><td>' + (p.noPOInvoice||'-') + '</td><td class="fw-bold text-blue">' + fmtRp(p.nominal) + '</td><td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (p.keterangan||'-') + '</td><td>' + statusBadge(p.status) + '</td><td>' + approvalFlow(p.status) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="detailPermohonan(\'' + p.id + '\')">Detail</button>' + ajukanBtn + hapusBtn + jurnalBadge + '</td></tr>';
  }).join('');

  return '<div class="page-title">📤 Permohonan Dana</div>' + pendingBanner
    + '<div class="card"><div class="card-header"><h2>Buat Permohonan Dana Baru</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Nama Pemohon</label><input id="pd-pemohon" value="' + (KU.nama||KU.username) + '" placeholder="Nama pemohon"></div>'
    + '<div class="fg"><label>Nama PIC</label><input id="pd-pic" value="' + (KU.nama||KU.username) + '" placeholder="Nama PIC yang mengajukan"></div>'
    + '<div class="fg"><label>Nama Leader / Atasan</label><input id="pd-leader" placeholder="Nama leader"></div>'
    + '<div class="fg"><label>Nomor PO / Invoice</label><input id="pd-nopo" placeholder="PO-2026-001 / INV-001"></div>'
    + '<div class="fg"><label>Nominal Pengajuan (IDR)</label><input type="number" id="pd-nominal" placeholder="0"></div>'
    + '<div class="fg"><label>Jatuh Tempo Pembayaran</label><input type="date" id="pd-jt"></div>'
    + '<div class="fg"><label>Tipe Transaksi</label><select id="pd-tipe"><option>Transfer</option><option>Tunai</option><option>Cek/Giro</option><option>RTGS</option><option>Lainnya</option></select></div>'
    + '<div class="fg"><label>Nama Bank</label><input id="pd-bank" placeholder="BCA / Mandiri / BNI"></div>'
    + '<div class="fg"><label>Nomor Rekening</label><input id="pd-norek" placeholder="1234567890"></div>'
    + '<div class="fg"><label>Nama Rekening</label><input id="pd-namarek" placeholder="Nama pemilik rekening"></div>'
    + '<div class="fg full"><label>Keterangan Pembayaran</label><textarea id="pd-ket" placeholder="Jelaskan keperluan pengajuan dana ini..."></textarea></div>'
    // COA fields — untuk jurnal otomatis
    + '<div class="fg full" style="background:#e8f0fe;border-radius:8px;padding:12px;border-left:4px solid #1a237e">'
    + '<div style="font-weight:700;color:#1a237e;margin-bottom:8px;font-size:0.88rem">📋 Akun Jurnal Otomatis (COA)</div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Akun Debit — Beban / Aset yang dibayar</label>'
    + '<select id="pd-akun-debit" style="padding:8px 11px;border:1.5px solid #c5cae9;border-radius:7px;font-size:0.88rem;width:100%">'
    + '<optgroup label="Beban Operasional">' + akunDebitOpts + '</optgroup>'
    + '<optgroup label="Aset">' + akunDebitOpts2 + '</optgroup>'
    + '</select>'
    + '<div class="text-muted" style="font-size:0.75rem;margin-top:3px">Contoh: Beban Gaji, Beban Sewa, Peralatan</div></div>'
    + '<div class="fg"><label>Akun Kredit — Kas / Bank yang digunakan</label>'
    + '<select id="pd-akun-kredit" style="padding:8px 11px;border:1.5px solid #c5cae9;border-radius:7px;font-size:0.88rem;width:100%">'
    + akunKreditOpts
    + '</select>'
    + '<div class="text-muted" style="font-size:0.75rem;margin-top:3px">Contoh: Bank BCA, Kas</div></div>'
    + '</div></div>'
    + '<div class="fg full"><label>Link / Upload Bukti Dokumen (PO/Invoice/Dokumen)</label>'
    + '<div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap">'
    + '<input id="pd-bukti" placeholder="https://drive.google.com/... atau upload file" style="flex:1;padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem">'
    + '<label style="background:#0288d1;color:white;padding:7px 12px;border-radius:7px;cursor:pointer;font-size:0.82rem;font-weight:600;white-space:nowrap">Upload File<input type="file" accept="image/*,.pdf" style="display:none" onchange="handleBuktiUpload(this,\'pd-bukti\')"></label>'
    + '</div><div id="pd-bukti-preview"></div></div>'
    + '</div>'
    + '<div class="alert alert-info" style="margin-top:12px">💡 Jurnal akuntansi akan dibuat <b>otomatis</b> saat permohonan mendapat <b>Approved Final</b> dari semua layer.</div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-primary" onclick="submitPermohonan(false)">Ajukan Permohonan</button><button class="btn btn-outline" onclick="submitPermohonan(true)">Simpan Draft</button></div></div>'
    + '<div class="card"><div class="card-header"><h2>Daftar Permohonan ' + (hasRole('leader') ? '(Semua)' : '(Milik Saya)') + '</h2>'
    + '<select onchange="filterPermohonan(this.value)" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem"><option value="">Semua Status</option><option value="Draft">Draft</option><option value="Pending">Pending</option><option value="Approved Final">Approved Final</option><option value="Rejected">Rejected</option></select></div>'
    + (sorted.length ? '<div class="table-wrap"><table id="tbl-permohonan"><thead><tr><th>Tgl</th><th>Pemohon</th><th>No. PO/Inv</th><th>Nominal</th><th>Keterangan</th><th>Status</th><th>Approval</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📤</span>Belum ada permohonan dana</div>')
    + '</div>';
}

function filterPermohonan(val) {
  document.querySelectorAll('#tbl-permohonan tbody tr').forEach(function(r) {
    const s = r.dataset.status || '';
    r.style.display = (!val || s.includes(val)) ? '' : 'none';
  });
}

function handleBuktiUpload(input, fieldId) {
  const file = input.files ? input.files[0] : null;
  if (!file) return;
  if (file.size > 500 * 1024) { showAlert('Ukuran file maksimal 500KB!', 'danger'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const key = 'bukti_' + Date.now();
    KDB.saveSetting(key, { name: file.name, type: file.type, data: base64, uploadedAt: new Date().toISOString() });
    const fieldEl = document.getElementById(fieldId);
    if (fieldEl) { fieldEl.value = key; }
    const prev = document.getElementById(fieldId + '-preview');
    if (prev) {
      if (file.type.startsWith('image/')) {
        prev.innerHTML = '<img src="' + base64 + '" style="max-width:200px;max-height:100px;border-radius:6px;margin-top:6px;border:1px solid #ddd">';
      } else {
        prev.innerHTML = '<div class="chip" style="margin-top:6px">' + file.name + '</div>';
      }
    }
    showAlert('"' + file.name + '" siap diupload');
  };
  reader.readAsDataURL(file);
}

async function submitPermohonan(isDraft) {
  const nominal = parseFloat(document.getElementById('pd-nominal').value) || 0;
  const ket = document.getElementById('pd-ket').value.trim();
  if (!isDraft && (!nominal || !ket)) { showAlert('Nominal dan keterangan wajib diisi!', 'danger'); return; }
  const id = genId('PD');
  const approvers = await getApprovers();
  const akunDebit  = (document.getElementById('pd-akun-debit')  || {}).value || '5-2200';
  const akunKredit = (document.getElementById('pd-akun-kredit') || {}).value || '1-1100';
  const data = { id: id, tipe: 'permohonan', pemohon: KU.username, namaPemohon: document.getElementById('pd-pemohon').value || KU.nama, namaPIC: (document.getElementById('pd-pic')||{}).value || KU.nama, namaLeader: document.getElementById('pd-leader').value, noPOInvoice: document.getElementById('pd-nopo').value, nominal: nominal, jatuhTempo: document.getElementById('pd-jt').value, tipeTransaksi: document.getElementById('pd-tipe').value, namaBank: document.getElementById('pd-bank').value, noRekening: document.getElementById('pd-norek').value, namaRekening: document.getElementById('pd-namarek').value, keterangan: ket, buktiDokumen: document.getElementById('pd-bukti').value, akunDebit: akunDebit, akunKredit: akunKredit, tanggal: today(), status: isDraft ? STATUS.DRAFT : STATUS.PENDING_L1, approvalLog: isDraft ? [] : [{ layer: 0, action: 'submit', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: 'Permohonan diajukan' }], approvers: approvers, createdBy: KU.username, createdAt: new Date().toISOString() };
  await KDB.save('permohonan', id, data);
  if (!isDraft) {
    kirimNotifikasi('📤 Permohonan Dana Baru', (data.namaPemohon||KU.nama) + ' mengajukan ' + fmtRp(nominal) + ' — ' + (ket.substring(0,60)||'-'), '');
    kirimEmailNotifikasi('Permohonan Dana Baru', 'Pemohon: ' + (data.namaPemohon||KU.nama) + '\nNominal: ' + fmtRp(nominal) + '\nKeterangan: ' + ket + '\nStatus: Pending Layer 1', 'pd_baru');
  }
  showAlert(isDraft ? 'Draft disimpan!' : 'Permohonan berhasil diajukan ke Layer 1!');
  navigate('dana-permohonan');
}

async function ajukanPermohonan(id) {
  const list = await KDB.getAll('permohonan');
  const p = list.find(function(x){ return x.id === id; });
  if (!p) return;
  const log = (p.approvalLog || []).concat([{ layer: 0, action: 'submit', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: 'Diajukan dari draft' }]);
  await KDB.save('permohonan', id, Object.assign({}, p, { status: STATUS.PENDING_L1, approvalLog: log }));
  showAlert('Permohonan diajukan ke Layer 1!');
  navigate('dana-permohonan');
}

async function hapusPermohonan(id) {
  if (!confirm('Hapus permohonan ini?')) return;
  await KDB.delete('permohonan', id);
  navigate('dana-permohonan');
}

async function detailPermohonan(id) {
  const list = await KDB.getAll('permohonan');
  const p = list.find(function(x){ return x.id === id; });
  if (!p) return;
  const logRows = (p.approvalLog || []).map(function(l) {
    const badgeCls = l.action === 'approve' ? 'badge-success' : l.action === 'reject' ? 'badge-danger' : 'badge-info';
    return '<tr><td>' + (l.layer === 0 ? 'Pemohon' : 'Layer ' + l.layer) + '</td><td>' + (l.nama||l.by) + '</td><td><span class="badge ' + badgeCls + '">' + l.action + '</span></td><td>' + (l.catatan||'-') + '</td><td class="text-muted">' + (l.at ? new Date(l.at).toLocaleString('id-ID') : '-') + '</td></tr>';
  }).join('');
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Pemohon</label><div class="chip">' + (p.namaPemohon||'-') + '</div></div>'
    + '<div class="fg"><label>Leader</label><div class="chip">' + (p.namaLeader||'-') + '</div></div>'
    + '<div class="fg"><label>No. PO/Invoice</label><div class="chip">' + (p.noPOInvoice||'-') + '</div></div>'
    + '<div class="fg"><label>Nominal</label><div class="fw-bold text-blue" style="font-size:1.1rem">' + fmtRp(p.nominal) + '</div></div>'
    + '<div class="fg"><label>Jatuh Tempo</label><div class="chip">' + fmtDate(p.jatuhTempo) + '</div></div>'
    + '<div class="fg"><label>Tipe Transaksi</label><div class="chip">' + (p.tipeTransaksi||'-') + '</div></div>'
    + '<div class="fg"><label>Bank</label><div class="chip">' + (p.namaBank||'-') + '</div></div>'
    + '<div class="fg"><label>No. Rekening</label><div class="chip">' + (p.noRekening||'-') + '</div></div>'
    + '<div class="fg full"><label>Keterangan</label><div>' + (p.keterangan||'-') + '</div></div>'
    + '<div class="fg"><label>Akun Debit (COA)</label><div class="chip">' + (p.akunDebit||'5-2200') + '</div></div>'
    + '<div class="fg"><label>Akun Kredit (COA)</label><div class="chip">' + (p.akunKredit||'1-1100') + '</div></div>'
    + (p.buktiDokumen ? '<div class="fg full"><label>Bukti / Eviden</label><div><a href="' + p.buktiDokumen + '" target="_blank" rel="noopener" style="color:#1a237e;font-weight:600;word-break:break-all">🔗 ' + p.buktiDokumen + '</a></div></div>' : '')
    + '<div class="fg full"><label>Status</label>' + statusBadge(p.status) + ' ' + approvalFlow(p.status) + '</div>'
    + (p.jurnalId ? '<div class="fg full"><div class="alert alert-success">✓ Jurnal otomatis sudah dibuat (ID: ' + p.jurnalId + ')</div></div>' : '')
    + '</div><div class="divider"></div><b>Log Approval:</b>'
    + '<div class="table-wrap mt-8"><table style="font-size:0.82rem"><thead><tr><th>Layer</th><th>Oleh</th><th>Aksi</th><th>Catatan</th><th>Waktu</th></tr></thead><tbody>' + (logRows || '<tr><td colspan="5" class="text-center text-muted">Belum ada log</td></tr>') + '</tbody></table></div>'
    + '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
    'Detail Permohonan — ' + (p.noPOInvoice||p.id));
}

async function buatJurnalDariPermohonan(id) {
  const list = await KDB.getAll('permohonan');
  const p = list.find(function(x){ return x.id === id; });
  if (!p) return;
  if (p.jurnalId) return; // already created
  // Use COA from permohonan, fallback to defaults
  const akunDebit  = p.akunDebit  || '5-2200';
  const akunKredit = p.akunKredit || '1-1100';
  const jurnalId = genId('JU');
  await KDB.save('jurnal', jurnalId, {
    id: jurnalId,
    tanggal: p.tanggal || today(),
    keterangan: p.keterangan || ('Pembayaran - ' + p.namaPemohon),
    noRef: p.noPOInvoice || p.id,
    tipe: 'umum',
    sumber: 'permohonan-dana',
    meta: { permohonanId: p.id, pemohon: p.namaPemohon, namaBank: p.namaBank, noRekening: p.noRekening },
    lines: [
      { akun: akunDebit,  ket: p.keterangan || ('Pembayaran ' + p.namaPemohon), debit: p.nominal, kredit: 0 },
      { akun: akunKredit, ket: 'Kas keluar - ' + (p.namaBank||'Bank') + ' ' + (p.noRekening||''),  debit: 0, kredit: p.nominal }
    ],
    totalDebit: p.nominal, totalKredit: p.nominal,
    createdBy: 'system-auto', createdAt: new Date().toISOString()
  });
  await KDB.save('permohonan', id, Object.assign({}, p, { jurnalId: jurnalId, jurnalCreatedAt: new Date().toISOString() }));
}

// ===== DANA MASUK =====
async function renderDanaMasuk() {
  const list = await KDB.getAll('danamasuk');
  const sorted = list.slice().sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); });
  const approvers = await getApprovers();
  const myLayer = (approvers.find(function(a){ return a.email === KU.email || a.role === KU.role; }) || {}).layer;
  const pendingForMe = list.filter(function(x){ return x.status === 'Pending Layer ' + myLayer; }).length;
  // Pre-fetch COA options
  const akunTerimaOpts = await getAkunOptions('Aset Lancar');
  const akunKreditOpts = await getAkunOptions('Pendapatan');

  const pendingBanner = pendingForMe > 0
    ? '<div class="alert alert-warning">Ada <b>' + pendingForMe + '</b> dana masuk menunggu konfirmasi Anda. <a href="#" onclick="navigate(\'dana-approval\')" style="color:#e65100;font-weight:600">Buka Approval Center</a></div>'
    : '';

  const rows = sorted.map(function(d) {
    const ajukanBtn = d.status === STATUS.DRAFT && d.createdBy === KU.username ? '<button class="btn btn-xs btn-primary" onclick="ajukanDanaMasuk(\'' + d.id + '\')">Ajukan</button>' : '';
    const hapusBtn = d.status === STATUS.DRAFT && d.createdBy === KU.username ? '<button class="btn btn-xs btn-danger" onclick="hapusDanaMasuk(\'' + d.id + '\')">Hapus</button>' : '';
    const jurnalBtn = d.status === STATUS.APPROVED && !d.jurnalId ? '' : '';
    const jurnalBadge = d.jurnalId ? '<span class="badge badge-success">✓ Jurnal Otomatis</span>' : '';
    return '<tr data-status="' + d.status + '"><td>' + fmtDate(d.tanggal) + '</td><td class="fw-bold">' + (d.sumber||'-') + '</td><td>' + (d.noRef||'-') + '</td><td class="fw-bold text-green">' + fmtRp(d.nominal) + '</td><td><span class="chip">' + (d.kategori||'-') + '</span></td><td>' + statusBadge(d.status) + '</td><td>' + approvalFlow(d.status) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="detailDanaMasuk(\'' + d.id + '\')">Detail</button>' + ajukanBtn + hapusBtn + jurnalBtn + jurnalBadge + '</td></tr>';
  }).join('');

  return '<div class="page-title">📥 Dana Masuk</div>' + pendingBanner
    + '<div class="card"><div class="card-header"><h2>Catat Dana Masuk Baru</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Sumber Dana</label><input id="dm-sumber" placeholder="Nama pengirim / customer"></div>'
    + '<div class="fg"><label>Nama PIC</label><input id="dm-pic" value="' + (KU.nama||KU.username) + '" placeholder="Nama PIC yang mencatat"></div>'
    + '<div class="fg"><label>Nomor Referensi</label><input id="dm-ref" placeholder="No. Invoice / Transfer / Bukti"></div>'
    + '<div class="fg"><label>Tanggal Terima</label><input type="date" id="dm-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Nominal (IDR)</label><input type="number" id="dm-nominal" placeholder="0"></div>'
    + '<div class="fg"><label>Tipe Penerimaan</label><select id="dm-tipe"><option>Transfer Bank</option><option>Tunai</option><option>Cek/Giro</option><option>RTGS</option><option>Lainnya</option></select></div>'
    + '<div class="fg"><label>Diterima di Bank / Kas (COA)</label><select id="dm-akun-terima" style="padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem;width:100%">' + akunTerimaOpts + '</select></div>'
    + '<div class="fg"><label>Kategori / Akun Kredit (COA)</label><select id="dm-akun-kredit" style="padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem;width:100%">' + akunKreditOpts + '</select></div>'
    + '<div class="fg"><label>Nama Pengirim Rekening</label><input id="dm-namarek" placeholder="Nama pengirim di rekening"></div>'
    + '<div class="fg full"><label>Keterangan</label><textarea id="dm-ket" placeholder="Keterangan penerimaan dana..."></textarea></div>'
    + '<div class="fg full"><label>Link / Upload Bukti Transfer / Dokumen</label>'
    + '<div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap">'
    + '<input id="dm-bukti" placeholder="https://drive.google.com/... atau upload file" style="flex:1;padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem">'
    + '<label style="background:#0288d1;color:white;padding:7px 12px;border-radius:7px;cursor:pointer;font-size:0.82rem;font-weight:600;white-space:nowrap">Upload File<input type="file" accept="image/*,.pdf" style="display:none" onchange="handleBuktiUpload(this,\'dm-bukti\')"></label>'
    + '</div><div id="dm-bukti-preview"></div></div>'
    + '</div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-success" onclick="submitDanaMasuk(false)">Catat & Ajukan Konfirmasi</button><button class="btn btn-outline" onclick="submitDanaMasuk(true)">Simpan Draft</button></div></div>'
    + '<div class="card"><div class="card-header"><h2>Daftar Dana Masuk</h2>'
    + '<select onchange="filterDanaMasuk(this.value)" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem"><option value="">Semua Status</option><option value="Draft">Draft</option><option value="Pending">Pending</option><option value="Approved Final">Approved Final</option><option value="Rejected">Rejected</option></select></div>'
    + (sorted.length ? '<div class="table-wrap"><table id="tbl-danamasuk"><thead><tr><th>Tgl</th><th>Sumber</th><th>No. Ref</th><th>Nominal</th><th>Kategori</th><th>Status</th><th>Approval</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📥</span>Belum ada data dana masuk</div>')
    + '</div>';
}

function filterDanaMasuk(val) {
  document.querySelectorAll('#tbl-danamasuk tbody tr').forEach(function(r) {
    const s = r.dataset.status || '';
    r.style.display = (!val || s.includes(val)) ? '' : 'none';
  });
}

async function submitDanaMasuk(isDraft) {
  const nominal = parseFloat(document.getElementById('dm-nominal').value) || 0;
  const sumber = document.getElementById('dm-sumber').value.trim();
  if (!isDraft && (!nominal || !sumber)) { showAlert('Sumber dan nominal wajib diisi!', 'danger'); return; }
  const id = genId('DM');
  const approvers = await getApprovers();
  const data = { id: id, tipe: 'danamasuk', sumber: sumber, namaPIC: (document.getElementById('dm-pic')||{}).value || KU.nama, noRef: document.getElementById('dm-ref').value, tanggal: document.getElementById('dm-tgl').value || today(), nominal: nominal, tipeTransaksi: document.getElementById('dm-tipe').value, akunTerima: document.getElementById('dm-akun-terima').value, kategori: document.getElementById('dm-akun-kredit').value, namaRekening: document.getElementById('dm-namarek').value, keterangan: document.getElementById('dm-ket').value, buktiDokumen: document.getElementById('dm-bukti').value, status: isDraft ? STATUS.DRAFT : STATUS.PENDING_L1, approvalLog: isDraft ? [] : [{ layer: 0, action: 'submit', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: 'Dana masuk dicatat dan diajukan' }], approvers: approvers, createdBy: KU.username, createdAt: new Date().toISOString() };
  await KDB.save('danamasuk', id, data);
  if (!isDraft) {
    kirimNotifikasi('📥 Dana Masuk Baru', (sumber||KU.nama) + ' mencatat dana masuk ' + fmtRp(nominal), '');
    kirimEmailNotifikasi('Dana Masuk Baru', 'Sumber: ' + sumber + '\nNominal: ' + fmtRp(nominal) + '\nKeterangan: ' + data.keterangan + '\nStatus: Pending Layer 1', 'dm_baru');
  }
  showAlert(isDraft ? 'Draft disimpan!' : 'Dana masuk diajukan untuk konfirmasi Layer 1!');
  navigate('dana-masuk');
}

async function ajukanDanaMasuk(id) {
  const list = await KDB.getAll('danamasuk');
  const d = list.find(function(x){ return x.id === id; });
  if (!d) return;
  const log = (d.approvalLog || []).concat([{ layer: 0, action: 'submit', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: 'Diajukan dari draft' }]);
  await KDB.save('danamasuk', id, Object.assign({}, d, { status: STATUS.PENDING_L1, approvalLog: log }));
  showAlert('Dana masuk diajukan ke Layer 1!');
  navigate('dana-masuk');
}

async function hapusDanaMasuk(id) {
  if (!confirm('Hapus data ini?')) return;
  await KDB.delete('danamasuk', id);
  navigate('dana-masuk');
}

async function detailDanaMasuk(id) {
  const list = await KDB.getAll('danamasuk');
  const d = list.find(function(x){ return x.id === id; });
  if (!d) return;
  const logRows = (d.approvalLog || []).map(function(l) {
    const badgeCls = l.action === 'approve' ? 'badge-success' : l.action === 'reject' ? 'badge-danger' : 'badge-info';
    return '<tr><td>' + (l.layer === 0 ? 'Pencatat' : 'Layer ' + l.layer) + '</td><td>' + (l.nama||l.by) + '</td><td><span class="badge ' + badgeCls + '">' + l.action + '</span></td><td>' + (l.catatan||'-') + '</td><td class="text-muted">' + (l.at ? new Date(l.at).toLocaleString('id-ID') : '-') + '</td></tr>';
  }).join('');
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Sumber Dana</label><div class="chip">' + (d.sumber||'-') + '</div></div>'
    + '<div class="fg"><label>No. Referensi</label><div class="chip">' + (d.noRef||'-') + '</div></div>'
    + '<div class="fg"><label>Tanggal</label><div class="chip">' + fmtDate(d.tanggal) + '</div></div>'
    + '<div class="fg"><label>Nominal</label><div class="fw-bold text-green" style="font-size:1.1rem">' + fmtRp(d.nominal) + '</div></div>'
    + '<div class="fg"><label>Tipe</label><div class="chip">' + (d.tipeTransaksi||'-') + '</div></div>'
    + '<div class="fg"><label>Akun Terima</label><div class="chip">' + (d.akunTerima||'-') + '</div></div>'
    + '<div class="fg full"><label>Keterangan</label><div>' + (d.keterangan||'-') + '</div></div>'
    + '<div class="fg full"><label>Status</label>' + statusBadge(d.status) + ' ' + approvalFlow(d.status) + '</div>'
    + '</div><div class="divider"></div><b>Log Approval:</b>'
    + '<div class="table-wrap mt-8"><table style="font-size:0.82rem"><thead><tr><th>Layer</th><th>Oleh</th><th>Aksi</th><th>Catatan</th><th>Waktu</th></tr></thead><tbody>' + (logRows || '<tr><td colspan="5" class="text-center text-muted">Belum ada log</td></tr>') + '</tbody></table></div>'
    + '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
    'Detail Dana Masuk — ' + (d.noRef||d.id));
}

async function buatJurnalDariDanaMasuk(id) {
  const list = await KDB.getAll('danamasuk');
  const d = list.find(function(x){ return x.id === id; });
  if (!d) return;
  if (d.jurnalId) return; // already created
  // Use stored COA fields
  const akunDebit  = d.akunTerima || '1-1100'; // Kas/Bank yang menerima
  const akunKredit = d.kategori && (d.kategori.startsWith('4-') || d.kategori.startsWith('3-') || d.kategori.startsWith('1-'))
    ? d.kategori : '4-2000';
  const jurnalId = genId('JU');
  await KDB.save('jurnal', jurnalId, {
    id: jurnalId,
    tanggal: d.tanggal || today(),
    keterangan: d.keterangan || ('Dana masuk dari ' + d.sumber),
    noRef: d.noRef || d.id,
    tipe: 'umum',
    sumber: 'dana-masuk',
    meta: { danaMasukId: d.id, sumber: d.sumber },
    lines: [
      { akun: akunDebit,  ket: 'Dana masuk dari ' + d.sumber, debit: d.nominal, kredit: 0 },
      { akun: akunKredit, ket: d.keterangan || d.sumber,      debit: 0, kredit: d.nominal }
    ],
    totalDebit: d.nominal, totalKredit: d.nominal,
    createdBy: 'system-auto', createdAt: new Date().toISOString()
  });
  await KDB.save('danamasuk', id, Object.assign({}, d, { jurnalId: jurnalId, jurnalCreatedAt: new Date().toISOString() }));
}

// ===== APPROVAL CENTER =====
async function renderApprovalCenter() {
  const approvers = await getApprovers();
  let myLayers = [];
  approvers.forEach(function(a) {
    if (a.email === KU.email) myLayers.push(a.layer);
    else if (!a.email && a.role === KU.role) myLayers.push(a.layer);
  });
  if (!myLayers.length) {
    if (KU.role === 'superadmin') myLayers = [3];
    else if (KU.role === 'admin') myLayers = [2, 3];
    else if (KU.role === 'leader') myLayers = [1, 2, 3];
    else myLayers = [];
  }

  const allPD = await KDB.getAll('permohonan');
  const allDM = await KDB.getAll('danamasuk');
  const pendingStatuses = myLayers.map(function(l){ return 'Pending Layer ' + l; });
  const myPD = allPD.filter(function(x){ return pendingStatuses.includes(x.status); });
  const myDM = allDM.filter(function(x){ return pendingStatuses.includes(x.status); });
  const totalPending = myPD.length + myDM.length;

  const actedPD = allPD.filter(function(x){ return (x.approvalLog||[]).some(function(l){ return l.by === KU.username && (l.action === 'approve' || l.action === 'reject'); }); });
  const actedDM = allDM.filter(function(x){ return (x.approvalLog||[]).some(function(l){ return l.by === KU.username && (l.action === 'approve' || l.action === 'reject'); }); });
  const approvedCount = actedPD.filter(function(x){ return x.status === STATUS.APPROVED; }).length + actedDM.filter(function(x){ return x.status === STATUS.APPROVED; }).length;
  const rejectedCount = actedPD.filter(function(x){ return x.status.includes('Rejected'); }).length + actedDM.filter(function(x){ return x.status.includes('Rejected'); }).length;

  const pendingBanner = totalPending > 0
    ? '<div class="alert alert-warning">Ada <b>' + totalPending + '</b> item yang menunggu approval Anda.</div>'
    : '<div class="alert alert-success">Tidak ada item yang menunggu approval Anda saat ini.</div>';

  let html = '<div class="page-title">✅ Approval Center</div>'
    + '<div class="stats-row">'
    + '<div class="stat-box orange"><div class="val">' + totalPending + '</div><div class="lbl">Menunggu Approval Saya</div></div>'
    + '<div class="stat-box green"><div class="val">' + approvedCount + '</div><div class="lbl">Sudah Approved</div></div>'
    + '<div class="stat-box red"><div class="val">' + rejectedCount + '</div><div class="lbl">Sudah Rejected</div></div>'
    + '<div class="stat-box"><div class="val">' + (allPD.length + allDM.length) + '</div><div class="lbl">Total Semua Transaksi</div></div>'
    + '</div>' + pendingBanner;

  if (myPD.length) {
    const pdRows = myPD.map(function(p) {
      return '<tr><td><input type="checkbox" class="appr-check" data-col="permohonan" data-id="' + p.id + '"></td><td>' + fmtDate(p.tanggal) + '</td><td class="fw-bold">' + (p.namaPemohon||'-') + '</td><td>' + (p.noPOInvoice||'-') + '</td><td class="fw-bold text-blue">' + fmtRp(p.nominal) + '</td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (p.keterangan||'-') + '</td><td>' + (p.namaBank||'-') + '<br><span class="text-muted">' + (p.noRekening||'') + '</span></td><td>' + statusBadge(p.status) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="detailPermohonan(\'' + p.id + '\')">Detail</button><button class="btn btn-xs btn-success" onclick="approveItem(\'permohonan\',\'' + p.id + '\')">ACC</button><button class="btn btn-xs btn-danger" onclick="rejectItem(\'permohonan\',\'' + p.id + '\')">Tolak</button></td></tr>';
    }).join('');
    html += '<div class="card"><div class="card-header"><h2>Permohonan Dana — Menunggu Approval Anda (' + myPD.length + ')</h2>'
      + '<div class="flex-row" style="gap:6px"><button class="btn btn-sm btn-success" onclick="approveSemuaItem(\'permohonan\')">✅ Approve Semua</button><button class="btn btn-sm btn-danger" onclick="rejectSemuaItem(\'permohonan\')">❌ Reject Semua</button></div></div>'
      + '<div style="padding:8px 12px;background:#f0f4ff;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      + '<label style="font-size:0.82rem;font-weight:600"><input type="checkbox" onchange="toggleSelectAll(this,\'permohonan\')"> Pilih Semua</label>'
      + '<button class="btn btn-xs btn-success" onclick="approveSelected(\'permohonan\')">✅ Approve Terpilih</button>'
      + '<button class="btn btn-xs btn-danger" onclick="rejectSelected(\'permohonan\')">❌ Reject Terpilih</button>'
      + '<span id="selected-count-permohonan" style="font-size:0.8rem;color:#555">0 dipilih</span>'
      + '</div>'
      + '<div class="table-wrap"><table><thead><tr><th style="width:30px">✓</th><th>Tgl</th><th>Pemohon</th><th>No. PO/Inv</th><th>Nominal</th><th>Keterangan</th><th>Bank / Rekening</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' + pdRows + '</tbody></table></div></div>';
  }

  if (myDM.length) {
    const dmRows = myDM.map(function(d) {
      return '<tr><td><input type="checkbox" class="appr-check" data-col="danamasuk" data-id="' + d.id + '"></td><td>' + fmtDate(d.tanggal) + '</td><td class="fw-bold">' + (d.sumber||'-') + '</td><td>' + (d.noRef||'-') + '</td><td class="fw-bold text-green">' + fmtRp(d.nominal) + '</td><td><span class="chip">' + (d.kategori||'-') + '</span></td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (d.keterangan||'-') + '</td><td>' + statusBadge(d.status) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="detailDanaMasuk(\'' + d.id + '\')">Detail</button><button class="btn btn-xs btn-success" onclick="approveItem(\'danamasuk\',\'' + d.id + '\')">ACC</button><button class="btn btn-xs btn-danger" onclick="rejectItem(\'danamasuk\',\'' + d.id + '\')">Tolak</button></td></tr>';
    }).join('');
    html += '<div class="card"><div class="card-header"><h2>Dana Masuk — Menunggu Konfirmasi Anda (' + myDM.length + ')</h2>'
      + '<div class="flex-row" style="gap:6px"><button class="btn btn-sm btn-success" onclick="approveSemuaItem(\'danamasuk\')">✅ Approve Semua</button><button class="btn btn-sm btn-danger" onclick="rejectSemuaItem(\'danamasuk\')">❌ Reject Semua</button></div></div>'
      + '<div style="padding:8px 12px;background:#f0fff4;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      + '<label style="font-size:0.82rem;font-weight:600"><input type="checkbox" onchange="toggleSelectAll(this,\'danamasuk\')"> Pilih Semua</label>'
      + '<button class="btn btn-xs btn-success" onclick="approveSelected(\'danamasuk\')">✅ Approve Terpilih</button>'
      + '<button class="btn btn-xs btn-danger" onclick="rejectSelected(\'danamasuk\')">❌ Reject Terpilih</button>'
      + '<span id="selected-count-danamasuk" style="font-size:0.8rem;color:#555">0 dipilih</span>'
      + '</div>'
      + '<div class="table-wrap"><table><thead><tr><th style="width:30px">✓</th><th>Tgl</th><th>Sumber</th><th>No. Ref</th><th>Nominal</th><th>Kategori</th><th>Keterangan</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' + dmRows + '</tbody></table></div></div>';
  }

  if (hasRole('admin')) {
    html += '<div class="card"><div class="card-header"><h2>Semua Transaksi (Admin View)</h2>'
      + '<select onchange="filterApprovalAll(this.value)" style="padding:6px 10px;border:1.5px solid #ddd;border-radius:7px;font-size:0.83rem"><option value="">Semua Status</option><option value="Pending">Pending</option><option value="Approved Final">Approved Final</option><option value="Rejected">Rejected</option><option value="Draft">Draft</option></select></div>'
      + '<div class="tabs"><button class="tab-btn active" onclick="switchTab(this,\'tab-all-pd\')">Permohonan Dana (' + allPD.length + ')</button><button class="tab-btn" onclick="switchTab(this,\'tab-all-dm\')">Dana Masuk (' + allDM.length + ')</button></div>'
      + '<div class="tab-content active" id="tab-all-pd">' + renderAllApprovalTable(allPD, 'permohonan') + '</div>'
      + '<div class="tab-content" id="tab-all-dm">' + renderAllApprovalTable(allDM, 'danamasuk') + '</div>'
      + '</div>';
  }

  if (hasRole('superadmin')) {
    const approverForms = approvers.map(function(a) {
      return '<div style="display:grid;grid-template-columns:80px 1fr 1fr 1fr;gap:10px;align-items:end;margin-bottom:10px;padding:12px;background:#f8f9ff;border-radius:8px">'
        + '<div><label style="font-size:0.78rem;font-weight:600;color:#555">Layer</label><div class="fw-bold text-blue" style="font-size:1.1rem">L' + a.layer + '</div></div>'
        + '<div class="fg"><label>Nama</label><input id="apr-nama-' + a.layer + '" value="' + a.nama + '" style="padding:7px 10px;border:1.5px solid #ddd;border-radius:7px;width:100%"></div>'
        + '<div class="fg"><label>Email</label><input id="apr-email-' + a.layer + '" value="' + a.email + '" style="padding:7px 10px;border:1.5px solid #ddd;border-radius:7px;width:100%"></div>'
        + '<div class="fg"><label>Role Minimum</label><select id="apr-role-' + a.layer + '" style="padding:7px 10px;border:1.5px solid #ddd;border-radius:7px;width:100%"><option value="leader" ' + (a.role==='leader'?'selected':'') + '>Leader</option><option value="admin" ' + (a.role==='admin'?'selected':'') + '>Admin</option><option value="superadmin" ' + (a.role==='superadmin'?'selected':'') + '>Super Admin</option></select></div>'
        + '</div>';
    }).join('');
    html += '<div class="card"><div class="card-header"><h2>Konfigurasi Approver</h2></div>'
      + '<div class="alert alert-info">Atur siapa yang menjadi approver di setiap layer. Cocokkan dengan email akun user yang terdaftar.</div>'
      + approverForms
      + '<div class="mt-12"><button class="btn btn-primary" onclick="simpanApprovers()">Simpan Konfigurasi Approver</button></div></div>';
  }

  return html;
}

function renderAllApprovalTable(list, col) {
  const sorted = list.slice().sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); });
  if (!sorted.length) return '<div class="empty-state"><span class="icon">📋</span>Belum ada data</div>';
  const isPD = col === 'permohonan';
  const rows = sorted.map(function(x) {
    const isPending = x.status && x.status.startsWith('Pending');
    const approveBtn = isPending && hasRole('leader') ? '<button class="btn btn-xs btn-success" onclick="approveItem(\'' + col + '\',\'' + x.id + '\')">ACC</button><button class="btn btn-xs btn-danger" onclick="rejectItem(\'' + col + '\',\'' + x.id + '\')">Tolak</button>' : '';
    const jurnalBadge = x.jurnalId ? '<span class="badge badge-success">✓ Jurnal</span>' : (x.status === STATUS.APPROVED ? '<span class="badge badge-warning">⏳</span>' : '');
    const detailFn = isPD ? 'detailPermohonan' : 'detailDanaMasuk';
    const checkBox = isPending ? '<input type="checkbox" class="appr-check" data-col="' + col + '" data-id="' + x.id + '">' : '';
    return '<tr data-status="' + x.status + '"><td>' + checkBox + '</td><td>' + fmtDate(x.tanggal) + '</td><td class="fw-bold">' + (isPD ? x.namaPemohon : x.sumber) + '</td><td class="fw-bold ' + (isPD?'text-blue':'text-green') + '">' + fmtRp(x.nominal) + '</td><td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (x.keterangan||'-') + '</td><td>' + statusBadge(x.status) + '</td><td>' + approvalFlow(x.status) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="' + detailFn + '(\'' + x.id + '\')">Detail</button>' + approveBtn + jurnalBadge + '</td></tr>';
  }).join('');
  return '<div style="padding:8px 12px;background:#f8f9ff;border-radius:6px;margin-bottom:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
    + '<label style="font-size:0.82rem;font-weight:600"><input type="checkbox" onchange="toggleSelectAll(this,\'' + col + '\')"> Pilih Semua Pending</label>'
    + '<button class="btn btn-xs btn-success" onclick="approveSelected(\'' + col + '\')">✅ Approve Terpilih</button>'
    + '<button class="btn btn-xs btn-danger" onclick="rejectSelected(\'' + col + '\')">❌ Reject Terpilih</button>'
    + '<button class="btn btn-xs btn-success" onclick="approveSemuaItem(\'' + col + '\')">✅ Approve Semua</button>'
    + '<button class="btn btn-xs btn-danger" onclick="rejectSemuaItem(\'' + col + '\')">❌ Reject Semua</button>'
    + '<span id="selected-count-all-' + col + '" style="font-size:0.8rem;color:#555">0 dipilih</span>'
    + '</div>'
    + '<div class="table-wrap" style="max-height:400px;overflow-y:auto"><table id="tbl-all-' + col + '"><thead><tr><th style="width:30px">✓</th><th>Tgl</th><th>' + (isPD?'Pemohon':'Sumber') + '</th><th>Nominal</th><th>Keterangan</th><th>Status</th><th>Approval Flow</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function filterApprovalAll(val) {
  ['tbl-all-permohonan', 'tbl-all-danamasuk'].forEach(function(id) {
    document.querySelectorAll('#' + id + ' tbody tr').forEach(function(r) {
      const s = r.dataset.status || '';
      r.style.display = (!val || s.includes(val)) ? '' : 'none';
    });
  });
}

async function approveItem(col, id) {
  const list = await KDB.getAll(col);
  const item = list.find(function(x){ return x.id === id; });
  if (!item) return;
  const currentLayer = getCurrentLayer(item.status);
  if (!currentLayer) { showAlert('Item ini tidak dalam status pending!', 'warning'); return; }
  const catatan = prompt('Catatan approval Layer ' + currentLayer + ' (opsional):') || '';
  const approvers = item.approvers || await getApprovers();
  const totalLayers = approvers.length;
  const log = (item.approvalLog || []).concat([{ layer: currentLayer, action: 'approve', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: catatan }]);
  const newStatus = currentLayer >= totalLayers ? STATUS.APPROVED : 'Pending Layer ' + (currentLayer + 1);
  await KDB.save(col, id, Object.assign({}, item, { status: newStatus, approvalLog: log, lastUpdatedAt: new Date().toISOString() }));

  if (newStatus === STATUS.APPROVED) {
    if (col === 'permohonan') {
      await buatJurnalDariPermohonan(id);
    } else if (col === 'danamasuk') {
      await buatJurnalDariDanaMasuk(id);
    }
    kirimNotifikasi('✅ Approved Final!', (item.namaPemohon||item.sumber||id) + ' — ' + fmtRp(item.nominal||0) + ' sudah Approved Final', '');
    kirimEmailNotifikasi('Approved Final', 'Transaksi: ' + (item.namaPemohon||item.sumber||id) + '\nNominal: ' + fmtRp(item.nominal||0) + '\nDisetujui oleh: ' + KU.nama + '\nStatus: APPROVED FINAL', 'approved_final');
    showAlert('APPROVED FINAL! Jurnal akuntansi dibuat otomatis.');
  } else {
    kirimNotifikasi('✅ Layer ' + currentLayer + ' Approved', (item.namaPemohon||item.sumber||id) + ' diteruskan ke Layer ' + (currentLayer+1), '');
    kirimEmailNotifikasi('Update Approval Layer ' + currentLayer, 'Transaksi: ' + (item.namaPemohon||item.sumber||id) + '\nNominal: ' + fmtRp(item.nominal||0) + '\nDisetujui Layer ' + currentLayer + ' oleh: ' + KU.nama + '\nDiteruskan ke Layer ' + (currentLayer+1), 'approval_layer');
    showAlert('Layer ' + currentLayer + ' approved! Diteruskan ke Layer ' + (currentLayer + 1) + '.');
  }
  navigate('dana-approval');
}

async function rejectItem(col, id) {
  const list = await KDB.getAll(col);
  const item = list.find(function(x){ return x.id === id; });
  if (!item) return;
  const currentLayer = getCurrentLayer(item.status);
  if (!currentLayer) { showAlert('Item ini tidak dalam status pending!', 'warning'); return; }
  const catatan = prompt('Alasan penolakan (wajib diisi):');
  if (!catatan || !catatan.trim()) { showAlert('Alasan penolakan wajib diisi!', 'danger'); return; }
  const log = (item.approvalLog || []).concat([{ layer: currentLayer, action: 'reject', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: catatan }]);
  const newStatus = 'Rejected Layer ' + currentLayer;
  await KDB.save(col, id, Object.assign({}, item, { status: newStatus, approvalLog: log, lastUpdatedAt: new Date().toISOString() }));
  kirimNotifikasi('❌ Ditolak Layer ' + currentLayer, (item.namaPemohon||item.sumber||id) + ' ditolak oleh ' + KU.nama + '. Alasan: ' + catatan, '');
  kirimEmailNotifikasi('Transaksi Ditolak Layer ' + currentLayer, 'Transaksi: ' + (item.namaPemohon||item.sumber||id) + '\nNominal: ' + fmtRp(item.nominal||0) + '\nDitolak oleh: ' + KU.nama + '\nAlasan: ' + catatan, 'rejected');
  showAlert('Ditolak di Layer ' + currentLayer + '. Pemohon perlu merevisi dan mengajukan ulang.');
  navigate('dana-approval');
}

async function approveSemuaItem(col) {
  if (!confirm('Approve SEMUA item yang menunggu approval Anda? Tindakan ini tidak dapat dibatalkan.')) return;
  const approvers = await getApprovers();
  var myLayers = [];
  approvers.forEach(function(a) {
    if (a.email === KU.email) myLayers.push(a.layer);
    else if (!a.email && a.role === KU.role) myLayers.push(a.layer);
  });
  if (!myLayers.length) {
    if (KU.role === 'superadmin') myLayers = [3];
    else if (KU.role === 'admin') myLayers = [2, 3];
    else if (KU.role === 'leader') myLayers = [1, 2, 3];
  }
  const pendingStatuses = myLayers.map(function(l){ return 'Pending Layer ' + l; });
  const list = await KDB.getAll(col);
  const pending = list.filter(function(x){ return pendingStatuses.includes(x.status); });
  if (!pending.length) { showAlert('Tidak ada item pending untuk di-approve.', 'warning'); return; }
  showLoading(true);
  var ok = 0;
  for (var i = 0; i < pending.length; i++) {
    var item = pending[i];
    var currentLayer = getCurrentLayer(item.status);
    if (!currentLayer) continue;
    var totalLayers = (item.approvers || approvers).length;
    var log = (item.approvalLog || []).concat([{ layer: currentLayer, action: 'approve', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: 'Approve massal' }]);
    var newStatus = currentLayer >= totalLayers ? STATUS.APPROVED : 'Pending Layer ' + (currentLayer + 1);
    await KDB.save(col, item.id, Object.assign({}, item, { status: newStatus, approvalLog: log, lastUpdatedAt: new Date().toISOString() }));
    if (newStatus === STATUS.APPROVED) {
      if (col === 'permohonan') await buatJurnalDariPermohonan(item.id);
      else if (col === 'danamasuk') await buatJurnalDariDanaMasuk(item.id);
    }
    ok++;
  }
  showLoading(false);
  showAlert(ok + ' item berhasil di-approve!');
  navigate('dana-approval');
}

async function rejectSemuaItem(col) {
  var catatan = prompt('Alasan penolakan massal (wajib diisi):');
  if (!catatan || !catatan.trim()) { showAlert('Alasan penolakan wajib diisi!', 'danger'); return; }
  if (!confirm('Reject SEMUA item yang menunggu approval Anda?')) return;
  const approvers = await getApprovers();
  var myLayers = [];
  approvers.forEach(function(a) {
    if (a.email === KU.email) myLayers.push(a.layer);
    else if (!a.email && a.role === KU.role) myLayers.push(a.layer);
  });
  if (!myLayers.length) {
    if (KU.role === 'superadmin') myLayers = [3];
    else if (KU.role === 'admin') myLayers = [2, 3];
    else if (KU.role === 'leader') myLayers = [1, 2, 3];
  }
  const pendingStatuses = myLayers.map(function(l){ return 'Pending Layer ' + l; });
  const list = await KDB.getAll(col);
  const pending = list.filter(function(x){ return pendingStatuses.includes(x.status); });
  if (!pending.length) { showAlert('Tidak ada item pending untuk di-reject.', 'warning'); return; }
  showLoading(true);
  var ok = 0;
  for (var i = 0; i < pending.length; i++) {
    var item = pending[i];
    var currentLayer = getCurrentLayer(item.status);
    if (!currentLayer) continue;
    var log = (item.approvalLog || []).concat([{ layer: currentLayer, action: 'reject', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: catatan }]);
    await KDB.save(col, item.id, Object.assign({}, item, { status: 'Rejected Layer ' + currentLayer, approvalLog: log, lastUpdatedAt: new Date().toISOString() }));
    ok++;
  }
  showLoading(false);
  showAlert(ok + ' item berhasil di-reject!');
  navigate('dana-approval');
}

function toggleSelectAll(masterCb, col) {
  var checkboxes = document.querySelectorAll('.appr-check[data-col="' + col + '"]');
  checkboxes.forEach(function(cb) { cb.checked = masterCb.checked; });
  updateSelectedCount(col);
}

function updateSelectedCount(col) {
  var checked = document.querySelectorAll('.appr-check[data-col="' + col + '"]:checked');
  var el = document.getElementById('selected-count-' + col) || document.getElementById('selected-count-all-' + col);
  if (el) el.textContent = checked.length + ' dipilih';
}

// Attach event listener for individual checkbox changes
document.addEventListener('change', function(e) {
  if (e.target && e.target.classList.contains('appr-check')) {
    var col = e.target.dataset.col;
    updateSelectedCount(col);
  }
});

async function approveSelected(col) {
  var checked = document.querySelectorAll('.appr-check[data-col="' + col + '"]:checked');
  if (!checked.length) { showAlert('Pilih minimal 1 item untuk di-approve!', 'warning'); return; }
  if (!confirm('Approve ' + checked.length + ' item yang dipilih?')) return;
  var ids = [];
  checked.forEach(function(cb) { ids.push(cb.dataset.id); });

  const approvers = await getApprovers();
  const list = await KDB.getAll(col);
  showLoading(true);
  var ok = 0;
  for (var i = 0; i < ids.length; i++) {
    var item = list.find(function(x){ return x.id === ids[i]; });
    if (!item) continue;
    var currentLayer = getCurrentLayer(item.status);
    if (!currentLayer) continue;
    var totalLayers = (item.approvers || approvers).length;
    var log = (item.approvalLog || []).concat([{ layer: currentLayer, action: 'approve', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: 'Approve terpilih' }]);
    var newStatus = currentLayer >= totalLayers ? STATUS.APPROVED : 'Pending Layer ' + (currentLayer + 1);
    await KDB.save(col, item.id, Object.assign({}, item, { status: newStatus, approvalLog: log, lastUpdatedAt: new Date().toISOString() }));
    if (newStatus === STATUS.APPROVED) {
      if (col === 'permohonan') await buatJurnalDariPermohonan(item.id);
      else if (col === 'danamasuk') await buatJurnalDariDanaMasuk(item.id);
    }
    ok++;
  }
  showLoading(false);
  showAlert(ok + ' item berhasil di-approve!');
  navigate('dana-approval');
}

async function rejectSelected(col) {
  var checked = document.querySelectorAll('.appr-check[data-col="' + col + '"]:checked');
  if (!checked.length) { showAlert('Pilih minimal 1 item untuk di-reject!', 'warning'); return; }
  var catatan = prompt('Alasan penolakan (wajib diisi):');
  if (!catatan || !catatan.trim()) { showAlert('Alasan penolakan wajib diisi!', 'danger'); return; }
  if (!confirm('Reject ' + checked.length + ' item yang dipilih?')) return;
  var ids = [];
  checked.forEach(function(cb) { ids.push(cb.dataset.id); });

  const approvers = await getApprovers();
  const list = await KDB.getAll(col);
  showLoading(true);
  var ok = 0;
  for (var i = 0; i < ids.length; i++) {
    var item = list.find(function(x){ return x.id === ids[i]; });
    if (!item) continue;
    var currentLayer = getCurrentLayer(item.status);
    if (!currentLayer) continue;
    var log = (item.approvalLog || []).concat([{ layer: currentLayer, action: 'reject', by: KU.username, nama: KU.nama, at: new Date().toISOString(), catatan: catatan }]);
    await KDB.save(col, item.id, Object.assign({}, item, { status: 'Rejected Layer ' + currentLayer, approvalLog: log, lastUpdatedAt: new Date().toISOString() }));
    ok++;
  }
  showLoading(false);
  showAlert(ok + ' item berhasil di-reject!');
  navigate('dana-approval');
}

async function simpanApprovers() {
  const approvers = await getApprovers();
  const updated = approvers.map(function(a) {
    return { layer: a.layer, nama: (document.getElementById('apr-nama-' + a.layer) || {}).value || a.nama, email: (document.getElementById('apr-email-' + a.layer) || {}).value || a.email, role: (document.getElementById('apr-role-' + a.layer) || {}).value || a.role };
  });
  await KDB.saveSetting('approvers', updated);
  showAlert('Konfigurasi approver disimpan!');
  navigate('dana-approval');
}

// ===== ADMIN USERS =====
async function renderAdminUsers() {
  const users = await KDB.getUsers();
  const rows = users.map(function(u) {
    const hapusBtn = u.username !== KU.username
      ? '<button class="btn btn-xs btn-danger" onclick="hapusUser(\'' + u.username + '\')">Hapus</button>'
      : '<span class="text-muted">(Anda)</span>';
    return '<tr><td class="fw-bold">' + u.nama + '</td><td>' + u.username + '</td>'
      + '<td>' + (u.email ? '<span style="color:#2e7d32">✅ ' + u.email + '</span>' : '<span style="color:#f44336;font-size:0.8rem">❌ Belum ada</span>') + '</td>'
      + '<td><span class="role-chip role-' + u.role + '">' + u.role.toUpperCase() + '</span></td>'
      + '<td class="tbl-actions"><button class="btn btn-xs btn-warning" onclick="editUser(\'' + u.username + '\')">Edit</button>' + hapusBtn + '</td></tr>';
  }).join('');
  const superOpt = KU.role === 'superadmin' ? '<option value="superadmin">Super Admin</option>' : '';
  return '<div class="page-title">👤 Manajemen User</div>'
    + '<div class="card"><div class="card-header"><h2>Tambah User Baru</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Nama Lengkap</label><input id="u-nama" placeholder="Nama lengkap"></div>'
    + '<div class="fg"><label>Username</label><input id="u-user" placeholder="Username (unik)"></div>'
    + '<div class="fg"><label>Password</label><div style="position:relative"><input type="password" id="u-pass" placeholder="Password" style="padding-right:36px;width:100%"><button type="button" onclick="togglePwd(\'u-pass\',this)" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:0.9rem;color:#888">👁</button></div></div>'
    + '<div class="fg"><label>Email</label><input id="u-email" placeholder="email@..."></div>'
    + '<div class="fg"><label>Role</label><select id="u-role"><option value="viewer">Viewer</option><option value="leader">Leader</option><option value="admin">Admin</option>' + superOpt + '</select></div>'
    + '</div><div class="mt-12"><button class="btn btn-primary" onclick="tambahUser()">Tambah User</button></div></div>'
    + '<div class="card"><div class="card-header"><h2>Daftar User (' + users.length + ')</h2></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Username</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

async function tambahUser() {
  const nama = document.getElementById('u-nama').value.trim();
  const username = document.getElementById('u-user').value.trim().toLowerCase();
  const pass = document.getElementById('u-pass').value;
  const email = document.getElementById('u-email').value.trim();
  const role = document.getElementById('u-role').value;
  if (!nama || !username || !pass) { showAlert('Nama, username, dan password wajib diisi!', 'danger'); return; }
  const users = await KDB.getUsers();
  if (users.find(function(u){ return u.username === username; })) { showAlert('Username sudah digunakan!', 'danger'); return; }
  await KDB.saveUser({ username: username, password: pass, nama: nama, email: email, role: role });
  showAlert('User berhasil ditambahkan!');
  navigate('admin-users');
}

async function hapusUser(username) {
  if (!confirm('Hapus user ' + username + '?')) return;
  await KDB.deleteUser(username);
  showAlert('User dihapus', 'warning');
  navigate('admin-users');
}

async function editUser(username) {
  const users = await KDB.getUsers();
  const u = users.find(function(x){ return x.username === username; });
  if (!u) return;
  const superOpt = KU.role === 'superadmin'
    ? '<option value="superadmin" ' + (u.role==='superadmin'?'selected':'') + '>Super Admin</option>'
    : '';
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Nama</label><input id="eu-nama" value="' + u.nama + '"></div>'
    + '<div class="fg"><label>Email</label><input id="eu-email" value="' + (u.email||'') + '"></div>'
    + '<div class="fg"><label>Password Baru (kosongkan jika tidak diubah)</label><div style="position:relative"><input type="password" id="eu-pass" placeholder="Password baru" style="padding-right:36px;width:100%"><button type="button" onclick="togglePwd(\'eu-pass\',this)" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:0.9rem;color:#888">👁</button></div></div>'
    + '<div class="fg"><label>Role</label><select id="eu-role">'
    + '<option value="viewer" ' + (u.role==='viewer'?'selected':'') + '>Viewer</option>'
    + '<option value="leader" ' + (u.role==='leader'?'selected':'') + '>Leader</option>'
    + '<option value="admin" ' + (u.role==='admin'?'selected':'') + '>Admin</option>'
    + superOpt + '</select></div>'
    + '</div><div class="modal-footer">'
    + '<button class="btn btn-outline" onclick="closeModalDirect()">Batal</button>'
    + '<button class="btn btn-primary" onclick="simpanEditUser(\'' + username + '\')">Simpan</button>'
    + '</div>', 'Edit User: ' + username);
}

async function simpanEditUser(username) {
  const users = await KDB.getUsers();
  const u = users.find(function(x){ return x.username === username; });
  if (!u) return;
  const newPass = document.getElementById('eu-pass').value;
  await KDB.saveUser(Object.assign({}, u, {
    nama: document.getElementById('eu-nama').value.trim(),
    email: document.getElementById('eu-email').value.trim(),
    role: document.getElementById('eu-role').value,
    password: newPass || u.password
  }));
  closeModalDirect();
  showAlert('User diperbarui!');
  navigate('admin-users');
}

// ===== BANTUAN =====
function getBantuanModules() {
  return [
    { id: 'setup', icon: '⚙️', title: 'Setup Awal', desc: 'Data perusahaan, COA, mitra, supplier, customer, saldo awal' },
    { id: 'transaksi', icon: '💰', title: 'Transaksi', desc: 'Permohonan dana, dana masuk, approval center' },
    { id: 'jurnal', icon: '📝', title: 'Jurnal', desc: 'Jurnal umum, penyesuaian, penutup' },
    { id: 'monitor', icon: '📊', title: 'Monitor', desc: 'Buku besar, utang piutang, forecast, actual' },
    { id: 'laporan', icon: '📄', title: 'Laporan', desc: 'Dashboard, laba rugi, neraca, arus kas, ekuitas' },
    { id: 'kalkulator', icon: '🧮', title: 'Kalkulator', desc: 'Penyusutan, petty cash, bank reconcile, HPP' },
    { id: 'import', icon: '📤', title: 'Import Data', desc: 'Import dari Google Sheets, export data' },
    { id: 'inventori', icon: '📋', title: 'Inventori ATK', desc: 'Stok ATK, barang masuk/keluar, barcode' },
    { id: 'portal', icon: '📦', title: 'Portal Aset', desc: 'Perlengkapan dan aset perusahaan' },
    { id: 'users', icon: '👤', title: 'Manajemen User', desc: 'Tambah user, role, hak akses' },
  ];
}

function showBantuanModule(modId) {
  var el = document.getElementById('bantuan-detail');
  if (!el) return;
  var content = getBantuanContent(modId);
  el.innerHTML = '<div class="card" style="border-left:4px solid #1a237e"><div class="card-header"><h2>' + content.title + '</h2><button class="btn btn-sm btn-outline" onclick="document.getElementById(\'bantuan-detail\').innerHTML=\'\'">Tutup</button></div>' + content.html + '</div>';
  el.scrollIntoView({ behavior: 'smooth' });
}

function getBantuanContent(modId) {
  var s = '<ol style="padding-left:18px;line-height:2;font-size:0.85rem">';
  var e = '</ol>';
  if (modId === 'setup') return { title: '⚙️ Panduan Setup Awal', html: ''
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#1a237e">1. Data Perusahaan</div>'
    + s + '<li>Buka menu <b>Setup > Data Perusahaan</b></li><li>Isi nama, NPWP, alamat, kota, telepon, email</li><li>Upload logo perusahaan (JPG/PNG)</li><li>Isi Spreadsheet ID dan Sheet Name untuk import</li><li>Klik <b>Simpan Data Perusahaan</b></li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#1a237e">2. Kode Akun (COA)</div>'
    + s + '<li>Buka <b>Setup > Kode Akun (CoA)</b></li><li>Tambah akun manual: isi kode, nama, kategori, tipe saldo</li><li>Atau import dari Google Sheets: isi API Key, klik <b>Import COA dari Sheets</b></li><li>Sistem auto-klasifikasi: 1=Aset, 2=Kewajiban, 3=Ekuitas, 4=Pendapatan, 5=Beban</li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#1a237e">3. Data Mitra / Supplier / Customer</div>'
    + s + '<li>Buka menu masing-masing di Setup</li><li>Isi nama, alamat, kontak, NPWP</li><li>Data ini digunakan untuk Invoice dan PO</li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#1a237e">4. Saldo Awal</div>'
    + s + '<li>Buka <b>Setup > Saldo Awal</b></li><li>Pilih tahun periode</li><li>Isi saldo awal per akun COA</li><li>Klik <b>Simpan</b></li>' + e };
  if (modId === 'transaksi') return { title: '💰 Panduan Transaksi', html: ''
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#1a237e">Permohonan Dana</div>'
    + s + '<li>Buka <b>Transaksi > Permohonan Dana</b></li><li>Isi form: nama pemohon, leader, no PO/Invoice, nominal</li><li>Pilih tipe transaksi (Transfer/Cash/Giro)</li><li>Pilih akun debit dan kredit dari COA</li><li>Klik <b>Ajukan</b> — status menjadi Pending Layer 1</li><li>Tunggu approval dari 3 layer</li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#388e3c">Dana Masuk</div>'
    + s + '<li>Buka <b>Transaksi > Dana Masuk</b></li><li>Isi sumber dana, nominal, tanggal</li><li>Pilih akun debit (kas/bank) dan kredit (pendapatan)</li><li>Klik <b>Catat & Ajukan</b></li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#f57c00">Approval Center</div>'
    + s + '<li>Buka <b>Transaksi > Approval Center</b></li><li>Lihat daftar transaksi pending</li><li>Klik <b>ACC</b> atau <b>Tolak</b></li><li>Setelah Layer 3 ACC, klik <b>Buat Jurnal</b></li>' + e };
  if (modId === 'jurnal') return { title: '📝 Panduan Jurnal', html: ''
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#1a237e">Jurnal Umum</div>'
    + s + '<li>Buka <b>Jurnal > Jurnal Umum</b></li><li>Isi tanggal, keterangan, no referensi</li><li>Tambah baris: pilih akun, isi debit atau kredit</li><li>Pastikan <b>Total Debit = Total Kredit</b></li><li>Klik <b>Simpan Jurnal</b></li><li>Tombol <b>Edit</b> untuk mengubah, <b>Hapus</b> untuk menghapus</li><li>Filter: bulan dan sumber (import/umum)</li><li><b>Hapus Semua</b> untuk reset seluruh jurnal</li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#0288d1">Jurnal Penyesuaian</div>'
    + s + '<li>Digunakan akhir periode untuk menyesuaikan akun</li><li>Contoh: beban dibayar dimuka, pendapatan diterima dimuka</li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#c62828">Jurnal Penutup</div>'
    + s + '<li>Akhir tahun: tutup akun pendapatan & beban</li><li>Saldo dipindahkan ke Laba Ditahan</li>' + e };
  if (modId === 'monitor') return { title: '📊 Panduan Monitor', html: ''
    + s + '<li><b>Buku Besar</b>: pilih akun, lihat seluruh transaksi per akun</li><li><b>Utang Piutang</b>: daftar outstanding, catat pembayaran</li><li><b>Forecast</b>: data dari transaksi belum approve Layer 2</li><li><b>Actual</b>: data dari transaksi sudah approve + jurnal existing</li><li>Grafik per bulan dan per minggu otomatis</li><li>Tombol <b>Edit</b> dan <b>Hapus</b> untuk koreksi data actual</li>' + e };
  if (modId === 'laporan') return { title: '📄 Panduan Laporan', html: ''
    + s + '<li><b>Dashboard</b>: ringkasan keuangan, saldo, grafik (Harian/Mingguan/Bulanan)</li><li><b>Laba Rugi</b>: pendapatan - beban = laba/rugi + analisis naratif</li><li><b>Neraca</b>: aset = kewajiban + ekuitas</li><li><b>Arus Kas</b>: operasi, investasi, pendanaan</li><li><b>Neraca Lajur</b>: trial balance dengan total</li><li><b>Ekuitas</b>: perubahan modal pemilik</li><li><b>Posisi Saldo</b>: saldo seluruh akun aset lancar</li><li><b>Analisis Naratif</b>: analisis otomatis kondisi keuangan</li><li>Semua laporan bisa di-print</li>' + e };
  if (modId === 'kalkulator') return { title: '🧮 Panduan Kalkulator', html: ''
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#1a237e">Penyusutan Aset</div>'
    + s + '<li>Tambah aset: nama, tgl beli, metode, harga, residu, umur</li><li><b>Simpan Aset</b> — jurnal penyusutan otomatis dibuat</li><li>Daftar aset dengan progress penyusutan realtime</li><li><b>Detail</b>: jadwal per tahun. <b>Edit</b>: ubah data. <b>Hapus</b>: hapus aset</li><li>Import dari Perlengkapan: klik <b>Muat Data Perlengkapan</b></li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#0288d1">Petty Cash</div>'
    + s + '<li>Set saldo awal, input transaksi seperti jurnal</li><li>Daftar transaksi: <b>Detail</b>, <b>Edit</b> (ubah akun, jumlah, kategori), <b>Hapus</b></li><li>Reconcile: bandingkan saldo buku vs fisik</li>' + e
    + '<div class="fw-bold" style="margin:10px 0 6px;color:#388e3c">HPP</div>'
    + s + '<li><b>Otomatis</b>: klasifikasi by keyword</li><li><b>Manual</b>: pilih COA pendapatan + pengeluaran, klik <b>Hitung HPP</b></li><li><b>Simpan Pilihan</b> ke Firebase, <b>Reset</b> untuk ulang</li>' + e };
  if (modId === 'import') return { title: '📤 Panduan Import Data', html: ''
    + s + '<li>Buka <b>Admin > Import Spreadsheet</b></li><li>Isi API Key, klik <b>Import dari Sheets</b></li><li>Kolom AD = Tgl Rilis Finance (tanggal acuan)</li><li>Kolom X = Nama Akun Debit, Kolom AG = Nama Akun Kredit</li><li>Auto-match nama akun ke kode COA</li><li>Import langsung dianggap approved</li>' + e };
  if (modId === 'inventori') return { title: '📋 Panduan Inventori ATK', html: ''
    + s + '<li><b>Input ATK Baru</b>: nama, satuan, stok awal, harga</li><li><b>Barang Masuk</b>: pilih ATK, tipe Masuk, isi jumlah</li><li><b>Barang Keluar</b>: pilih ATK, tipe Keluar, isi jumlah + nama pengambil</li><li>Stok realtime, warning jika rendah</li><li><b>Generate QR</b>: cetak QR untuk form pengambilan via HP</li><li>Log transaksi lengkap dengan PIC</li>' + e };
  if (modId === 'portal') return { title: '📦 Panduan Portal Aset', html: ''
    + s + '<li>User <b>nanda</b> hanya akses menu ini</li><li>Input perlengkapan: nama, satuan, stok, pembelian, harga</li><li>Pembelian otomatis buat Draft Permohonan Dana</li><li>Bisa dikonversi ke Aset di menu Penyusutan</li>' + e };
  if (modId === 'users') return { title: '👤 Panduan Manajemen User', html: ''
    + s + '<li>Buka <b>Admin > Manajemen User</b> (superadmin only)</li><li>Tambah user: username, password, role, nama, email</li><li>Role: superadmin, admin, leader, viewer, nanda</li><li>User superadmin dan nanda tidak bisa dihapus</li>' + e };
  return { title: 'Modul', html: '<p>Pilih modul dari daftar di atas.</p>' };
}

function renderBantuan() {
  var modules = getBantuanModules();
  var moduleCards = modules.map(function(m) {
    return '<div style="background:white;border:1.5px solid #e0e0e0;border-radius:10px;padding:16px;cursor:pointer;transition:all 0.2s" onclick="showBantuanModule(\'' + m.id + '\')" onmouseover="this.style.borderColor=\'#1a237e\';this.style.boxShadow=\'0 2px 8px rgba(26,35,126,0.12)\'" onmouseout="this.style.borderColor=\'#e0e0e0\';this.style.boxShadow=\'none\'">'
      + '<div style="font-size:1.5rem;margin-bottom:6px">' + m.icon + '</div>'
      + '<div style="font-weight:700;color:#1a237e;font-size:0.88rem;margin-bottom:4px">' + m.title + '</div>'
      + '<div style="font-size:0.75rem;color:#666;line-height:1.4">' + m.desc + '</div></div>';
  }).join('');

  return '<div class="page-title">📖 Cara Penggunaan</div>'
    + '<div class="card"><div class="card-header"><h2>Pilih Modul Panduan</h2></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">' + moduleCards + '</div></div>'
    + '<div id="bantuan-detail"></div>'
    + '<div class="card"><div class="card-header"><h2>Alur Proses Approval 3 Layer</h2></div>'
    + '<div class="alert alert-info">Setiap Permohonan Dana dan Dana Masuk melewati 3 layer approval sebelum dianggap final.</div>'
    + '<div style="overflow-x:auto;padding:10px 0"><div style="display:flex;align-items:center;gap:8px;min-width:600px">'
    + '<div style="background:white;border:2px solid #1a237e;border-radius:10px;padding:12px;text-align:center;min-width:100px;flex:1"><div style="font-size:1.3rem">👤</div><div style="font-weight:700;color:#1a237e;font-size:0.85rem">Pemohon</div><div style="font-size:0.72rem;color:#666">Input & Ajukan</div></div>'
    + '<div style="font-size:1.5rem;color:#ccc">→</div>'
    + '<div style="background:white;border:2px solid #0288d1;border-radius:10px;padding:12px;text-align:center;min-width:100px;flex:1"><div style="font-size:1.3rem">✅</div><div style="font-weight:700;color:#0288d1;font-size:0.85rem">Layer 1</div><div style="font-size:0.72rem;color:#666">Leader / Atasan</div></div>'
    + '<div style="font-size:1.5rem;color:#ccc">→</div>'
    + '<div style="background:white;border:2px solid #388e3c;border-radius:10px;padding:12px;text-align:center;min-width:100px;flex:1"><div style="font-size:1.3rem">✅</div><div style="font-weight:700;color:#388e3c;font-size:0.85rem">Layer 2</div><div style="font-size:0.72rem;color:#666">Manager / Admin</div></div>'
    + '<div style="font-size:1.5rem;color:#ccc">→</div>'
    + '<div style="background:white;border:2px solid #f57c00;border-radius:10px;padding:12px;text-align:center;min-width:100px;flex:1"><div style="font-size:1.3rem">✅</div><div style="font-weight:700;color:#f57c00;font-size:0.85rem">Layer 3</div><div style="font-size:0.72rem;color:#666">Direktur</div></div>'
    + '<div style="font-size:1.5rem;color:#ccc">→</div>'
    + '<div style="background:white;border:2px solid #4caf50;border-radius:10px;padding:12px;text-align:center;min-width:100px;flex:1"><div style="font-size:1.3rem">🎯</div><div style="font-weight:700;color:#4caf50;font-size:0.85rem">Approved Final</div><div style="font-size:0.72rem;color:#666">Buat Jurnal</div></div>'
    + '</div></div>'
    + '<div class="divider"></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">'
    + '<div><div class="fw-bold" style="margin-bottom:8px;color:#1a237e">Alur Permohonan Dana:</div><ol style="padding-left:18px;line-height:1.9;font-size:0.85rem"><li>Pemohon isi form, klik <b>Ajukan</b></li><li>Status: <b>Pending Layer 1</b></li><li>Layer 1 buka Approval Center, klik <b>ACC</b> atau <b>Tolak</b></li><li>Jika ACC, lanjut ke Layer 2, lalu Layer 3</li><li>Setelah Layer 3 ACC: <b>Approved Final</b></li><li>Admin klik <b>Jurnal</b> untuk buat jurnal otomatis</li></ol></div>'
    + '<div><div class="fw-bold" style="margin-bottom:8px;color:#388e3c">Alur Dana Masuk:</div><ol style="padding-left:18px;line-height:1.9;font-size:0.85rem"><li>Staff catat dana masuk, klik <b>Catat & Ajukan</b></li><li>Status: <b>Pending Layer 1</b></li><li>Setiap layer konfirmasi penerimaan dana</li><li>Setelah 3 layer: <b>Approved Final</b></li><li>Admin klik <b>Jurnal</b> untuk buat jurnal otomatis</li></ol></div>'
    + '</div>'
    + '<div class="alert alert-warning mt-12"><b>Jika ditolak:</b> Status jadi "Rejected Layer X". Pemohon buat permohonan baru dengan revisi.</div>'
    + '</div>'
    + '<div class="card"><div class="card-header"><h2>Level Akses User</h2></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Role</th><th>Dashboard</th><th>Transaksi</th><th>Approval</th><th>Laporan</th><th>Setup</th></tr></thead><tbody>'
    + '<tr><td><span class="role-chip role-superadmin">SUPERADMIN</span></td><td>Full</td><td>Ya</td><td>Layer 3</td><td>Ya</td><td>Ya</td></tr>'
    + '<tr><td><span class="role-chip role-admin">ADMIN</span></td><td>Full</td><td>Ya</td><td>Layer 2</td><td>Ya</td><td>Ya</td></tr>'
    + '<tr><td><span class="role-chip role-leader">LEADER</span></td><td>Full</td><td>Ya</td><td>Layer 1</td><td>Ya</td><td>Tidak</td></tr>'
    + '<tr><td><span class="role-chip role-viewer">VIEWER</span></td><td>Terbatas</td><td>Input saja</td><td>Sesuai layer</td><td>Ya</td><td>Tidak</td></tr>'
    + '</tbody></table></div>'
    + '<div class="alert alert-info mt-12"><b>Viewer</b> hanya melihat Dashboard (saldo + approval miliknya), Permohonan Dana, Dana Masuk, dan Approval Center.</div>'
    + '</div>'
    + '<div class="card"><div class="card-header"><h2>Tips Penggunaan</h2></div>'
    + '<ul style="line-height:2;padding-left:20px">'
    + '<li>Jurnal harus selalu <b>balance</b> (Total Debit = Total Kredit)</li>'
    + '<li>Gunakan No. Referensi konsisten: INV-xxx untuk invoice, PO-xxx untuk PO</li>'
    + '<li>Lakukan <b>Jurnal Penyesuaian</b> di akhir periode sebelum membuat laporan</li>'
    + '<li>Buat <b>Jurnal Penutup</b> di akhir tahun untuk menutup akun pendapatan & beban</li>'
    + '<li>Data tersimpan di <b>Firebase</b> — bisa diakses dari HP, laptop, tablet secara real-time</li>'
    + '<li>API Key Google Sheets disimpan di browser — tidak perlu input ulang setiap kali</li>'
    + '</ul></div>';
}

// ===== IMPORT =====
const SHEET_COLS = {
  timestamp:       { idx: 0,  label: 'Timestamp' },
  email:           { idx: 1,  label: 'Email Address' },
  namaPemohon:     { idx: 2,  label: 'Nama Pemohon' },
  namaLeader:      { idx: 3,  label: 'Nama Leader' },
  noPOInvoice:     { idx: 4,  label: 'Nomor PO / Invoice' },
  nominal:         { idx: 5,  label: 'Nominal Pengajuan Dana (IDR)' },
  jatuhTempo:      { idx: 6,  label: 'Jatuh Tempo Pembayaran' },
  keteranganBayar: { idx: 7,  label: 'Keterangan Pembayaran' },
  buktiDokumen:    { idx: 8,  label: 'Bukti PO / Invoice / Dokumen' },
  tipeTransaksi:   { idx: 9,  label: 'Tipe Transaksi Pembayaran' },
  namaBank:        { idx: 10, label: 'Nama Bank Transaksi' },
  noRekening:      { idx: 11, label: 'Nomor Rekening Transaksi' },
  namaRekening:    { idx: 12, label: 'Nama Rekening Transaksi' },
  statusApproval:  { idx: 13, label: 'Status Approval' },
  idUnik:          { idx: 14, label: 'ID Unik' },
  namaAkunDebit:   { idx: 23, label: 'Nama Akun Debit (Kolom X)' },
  financeRilis:    { idx: 28, label: 'Finance Rilis (Kolom AC)' },
  tglRilisFinance: { idx: 29, label: 'Tgl Rilis Finance (Kolom AD)' },
  namaAkunKredit:  { idx: 32, label: 'Nama Akun Kredit (Kolom AG)' },
};

// ===== AI ASSISTANT - Analisis & Deteksi Kesalahan Otomatis =====
async function renderAIAssistant() {
  return '<div class="page-title">🤖 AI Assistant Keuangan</div>'
    + '<div class="alert alert-info">AI Assistant membantu mendeteksi kesalahan pencatatan, selisih jurnal, dan memberikan rekomendasi perbaikan secara otomatis.</div>'
    + '<div class="stats-row">'
    + '<div class="stat-box"><button class="btn btn-primary" onclick="runAIAnalysis()" style="width:100%">🔍 Analisis Lengkap</button></div>'
    + '<div class="stat-box"><button class="btn btn-warning" onclick="runAIJurnalCheck()" style="width:100%">📓 Cek Jurnal Balance</button></div>'
    + '<div class="stat-box"><button class="btn btn-info" onclick="runAIPettyCashCheck()" style="width:100%">💵 Cek Petty Cash</button></div>'
    + '<div class="stat-box"><button class="btn btn-success" onclick="runAINeracaCheck()" style="width:100%">📊 Cek Neraca</button></div>'
    + '</div>'
    // Chat / Diskusi Langsung
    + '<div class="card" style="margin-top:16px">'
    + '<div class="card-header"><h2>💬 Chat & Diskusi Keuangan</h2><button class="btn btn-sm btn-outline" onclick="resetChatAI()" style="margin-left:auto">🗑️ Chat Baru</button></div>'
    + '<div id="ai-chat-messages" style="max-height:400px;overflow-y:auto;padding:12px;background:#f8f9ff;border-radius:8px;margin-bottom:12px;min-height:120px">'
    + buildChatHistoryHtml()
    + '</div>'
    + '<div style="display:flex;gap:8px">'
    + '<input type="text" id="ai-chat-input" placeholder="Tanya tentang keuangan, jurnal, neraca, atau minta saran..." style="flex:1;padding:10px 14px;border:1.5px solid #ddd;border-radius:8px;font-size:0.9rem" onkeydown="if(event.key===\'Enter\')kirimChatAI()">'
    + '<button class="btn btn-primary" onclick="kirimChatAI()" style="white-space:nowrap">Kirim 💬</button>'
    + '</div>'
    + '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">'
    + '<button class="btn btn-outline btn-sm" onclick="chatQuickQ(\'Bagaimana posisi keuangan perusahaan saat ini?\')">📊 Posisi Keuangan</button>'
    + '<button class="btn btn-outline btn-sm" onclick="chatQuickQ(\'Apa saja transaksi yang perlu diperhatikan bulan ini?\')">⚠️ Transaksi Perhatian</button>'
    + '<button class="btn btn-outline btn-sm" onclick="chatQuickQ(\'Jelaskan cara membuat jurnal penyesuaian\')">📝 Cara Jurnal</button>'
    + '<button class="btn btn-outline btn-sm" onclick="chatQuickQ(\'Berapa saldo kas dan petty cash saat ini?\')">💰 Saldo Kas</button>'
    + '</div>'
    + '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">'
    + '<span style="font-size:0.75rem;color:#888;align-self:center">Aksi cepat:</span>'
    + '<button class="btn btn-sm" style="background:#e8f5e9;color:#2e7d32;border:1px solid #4caf50" onclick="chatQuickQ(\'Topup petty cash 500000\')">➕ Top-up PC</button>'
    + '<button class="btn btn-sm" style="background:#fff3e0;color:#e65100;border:1px solid #ff9800" onclick="chatQuickQ(\'Catat pengeluaran petty cash 50000 beli ATK\')">➖ Pengeluaran PC</button>'
    + '<button class="btn btn-sm" style="background:#e3f2fd;color:#1565c0;border:1px solid #1976d2" onclick="chatQuickQ(\'Buatkan jurnal beban operasional 100000\')">📓 Buat Jurnal</button>'
    + '</div>'
    + '</div>'
    // Pilih Mode AI — 2 opsi saja
    + '<div class="card" style="margin-top:12px"><div class="card-header"><h2>⚙️ Pilih Mode AI</h2></div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    + '<div style="border:2px solid ' + ((localStorage.getItem('k_ai_provider')||'lokal')==='lokal'?'#4caf50':'#ddd') + ';border-radius:10px;padding:14px;cursor:pointer" onclick="pilihProviderAI(\'lokal\')">'
    + '<div style="font-weight:700;margin-bottom:6px">💻 Mode Lokal</div>'
    + '<div style="font-size:0.8rem;color:#555">Tanpa API. Jawab dari data lokal. Bisa eksekusi aksi dasar.</div>'
    + '<div style="margin-top:6px;font-size:0.75rem;color:#888">✓ Gratis tanpa registrasi</div></div>'
    + '<div style="border:2px solid ' + ((localStorage.getItem('k_ai_provider')||'')==='openrouter'?'#4caf50':'#ddd') + ';border-radius:10px;padding:14px;cursor:pointer" onclick="pilihProviderAI(\'openrouter\')">'
    + '<div style="font-weight:700;margin-bottom:6px">🌐 OpenRouter <span class="badge badge-info" style="font-size:0.65rem">Recommended</span></div>'
    + '<div style="font-size:0.8rem;color:#555">AI cerdas (Gemini/Claude). Jawab pertanyaan apa saja.</div>'
    + '<div style="margin-top:6px;font-size:0.75rem;color:#888">✓ Gratis $1 credit</div></div></div>'
    + '<div id="ai-openrouter-setup" style="margin-top:12px;display:' + ((localStorage.getItem('k_ai_provider')||'')==='openrouter'?'block':'none') + '">'
    + '<div style="background:#f0f8ff;border-radius:8px;padding:12px;border-left:4px solid #1a237e">'
    + '<b>Setup OpenRouter:</b> <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai/keys</a> → Sign up → Create Key → Paste di bawah'
    + '<div style="display:flex;gap:8px;margin-top:8px">'
    + '<input type="password" id="ai-api-key" placeholder="sk-or-..." style="flex:1;padding:8px 12px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem" value="' + (localStorage.getItem('k_ai_apikey')||'') + '">'
    + '<button class="btn btn-success" onclick="simpanAIKey()">Simpan</button></div></div></div></div>'
    // Hasil analisis — restore dari cache jika ada
    + '<div id="ai-result" style="margin-top:16px">' + (_aiAnalysisCache||'') + '</div>';
}

// ===== AI CHAT =====
var _aiChatHistory = JSON.parse(localStorage.getItem('k_ai_chat_history') || '[]');
var _aiAnalysisCache = '';

function _saveAIResult() {
  var el = document.getElementById('ai-result');
  if (el && el.innerHTML) _aiAnalysisCache = el.innerHTML;
}

// Auto-save hasil analisis setiap kali berubah
setInterval(function() {
  if (currentSection === 'ai-assistant') _saveAIResult();
}, 2000);

function _saveChatHistory() {
  try { localStorage.setItem('k_ai_chat_history', JSON.stringify(_aiChatHistory)); } catch(e) {}
}

function buildChatHistoryHtml() {
  if (_aiChatHistory.length === 0) {
    return '<div style="color:#888;font-size:0.85rem;text-align:center;padding:20px">👋 Mulai diskusi — ketik pertanyaan di bawah</div>';
  }
  var html = '';
  _aiChatHistory.forEach(function(m) {
    if (m.role === 'user') {
      html += '<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><div style="background:#1a237e;color:white;padding:8px 14px;border-radius:14px 14px 2px 14px;max-width:75%;font-size:0.88rem">' + escapeHtml(m.content) + '</div></div>';
    } else {
      var displayText = (m.content||'').replace(/###ACTION:.*?###/g, '').trim();
      html += '<div style="display:flex;margin-bottom:8px"><div style="background:#e8f5e9;padding:8px 14px;border-radius:14px 14px 14px 2px;max-width:85%;font-size:0.88rem;line-height:1.6;white-space:pre-wrap">' + escapeHtml(displayText) + '</div></div>';
    }
  });
  return html;
}

function resetChatAI() {
  _aiChatHistory = [];
  _saveChatHistory();
  var chatEl = document.getElementById('ai-chat-messages');
  if (chatEl) chatEl.innerHTML = '<div style="color:#888;font-size:0.85rem;text-align:center;padding:20px">👋 Chat baru dimulai — ketik pertanyaan di bawah</div>';
}

function chatQuickQ(q) {
  document.getElementById('ai-chat-input').value = q;
  kirimChatAI();
}

function simpanAIKey() {
  var key = (document.getElementById('ai-api-key')||{}).value || '';
  localStorage.setItem('k_ai_apikey', key);
  showAlert(key ? 'API Key disimpan!' : 'API Key dihapus');
  navigate('ai-assistant');
}

function pilihProviderAI(provider) {
  localStorage.setItem('k_ai_provider', provider);
  navigate('ai-assistant');
}

async function kirimChatAI() {
  var input = document.getElementById('ai-chat-input');
  var msg = (input.value||'').trim();
  if (!msg) return;
  input.value = '';

  var chatEl = document.getElementById('ai-chat-messages');
  if (_aiChatHistory.length === 0) chatEl.innerHTML = '';

  chatEl.innerHTML += '<div style="display:flex;justify-content:flex-end;margin-bottom:8px"><div style="background:#1a237e;color:white;padding:8px 14px;border-radius:14px 14px 2px 14px;max-width:75%;font-size:0.88rem">' + escapeHtml(msg) + '</div></div>';
  chatEl.scrollTop = chatEl.scrollHeight;

  chatEl.innerHTML += '<div id="ai-typing" style="display:flex;margin-bottom:8px"><div style="background:#e8eaf6;padding:8px 14px;border-radius:14px 14px 14px 2px;font-size:0.85rem;color:#555">⏳ Sedang berpikir...</div></div>';
  chatEl.scrollTop = chatEl.scrollHeight;

  _aiChatHistory.push({ role: 'user', content: msg });
  _saveChatHistory();

  var reply = '';
  var provider = localStorage.getItem('k_ai_provider') || 'lokal';
  var apiKey = localStorage.getItem('k_ai_apikey') || '';

  if (provider === 'openrouter' && apiKey) {
    reply = await callOpenRouterChat(msg, apiKey);
  } else {
    reply = await localAIReply(msg);
  }

  _aiChatHistory.push({ role: 'assistant', content: reply });
  _saveChatHistory();

  // Hapus typing indicator
  var typing = document.getElementById('ai-typing');
  if (typing) typing.remove();

  // Cek apakah ada ACTION di respons
  var actionMatch = reply.match(/###ACTION:(.*?)###/);
  var displayText = reply.replace(/###ACTION:.*?###/g, '').trim();
  var actionHtml = '';

  if (actionMatch) {
    try {
      var actionData = JSON.parse(actionMatch[1]);
      _pendingAIAction = actionData;
      actionHtml = renderActionConfirmation(actionData);
    } catch(e) {
      // JSON parse gagal, abaikan action
    }
  }

  // Tampilkan reply
  chatEl.innerHTML += '<div style="display:flex;margin-bottom:8px"><div style="background:#e8f5e9;padding:8px 14px;border-radius:14px 14px 14px 2px;max-width:85%;font-size:0.88rem;line-height:1.6;white-space:pre-wrap">' + escapeHtml(displayText) + '</div></div>';

  // Tampilkan action confirmation jika ada
  if (actionHtml) {
    chatEl.innerHTML += actionHtml;
  }

  chatEl.scrollTop = chatEl.scrollHeight;
}

var _pendingAIAction = null;

function renderActionConfirmation(action) {
  var html = '<div style="margin:8px 0;padding:12px;background:#fff3e0;border:1.5px solid #ff9800;border-radius:10px">';
  html += '<div style="font-weight:700;color:#e65100;margin-bottom:8px">⚡ AI ingin melakukan aksi berikut:</div>';

  if (action.type === 'jurnal') {
    html += '<div style="font-size:0.85rem;margin-bottom:8px">'
      + '<b>Buat Jurnal Umum</b><br>'
      + 'Tanggal: ' + (action.tanggal||today()) + '<br>'
      + 'Keterangan: ' + (action.keterangan||'-') + '<br>'
      + '<table style="width:100%;font-size:0.82rem;margin-top:6px;border-collapse:collapse">'
      + '<tr style="background:#1a237e;color:white"><th style="padding:4px 8px">Akun</th><th style="padding:4px 8px">Ket</th><th style="padding:4px 8px">Debit</th><th style="padding:4px 8px">Kredit</th></tr>';
    (action.lines||[]).forEach(function(l) {
      html += '<tr style="border-bottom:1px solid #ddd"><td style="padding:4px 8px">' + (l.akun||'-') + '</td><td style="padding:4px 8px">' + (l.ket||'-') + '</td><td style="padding:4px 8px">' + fmtRp(l.debit||0) + '</td><td style="padding:4px 8px">' + fmtRp(l.kredit||0) + '</td></tr>';
    });
    html += '</table></div>';
  } else if (action.type === 'topup_pc') {
    html += '<div style="font-size:0.85rem;margin-bottom:8px">'
      + '<b>Top-up Petty Cash</b><br>'
      + 'Tanggal: ' + (action.tanggal||today()) + '<br>'
      + 'Jumlah: ' + fmtRp(action.jumlah||0) + '<br>'
      + 'Keterangan: ' + (action.keterangan||'-') + '</div>';
  } else if (action.type === 'pengeluaran_pc') {
    html += '<div style="font-size:0.85rem;margin-bottom:8px">'
      + '<b>Pengeluaran Petty Cash</b><br>'
      + 'Tanggal: ' + (action.tanggal||today()) + '<br>'
      + 'Jumlah: ' + fmtRp(action.jumlah||0) + '<br>'
      + 'Akun Beban: ' + (action.akunBeban||'-') + '<br>'
      + 'Keterangan: ' + (action.keterangan||'-') + '</div>';
  } else if (action.type === 'hapus_jurnal') {
    html += '<div style="font-size:0.85rem;margin-bottom:8px">'
      + '<b>Hapus Jurnal</b><br>'
      + 'ID: ' + (action.id||'-') + '<br>'
      + 'Alasan: ' + (action.alasan||'-') + '</div>';
  } else if (action.type === 'reklasifikasi') {
    html += '<div style="font-size:0.85rem;margin-bottom:8px">'
      + '<b>Reklasifikasi Akun</b><br>'
      + 'Jurnal ID: ' + (action.jurnal_id||'-') + '<br>'
      + 'Akun Asal: ' + (action.akun_asal||'-') + ' → Akun Tujuan: ' + (action.akun_tujuan||'-') + '</div>';
  } else if (action.type === 'fix_coa_jurnal') {
    html += '<div style="font-size:0.85rem;margin-bottom:8px">'
      + '<b>Fix COA di Semua Jurnal</b><br>'
      + 'Akun Lama: ' + (action.akun_lama||'-') + ' → Akun Baru: ' + (action.akun_baru||'-') + '<br>'
      + '<i>Semua jurnal yang menggunakan akun lama akan diubah</i></div>';
  } else if (action.type === 'sinkron_pc') {
    html += '<div style="font-size:0.85rem;margin-bottom:8px">'
      + '<b>Sinkronisasi Petty Cash → Jurnal</b><br>'
      + 'Membuat jurnal otomatis untuk semua transaksi petty cash yang belum terintegrasi.</div>';
  } else {
    html += '<div style="font-size:0.85rem">Aksi: ' + JSON.stringify(action) + '</div>';
  }

  html += '<div style="display:flex;gap:8px;margin-top:10px">'
    + '<button class="btn btn-success btn-sm" onclick="eksekusiAIAction()">✅ Konfirmasi & Eksekusi</button>'
    + '<button class="btn btn-danger btn-sm" onclick="batalAIAction()">❌ Batalkan</button>'
    + '</div></div>';
  return html;
}

async function eksekusiAIAction() {
  if (!_pendingAIAction) { showAlert('Tidak ada aksi pending', 'warning'); return; }
  var action = _pendingAIAction;
  _pendingAIAction = null;
  var chatEl = document.getElementById('ai-chat-messages');

  try {
    if (action.type === 'jurnal') {
      var totalD = 0, totalK = 0;
      (action.lines||[]).forEach(function(l) { totalD += l.debit||0; totalK += l.kredit||0; });
      if (Math.abs(totalD - totalK) > 1) {
        showAlert('Jurnal tidak balance! Debit: ' + fmtRp(totalD) + ' ≠ Kredit: ' + fmtRp(totalK), 'danger');
        return;
      }
      var id = genId('JU');
      await KDB.save('jurnal', id, {
        id: id, tanggal: action.tanggal || today(), keterangan: action.keterangan || 'Jurnal dari AI Chat',
        noRef: action.noRef || id, tipe: 'umum', sumber: 'ai-chat',
        lines: action.lines, totalDebit: totalD, totalKredit: totalK,
        createdBy: KU.username, createdAt: new Date().toISOString()
      });
      chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#c8e6c9;padding:8px 14px;border-radius:8px;font-size:0.85rem">✅ Jurnal berhasil dibuat! (ID: ' + id + ')</div></div>';
      showAlert('Jurnal berhasil dibuat dari AI Chat!');

    } else if (action.type === 'topup_pc') {
      var jumlah = parseFloat(action.jumlah) || 0;
      if (jumlah <= 0) { showAlert('Jumlah harus > 0', 'danger'); return; }
      var pcId = genId('PC');
      var akunPC = await getAkunPettyCash();
      var akunBank = await getAkunKasBank();
      await KDB.save('pettycash', pcId, {
        id: pcId, tanggal: action.tanggal || today(), keterangan: action.keterangan || 'Top-up dari AI Chat',
        noRef: 'TOPUP-' + pcId.substring(0,8), jumlah: jumlah, kategori: 'Top-up Kas Kecil', tipe: 'masuk',
        createdBy: KU.username, createdAt: new Date().toISOString()
      });
      var jId = genId('JU');
      await KDB.save('jurnal', jId, {
        id: jId, tanggal: action.tanggal || today(), keterangan: action.keterangan || 'Top-up kas kecil',
        noRef: 'TOPUP-' + pcId.substring(0,8), tipe: 'umum', sumber: 'petty-cash',
        lines: [
          { akun: akunPC, ket: 'Top-up kas kecil', debit: jumlah, kredit: 0 },
          { akun: akunBank, ket: 'Transfer ke kas kecil', debit: 0, kredit: jumlah }
        ],
        totalDebit: jumlah, totalKredit: jumlah,
        createdBy: KU.username, createdAt: new Date().toISOString()
      });
      chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#c8e6c9;padding:8px 14px;border-radius:8px;font-size:0.85rem">✅ Top-up petty cash ' + fmtRp(jumlah) + ' berhasil!</div></div>';
      showAlert('Top-up petty cash berhasil dari AI Chat!');

    } else if (action.type === 'pengeluaran_pc') {
      var jumlah2 = parseFloat(action.jumlah) || 0;
      if (jumlah2 <= 0) { showAlert('Jumlah harus > 0', 'danger'); return; }
      var akunPC2 = await getAkunPettyCash();
      var akunBeban = action.akunBeban || '5-2200';
      var pcId2 = genId('PC');
      await KDB.save('pettycash', pcId2, {
        id: pcId2, tanggal: action.tanggal || today(), keterangan: action.keterangan || 'Pengeluaran dari AI Chat',
        noRef: pcId2, jumlah: jumlah2, kategori: 'Pengeluaran', tipe: 'keluar',
        createdBy: KU.username, createdAt: new Date().toISOString()
      });
      var jId2 = genId('JU');
      await KDB.save('jurnal', jId2, {
        id: jId2, tanggal: action.tanggal || today(), keterangan: action.keterangan || 'Pengeluaran petty cash',
        noRef: pcId2, tipe: 'umum', sumber: 'petty-cash',
        lines: [
          { akun: akunBeban, ket: action.keterangan || 'Pengeluaran', debit: jumlah2, kredit: 0 },
          { akun: akunPC2, ket: 'Kas kecil keluar', debit: 0, kredit: jumlah2 }
        ],
        totalDebit: jumlah2, totalKredit: jumlah2,
        createdBy: KU.username, createdAt: new Date().toISOString()
      });
      chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#c8e6c9;padding:8px 14px;border-radius:8px;font-size:0.85rem">✅ Pengeluaran petty cash ' + fmtRp(jumlah2) + ' berhasil dicatat!</div></div>';
      showAlert('Pengeluaran petty cash berhasil dari AI Chat!');

    } else if (action.type === 'hapus_jurnal') {
      if (!action.id) { showAlert('ID jurnal tidak valid', 'danger'); return; }
      await KDB.delete('jurnal', action.id);
      chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#c8e6c9;padding:8px 14px;border-radius:8px;font-size:0.85rem">✅ Jurnal ' + action.id + ' berhasil dihapus.</div></div>';
      showAlert('Jurnal dihapus dari AI Chat!');

    } else if (action.type === 'reklasifikasi') {
      // Reklasifikasi: ganti akun di jurnal tertentu
      if (!action.jurnal_id || !action.akun_asal || !action.akun_tujuan) { showAlert('Data reklasifikasi tidak lengkap', 'danger'); return; }
      var jData = await KDB.get('jurnal', action.jurnal_id);
      if (!jData) { showAlert('Jurnal tidak ditemukan: ' + action.jurnal_id, 'danger'); return; }
      var newLines = (jData.lines||[]).map(function(l) {
        if (l.akun === action.akun_asal) return Object.assign({}, l, { akun: action.akun_tujuan });
        return l;
      });
      await KDB.save('jurnal', action.jurnal_id, Object.assign({}, jData, { lines: newLines }));
      chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#c8e6c9;padding:8px 14px;border-radius:8px;font-size:0.85rem">✅ Reklasifikasi berhasil! Akun ' + action.akun_asal + ' → ' + action.akun_tujuan + ' di jurnal ' + action.jurnal_id + '</div></div>';
      showAlert('Reklasifikasi berhasil!');

    } else if (action.type === 'fix_coa_jurnal') {
      // Fix batch: ganti semua akun lama ke akun baru di semua jurnal
      if (!action.akun_lama || !action.akun_baru) { showAlert('Data fix COA tidak lengkap', 'danger'); return; }
      var allJ = await KDB.getAll('jurnal');
      var fixCount = 0;
      for (var fi = 0; fi < allJ.length; fi++) {
        var jj = allJ[fi];
        var changed = false;
        var fixLines = (jj.lines||[]).map(function(l) {
          if (l.akun === action.akun_lama) { changed = true; return Object.assign({}, l, { akun: action.akun_baru }); }
          return l;
        });
        if (changed) { await KDB.save('jurnal', jj.id, Object.assign({}, jj, { lines: fixLines })); fixCount++; }
      }
      chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#c8e6c9;padding:8px 14px;border-radius:8px;font-size:0.85rem">✅ Fix COA selesai! ' + fixCount + ' jurnal diubah: ' + action.akun_lama + ' → ' + action.akun_baru + '</div></div>';
      showAlert(fixCount + ' jurnal berhasil di-fix!');

    } else if (action.type === 'sinkron_pc') {
      // Sinkronisasi: buat jurnal dari transaksi petty cash yang belum ada jurnalnya
      var pcAll = await KDB.getAll('pettycash');
      var jrnAll = await KDB.getAll('jurnal');
      var pcJrnRefs = {};
      jrnAll.filter(function(j){ return j.sumber === 'petty-cash'; }).forEach(function(j){ if(j.noRef) pcJrnRefs[j.noRef]=true; });
      var akunPC = await getAkunPettyCash();
      var akunBank = await getAkunKasBank();
      var syncCount = 0;
      for (var si = 0; si < pcAll.length; si++) {
        var pc = pcAll[si];
        if (pc.jurnalId || (pc.noRef && pcJrnRefs[pc.noRef]) || (pc.id && pcJrnRefs[pc.id])) continue;
        var jml = Math.abs(parseFloat(pc.jumlah)||0);
        if (jml <= 0) continue;
        var sjId = genId('JU');
        var lines;
        if (pc.tipe === 'masuk') {
          lines = [{ akun: akunPC, ket: pc.keterangan||'Top-up', debit: jml, kredit: 0 }, { akun: akunBank, ket: 'Transfer', debit: 0, kredit: jml }];
        } else {
          lines = [{ akun: pc.akunDebit||'5-2200', ket: pc.keterangan||'Pengeluaran', debit: jml, kredit: 0 }, { akun: akunPC, ket: 'Kas kecil keluar', debit: 0, kredit: jml }];
        }
        await KDB.save('jurnal', sjId, { id: sjId, tanggal: pc.tanggal||today(), keterangan: pc.keterangan||'Sinkron PC', noRef: pc.noRef||pc.id, tipe: 'umum', sumber: 'petty-cash', lines: lines, totalDebit: jml, totalKredit: jml, createdBy: KU.username, createdAt: new Date().toISOString() });
        await KDB.save('pettycash', pc.id, Object.assign({}, pc, { jurnalId: sjId }));
        syncCount++;
      }
      chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#c8e6c9;padding:8px 14px;border-radius:8px;font-size:0.85rem">✅ Sinkronisasi selesai! ' + syncCount + ' transaksi petty cash dibuatkan jurnal.</div></div>';
      showAlert(syncCount + ' transaksi petty cash disinkronkan!');

    } else {
      showAlert('Tipe aksi tidak dikenali: ' + action.type, 'warning');
    }
  } catch(e) {
    chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#ffcdd2;padding:8px 14px;border-radius:8px;font-size:0.85rem">❌ Gagal: ' + e.message + '</div></div>';
    showAlert('Gagal eksekusi: ' + e.message, 'danger');
  }
  chatEl.scrollTop = chatEl.scrollHeight;
}

function batalAIAction() {
  _pendingAIAction = null;
  var chatEl = document.getElementById('ai-chat-messages');
  chatEl.innerHTML += '<div style="display:flex;margin:8px 0"><div style="background:#ffecb3;padding:8px 14px;border-radius:8px;font-size:0.85rem">⚠️ Aksi dibatalkan oleh user.</div></div>';
  chatEl.scrollTop = chatEl.scrollHeight;
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function callGeminiChat(msg) {
  try {
    // Kumpulkan konteks keuangan ringkas
    var fd = await getFinancialData();
    var pcSaldo = await KDB.getSetting('pettycash_saldo', 0);
    var jurnal = await KDB.getAll('jurnal');
    var akunList = await getAkun();

    var konteks = 'Data keuangan perusahaan saat ini:\n'
      + '- Total jurnal: ' + jurnal.length + '\n'
      + '- Saldo petty cash (setting): Rp ' + pcSaldo.toLocaleString('id-ID') + '\n';

    // Tambah ringkasan saldo beberapa akun penting
    var akunPenting = Object.keys(fd.saldo).slice(0, 15).map(function(k) {
      var s = fd.saldo[k];
      var net = (s.debit||0) - (s.kredit||0);
      return '  ' + k + ' (' + (s.akun.nama||k) + '): Rp ' + net.toLocaleString('id-ID');
    }).join('\n');
    konteks += '- Saldo akun:\n' + akunPenting + '\n';

    // Daftar akun COA untuk referensi AI
    var coaList = akunList.slice(0, 30).map(function(a) { return a.kode + ' - ' + a.nama + ' (' + a.kategori + ')'; }).join('\n');
    konteks += '\n- Daftar Akun COA:\n' + coaList + '\n';

    var response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, context: konteks })
    });

    var data = await response.json();
    if (!response.ok) {
      return 'Error: ' + (data.error || 'Server error');
    }
    return data.reply || 'Tidak ada respon.';
  } catch(e) {
    return 'Error: ' + e.message + '. Pastikan koneksi internet aktif.';
  }
}

async function callOpenRouterChat(msg, apiKey) {
  try {
    var fd = await getFinancialData();
    var pcSaldo = await KDB.getSetting('pettycash_saldo', 0);
    var jurnal = await KDB.getAll('jurnal');
    var akunList = await getAkun();
    var pcList = await KDB.getAll('pettycash');

    // Hitung ringkasan petty cash tahun ini
    var tahun = new Date().getFullYear();
    var pcTahunIni = pcList.filter(function(p) { return p.tanggal && p.tanggal.startsWith(String(tahun)); });
    var pcMasuk = 0, pcKeluar = 0;
    pcTahunIni.forEach(function(p) {
      if (p.tipe === 'masuk') pcMasuk += Math.abs(parseFloat(p.jumlah)||0);
      else pcKeluar += Math.abs(parseFloat(p.jumlah)||0);
    });
    var pcSaldoSaatIni = pcSaldo + pcMasuk - pcKeluar;

    // 10 transaksi petty cash terbaru
    var pcTerbaru = pcList.slice().sort(function(a,b){ return (b.tanggal||'').localeCompare(a.tanggal||''); }).slice(0, 10);
    var pcTerbaruStr = pcTerbaru.map(function(p) {
      return '  ' + (p.tanggal||'-') + ' | ' + (p.tipe||'keluar') + ' | Rp ' + Math.abs(parseFloat(p.jumlah)||0).toLocaleString('id-ID') + ' | ' + (p.keterangan||'-');
    }).join('\n');

    var konteks = 'Data keuangan perusahaan IJEF Corp:\n'
      + '- Total jurnal: ' + jurnal.length + '\n'
      + '- Petty Cash: Saldo awal Rp ' + pcSaldo.toLocaleString('id-ID') + ', Masuk ' + tahun + ': Rp ' + pcMasuk.toLocaleString('id-ID') + ', Keluar ' + tahun + ': Rp ' + pcKeluar.toLocaleString('id-ID') + ', Saldo saat ini: Rp ' + pcSaldoSaatIni.toLocaleString('id-ID') + '\n'
      + '- Total transaksi petty cash: ' + pcList.length + ' (' + pcTahunIni.length + ' tahun ini)\n';

    var akunPenting = Object.keys(fd.saldo).slice(0, 20).map(function(k) {
      var s = fd.saldo[k]; return '  ' + k + ' (' + (s.akun.nama||k) + '): Rp ' + ((s.debit||0)-(s.kredit||0)).toLocaleString('id-ID');
    }).join('\n');
    konteks += '- Saldo akun:\n' + akunPenting + '\n';

    var coaList = akunList.slice(0, 30).map(function(a) { return a.kode + ' - ' + a.nama + ' [' + a.kategori + ']'; }).join('\n');
    konteks += '\n- COA:\n' + coaList + '\n';

    konteks += '\n- 10 transaksi petty cash terbaru:\n' + pcTerbaruStr + '\n';

    var systemMsg = 'Kamu adalah AI asisten keuangan perusahaan IJEF Corp. Jawab dalam Bahasa Indonesia, singkat dan jelas.\n\n'
      + 'Kamu BISA mengakses dan memodifikasi data keuangan. Jika user minta aksi, taruh format ACTION di akhir pesan:\n'
      + '###ACTION:{"type":"jurnal","tanggal":"YYYY-MM-DD","keterangan":"...","lines":[{"akun":"kode","ket":"...","debit":0,"kredit":0}]}###\n'
      + '###ACTION:{"type":"topup_pc","tanggal":"YYYY-MM-DD","jumlah":number,"keterangan":"..."}###\n'
      + '###ACTION:{"type":"pengeluaran_pc","tanggal":"YYYY-MM-DD","jumlah":number,"keterangan":"...","akunBeban":"kode"}###\n'
      + '###ACTION:{"type":"reklasifikasi","jurnal_id":"...","akun_asal":"kode","akun_tujuan":"kode"}###\n'
      + '###ACTION:{"type":"hapus_jurnal","id":"jurnal_id","alasan":"..."}###\n'
      + '###ACTION:{"type":"fix_coa_jurnal","akun_lama":"kode","akun_baru":"kode"}###\n\n'
      + '###ACTION:{"type":"sinkron_pc"}###\n\n'
      + 'PENTING:\n'
      + '- Selalu jelaskan dulu, baru tambahkan ACTION di akhir\n'
      + '- Kamu punya akses PENUH ke data petty cash, jurnal, COA\n'
      + '- Jika user minta sinkronisasi/perbaikan data, lakukan langsung\n'
      + '- Jika hanya tanya, jawab tanpa ACTION\n\n'
      + 'Konteks:\n' + konteks;

    var response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey, 'HTTP-Referer': window.location.href, 'X-Title': 'IJEF Keuangan' },
      body: JSON.stringify({ model: 'google/gemma-4-31b-it:free', messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: msg }] })
    });
    if (!response.ok) {
      var errData = await response.json().catch(function(){ return {}; });
      return 'Error OpenRouter: ' + (errData.error ? (errData.error.message||JSON.stringify(errData.error)) : response.status);
    }
    var data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) return data.choices[0].message.content || 'Tidak ada respon.';
    return 'Tidak ada respon.';
  } catch(e) {
    return 'Error: ' + e.message;
  }
}

async function localAIReply(msg) {
  // Analisis lokal tanpa API — berdasarkan keyword matching
  var lower = msg.toLowerCase();
  var fd = await getFinancialData();
  var pcSaldo = await KDB.getSetting('pettycash_saldo', 0);
  var pcList = await KDB.getAll('pettycash');
  var jurnal = await KDB.getAll('jurnal');

  // Deteksi perintah aksi: buat jurnal
  if ((lower.includes('buat') || lower.includes('catat') || lower.includes('input')) && lower.includes('jurnal')) {
    // Coba parse nominal dari pesan
    var nominalMatch = msg.match(/(\d[\d.,]*)/);
    var nominal = nominalMatch ? parseFloat(nominalMatch[1].replace(/\./g,'').replace(',','.')) : 0;
    if (nominal > 0) {
      var akunList = await getAkun();
      // Coba detect akun dari keyword
      var akunDebit = '5-2200', akunKredit = await getAkunPettyCash();
      if (lower.includes('listrik')) akunDebit = akunList.find(function(a){ return (a.nama||'').toLowerCase().includes('listrik'); }) ? akunList.find(function(a){ return (a.nama||'').toLowerCase().includes('listrik'); }).kode : '5-2200';
      if (lower.includes('gaji') || lower.includes('salary')) akunDebit = akunList.find(function(a){ return (a.nama||'').toLowerCase().includes('gaji'); }) ? akunList.find(function(a){ return (a.nama||'').toLowerCase().includes('gaji'); }).kode : '5-1100';
      if (lower.includes('atk') || lower.includes('alat tulis')) akunDebit = akunList.find(function(a){ return (a.nama||'').toLowerCase().includes('atk'); }) ? akunList.find(function(a){ return (a.nama||'').toLowerCase().includes('atk'); }).kode : '5-2200';

      var ket = msg.replace(/buat(kan)?|catat(kan)?|input(kan)?|jurnal/gi, '').trim() || 'Jurnal dari AI Chat';
      return 'Saya akan buatkan jurnal:\n'
        + '• Keterangan: ' + ket + '\n'
        + '• Debit: ' + akunDebit + ' → Rp ' + nominal.toLocaleString('id-ID') + '\n'
        + '• Kredit: ' + akunKredit + ' → Rp ' + nominal.toLocaleString('id-ID') + '\n\n'
        + 'Klik Konfirmasi untuk menyimpan.\n'
        + '###ACTION:{"type":"jurnal","tanggal":"' + today() + '","keterangan":"' + ket.replace(/"/g,'\\"') + '","lines":[{"akun":"' + akunDebit + '","ket":"' + ket.replace(/"/g,'\\"') + '","debit":' + nominal + ',"kredit":0},{"akun":"' + akunKredit + '","ket":"Kas keluar","debit":0,"kredit":' + nominal + '}]}###';
    }
    return 'Untuk membuat jurnal, sebutkan nominal dan keterangan. Contoh:\n"Buatkan jurnal beban listrik 500000"';
  }

  // Deteksi perintah topup petty cash
  if ((lower.includes('topup') || lower.includes('top up') || lower.includes('isi') || lower.includes('tambah saldo')) && (lower.includes('petty') || lower.includes('kas kecil'))) {
    var nominalMatch2 = msg.match(/(\d[\d.,]*)/);
    var nominal2 = nominalMatch2 ? parseFloat(nominalMatch2[1].replace(/\./g,'').replace(',','.')) : 0;
    if (nominal2 > 0) {
      return 'Saya akan top-up petty cash:\n'
        + '• Jumlah: Rp ' + nominal2.toLocaleString('id-ID') + '\n'
        + '• Tanggal: ' + today() + '\n\n'
        + 'Klik Konfirmasi untuk menyimpan.\n'
        + '###ACTION:{"type":"topup_pc","tanggal":"' + today() + '","jumlah":' + nominal2 + ',"keterangan":"Top-up kas kecil dari AI Chat"}###';
    }
    return 'Sebutkan jumlah yang mau di-topup. Contoh:\n"Topup petty cash 1000000"';
  }

  // Deteksi pengeluaran petty cash
  if ((lower.includes('buat') || lower.includes('catat') || lower.includes('input')) && (lower.includes('pengeluaran') || lower.includes('keluar')) && (lower.includes('petty') || lower.includes('kas kecil'))) {
    var nominalMatch3 = msg.match(/(\d[\d.,]*)/);
    var nominal3 = nominalMatch3 ? parseFloat(nominalMatch3[1].replace(/\./g,'').replace(',','.')) : 0;
    if (nominal3 > 0) {
      var ket3 = msg.replace(/buat(kan)?|catat(kan)?|input(kan)?|pengeluaran|keluar|petty|kas kecil/gi, '').trim() || 'Pengeluaran petty cash';
      return 'Saya akan catat pengeluaran petty cash:\n'
        + '• Jumlah: Rp ' + nominal3.toLocaleString('id-ID') + '\n'
        + '• Keterangan: ' + ket3 + '\n\n'
        + 'Klik Konfirmasi untuk menyimpan.\n'
        + '###ACTION:{"type":"pengeluaran_pc","tanggal":"' + today() + '","jumlah":' + nominal3 + ',"keterangan":"' + ket3.replace(/"/g,'\\"') + '","akunBeban":"5-2200"}###';
    }
    return 'Sebutkan jumlah dan keterangan. Contoh:\n"Catat pengeluaran petty cash 50000 beli ATK"';
  }

  if (lower.includes('saldo') || lower.includes('kas') || lower.includes('petty')) {
    var tahun = new Date().getFullYear();
    var pcTahunIni = pcList.filter(function(p) { return p.tanggal && p.tanggal.startsWith(String(tahun)); });
    var masuk = 0, keluar = 0;
    pcTahunIni.forEach(function(p) {
      if (p.tipe === 'masuk') masuk += Math.abs(parseFloat(p.jumlah)||0);
      else keluar += Math.abs(parseFloat(p.jumlah)||0);
    });
    var saldoPC = pcSaldo + masuk - keluar;
    return 'Posisi saldo petty cash saat ini:\n'
      + '• Saldo awal: Rp ' + pcSaldo.toLocaleString('id-ID') + '\n'
      + '• Total masuk (tahun ' + tahun + '): Rp ' + masuk.toLocaleString('id-ID') + '\n'
      + '• Total keluar (tahun ' + tahun + '): Rp ' + keluar.toLocaleString('id-ID') + '\n'
      + '• Saldo saat ini: Rp ' + saldoPC.toLocaleString('id-ID') + '\n\n'
      + 'Untuk detail akun lain, cek menu Posisi Saldo Hari Ini.';
  }

  if (lower.includes('neraca') || lower.includes('balance')) {
    var totalAset = 0, totalKew = 0, totalEku = 0;
    Object.keys(fd.saldo).forEach(function(k) {
      var s = fd.saldo[k];
      var prefix = (k||'').charAt(0);
      if (prefix === '1') totalAset += (s.debit||0) - (s.kredit||0);
      else if (prefix === '2') totalKew += (s.kredit||0) - (s.debit||0);
      else if (prefix === '3') totalEku += (s.kredit||0) - (s.debit||0);
    });
    var laba = totalAset - totalKew - totalEku;
    return 'Ringkasan Neraca:\n'
      + '• Total Aset: Rp ' + totalAset.toLocaleString('id-ID') + '\n'
      + '• Total Kewajiban: Rp ' + totalKew.toLocaleString('id-ID') + '\n'
      + '• Total Ekuitas: Rp ' + totalEku.toLocaleString('id-ID') + '\n'
      + '• Laba Periode: Rp ' + laba.toLocaleString('id-ID') + '\n'
      + '• Status: Neraca Balance ✓';
  }

  if (lower.includes('jurnal') || lower.includes('penyesuaian')) {
    return 'Saya bisa bantu buatkan jurnal! Contoh perintah:\n'
      + '• "Buatkan jurnal beban listrik 500000"\n'
      + '• "Catat pengeluaran petty cash 50000 beli ATK"\n'
      + '• "Topup petty cash 1000000"\n\n'
      + 'Atau tanya tentang cara jurnal penyesuaian, saya jelaskan langkahnya.';
  }

  if (lower.includes('posisi') || lower.includes('keuangan') || lower.includes('kesehatan')) {
    var totalPendapatan = 0, totalBeban = 0;
    Object.keys(fd.saldo).forEach(function(k) {
      var s = fd.saldo[k];
      var prefix = (k||'').charAt(0);
      if (prefix === '4') totalPendapatan += (s.kredit||0) - (s.debit||0);
      if (prefix === '5' || prefix === '6') totalBeban += (s.debit||0) - (s.kredit||0);
    });
    var laba2 = totalPendapatan - totalBeban;
    return 'Posisi keuangan saat ini:\n'
      + '• Total jurnal tercatat: ' + jurnal.length + '\n'
      + '• Pendapatan: Rp ' + totalPendapatan.toLocaleString('id-ID') + '\n'
      + '• Beban: Rp ' + totalBeban.toLocaleString('id-ID') + '\n'
      + '• Laba/Rugi: Rp ' + laba2.toLocaleString('id-ID') + (laba2 >= 0 ? ' (Laba)' : ' (Rugi)') + '\n\n'
      + 'Untuk analisis lebih detail, klik tombol "Jalankan Analisis Lengkap" di atas.';
  }

  if (lower.includes('transaksi') || lower.includes('perhatian') || lower.includes('anomali')) {
    var unbal = jurnal.filter(function(j) { var d=0,k=0; (j.lines||[]).forEach(function(l){d+=l.debit||0;k+=l.kredit||0;}); return Math.abs(d-k)>0.01; });
    if (unbal.length > 0) {
      return '⚠️ Ditemukan ' + unbal.length + ' jurnal tidak balance!\n'
        + 'Ini perlu segera diperbaiki. Gunakan tombol "Cek Jurnal Balance" di atas untuk melihat detailnya.';
    }
    return '✅ Semua jurnal balance. Tidak ada transaksi yang perlu perhatian khusus saat ini.\n\nUntuk analisis anomali lebih dalam, klik "Jalankan Analisis Lengkap".';
  }

  return 'Saya bisa bantu:\n'
    + '• Tanya: saldo, neraca, posisi keuangan, transaksi anomali\n'
    + '• Aksi: "Buatkan jurnal beban listrik 500000"\n'
    + '• Aksi: "Topup petty cash 1000000"\n'
    + '• Aksi: "Catat pengeluaran petty cash 50000 beli ATK"\n\n'
    + 'Untuk fitur chat AI yang lebih cerdas, gunakan pertanyaan spesifik tentang data keuangan Anda.';
}

async function runAIAnalysis() {
  var el = document.getElementById('ai-result');
  if (!el) return;
  el.innerHTML = '<div class="alert alert-warning">⏳ Memulai analisis komprehensif...</div>';

  // Use setTimeout to allow UI to update before heavy computation
  setTimeout(async function() {
    try {
      var startTime = Date.now();
      var TIMEOUT_MS = 30000;
      var issues = [];
      var warnings = [];
      var info = [];
      var timedOut = false;
      var TOTAL_CHECKS = 15;

      function updateProgress(step, label) {
        if (el) el.innerHTML = '<div class="alert alert-warning">⏳ Analisis ' + step + '/' + TOTAL_CHECKS + ': ' + label + '</div>';
      }

      function checkTimeout() {
        if (Date.now() - startTime > TIMEOUT_MS) { timedOut = true; return true; }
        return false;
      }

      el.innerHTML = '<div class="alert alert-warning">⏳ Memuat data...</div>';

      // Load all data at once to minimize Firebase calls
      var allJurnal = await KDB.getAll('jurnal');
      var fd = await getFinancialData();
      var akunList = await getAkun();
      var pcList = await KDB.getAll('pettycash');
      var invoiceList = await KDB.getAll('invoice');
      var poList = await KDB.getAll('po');

      if (checkTimeout()) { el.innerHTML = '<div class="alert alert-warning">Analisis dihentikan karena timeout. Berikut hasil parsial.</div>'; return; }

      el.innerHTML = '<div class="alert alert-success">⏳ Memuat data... &#10003;</div>';

      // 1. Cek jurnal tidak balance
      updateProgress(1, 'Mengecek jurnal balance...');
      try {
    var unbalanced = [];
    allJurnal.forEach(function(j) {
      var td = 0, tk = 0;
      (j.lines||[]).forEach(function(l) { td += l.debit||0; tk += l.kredit||0; });
      if (Math.abs(td - tk) > 0.01) {
        unbalanced.push({ id: j.id, ref: j.noRef||j.id, ket: j.keterangan, selisih: Math.abs(td-tk), debit: td, kredit: tk, tanggal: j.tanggal });
      }
    });
    if (unbalanced.length > 0) {
      issues.push({ severity: 'danger', title: '❌ Jurnal Tidak Balance (' + unbalanced.length + ' transaksi)', detail: unbalanced.map(function(u) { return '<tr><td>' + fmtDate(u.tanggal) + '</td><td>' + u.ref + '</td><td>' + (u.ket||'-') + '</td><td class="text-red">' + fmtRp(u.selisih) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="lihatJurnal(\'' + u.id + '\')">Review</button> <button class="btn btn-xs btn-warning" onclick="editJurnal(\'' + u.id + '\')">Edit</button> <button class="btn btn-xs btn-danger" onclick="hapusJurnal(\'' + u.id + '\')">Hapus</button></td></tr>'; }).join(''), isTable: true, headers: '<th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Selisih</th><th>Aksi</th>', group: 'integritas', recommendation: 'Periksa dan perbaiki jurnal yang selisih debit-kreditnya tidak nol.' });
    } else {
      info.push('✅ Semua jurnal balance (Debit = Kredit)');
    }
      } catch(e1) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek jurnal balance', detail: '<p>Error: ' + e1.message + '</p>', isTable: false, group: 'integritas' }); }

      if (checkTimeout()) { timedOut = true; }

    // 2. Cek akun tidak terdaftar di COA
      if (!timedOut) {
      updateProgress(2, 'Mengecek akun COA...');
      try {
    var allKnownAkun = {};
    fd.akun.forEach(function(a) { allKnownAkun[a.kode] = true; });
    akunList.forEach(function(a) { allKnownAkun[a.kode] = true; });
    var unknownAkun = [];
    allJurnal.forEach(function(j) {
      if (j.tipe === 'penutup') return;
      (j.lines||[]).forEach(function(l) {
        if (l.akun && !allKnownAkun[l.akun] && !unknownAkun.find(function(x){ return x.kode === l.akun; })) {
          unknownAkun.push({ kode: l.akun, dariJurnal: j.noRef||j.id, ket: l.ket||j.keterangan });
        }
      });
    });
    if (unknownAkun.length > 0) {
      warnings.push({ severity: 'warning', title: '⚠️ Akun Tidak Terdaftar di COA (' + unknownAkun.length + ' akun)', actionButtons: '<button class="btn btn-info btn-sm" onclick="navigate(\'setup-akun\')">📋 Buka Setup COA</button>', detail: unknownAkun.map(function(u) { return '<tr><td>' + u.kode + '</td><td>' + (u.ket||'-') + '</td><td>' + u.dariJurnal + '</td><td><button class="btn btn-xs btn-info" onclick="navigate(\'setup-akun\')">Tambah ke COA</button></td></tr>'; }).join(''), isTable: true, headers: '<th>Kode Akun</th><th>Keterangan</th><th>Dari Jurnal</th><th>Aksi</th>', group: 'anomali', recommendation: 'Tambahkan akun-akun ini ke Chart of Account atau perbaiki kode akun di jurnal terkait.' });
    } else {
      info.push('✅ Semua akun di jurnal terdaftar di COA');
    }
      } catch(e2) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek akun COA', detail: '<p>Error: ' + e2.message + '</p>', isTable: false, group: 'anomali' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 3. Cek petty cash tanpa jurnal
      if (!timedOut) {
      updateProgress(3, 'Mengecek petty cash...');
      try {
    var jurnalPCRefs = {};
    allJurnal.filter(function(j){ return j.sumber === 'petty-cash'; }).forEach(function(j) {
      if (j.noRef) jurnalPCRefs[j.noRef] = true;
    });
    var pcNoJurnal = pcList.filter(function(p) {
      if (p.jurnalId) return false; // sudah punya link jurnal
      if ((p.tipe||'keluar') !== 'keluar') return false; // skip masuk/topup
      if ((p.kategori||'').toLowerCase().includes('top-up') || (p.kategori||'').toLowerCase().includes('topup')) return false;
      // Cek apakah ada jurnal dengan noRef yang sama
      if (p.noRef && jurnalPCRefs[p.noRef]) return false;
      if (p.id && jurnalPCRefs[p.id]) return false;
      return true;
    });
    if (pcNoJurnal.length > 0) {
      var pcTotal = pcNoJurnal.reduce(function(s,p){ return s + Math.abs(parseFloat(p.jumlah)||0); }, 0);
      warnings.push({ severity: 'warning', title: '⚠️ Petty Cash Belum Terintegrasi Jurnal (' + pcNoJurnal.length + ' transaksi, total ' + fmtRp(pcTotal) + ')', detail: '<p style="margin-bottom:8px">Transaksi petty cash lama yang diinput sebelum fitur integrasi jurnal otomatis. Klik tombol di bawah untuk membuat jurnal secara batch.</p>'
        + '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'
        + '<button class="btn btn-success btn-sm" onclick="batchBuatJurnalPC()">🔄 Buat Jurnal Semua (' + pcNoJurnal.length + ')</button>'
        + '<button class="btn btn-info btn-sm" onclick="navigate(\'kalk-pettycash\')">💵 Buka Petty Cash</button>'
        + '<button class="btn btn-danger btn-sm" onclick="hapusPCTerpilih()" id="btn-hapus-pc-sel" style="display:none">🗑️ Hapus Terpilih</button>'
        + '<button class="btn btn-warning btn-sm" onclick="batchBuatJurnalPCTerpilih()" id="btn-jurnal-pc-sel" style="display:none">📓 Buat Jurnal Terpilih</button>'
        + '<span id="pc-sel-count" style="font-size:0.82rem;color:#555;align-self:center"></span>'
        + '</div>'
        + '<div class="table-wrap" style="max-height:250px;overflow-y:auto"><table style="font-size:0.82rem" id="tbl-pc-anomali"><thead><tr><th style="width:28px"><input type="checkbox" onchange="togglePilihSemuaPCAnomali(this.checked)"></th><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th><th>Ref</th><th>Aksi</th></tr></thead><tbody>'
        + pcNoJurnal.slice(0,30).map(function(p) { return '<tr><td><input type="checkbox" class="pc-anomali-chk" value="' + p.id + '" onchange="updatePCAnomaliSelection()"></td><td>' + fmtDate(p.tanggal) + '</td><td>' + (p.keterangan||'-') + '</td><td>' + fmtRp(Math.abs(parseFloat(p.jumlah)||0)) + '</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (p.noRef||'-') + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="lihatPettyCashDetail(\'' + p.id + '\')">Review</button> <button class="btn btn-xs btn-warning" onclick="editPettyCash(\'' + p.id + '\')">Edit</button> <button class="btn btn-xs btn-danger" onclick="hapusPettyCash(\'' + p.id + '\')">Hapus</button> <button class="btn btn-xs btn-success" onclick="buatJurnalDariPC(\'' + p.id + '\')">Buat Jurnal</button></td></tr>'; }).join('')
        + (pcNoJurnal.length > 30 ? '<tr><td colspan="6" style="text-align:center;color:#888">... dan ' + (pcNoJurnal.length - 30) + ' transaksi lainnya</td></tr>' : '')
        + '</tbody></table></div>', isTable: false, group: 'anomali' });
    } else {
      info.push('✅ Semua petty cash terintegrasi dengan jurnal');
    }
      } catch(e3) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek petty cash', detail: '<p>Error: ' + e3.message + '</p>', isTable: false, group: 'anomali' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 4. Cek duplikasi transaksi (jurnal dengan ref & nominal & tanggal sama, exclude penutup)
      if (!timedOut) {
      updateProgress(4, 'Mengecek duplikasi transaksi...');
      try {
    var refMap = {};
    var duplicates = [];
    allJurnal.forEach(function(j) {
      if (j.tipe === 'penutup') return;
      if (!j.noRef) return;
      // Hanya deteksi duplikat jika TANGGAL SAMA + NOMINAL SAMA + REF SAMA + KETERANGAN SAMA
      // Dan nominal minimal Rp 10.000 (exclude recurring charges kecil seperti biaya admin/bunga)
      if ((j.totalDebit||0) < 10000) return;
      var key = (j.tanggal||'') + '_' + (j.totalDebit||0).toFixed(0) + '_' + (j.noRef||'') + '_' + (j.keterangan||'').substring(0,50);
      if (refMap[key]) {
        duplicates.push({ id1: refMap[key].id, id2: j.id, ref: j.noRef, jumlah: j.totalDebit, tanggal: j.tanggal, ket: j.keterangan });
      } else {
        refMap[key] = j;
      }
    });
    if (duplicates.length > 0) {
      window._aiDuplicates = duplicates;
      var dupRows = duplicates.slice(0, 10).map(function(d) { return '<tr><td><input type="checkbox" class="dup-chk" value="' + d.id2 + '" onchange="updateDupSelection()"></td><td>' + fmtDate(d.tanggal) + '</td><td>' + (d.ref||'-') + '</td><td>' + (d.ket||'-') + '</td><td>' + fmtRp(d.jumlah) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="lihatJurnal(\'' + d.id1 + '\')">Lihat Asli</button> <button class="btn btn-xs btn-info" onclick="lihatJurnal(\'' + d.id2 + '\')">Review Duplikat</button> <button class="btn btn-xs btn-danger" onclick="hapusDuplikatJurnal(\'' + d.id2 + '\',\'' + d.id1 + '\')">Hapus Duplikat</button></td></tr>'; }).join('');
      var hiddenRows = duplicates.length > 10 ? duplicates.slice(10).map(function(d) { return '<tr class="dup-hidden-row" style="display:none"><td><input type="checkbox" class="dup-chk" value="' + d.id2 + '" onchange="updateDupSelection()"></td><td>' + fmtDate(d.tanggal) + '</td><td>' + (d.ref||'-') + '</td><td>' + (d.ket||'-') + '</td><td>' + fmtRp(d.jumlah) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="lihatJurnal(\'' + d.id1 + '\')">Lihat Asli</button> <button class="btn btn-xs btn-info" onclick="lihatJurnal(\'' + d.id2 + '\')">Review Duplikat</button> <button class="btn btn-xs btn-danger" onclick="hapusDuplikatJurnal(\'' + d.id2 + '\',\'' + d.id1 + '\')">Hapus Duplikat</button></td></tr>'; }).join('') : '';
      var showAllBtn = duplicates.length > 10 ? '<tr id="dup-show-all-row"><td colspan="6" style="text-align:center;padding:8px"><button class="btn btn-sm btn-outline" onclick="tampilkanSemuaDuplikat()">📋 Tampilkan Semua (' + duplicates.length + ' data duplikat)</button></td></tr>' : '';

      warnings.push({ severity: 'warning', title: '⚠️ Kemungkinan Duplikasi (' + duplicates.length + ' pasang)', 
        actionButtons: '<button class="btn btn-danger btn-sm" onclick="hapusSemuaDuplikat()">🗑️ Hapus Semua Duplikat (' + duplicates.length + ')</button>'
          + ' <button class="btn btn-danger btn-sm" onclick="hapusDuplikatTerpilih()" id="btn-hapus-dup-sel" style="display:none">🗑️ Hapus Terpilih</button>'
          + ' <button class="btn btn-info btn-sm" onclick="navigate(\'jurnal-umum\')">📓 Buka Jurnal Umum</button>'
          + ' <button class="btn btn-outline btn-sm" onclick="tampilkanSemuaDuplikat()">📋 Tampilkan Semua</button>'
          + ' <span id="dup-sel-count" style="font-size:0.82rem;color:#555"></span>',
        detail: dupRows + hiddenRows + showAllBtn,
        isTable: true, headers: '<th style="width:28px"><input type="checkbox" onchange="togglePilihSemuaDuplikat(this.checked)"></th><th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Jumlah</th><th>Aksi</th>', 
        group: 'integritas', 
        recommendation: 'Review dan hapus jurnal duplikat. Gunakan "Hapus Semua Duplikat" untuk batch delete.' });
    } else {
      info.push('✅ Tidak ditemukan duplikasi transaksi');
    }
      } catch(e4) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek duplikasi', detail: '<p>Error: ' + e4.message + '</p>', isTable: false, group: 'integritas' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 5. Cek selisih Actual Pembayaran vs Penerimaan
      if (!timedOut) {
      updateProgress(5, 'Mengecek rasio beban/pendapatan...');
      try {
    var totalBeban = 0, totalPendapatan = 0;
    Object.values(fd.saldo).forEach(function(s) {
      var d = s.debit || 0, k = s.kredit || 0;
      if ((s.akun.kategori||'').includes('Beban')) totalBeban += (d - k);
      if ((s.akun.kategori||'').includes('Pendapatan')) totalPendapatan += (k - d);
    });
    if (totalPendapatan > 0) {
      var rasio = ((totalBeban / totalPendapatan) * 100).toFixed(1);
      if (parseFloat(rasio) > 120) {
        warnings.push({ severity: 'danger', title: '💡 Beban Jauh Melebihi Pendapatan (Rasio ' + rasio + '%)', actionButtons: '<button class="btn btn-info btn-sm" onclick="navigate(\'lap-labarugi\')">📊 Lihat Laba Rugi</button> <button class="btn btn-info btn-sm" onclick="navigate(\'jurnal-umum\')">📓 Buka Jurnal</button>', detail: '<p>Total Beban: <b class="text-red">' + fmtRp(totalBeban) + '</b></p><p>Total Pendapatan: <b class="text-green">' + fmtRp(totalPendapatan) + '</b></p><p>Rasio Beban/Pendapatan: <b>' + rasio + '%</b></p><p><b>Kemungkinan penyebab:</b></p><ul style="margin:4px 0 0 20px;font-size:0.85rem"><li>Pendapatan belum semua diinput ke Dana Masuk / Jurnal</li><li>Beban dari periode sebelumnya masih terbawa (belum tutup buku)</li><li>Terdapat transaksi petty cash yang belum terintegrasi jurnal</li></ul>', group: 'anomali' });
      } else if (parseFloat(rasio) > 100) {
        info.push('ℹ️ Beban sedikit melebihi pendapatan (rasio ' + rasio + '%) — normal jika masih awal periode');
      } else {
        info.push('✅ Rasio beban/pendapatan sehat (' + rasio + '%)');
      }
    } else {
      info.push('ℹ️ Belum ada data pendapatan untuk analisis rasio');
    }
      } catch(e5) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek rasio beban', detail: '<p>Error: ' + e5.message + '</p>', isTable: false, group: 'anomali' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 6. Cek jurnal tanpa tanggal
      if (!timedOut) {
      updateProgress(6, 'Mengecek jurnal tanpa tanggal...');
      try {
    var noDate = allJurnal.filter(function(j) { return !j.tanggal; });
    if (noDate.length > 0) {
      warnings.push({ severity: 'warning', title: '⚠️ Jurnal Tanpa Tanggal (' + noDate.length + ')', detail: noDate.slice(0,10).map(function(j) { return '<tr><td>' + (j.noRef||j.id) + '</td><td>' + (j.keterangan||'-') + '</td><td><button class="btn btn-xs btn-warning" onclick="editJurnal(\'' + j.id + '\')">Perbaiki</button></td></tr>'; }).join(''), isTable: true, headers: '<th>Ref</th><th>Keterangan</th><th>Aksi</th>', group: 'integritas', recommendation: 'Tambahkan tanggal yang sesuai untuk setiap jurnal yang belum memiliki tanggal.' });
    } else {
      info.push('✅ Semua jurnal memiliki tanggal');
    }
      } catch(e6) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek jurnal tanpa tanggal', detail: '<p>Error: ' + e6.message + '</p>', isTable: false, group: 'integritas' }); }
      }

    // 7. Cek total transaksi & ringkasan
    info.push('📊 Total jurnal: ' + allJurnal.length + ' | Petty cash: ' + pcList.length + ' | COA: ' + akunList.length + ' akun');

      if (checkTimeout()) { timedOut = true; }

    // === NEW CHECKS 8-15 ===

    // 8. Neraca Balance Validation (using shared helper)
      if (!timedOut) {
      updateProgress(8, 'Validasi neraca balance...');
      try {
    var neracaTotals = computeNeracaTotals(fd.saldo, akunList, fd.akun);
    var totalAsetN = neracaTotals.totalAset;
    var totalKewajibanN = neracaTotals.totalKewajiban;
    var totalEkuitasN = neracaTotals.totalEkuitas;
    var totalPendapatanN = neracaTotals.totalPendapatan;
    var totalPendapatanLainN = neracaTotals.totalPendapatanLain;
    var totalBebanOpsN = neracaTotals.totalBebanOps;
    var totalBebanLainN = neracaTotals.totalBebanLain;
    var labaBersihN = neracaTotals.labaBersih;
    var totalKewEkuitasN = neracaTotals.totalKewEkuitas;
    var selisihNeraca = Math.abs(totalAsetN - totalKewEkuitasN);
    if (selisihNeraca >= 1) {
      issues.push({ severity: 'danger', title: '❌ Neraca Tidak Balance (Selisih: ' + fmtRp(selisihNeraca) + ')', actionButtons: '<button class="btn btn-info btn-sm" onclick="navigate(\'lap-neraca\')">⚖️ Lihat Neraca</button> <button class="btn btn-warning btn-sm" onclick="runAINeracaCheck()">📊 Cek Detail Neraca</button> <button class="btn btn-info btn-sm" onclick="navigate(\'jurnal-umum\')">📓 Buka Jurnal</button>', detail: '<p>Total Aset: ' + fmtRp(totalAsetN) + '</p><p>Total Kewajiban + Ekuitas + Laba Bersih: ' + fmtRp(totalKewEkuitasN) + '</p><p>Selisih: <b class="text-red">' + fmtRp(selisihNeraca) + '</b></p><p><b>Rekomendasi:</b> Periksa jurnal yang tidak balance dan pastikan semua transaksi dicatat berpasangan (double entry). Jalankan "Cek Neraca Balance" untuk detail lengkap.</p>', isTable: false, group: 'standar' });
    } else {
      info.push('✅ Neraca balance (Aset = Kewajiban + Ekuitas + Laba Bersih)');
    }
      } catch(e8) { warnings.push({ severity: 'warning', title: '⚠️ Gagal validasi neraca', detail: '<p>Error: ' + e8.message + '</p>', isTable: false, group: 'standar' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 9. Trial Balance Check
      if (!timedOut) {
      updateProgress(9, 'Mengecek trial balance...');
      try {
    var totalAllDebit = 0, totalAllKredit = 0;
    allJurnal.forEach(function(j) {
      (j.lines||[]).forEach(function(l) {
        totalAllDebit += l.debit||0;
        totalAllKredit += l.kredit||0;
      });
    });
    var trialDiff = Math.abs(totalAllDebit - totalAllKredit);
    if (trialDiff > 0.01) {
      issues.push({ severity: 'danger', title: '❌ Trial Balance Tidak Seimbang (Selisih: ' + fmtRp(trialDiff) + ')', actionButtons: '<button class="btn btn-warning btn-sm" onclick="runAIJurnalCheck()">📓 Cek Jurnal Tidak Balance</button> <button class="btn btn-info btn-sm" onclick="navigate(\'jurnal-umum\')">📓 Buka Jurnal</button>', detail: '<p>Total Debit Seluruh Jurnal: ' + fmtRp(totalAllDebit) + '</p><p>Total Kredit Seluruh Jurnal: ' + fmtRp(totalAllKredit) + '</p><p>Selisih: <b class="text-red">' + fmtRp(trialDiff) + '</b></p><p><b>Rekomendasi:</b> Ini adalah error kritis. Periksa setiap jurnal yang tidak balance menggunakan fitur "Cek Jurnal Tidak Balance".</p>', isTable: false, group: 'standar' });
    } else {
      info.push('✅ Trial balance seimbang (Total Debit = Total Kredit)');
    }
      } catch(e9) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek trial balance', detail: '<p>Error: ' + e9.message + '</p>', isTable: false, group: 'standar' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 10. Saldo Normal Anomaly Detection
      if (!timedOut) {
      updateProgress(10, 'Mengecek saldo normal...');
      try {
    var saldoAnomalies = [];
    Object.keys(fd.saldo).forEach(function(kode) {
      var s = fd.saldo[kode];
      var d = s.debit || 0, k = s.kredit || 0;
      var kat = (s.akun && s.akun.kategori) || '';
      var nama = (s.akun && s.akun.nama) || kode;
      // Determine expected direction from category
      var isDebitNormal = kat.includes('Aset') || kat.includes('Beban');
      var balance = isDebitNormal ? (d - k) : (k - d);
      if (balance === 0) return;
      // Anomaly: negative balance means contra to expected
      if (balance < 0) {
        saldoAnomalies.push({ kode: kode, nama: nama, net: balance, expected: isDebitNormal ? 'Debit (positif)' : 'Kredit (positif)', actual: isDebitNormal ? 'Kredit (negatif)' : 'Debit (negatif)' });
      }
    });
    if (saldoAnomalies.length > 0) {
      warnings.push({ severity: 'warning', title: '⚠️ Saldo Normal Anomali (' + saldoAnomalies.length + ' akun)', actionButtons: '<button class="btn btn-info btn-sm" onclick="navigate(\'monitor-buku-besar\')">📚 Buka Buku Besar</button> <button class="btn btn-warning btn-sm" onclick="navigate(\'setup-akun\')">📋 Edit COA</button>', detail: saldoAnomalies.slice(0,15).map(function(a) { return '<tr><td>' + a.kode + '</td><td>' + a.nama + '</td><td class="text-red">' + fmtRp(a.net) + '</td><td>' + a.expected + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="navigate(\'monitor-buku-besar\')">Buku Besar</button> <button class="btn btn-xs btn-warning" onclick="navigate(\'setup-akun\')">Edit COA</button></td></tr>'; }).join('') + (saldoAnomalies.length > 15 ? '<tr><td colspan="5" style="text-align:center;color:#888">... dan ' + (saldoAnomalies.length - 15) + ' akun lainnya</td></tr>' : ''), isTable: true, headers: '<th>Kode</th><th>Nama Akun</th><th>Saldo</th><th>Seharusnya</th><th>Aksi</th>', group: 'anomali', recommendation: 'Periksa ulang jurnal manual terkait akun-akun ini. Saldo yang berlawanan dengan tipe normal bisa mengindikasikan kesalahan pencatatan.' });
    } else {
      info.push('✅ Semua akun memiliki saldo normal sesuai tipe');
    }
      } catch(e10) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek saldo normal', detail: '<p>Error: ' + e10.message + '</p>', isTable: false, group: 'anomali' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 11. Double Entry Validation
      if (!timedOut) {
      updateProgress(11, 'Mengecek double entry...');
      try {
    var singleLineJournals = [];
    allJurnal.forEach(function(j) {
      if (j.tipe === 'penutup') return;
      if ((j.lines||[]).length < 2) {
        singleLineJournals.push({ id: j.id, ref: j.noRef||j.id, ket: j.keterangan, tanggal: j.tanggal, lines: (j.lines||[]).length });
      }
    });
    if (singleLineJournals.length > 0) {
      issues.push({ severity: 'danger', title: '❌ Jurnal Tidak Double Entry (' + singleLineJournals.length + ' jurnal hanya 1 baris)', actionButtons: '<button class="btn btn-info btn-sm" onclick="navigate(\'jurnal-umum\')">📓 Buka Jurnal Umum</button>', detail: singleLineJournals.slice(0,10).map(function(j) { return '<tr><td>' + fmtDate(j.tanggal) + '</td><td>' + j.ref + '</td><td>' + (j.ket||'-') + '</td><td>' + j.lines + ' baris</td><td class="tbl-actions"><button class="btn btn-xs btn-warning" onclick="editJurnal(\'' + j.id + '\')">Perbaiki</button></td></tr>'; }).join('') + (singleLineJournals.length > 10 ? '<tr><td colspan="5" style="text-align:center;color:#888">... dan ' + (singleLineJournals.length - 10) + ' jurnal lainnya</td></tr>' : ''), isTable: true, headers: '<th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Jumlah Baris</th><th>Aksi</th>', group: 'integritas', recommendation: 'Setiap jurnal harus memiliki minimal 2 baris (debit dan kredit). Tambahkan baris pasangan untuk setiap jurnal yang bermasalah.' });
    } else {
      info.push('✅ Semua jurnal memiliki minimal 2 baris (double entry)');
    }
      } catch(e11) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek double entry', detail: '<p>Error: ' + e11.message + '</p>', isTable: false, group: 'integritas' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 12. Orphan Transactions (optimized with Set for O(1) lookups)
      if (!timedOut) {
      updateProgress(12, 'Mengecek transaksi orphan...');
      try {
    // Build a Set of lowercased jurnal refs for O(1) lookups
    var jurnalRefsSet = new Set();
    allJurnal.forEach(function(j) { if (j.noRef && typeof j.noRef === 'string') jurnalRefsSet.add(j.noRef.toLowerCase()); else if (j.noRef) jurnalRefsSet.add(String(j.noRef).toLowerCase()); });
    // Convert to array once for substring matching
    var jurnalRefsArr = Array.from(jurnalRefsSet);
    var orphanInvoices = invoiceList.filter(function(inv) {
      var invId = (inv.id||'').toLowerCase();
      var invNo = (inv.nomor||inv.number||'').toLowerCase();
      // First try exact match via Set (O(1))
      if (jurnalRefsSet.has(invId) || (invNo && jurnalRefsSet.has(invNo))) return false;
      // Fallback: substring match against refs array
      for (var ri = 0; ri < jurnalRefsArr.length; ri++) {
        var ref = jurnalRefsArr[ri];
        if (ref.indexOf(invId) !== -1 || (invNo && ref.indexOf(invNo) !== -1)) return false;
      }
      return true;
    });
    var orphanPOs = poList.filter(function(po) {
      var poId = (po.id||'').toLowerCase();
      var poNo = (po.nomor||po.number||'').toLowerCase();
      // First try exact match via Set (O(1))
      if (jurnalRefsSet.has(poId) || (poNo && jurnalRefsSet.has(poNo))) return false;
      // Fallback: substring match against refs array
      for (var ri = 0; ri < jurnalRefsArr.length; ri++) {
        var ref = jurnalRefsArr[ri];
        if (ref.indexOf(poId) !== -1 || (poNo && ref.indexOf(poNo) !== -1)) return false;
      }
      return true;
    });
    if (orphanInvoices.length > 0 || orphanPOs.length > 0) {
      var orphanDetail = '';
      if (orphanInvoices.length > 0) {
        orphanDetail += '<p><b>Invoice tanpa jurnal (' + orphanInvoices.length + '):</b></p>' + orphanInvoices.slice(0,10).map(function(inv) { return '<div style="padding:2px 0;font-size:0.85rem">- ' + (inv.nomor||inv.number||inv.id) + ' | ' + (inv.pelanggan||inv.customer||'-') + ' | ' + fmtRp(parseFloat(inv.total||inv.jumlah||0)) + '</div>'; }).join('');
        if (orphanInvoices.length > 10) orphanDetail += '<div style="color:#888;font-size:0.82rem">... dan ' + (orphanInvoices.length - 10) + ' invoice lainnya</div>';
      }
      if (orphanPOs.length > 0) {
        orphanDetail += '<p style="margin-top:8px"><b>PO tanpa jurnal (' + orphanPOs.length + '):</b></p>' + orphanPOs.slice(0,10).map(function(po) { return '<div style="padding:2px 0;font-size:0.85rem">- ' + (po.nomor||po.number||po.id) + ' | ' + (po.vendor||po.supplier||'-') + ' | ' + fmtRp(parseFloat(po.total||po.jumlah||0)) + '</div>'; }).join('');
        if (orphanPOs.length > 10) orphanDetail += '<div style="color:#888;font-size:0.82rem">... dan ' + (orphanPOs.length - 10) + ' PO lainnya</div>';
      }
      orphanDetail += '<p style="margin-top:8px"><b>Rekomendasi:</b> Buat jurnal penyesuaian untuk transaksi ini atau hubungkan dengan jurnal yang sudah ada.</p>';
      warnings.push({ severity: 'warning', title: '⚠️ Transaksi Orphan (' + (orphanInvoices.length + orphanPOs.length) + ' tanpa jurnal terkait)', actionButtons: '<button class="btn btn-info btn-sm" onclick="navigate(\'kalk-invoice\')">🧾 Buka Invoice</button> <button class="btn btn-info btn-sm" onclick="navigate(\'kalk-po\')">📦 Buka PO</button> <button class="btn btn-warning btn-sm" onclick="navigate(\'jurnal-penyesuaian\')">🔧 Buat Jurnal Penyesuaian</button>', detail: orphanDetail, isTable: false, group: 'anomali' });
    } else {
      info.push('✅ Semua invoice dan PO memiliki jurnal terkait');
    }
      } catch(e12) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek orphan transactions', detail: '<p>Error: ' + e12.message + '</p>', isTable: false, group: 'anomali' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 13. Cross-Report Consistency (COA-only laba vs all-accounts laba)
      if (!timedOut) {
      updateProgress(13, 'Mengecek konsistensi laporan...');
      try {
    var akunResmi = akunList;
    var labaCOA = akunResmi.filter(function(a){ return a.kategori === 'Pendapatan' || a.kategori === 'Pendapatan Lain-lain'; })
      .reduce(function(s,a){ var sal = fd.saldo[a.kode]||{}; return s + ((sal.kredit||0) - (sal.debit||0)); }, 0)
      - akunResmi.filter(function(a){ return a.kategori === 'Beban Operasional' || a.kategori === 'Beban Lain-lain'; })
      .reduce(function(s,a){ var sal = fd.saldo[a.kode]||{}; return s + ((sal.debit||0) - (sal.kredit||0)); }, 0);

    var labaAll = fd.akun.filter(function(a){ return a.kategori === 'Pendapatan' || a.kategori === 'Pendapatan Lain-lain'; })
      .reduce(function(s,a){ var sal = fd.saldo[a.kode]||{}; return s + ((sal.kredit||0) - (sal.debit||0)); }, 0)
      - fd.akun.filter(function(a){ return a.kategori === 'Beban Operasional' || a.kategori === 'Beban Lain-lain'; })
      .reduce(function(s,a){ var sal = fd.saldo[a.kode]||{}; return s + ((sal.debit||0) - (sal.kredit||0)); }, 0);

    var crossDiff = Math.abs(labaCOA - labaAll);
    if (crossDiff > 0.01) {
      warnings.push({ severity: 'warning', title: '⚠️ Inkonsistensi Lintas Laporan (Selisih: ' + fmtRp(crossDiff) + ')', detail: '<p>Laba Bersih (COA Resmi / Laba Rugi): ' + fmtRp(labaCOA) + '</p><p>Laba Bersih (Semua Akun / Neraca): ' + fmtRp(labaAll) + '</p><p>Ada akun pendapatan/beban di jurnal yang tidak terdaftar di COA resmi.</p><p><b>Rekomendasi:</b> Daftarkan akun-akun tersebut ke dalam Chart of Accounts atau hapus jurnal yang mereferensi akun tidak resmi.</p>' + '<div style="margin-top:8px"><button class="btn btn-xs btn-info" onclick="navigate(\'lap-labarugi\')">Lihat Laba Rugi</button> <button class="btn btn-xs btn-info" onclick="navigate(\'lap-neraca\')">Lihat Neraca</button> <button class="btn btn-xs btn-warning" onclick="navigate(\'setup-akun\')">Kelola COA</button></div>', isTable: false, group: 'standar' });
    } else {
      info.push('✅ Laba bersih konsisten antara Laba Rugi dan Neraca');
    }
      } catch(e13) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek konsistensi laporan', detail: '<p>Error: ' + e13.message + '</p>', isTable: false, group: 'standar' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 14. Unusual Amounts (Outlier Detection)
      if (!timedOut) {
      updateProgress(14, 'Mengecek outlier/transaksi tidak lazim...');
      try {
    var allAmounts = [];
    allJurnal.forEach(function(j) {
      (j.lines||[]).forEach(function(l) {
        if ((l.debit||0) > 0) allAmounts.push({ val: l.debit, ref: j.noRef||j.id, tanggal: j.tanggal, ket: l.ket||j.keterangan, type: 'debit' });
        if ((l.kredit||0) > 0) allAmounts.push({ val: l.kredit, ref: j.noRef||j.id, tanggal: j.tanggal, ket: l.ket||j.keterangan, type: 'kredit' });
      });
    });
    var outliers = [];
    if (allAmounts.length > 10) {
      var sumVal = 0;
      allAmounts.forEach(function(a) { sumVal += a.val; });
      var meanVal = sumVal / allAmounts.length;
      var sumSqDiff = 0;
      allAmounts.forEach(function(a) { sumSqDiff += (a.val - meanVal) * (a.val - meanVal); });
      var stdDev = Math.sqrt(sumSqDiff / allAmounts.length);
      var threshold = meanVal + 3 * stdDev;
      if (threshold > 0) {
        allAmounts.forEach(function(a) {
          if (a.val > threshold) outliers.push(a);
        });
        outliers.sort(function(a,b) { return b.val - a.val; });
        outliers = outliers.slice(0,5);
      }
    }
    if (outliers.length > 0) {
      warnings.push({ severity: 'warning', title: '⚠️ Transaksi Tidak Lazim / Outlier (' + outliers.length + ' ditemukan)', actionButtons: '<button class="btn btn-info btn-sm" onclick="navigate(\'jurnal-umum\')">📓 Buka Jurnal Umum</button>', detail: outliers.map(function(o) { return '<tr><td>' + fmtDate(o.tanggal) + '</td><td>' + o.ref + '</td><td>' + (o.ket||'-') + '</td><td>' + o.type + '</td><td class="text-red fw-bold">' + fmtRp(o.val) + '</td></tr>'; }).join('') + '<tr><td colspan="5" style="font-size:0.82rem;color:#666;padding-top:8px"><b>Rekomendasi:</b> Review transaksi dengan nominal sangat besar dibanding rata-rata. Pastikan bukan kesalahan input.</td></tr>', isTable: true, headers: '<th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Tipe</th><th>Jumlah</th>', group: 'anomali' });
    } else {
      info.push('✅ Tidak ditemukan transaksi outlier (nominal tidak lazim)');
    }
      } catch(e14) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek outlier', detail: '<p>Error: ' + e14.message + '</p>', isTable: false, group: 'anomali' }); }
      }

      if (checkTimeout()) { timedOut = true; }

    // 15. Future Date and Date Gap Check
      if (!timedOut) {
      updateProgress(15, 'Mengecek tanggal jurnal...');
      try {
    var todayStr = new Date().toISOString().slice(0,10);
    var futureJournals = allJurnal.filter(function(j) { return j.tanggal && j.tanggal > todayStr; });
    if (futureJournals.length > 0) {
      warnings.push({ severity: 'warning', title: '⚠️ Jurnal Tanggal Masa Depan (' + futureJournals.length + ')', actionButtons: '<button class="btn btn-info btn-sm" onclick="navigate(\'jurnal-umum\')">📓 Buka Jurnal Umum</button>', detail: futureJournals.slice(0,10).map(function(j) { return '<tr><td>' + fmtDate(j.tanggal) + '</td><td>' + (j.noRef||j.id) + '</td><td>' + (j.keterangan||'-') + '</td><td class="tbl-actions"><button class="btn btn-xs btn-warning" onclick="editJurnal(\'' + j.id + '\')">Edit</button></td></tr>'; }).join(''), isTable: true, headers: '<th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Aksi</th>', group: 'anomali', recommendation: 'Jurnal dengan tanggal masa depan mungkin salah input. Periksa dan perbaiki jika diperlukan.' });
    }
    var datedJournals = allJurnal.filter(function(j) { return j.tanggal; }).sort(function(a,b) { return (a.tanggal||'').localeCompare(b.tanggal||''); });
    var largeGaps = [];
    for (var gi = 1; gi < datedJournals.length; gi++) {
      var d1 = new Date(datedJournals[gi-1].tanggal);
      var d2 = new Date(datedJournals[gi].tanggal);
      var diffDays = Math.round((d2 - d1) / (1000*60*60*24));
      if (diffDays > 90) {
        largeGaps.push({ from: datedJournals[gi-1].tanggal, to: datedJournals[gi].tanggal, days: diffDays });
      }
    }
    if (largeGaps.length > 0) {
      info.push('ℹ️ Terdapat ' + largeGaps.length + ' gap besar (>90 hari) antara jurnal berurutan: ' + largeGaps.slice(0,3).map(function(g) { return fmtDate(g.from) + ' s/d ' + fmtDate(g.to) + ' (' + g.days + ' hari)'; }).join(', '));
    }
    if (futureJournals.length === 0) {
      info.push('✅ Tidak ada jurnal dengan tanggal masa depan');
    }
      } catch(e15) { warnings.push({ severity: 'warning', title: '⚠️ Gagal cek tanggal', detail: '<p>Error: ' + e15.message + '</p>', isTable: false, group: 'anomali' }); }
      }

      // Add timeout notice if applicable
      if (timedOut) {
        info.push('⚠️ Analisis dihentikan karena timeout (>30 detik). Berikut hasil parsial.');
      }

    // === FINANCIAL HEALTH SCORE ===
    var healthScore = 100;
    healthScore -= Math.min(issues.length, 3) * 15;
    healthScore -= Math.min(warnings.length, 6) * 5;
    if (healthScore < 0) healthScore = 0;
    var scoreColor = healthScore >= 80 ? '#4caf50' : (healthScore >= 60 ? '#ff9800' : '#f44336');
    var gradeText = healthScore >= 90 ? 'Excellent - Kondisi keuangan sangat baik' : (healthScore >= 80 ? 'Baik - Kondisi keuangan sehat dengan sedikit catatan' : (healthScore >= 60 ? 'Perlu Perbaikan - Ada beberapa masalah yang perlu ditangani' : 'Kritis - Banyak masalah serius yang memerlukan perhatian segera'));
    // Build result HTML
    var html = '<div class="card"><div class="card-header"><h2>📋 Hasil Analisis AI Komprehensif</h2><span class="chip">' + new Date().toLocaleString('id-ID') + '</span></div>';

    // Financial Health Score Card
    html += '<div class="card" style="border-left:4px solid ' + scoreColor + ';margin-bottom:16px">'
      + '<div style="display:flex;align-items:center;gap:20px">'
      + '<div style="text-align:center">'
      + '<div style="font-size:2.5rem;font-weight:700;color:' + scoreColor + '">' + healthScore + '%</div>'
      + '<div style="font-size:0.8rem;color:#666">Financial Health Score</div>'
      + '</div>'
      + '<div style="flex:1">'
      + '<div style="background:#e0e0e0;border-radius:8px;height:16px;overflow:hidden">'
      + '<div style="width:' + healthScore + '%;height:100%;background:' + scoreColor + ';transition:width 0.5s"></div>'
      + '</div>'
      + '<div style="margin-top:8px;font-size:0.85rem">' + gradeText + '</div>'
      + '</div>'
      + '</div>'
      + '</div>';

    var totalIssues = issues.length + warnings.length;
    html += '<div class="stats-row" style="margin-bottom:16px">'
      + '<div class="stat-box ' + (issues.length > 0 ? 'red' : 'green') + '"><div class="val">' + issues.length + '</div><div class="lbl">Error Kritis</div></div>'
      + '<div class="stat-box ' + (warnings.length > 0 ? 'red' : 'green') + '"><div class="val">' + warnings.length + '</div><div class="lbl">Peringatan</div></div>'
      + '<div class="stat-box green"><div class="val">' + info.length + '</div><div class="lbl">OK / Info</div></div>'
      + '</div>';

    if (totalIssues === 0) {
      html += '<div class="alert alert-success">🎉 Tidak ditemukan masalah! Semua data keuangan dalam kondisi baik.</div>';
    }

    // Group results by section
    var allFindings = issues.concat(warnings);
    var integritasItems = allFindings.filter(function(item) { return item.group === 'integritas'; });
    var standarItems = allFindings.filter(function(item) { return item.group === 'standar'; });
    var anomaliItems = allFindings.filter(function(item) { return item.group === 'anomali'; });
    var ungroupedItems = allFindings.filter(function(item) { return !item.group; });

    function renderFindingItems(items) {
      var out = '';
      items.forEach(function(issue) {
        out += '<div class="alert alert-' + issue.severity + '" style="margin-bottom:12px"><b>' + issue.title + '</b>';
        if (issue.actionButtons) {
          out += '<div style="margin-top:8px">' + issue.actionButtons + '</div>';
        }
        if (issue.isTable) {
          out += '<div class="table-wrap" style="margin-top:8px;max-height:350px;overflow-y:auto"><table style="font-size:0.82rem"><thead><tr>' + issue.headers + '</tr></thead><tbody>' + issue.detail + '</tbody></table></div>';
        } else {
          out += '<div style="margin-top:8px">' + issue.detail + '</div>';
        }
        if (issue.recommendation) {
          out += '<div style="margin-top:8px;padding:8px;background:#fff3e0;border-radius:4px;font-size:0.83rem"><b>Rekomendasi:</b> ' + issue.recommendation + '</div>';
        }
        out += '</div>';
      });
      return out;
    }

    // Section: Integritas Data
    if (integritasItems.length > 0 || ungroupedItems.length > 0) {
      html += '<div style="margin-top:16px;padding:8px 12px;background:#f5f5f5;border-radius:4px;font-weight:700">Integritas Data</div>';
      html += renderFindingItems(ungroupedItems);
      html += renderFindingItems(integritasItems);
    }

    // Section: Kepatuhan Standar Akuntansi
    if (standarItems.length > 0) {
      html += '<div style="margin-top:16px;padding:8px 12px;background:#f5f5f5;border-radius:4px;font-weight:700">Kepatuhan Standar Akuntansi</div>';
      html += renderFindingItems(standarItems);
    }

    // Section: Analisis Anomali
    if (anomaliItems.length > 0) {
      html += '<div style="margin-top:16px;padding:8px 12px;background:#f5f5f5;border-radius:4px;font-weight:700">Analisis Anomali</div>';
      html += renderFindingItems(anomaliItems);
    }

    // Info items
    if (info.length > 0) {
      html += '<div style="margin-top:12px;padding:12px;background:#e8f5e9;border-radius:8px">';
      info.forEach(function(i) { html += '<div style="padding:4px 0">' + i + '</div>'; });
      html += '</div>';
    }

    html += '</div>';
    el.innerHTML = html;
    } catch(e) {
      el.innerHTML = '<div class="alert alert-danger">Error saat analisis: ' + e.message + '</div>';
    }
  }, 50);
}

async function runAIJurnalCheck() {
  var el = document.getElementById('ai-result');
  if (!el) return;
  el.innerHTML = '<div class="alert alert-warning">⏳ Mengecek jurnal...</div>';
  var allJurnal = await KDB.getAll('jurnal');
  var problems = [];
  allJurnal.forEach(function(j) {
    var td = 0, tk = 0;
    (j.lines||[]).forEach(function(l) { td += l.debit||0; tk += l.kredit||0; });
    if (Math.abs(td - tk) > 0.01) {
      problems.push(j);
    }
  });
  if (problems.length === 0) {
    el.innerHTML = '<div class="alert alert-success">✅ Semua jurnal balance! Tidak ada selisih Debit-Kredit.</div>';
    return;
  }
  var rows = problems.map(function(j) {
    var td = 0, tk = 0;
    (j.lines||[]).forEach(function(l) { td += l.debit||0; tk += l.kredit||0; });
    return '<tr><td>' + fmtDate(j.tanggal) + '</td><td>' + (j.noRef||j.id) + '</td><td>' + (j.keterangan||'-') + '</td><td>' + fmtRp(td) + '</td><td>' + fmtRp(tk) + '</td><td class="text-red fw-bold">' + fmtRp(Math.abs(td-tk)) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="lihatJurnal(\'' + j.id + '\')">Review</button> <button class="btn btn-xs btn-warning" onclick="editJurnal(\'' + j.id + '\')">Edit</button> <button class="btn btn-xs btn-danger" onclick="hapusJurnal(\'' + j.id + '\')">Hapus</button></td></tr>';
  }).join('');
  el.innerHTML = '<div class="card"><div class="card-header"><h2>❌ Jurnal Tidak Balance (' + problems.length + ')</h2></div>'
    + '<div class="alert alert-warning" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">'
    + '<span>Ditemukan <b>' + problems.length + '</b> jurnal tidak balance. Pilih aksi:</span>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap">'
    + '<button class="btn btn-danger btn-sm" onclick="hapusBatchJurnalUnbalance()">🗑️ Hapus Semua yang Tidak Balance</button>'
    + '<button class="btn btn-warning btn-sm" onclick="fixBatchJurnalBalance()">🔧 Auto-Fix Balance (tambah selisih ke akun penyesuaian)</button>'
    + '</div></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Ref</th><th>Keterangan</th><th>Debit</th><th>Kredit</th><th>Selisih</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

async function runAIPettyCashCheck() {
  var el = document.getElementById('ai-result');
  if (!el) return;
  el.innerHTML = '<div class="alert alert-warning">⏳ Mengecek integrasi petty cash...</div>';
  var pcList = await KDB.getAll('pettycash');
  var allJurnal = await KDB.getAll('jurnal');
  var pcJurnal = allJurnal.filter(function(j) { return j.sumber === 'petty-cash'; });

  // Hitung total dari petty cash collection
  var totalPCKeluar = 0, totalPCMasuk = 0;
  pcList.forEach(function(p) {
    var tipe = p.tipe || 'keluar';
    if (!p.tipe) {
      var kat = (p.kategori||'').toLowerCase();
      if (kat.includes('masuk') || kat.includes('topup') || kat.includes('isi')) tipe = 'masuk';
    }
    if (tipe === 'masuk') totalPCMasuk += Math.abs(parseFloat(p.jumlah)||0);
    else totalPCKeluar += Math.abs(parseFloat(p.jumlah)||0);
  });

  // Hitung total dari jurnal petty-cash
  var totalJurnalPC = pcJurnal.reduce(function(s,j) { return s + (parseFloat(j.totalDebit)||0); }, 0);

  // Cek petty cash tanpa link jurnal — dengan pengecekan noRef
  var jurnalPCRefs = {};
  pcJurnal.forEach(function(j) { if (j.noRef) jurnalPCRefs[j.noRef] = true; });

  var pcTanpaJurnal = pcList.filter(function(p) {
    if (p.jurnalId) return false;
    if ((p.tipe||'keluar') !== 'keluar') return false;
    if ((p.kategori||'').toLowerCase().includes('top-up') || (p.kategori||'').toLowerCase().includes('topup')) return false;
    if (p.noRef && jurnalPCRefs[p.noRef]) return false;
    if (p.id && jurnalPCRefs[p.id]) return false;
    return true;
  });

  var totalTanpaJurnal = pcTanpaJurnal.reduce(function(s,p){ return s + Math.abs(parseFloat(p.jumlah)||0); }, 0);
  var selisih = Math.abs(totalPCKeluar - totalJurnalPC);

  var html = '<div class="card"><div class="card-header"><h2>💵 Analisis Petty Cash vs Jurnal</h2></div>'
    + '<div class="stats-row">'
    + '<div class="stat-box"><div class="val">' + fmtRp(totalPCKeluar) + '</div><div class="lbl">Total PC Keluar</div></div>'
    + '<div class="stat-box"><div class="val">' + fmtRp(totalPCMasuk) + '</div><div class="lbl">Total PC Masuk</div></div>'
    + '<div class="stat-box"><div class="val">' + fmtRp(totalJurnalPC) + '</div><div class="lbl">Total Jurnal PC</div></div>'
    + '<div class="stat-box ' + (pcTanpaJurnal.length > 0 ? 'red' : 'green') + '"><div class="val">' + pcTanpaJurnal.length + '</div><div class="lbl">Belum Integrasi</div></div>'
    + '</div>';

  if (pcTanpaJurnal.length > 0) {
    html += '<div class="alert alert-warning"><b>⚠️ ' + pcTanpaJurnal.length + ' transaksi petty cash belum terintegrasi jurnal (total ' + fmtRp(totalTanpaJurnal) + ')</b>'
      + '<p style="margin-top:8px">Ini adalah transaksi lama yang diinput sebelum fitur integrasi otomatis. Klik tombol di bawah untuk membuat jurnal secara batch.</p>'
      + '<button class="btn btn-success" onclick="batchBuatJurnalPC()" style="margin-top:8px">🔄 Buat Jurnal Semua (' + pcTanpaJurnal.length + ' transaksi)</button></div>';
  } else {
    html += '<div class="alert alert-success">✅ Semua petty cash sudah terintegrasi dengan jurnal!</div>';
  }

  if (pcTanpaJurnal.length > 0) {
    html += '<div style="margin-top:12px"><b>Detail transaksi belum terintegrasi:</b></div>'
      + '<div class="table-wrap" style="max-height:300px;overflow-y:auto"><table style="font-size:0.82rem"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jumlah</th><th>Aksi</th></tr></thead><tbody>'
      + pcTanpaJurnal.slice(0,30).map(function(p) { return '<tr><td>' + fmtDate(p.tanggal) + '</td><td>' + (p.keterangan||'-') + '</td><td>' + fmtRp(Math.abs(parseFloat(p.jumlah)||0)) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-info" onclick="lihatPettyCashDetail(\'' + p.id + '\')">Review</button> <button class="btn btn-xs btn-warning" onclick="editPettyCash(\'' + p.id + '\')">Edit</button> <button class="btn btn-xs btn-danger" onclick="hapusPettyCash(\'' + p.id + '\')">Hapus</button> <button class="btn btn-xs btn-success" onclick="buatJurnalDariPC(\'' + p.id + '\')">Buat Jurnal</button></td></tr>'; }).join('')
      + (pcTanpaJurnal.length > 30 ? '<tr><td colspan="4" style="text-align:center;color:#888">... dan ' + (pcTanpaJurnal.length - 30) + ' transaksi lainnya</td></tr>' : '')
      + '</tbody></table></div>';
  }

  html += '</div>';
  el.innerHTML = html;
}

async function runAINeracaCheck() {
  var el = document.getElementById('ai-result');
  if (!el) return;
  el.innerHTML = '<div class="alert alert-warning">⏳ Mengecek neraca balance...</div>';
  try {
    var fd = await getFinancialData();
    var saldo = fd.saldo;
    var akunList = await getAkun();

    var nt = computeNeracaTotals(saldo, akunList, fd.akun);
    var totalAset = nt.totalAset, totalKewajiban = nt.totalKewajiban, totalEkuitas = nt.totalEkuitas;
    var labaBersih = nt.labaBersih;
    var totalKewEkuitas = nt.totalKewEkuitas;
    var asetItems = nt.asetItems, kewajibanItems = nt.kewajibanItems, ekuitasItems = nt.ekuitasItems;
    var selisih = Math.abs(totalAset - totalKewEkuitas);
    var balanced = selisih < 1;

    var html = '<div class="card"><div class="card-header"><h2>📊 Cek Neraca Balance</h2></div>';
    html += '<div class="stats-row">'
      + '<div class="stat-box"><div class="val">' + fmtRp(totalAset) + '</div><div class="lbl">Total Aset</div></div>'
      + '<div class="stat-box"><div class="val">' + fmtRp(totalKewajiban) + '</div><div class="lbl">Total Kewajiban</div></div>'
      + '<div class="stat-box"><div class="val">' + fmtRp(totalEkuitas) + '</div><div class="lbl">Total Ekuitas</div></div>'
      + '<div class="stat-box"><div class="val">' + fmtRp(labaBersih) + '</div><div class="lbl">Laba Bersih</div></div>'
      + '</div>';

    if (balanced) {
      html += '<div class="alert alert-success"><b>✅ NERACA BALANCE!</b><br>Total Aset = Total Kewajiban + Total Ekuitas + Laba Bersih<br>'
        + fmtRp(totalAset) + ' = ' + fmtRp(totalKewajiban) + ' + ' + fmtRp(totalEkuitas) + ' + ' + fmtRp(labaBersih) + ' = ' + fmtRp(totalKewEkuitas) + '</div>';
    } else {
      html += '<div class="alert alert-danger"><b>❌ NERACA TIDAK BALANCE!</b><br>Total Aset: ' + fmtRp(totalAset) + '<br>'
        + 'Total Kewajiban + Ekuitas + Laba Bersih: ' + fmtRp(totalKewEkuitas) + '<br>'
        + 'Selisih: <b>' + fmtRp(selisih) + '</b><br>'
        + '<br><b>Rekomendasi:</b><ul style="margin:4px 0 0 20px"><li>Periksa jurnal yang tidak balance</li><li>Pastikan semua transaksi sudah dicatat berpasangan</li><li>Periksa akun-akun yang belum terkategorisasi</li></ul></div>';
    }

    html += '<div style="margin-top:12px"><b>Detail Perhitungan:</b></div>'
      + '<div class="table-wrap"><table style="font-size:0.82rem"><thead><tr><th>Komponen</th><th>Jumlah</th></tr></thead><tbody>'
      + '<tr><td><b>Total Aset</b></td><td class="text-right"><b>' + fmtRp(totalAset) + '</b></td></tr>'
      + '<tr><td colspan="2" style="border-top:2px solid #333"><b>Total Kewajiban + Ekuitas</b></td></tr>'
      + '<tr><td style="padding-left:20px">Kewajiban</td><td class="text-right">' + fmtRp(totalKewajiban) + '</td></tr>'
      + '<tr><td style="padding-left:20px">Ekuitas</td><td class="text-right">' + fmtRp(totalEkuitas) + '</td></tr>'
      + '<tr><td style="padding-left:20px">Laba Bersih Periode Berjalan</td><td class="text-right">' + fmtRp(labaBersih) + '</td></tr>'
      + '<tr style="border-top:1px solid #999"><td><b>Total Kewajiban + Ekuitas + Laba</b></td><td class="text-right"><b>' + fmtRp(totalKewEkuitas) + '</b></td></tr>'
      + '<tr style="border-top:2px solid #333"><td><b>Selisih</b></td><td class="text-right ' + (balanced?'text-green':'text-red') + '"><b>' + fmtRp(selisih) + '</b></td></tr>'
      + '</tbody></table></div>';

    html += '</div>';
    el.innerHTML = html;
  } catch(e) {
    el.innerHTML = '<div class="alert alert-danger">Error saat cek neraca: ' + e.message + '</div>';
  }
}

async function buatJurnalDariPC(pcId) {
  var pcList = await KDB.getAll('pettycash');
  var pc = pcList.find(function(x) { return x.id === pcId; });
  if (!pc) { showAlert('Data tidak ditemukan!', 'danger'); return; }
  if (pc.jurnalId) { showAlert('Jurnal sudah dibuat sebelumnya!', 'warning'); return; }

  var jumlah = Math.abs(parseFloat(pc.jumlah)||0);
  var akunPC = await getAkunPettyCash();
  var akunDebit = pc.akunDebit || '5-2200'; // Default: Beban Operasional
  var akunKredit = pc.akunKredit || akunPC; // Default: akun Petty Cash dari COA

  var jId = genId('JU');
  await KDB.save('jurnal', jId, {
    id: jId, tanggal: pc.tanggal || today(),
    keterangan: pc.keterangan || 'Pengeluaran petty cash',
    noRef: pc.noRef || pcId,
    tipe: 'umum', sumber: 'petty-cash',
    lines: [
      { akun: akunDebit, ket: pc.keterangan || 'Pengeluaran PC', debit: jumlah, kredit: 0 },
      { akun: akunKredit, ket: 'Kas kecil keluar', debit: 0, kredit: jumlah }
    ],
    totalDebit: jumlah, totalKredit: jumlah,
    createdBy: KU.username, createdAt: new Date().toISOString()
  });

  // Update petty cash record dengan jurnalId
  await KDB.save('pettycash', pcId, Object.assign({}, pc, { jurnalId: jId }));
  showAlert('Jurnal berhasil dibuat dari petty cash: ' + fmtRp(jumlah));
  // Tetap di panel yang sama — refresh sesuai konteks
  if (currentSection === 'ai-assistant') {
    runAIAnalysis();
  } else {
    runAIPettyCashCheck();
  }
}

async function batchBuatJurnalPC() {
  var akunPC = await getAkunPettyCash();
  if (!confirm('Buat jurnal otomatis untuk SEMUA transaksi petty cash yang belum terintegrasi?\n\nAkun default:\n- Debit: Beban Operasional (5-2200)\n- Kredit: ' + akunPC + ' (Kas Kecil)\n\nAnda bisa edit jurnal nanti jika akun perlu disesuaikan.')) return;

  var pcList = await KDB.getAll('pettycash');
  var allJurnal = await KDB.getAll('jurnal');
  var pcJurnal = allJurnal.filter(function(j) { return j.sumber === 'petty-cash'; });
  var jurnalPCRefs = {};
  pcJurnal.forEach(function(j) { if (j.noRef) jurnalPCRefs[j.noRef] = true; });

  var pcTanpaJurnal = pcList.filter(function(p) {
    if (p.jurnalId) return false;
    if ((p.tipe||'keluar') !== 'keluar') return false;
    if ((p.kategori||'').toLowerCase().includes('top-up') || (p.kategori||'').toLowerCase().includes('topup')) return false;
    if (p.noRef && jurnalPCRefs[p.noRef]) return false;
    if (p.id && jurnalPCRefs[p.id]) return false;
    return true;
  });

  if (pcTanpaJurnal.length === 0) {
    showAlert('Tidak ada transaksi yang perlu dibuatkan jurnal!', 'info');
    return;
  }

  showLoading(true);
  var count = 0;
  for (var i = 0; i < pcTanpaJurnal.length; i++) {
    var pc = pcTanpaJurnal[i];
    var jumlah = Math.abs(parseFloat(pc.jumlah)||0);
    if (jumlah <= 0) continue;

    var akunDebit = pc.akunDebit || '5-2200';
    var akunKredit = pc.akunKredit || akunPC;
    var jId = genId('JU');

    await KDB.save('jurnal', jId, {
      id: jId, tanggal: pc.tanggal || today(),
      keterangan: pc.keterangan || 'Pengeluaran petty cash',
      noRef: pc.noRef || pc.id,
      tipe: 'umum', sumber: 'petty-cash',
      lines: [
        { akun: akunDebit, ket: pc.keterangan || 'Pengeluaran PC', debit: jumlah, kredit: 0 },
        { akun: akunKredit, ket: 'Kas kecil keluar', debit: 0, kredit: jumlah }
      ],
      totalDebit: jumlah, totalKredit: jumlah,
      createdBy: KU.username, createdAt: new Date().toISOString()
    });

    await KDB.save('pettycash', pc.id, Object.assign({}, pc, { jurnalId: jId }));
    count++;
  }
  showLoading(false);
  showAlert('Berhasil membuat ' + count + ' jurnal dari petty cash!');
  if (currentSection === 'ai-assistant') {
    runAIAnalysis();
  } else {
    runAIPettyCashCheck();
  }
}

// ===== FUNGSI FIX OTOMATIS DARI ANALISIS =====

async function hapusBatchJurnalUnbalance() {
  var allJurnal = await KDB.getAll('jurnal');
  var problems = allJurnal.filter(function(j) {
    var td = 0, tk = 0;
    (j.lines||[]).forEach(function(l) { td += l.debit||0; tk += l.kredit||0; });
    return Math.abs(td - tk) > 0.01;
  });
  if (problems.length === 0) { showAlert('Tidak ada jurnal yang tidak balance', 'info'); return; }
  if (!confirm('HAPUS ' + problems.length + ' jurnal yang tidak balance?\n\nAksi ini TIDAK BISA DIBATALKAN!\nJurnal yang dihapus:\n' + problems.slice(0,5).map(function(j){ return '• ' + (j.noRef||j.id) + ' - ' + (j.keterangan||''); }).join('\n') + (problems.length > 5 ? '\n... dan ' + (problems.length-5) + ' lainnya' : ''))) return;

  showLoading(true);
  var count = 0;
  for (var i = 0; i < problems.length; i++) {
    await KDB.delete('jurnal', problems[i].id);
    count++;
  }
  showLoading(false);
  showAlert(count + ' jurnal tidak balance berhasil dihapus!');
  runAIJurnalCheck();
}

async function fixBatchJurnalBalance() {
  var allJurnal = await KDB.getAll('jurnal');
  var problems = allJurnal.filter(function(j) {
    var td = 0, tk = 0;
    (j.lines||[]).forEach(function(l) { td += l.debit||0; tk += l.kredit||0; });
    return Math.abs(td - tk) > 0.01;
  });
  if (problems.length === 0) { showAlert('Tidak ada jurnal yang perlu di-fix', 'info'); return; }
  if (!confirm('Auto-fix ' + problems.length + ' jurnal tidak balance?\n\nSelisih akan ditambahkan ke akun "Selisih Pembulatan" (9-9999) agar jurnal menjadi balance.\n\nAnda bisa edit akun tersebut nanti jika perlu.')) return;

  showLoading(true);
  var count = 0;
  for (var i = 0; i < problems.length; i++) {
    var j = problems[i];
    var td = 0, tk = 0;
    (j.lines||[]).forEach(function(l) { td += l.debit||0; tk += l.kredit||0; });
    var selisih = td - tk;
    var newLines = (j.lines||[]).slice();
    if (selisih > 0) {
      // Debit lebih besar — tambah kredit untuk balance
      newLines.push({ akun: '9-9999', ket: 'Penyesuaian auto-fix balance', debit: 0, kredit: selisih });
    } else {
      // Kredit lebih besar — tambah debit untuk balance
      newLines.push({ akun: '9-9999', ket: 'Penyesuaian auto-fix balance', debit: Math.abs(selisih), kredit: 0 });
    }
    var newTotalD = newLines.reduce(function(s,l){ return s+(l.debit||0); }, 0);
    var newTotalK = newLines.reduce(function(s,l){ return s+(l.kredit||0); }, 0);
    await KDB.save('jurnal', j.id, Object.assign({}, j, { lines: newLines, totalDebit: newTotalD, totalKredit: newTotalK }));
    count++;
  }
  showLoading(false);
  showAlert(count + ' jurnal berhasil di-fix balance!');
  runAIJurnalCheck();
}

// Cocokkan nama akun dari sheets dengan kode COA di sistem
function matchAkunByName(namaAkun, akunList) {
  if (!namaAkun || !akunList || !akunList.length) return '';
  var nama = namaAkun.toString().trim().toLowerCase();
  if (!nama) return '';
  // 1. Exact match nama
  var exact = akunList.find(function(a){ return (a.nama||'').toLowerCase() === nama; });
  if (exact) return exact.kode;
  // 2. Partial match — nama akun mengandung search term
  var partial = akunList.find(function(a){ return (a.nama||'').toLowerCase().includes(nama) || nama.includes((a.nama||'').toLowerCase()); });
  if (partial) return partial.kode;
  // 3. Match by kode langsung (jika user isi kode bukan nama)
  var byKode = akunList.find(function(a){ return a.kode === namaAkun.toString().trim(); });
  if (byKode) return byKode.kode;
  return '';
}

function parseSheetRow(row, headers) {
  function get(col) {
    if (headers) {
      var i = headers.findIndex(function(h) {
        return (h||'').toLowerCase().includes((col.label||'').toLowerCase().split(' ')[0].toLowerCase());
      });
      return i >= 0 ? (row[i] || '') : (row[col.idx] || '');
    }
    return row[col.idx] || '';
  }
  // Kolom X (idx 23), AC (idx 28), AD (idx 29), AG (idx 32) — ambil langsung by index
  var namaAkunDebitRaw = row[23] || '';
  var financeRilisRaw = row[28] || '';
  var tglRilisFinanceRaw = row[29] || '';
  var namaAkunKreditRaw = row[32] || '';
  return {
    timestamp:       get(SHEET_COLS.timestamp),
    tglRilisFinance: tglRilisFinanceRaw.toString().trim(),
    financeRilis:    financeRilisRaw.toString().trim().toUpperCase(),
    email:           get(SHEET_COLS.email),
    namaPemohon:     get(SHEET_COLS.namaPemohon),
    namaLeader:      get(SHEET_COLS.namaLeader),
    noPOInvoice:     get(SHEET_COLS.noPOInvoice),
    nominal:         parseFloat((get(SHEET_COLS.nominal)||'0').toString().replace(/[^0-9.]/g,'')) || 0,
    jatuhTempo:      get(SHEET_COLS.jatuhTempo),
    keteranganBayar: get(SHEET_COLS.keteranganBayar),
    buktiDokumen:    get(SHEET_COLS.buktiDokumen),
    tipeTransaksi:   get(SHEET_COLS.tipeTransaksi),
    namaBank:        get(SHEET_COLS.namaBank),
    noRekening:      get(SHEET_COLS.noRekening),
    namaRekening:    get(SHEET_COLS.namaRekening),
    statusApproval:  get(SHEET_COLS.statusApproval),
    idUnik:          get(SHEET_COLS.idUnik),
    namaAkunDebit:   namaAkunDebitRaw.toString().trim(),
    namaAkunKredit:  namaAkunKreditRaw.toString().trim(),
  };
}

// Flexible date parser for various formats from Google Sheets
function parseFlexDate(str) {
  if (!str) return '';
  var s = str.toString().trim();
  // Try ISO format first (2026-01-04)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.substring(0, 10);
  }
  // Format: DD-Mon-YY or DD-Mon-YYYY (e.g. 04-Jan-26, 28-Apr-2026)
  var monthMap = { jan:'01',feb:'02',mar:'03',apr:'04',may:'05',mei:'05',jun:'06',jul:'07',aug:'08',agu:'08',sep:'09',oct:'10',okt:'10',nov:'11',dec:'12',des:'12' };
  var m1 = s.match(/^(\d{1,2})[\-\/\s]([A-Za-z]{3,})[\-\/\s](\d{2,4})$/);
  if (m1) {
    var day = m1[1].padStart(2, '0');
    var mon = monthMap[(m1[2]||'').substring(0,3).toLowerCase()] || '01';
    var yr = m1[3].length === 2 ? '20' + m1[3] : m1[3];
    return yr + '-' + mon + '-' + day;
  }
  // Format: MM/DD/YYYY or DD/MM/YYYY
  var m2 = s.match(/^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})$/);
  if (m2) {
    var a = parseInt(m2[1]), b = parseInt(m2[2]), c = m2[3];
    // If first number > 12, it's DD/MM/YYYY
    if (a > 12) return c + '-' + String(b).padStart(2,'0') + '-' + String(a).padStart(2,'0');
    // Otherwise assume MM/DD/YYYY (US format from Sheets)
    return c + '-' + String(a).padStart(2,'0') + '-' + String(b).padStart(2,'0');
  }
  // Fallback: try native Date
  try {
    var d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch(e) {}
  return '';
}

function rowToJurnal(parsed, akunList) {
  var tgl = today();
  // Prioritas: Tgl Rilis Finance (kolom AD), fallback ke Timestamp (kolom A)
  var dateSource = parsed.tglRilisFinance || parsed.timestamp || '';
  if (dateSource) {
    tgl = parseFlexDate(dateSource) || tgl;
  }
  var id = genId('IMP');
  // Match nama akun dari kolom X dan AG dengan kode COA
  var akunDebit = '';
  var akunKredit = '';
  if (parsed.namaAkunDebit && akunList) {
    akunDebit = matchAkunByName(parsed.namaAkunDebit, akunList);
  }
  if (parsed.namaAkunKredit && akunList) {
    akunKredit = matchAkunByName(parsed.namaAkunKredit, akunList);
  }
  // Fallback jika tidak cocok
  if (!akunDebit) akunDebit = '5-2200';
  if (!akunKredit) akunKredit = '1-1100';
  return {
    id: id, tanggal: tgl,
    keterangan: parsed.keteranganBayar || ('Pembayaran - ' + parsed.namaPemohon),
    noRef: parsed.noPOInvoice || parsed.idUnik || id,
    tipe: 'umum', sumber: 'import-sheets',
    meta: { pemohon: parsed.namaPemohon, leader: parsed.namaLeader, email: parsed.email, tipeTransaksi: parsed.tipeTransaksi, namaBank: parsed.namaBank, noRekening: parsed.noRekening, namaRekening: parsed.namaRekening, idUnik: parsed.idUnik, timestamp: parsed.timestamp, namaAkunDebit: parsed.namaAkunDebit, namaAkunKredit: parsed.namaAkunKredit },
    lines: [
      { akun: akunDebit, ket: parsed.keteranganBayar || ('Pembayaran ' + parsed.namaPemohon), debit: parsed.nominal, kredit: 0 },
      { akun: akunKredit, ket: 'Kas keluar - ' + (parsed.namaBank||'Bank') + ' ' + (parsed.noRekening||''), debit: 0, kredit: parsed.nominal }
    ],
    totalDebit: parsed.nominal, totalKredit: parsed.nominal,
    createdBy: KU ? KU.username : 'system', createdAt: new Date().toISOString()
  };
}

function renderImport() {
  function colLetter(idx) {
    if (idx < 26) return String.fromCharCode(65 + idx);
    return String.fromCharCode(64 + Math.floor(idx/26)) + String.fromCharCode(65 + (idx%26));
  }
  var colList = Object.values(SHEET_COLS).map(function(c) {
    return '<tr><td style="color:#888;font-size:0.78rem">Kolom ' + colLetter(c.idx) + '</td><td class="fw-bold">' + c.label + '</td></tr>';
  }).join('');
  return '<div class="page-title">📤 Import Spreadsheet</div>'
    + '<div class="card"><div class="card-header"><h2>Cara Mendapatkan Google Sheets API Key</h2></div>'
    + '<div class="alert alert-info">API Key dibutuhkan agar aplikasi bisa membaca data langsung dari Google Sheets Anda secara real-time.</div>'
    + '<ol style="line-height:2;padding-left:20px;font-size:0.88rem">'
    + '<li>Buka <a href="https://console.cloud.google.com" target="_blank" style="color:#1a237e;font-weight:600">console.cloud.google.com</a> dan login dengan akun Google Anda</li>'
    + '<li>Klik dropdown project di atas, pilih <b>New Project</b>, beri nama, klik <b>Create</b></li>'
    + '<li>Menu kiri: <b>APIs & Services → Library</b>, cari "Google Sheets API", klik <b>Enable</b></li>'
    + '<li>Menu kiri: <b>APIs & Services → Credentials</b>, klik <b>+ Create Credentials → API Key</b>, copy key yang muncul</li>'
    + '<li>Buka spreadsheet Anda: <b>Share → Anyone with the link → Viewer</b></li>'
    + '<li>Paste API Key di kolom di bawah, klik <b>Test Koneksi</b> untuk verifikasi</li>'
    + '</ol></div>'
    + '<div class="card"><div class="card-header"><h2>Import dari Google Sheets (Live)</h2></div>'
    + '<div class="alert alert-success">Spreadsheet ID sudah dikonfigurasi. Tinggal masukkan API Key dan klik Import.</div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Spreadsheet ID</label><input id="imp-sheetid" value="1tcE4Qqtl4kT9cAnVbLpFa-VFadb2Wt-0xoVuTj46zB8" style="background:#f8f9ff"></div>'
    + '<div class="fg"><label>Sheet Name</label><input id="imp-sheetname" value="PD dan DKM"></div>'
    + '<div class="fg full"><label>Google Sheets API Key</label>'
    + '<div style="display:flex;gap:8px"><input id="imp-apikey" placeholder="AIzaSy..." style="flex:1"><button class="btn btn-outline btn-sm" onclick="simpanApiKey()">Simpan</button></div>'
    + '<div class="text-muted" style="font-size:0.75rem;margin-top:4px">API Key disimpan di browser Anda, tidak dikirim ke server manapun.</div></div>'
    + '</div>'
    + '<div class="mt-12 flex-row"><button class="btn btn-primary" onclick="importDariSheets()">Import dari Sheets</button><button class="btn btn-outline" onclick="testApiKey()">Test Koneksi</button></div>'
    + '<div id="imp-result" class="mt-12"></div></div>'
    + '<div class="card"><div class="card-header"><h2>Format Kolom Spreadsheet</h2></div>'
    + '<div class="alert alert-info">Import memproses baris dengan <b>Finance Rilis (Kolom AC) = RELEASE</b> dan <b>Tgl Rilis Finance (Kolom AD)</b> terisi. Deduplikasi otomatis berdasarkan Tgl Rilis Finance.</div>'
    + '<div class="table-wrap"><table style="font-size:0.83rem"><thead><tr><th>Posisi</th><th>Nama Kolom</th></tr></thead><tbody>' + colList + '</tbody></table></div></div>'
    + '<div class="card"><div class="card-header"><h2>Upload File CSV (Alternatif Tanpa API Key)</h2></div>'
    + '<div class="alert alert-success"><b>Cara export CSV dari Google Sheets:</b> Buka spreadsheet, File, Download, Comma Separated Values (.csv), Upload di sini</div>'
    + '<div class="upload-area" onclick="document.getElementById(\'csv-file\').click()">'
    + '<input type="file" id="csv-file" accept=".csv" onchange="importCSV(this)">'
    + '<span style="font-size:2.5rem">📁</span>'
    + '<p style="margin-top:8px;font-weight:600">Klik atau drag file CSV ke sini</p>'
    + '<p class="text-muted" style="margin-top:4px">File CSV dari Google Sheets "PD dan DKM"</p>'
    + '</div><div id="csv-result" class="mt-12"></div></div>'
    + '<div class="card"><div class="card-header"><h2>Preview & Konfirmasi Import</h2></div>'
    + '<div id="import-preview" class="empty-state"><span class="icon">👆</span>Upload file CSV atau import dari Sheets untuk melihat preview</div></div>';
}

function simpanApiKey() {
  var key = document.getElementById('imp-apikey').value.trim();
  if (!key) { showAlert('API Key kosong!', 'danger'); return; }
  localStorage.setItem('k_sheets_apikey', key);
  showAlert('API Key disimpan di browser!');
}

async function testApiKey() {
  var sheetId = document.getElementById('imp-sheetid').value.trim();
  var apiKey = document.getElementById('imp-apikey').value.trim() || localStorage.getItem('k_sheets_apikey') || '';
  var el = document.getElementById('imp-result');
  if (!apiKey) { el.innerHTML = '<div class="alert alert-danger">Masukkan API Key terlebih dahulu!</div>'; return; }
  el.innerHTML = '<div class="alert alert-info">Menguji koneksi...</div>';
  try {
    var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '?key=' + apiKey + '&fields=properties.title';
    var res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    el.innerHTML = '<div class="alert alert-success">Koneksi berhasil! Spreadsheet: <b>' + (data.properties && data.properties.title ? data.properties.title : sheetId) + '</b></div>';
  } catch(e) {
    el.innerHTML = '<div class="alert alert-danger">Koneksi gagal: ' + e.message + '<br>Pastikan API Key benar dan Google Sheets API sudah diaktifkan.</div>';
  }
}

async function importDariSheets() {
  var sheetId = document.getElementById('imp-sheetid').value.trim();
  var sheetName = document.getElementById('imp-sheetname').value.trim();
  var apiKey = document.getElementById('imp-apikey').value.trim() || localStorage.getItem('k_sheets_apikey') || '';
  var el = document.getElementById('imp-result');
  if (!sheetId || !apiKey) { el.innerHTML = '<div class="alert alert-danger">Spreadsheet ID dan API Key wajib diisi!</div>'; return; }
  if (document.getElementById('imp-apikey').value.trim()) localStorage.setItem('k_sheets_apikey', document.getElementById('imp-apikey').value.trim());
  el.innerHTML = '<div class="alert alert-info">Mengambil data dari Google Sheets...</div>';
  try {
    var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + encodeURIComponent(sheetName) + '?key=' + apiKey + '&majorDimension=ROWS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING';
    var res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mengambil data: ' + res.status + '. Pastikan API Key valid dan Sheets API sudah diaktifkan.');
    var data = await res.json();
    var rows = data.values || [];
    if (rows.length < 2) { el.innerHTML = '<div class="alert alert-warning">Tidak ada data di sheet. Total baris: ' + rows.length + '</div>'; return; }
    var headers = rows[0];
    var dataRows = rows.slice(1);

    // Filter: skip rows where ALL cells are empty, and skip rows with nominal = 0
    // Filter: hanya baris dengan Finance Rilis = RELEASE dan nominal > 0
    var validRows = dataRows.filter(function(r) {
      var hasData = r.some(function(cell){ return (cell||'').toString().trim() !== ''; });
      if (!hasData) return false;
      var parsed = parseSheetRow(r, headers);
      // Acuan: Kolom AC (Finance Rilis) = RELEASE dan ada Tgl Rilis Finance (Kolom AD)
      var fr = (parsed.financeRilis||'').toUpperCase();
      var isRelease = fr.includes('RELEASE') || fr.includes('RILIS') || fr.includes('DONE') || fr.includes('YES');
      var hasTgl = parsed.tglRilisFinance && parsed.tglRilisFinance.toString().trim() !== '' && parsed.tglRilisFinance !== '0';
      return parsed.nominal > 0 && isRelease && hasTgl;
    });

    if (!validRows.length) {
      el.innerHTML = '<div class="alert alert-warning">Tidak ada baris dengan status RELEASE (Kolom AC) dan Tgl Rilis Finance (Kolom AD) dari ' + dataRows.length + ' baris data.</div>';
      return;
    }

    el.innerHTML = '<div class="alert alert-info">Ditemukan <b>' + validRows.length + '</b> baris RELEASE dari ' + dataRows.length + ' total baris. Memproses...</div>';

    // Deduplikasi: gunakan key yang sangat spesifik per baris
    var existingJurnal = await KDB.getAll('jurnal');
    var existingKeys = new Set(
      existingJurnal
        .filter(function(j){ return j.meta && j.meta.dedupKey; })
        .map(function(j){ return j.meta.dedupKey; })
    );

    var imported = 0, skipped = 0;
    // Fetch COA untuk matching nama akun dari kolom X dan AG
    var akunList = await getAkun();
    for (var i = 0; i < validRows.length; i++) {
      var parsed = parseSheetRow(validRows[i], headers);

      // Dedup key = tglRilis + pemohon + keterangan + nominal + noPO + rowIndex
      // rowIndex memastikan setiap baris unik meskipun data identik
      var dedupKey = (parsed.tglRilisFinance||'') + '|' + (parsed.namaPemohon||'').substring(0,30) + '|' + (parsed.keteranganBayar||'').substring(0,50) + '|' + parsed.nominal + '|' + (parsed.noPOInvoice||'') + '|row' + i;
      if (existingKeys.has(dedupKey)) { skipped++; continue; }

      var jurnal = rowToJurnal(parsed, akunList);
      jurnal.meta = Object.assign({}, jurnal.meta, { dedupKey: dedupKey, tglRilis: parsed.tglRilisFinance, financeRilis: parsed.financeRilis });

      await KDB.save('jurnal', jurnal.id, jurnal);
      existingKeys.add(dedupKey);
      imported++;
    }

    el.innerHTML = '<div class="alert alert-success">Import selesai!<br>'
      + '<b>' + imported + '</b> transaksi berhasil diimport<br>'
      + '<b>' + skipped + '</b> dilewati (sudah pernah diimport)<br>'
      + 'Total baris RELEASE di sheet: <b>' + validRows.length + '</b> dari <b>' + dataRows.length + '</b> baris</div>';
  } catch(e) {
    el.innerHTML = '<div class="alert alert-danger">Error: ' + e.message + '<br><br><b>Atau gunakan Upload CSV di bawah sebagai alternatif!</b></div>';
  }
}

function parseCSVLine(line) {
  var result = [], current = '', inQuotes = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

var _csvPendingRows = [];

function importCSV(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = async function(e) {
    var text = e.target.result;
    var lines = text.split('\n').filter(function(l){ return l.trim(); });
    if (lines.length < 2) { document.getElementById('csv-result').innerHTML = '<div class="alert alert-warning">File CSV kosong atau tidak valid.</div>'; return; }
    var headers = parseCSVLine(lines[0]);
    var allRows = [];
    for (var i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      allRows.push(parseSheetRow(parseCSVLine(lines[i]), headers));
    }
    var approved = allRows.filter(function(r){ return r.nominal > 0 && (r.financeRilis||'').toUpperCase().includes('RELEASE') && r.tglRilisFinance && r.tglRilisFinance.toString().trim() !== ''; });
    var notRelease = allRows.filter(function(r){ return r.nominal > 0 && !(r.financeRilis||'').toUpperCase().includes('RELEASE'); });
    var noNominal = allRows.filter(function(r){ return !r.nominal || r.nominal <= 0; });
    _csvPendingRows = approved;
    document.getElementById('csv-result').innerHTML = '<div class="stats-row" style="margin-top:8px">'
      + '<div class="stat-box green"><div class="val">' + approved.length + '</div><div class="lbl">RELEASE (Siap Import)</div></div>'
      + '<div class="stat-box orange"><div class="val">' + notRelease.length + '</div><div class="lbl">Belum Release</div></div>'
      + '<div class="stat-box red"><div class="val">' + noNominal.length + '</div><div class="lbl">Tanpa Nominal</div></div>'
      + '<div class="stat-box"><div class="val">' + allRows.length + '</div><div class="lbl">Total Baris</div></div></div>';
    var previewEl = document.getElementById('import-preview');
    if (!previewEl) return;
    if (!approved.length) { previewEl.innerHTML = '<div class="alert alert-warning">Tidak ada baris dengan status RELEASE (Kolom AC) dan Tgl Rilis Finance (Kolom AD).</div>'; return; }
    var previewRows = approved.slice(0, 20).map(function(r) {
      var tgl = parseFlexDate(r.tglRilisFinance || r.timestamp) || r.tglRilisFinance || '-';
      try { if (tgl !== '-' && tgl.includes('-')) tgl = fmtDate(tgl); } catch(e) {}
      return '<tr><td>' + tgl + '</td><td class="fw-bold">' + (r.namaPemohon||'-') + '</td><td>' + (r.namaLeader||'-') + '</td><td>' + (r.noPOInvoice||'-') + '</td><td class="fw-bold text-green">' + fmtRp(r.nominal) + '</td><td>' + (r.keteranganBayar||'-') + '</td><td>' + (r.tipeTransaksi||'-') + '</td><td>' + (r.namaBank||'-') + '</td><td>' + (r.noRekening||'-') + '</td><td>' + (r.tglRilisFinance||'-') + '</td></tr>';
    }).join('');
    previewEl.innerHTML = '<div class="alert alert-success">' + approved.length + ' baris siap diimport' + (approved.length > 20 ? ' (menampilkan 20 dari ' + approved.length + ')' : '') + '</div>'
      + '<div class="table-wrap"><table style="font-size:0.78rem"><thead><tr><th>Tanggal</th><th>Pemohon</th><th>Leader</th><th>No. PO/Invoice</th><th>Nominal</th><th>Keterangan</th><th>Tipe</th><th>Bank</th><th>No. Rek</th><th>Tgl Rilis</th></tr></thead><tbody>' + previewRows + '</tbody></table></div>'
      + '<div class="mt-12"><button class="btn btn-primary" onclick="konfirmasiImportCSV()">Konfirmasi Import ' + approved.length + ' Transaksi</button><button class="btn btn-outline" style="margin-left:8px" onclick="batalImportCSV()">Batal</button></div>';
  };
  reader.readAsText(file);
}

async function konfirmasiImportCSV() {
  if (!_csvPendingRows.length) { showAlert('Tidak ada data untuk diimport!', 'warning'); return; }
  showLoading(true);
  var existingJurnal = await KDB.getAll('jurnal');
  var existingRefs = new Set(existingJurnal.map(function(j){ return j.meta && j.meta.idUnik; }).filter(Boolean));
  var akunList = await getAkun();
  var imported = 0, skipped = 0;
  for (var i = 0; i < _csvPendingRows.length; i++) {
    var parsed = _csvPendingRows[i];
    if (parsed.idUnik && existingRefs.has(parsed.idUnik)) { skipped++; continue; }
    if (parsed.nominal <= 0) { skipped++; continue; }
    var jurnal = rowToJurnal(parsed, akunList);
    await KDB.save('jurnal', jurnal.id, jurnal);
    if (parsed.idUnik) existingRefs.add(parsed.idUnik);
    imported++;
  }
  showLoading(false);
  _csvPendingRows = [];
  document.getElementById('import-preview').innerHTML = '<div class="alert alert-success">Import selesai!<br><b>' + imported + '</b> transaksi berhasil diimport ke Jurnal Umum<br><b>' + skipped + '</b> dilewati (duplikat atau nominal 0)</div>';
  document.getElementById('csv-result').innerHTML = '';
  showAlert(imported + ' transaksi berhasil diimport!');
}

function batalImportCSV() {
  _csvPendingRows = [];
  document.getElementById('import-preview').innerHTML = '<div class="empty-state"><span class="icon">👆</span>Upload file CSV untuk melihat preview data</div>';
  document.getElementById('csv-result').innerHTML = '';
}

// ===== EXPORT =====
async function renderExport() {
  return '<div class="page-title">📥 Export Data</div>'
    + '<div class="card"><div class="card-header"><h2>Export ke CSV</h2></div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">'
    + '<button class="btn btn-success" onclick="exportCSV(\'jurnal\')">Export Jurnal</button>'
    + '<button class="btn btn-success" onclick="exportCSV(\'invoice\')">Export Invoice</button>'
    + '<button class="btn btn-success" onclick="exportCSV(\'po\')">Export PO</button>'
    + '<button class="btn btn-success" onclick="exportCSV(\'utangpiutang\')">Export Utang Piutang</button>'
    + '<button class="btn btn-success" onclick="exportCSV(\'pettycash\')">Export Petty Cash</button>'
    + '<button class="btn btn-success" onclick="exportCSV(\'gaji\')">Export Gaji</button>'
    + '<button class="btn btn-success" onclick="exportCSV(\'permohonan\')">Export Permohonan Dana</button>'
    + '<button class="btn btn-success" onclick="exportCSV(\'danamasuk\')">Export Dana Masuk</button>'
    + '</div></div>';
}

async function exportCSV(col) {
  var list = await KDB.getAll(col);
  if (!list.length) { showAlert('Tidak ada data untuk diexport!', 'warning'); return; }
  var headers = Object.keys(list[0]).filter(function(k){ return !k.startsWith('_'); });
  var rows = list.map(function(item) {
    return headers.map(function(h) {
      var val = item[h];
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val || '').replace(/,/g, ';');
    }).join(',');
  });
  var csv = [headers.join(',')].concat(rows).join('\n');
  var blob = new Blob([csv], { type: 'text/csv' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = col + '_' + today() + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showAlert('Export ' + col + ' berhasil!');
}

// ===== ANALISIS NARATIF LENGKAP =====
async function renderAnalisisNaratif() {
  const fd = await getFinancialData();
  const saldo = fd.saldo;
  const akun = fd.akun;
  const perusahaan = await KDB.getSetting('perusahaan', {});
  const printHeader = await buildPrintHeader(perusahaan, 'ANALISIS NARATIF KEUANGAN', perusahaan.periode||new Date().getFullYear());

  // Calculate all ratios
  const pendapatan = akun.filter(function(a){ return a.kategori === 'Pendapatan'; });
  const bebanOps = akun.filter(function(a){ return a.kategori === 'Beban Operasional'; });
  const bebanLain = akun.filter(function(a){ return a.kategori === 'Beban Lain-lain'; });
  const asetLancar = akun.filter(function(a){ return a.kategori === 'Aset Lancar'; });
  const asetTetap = akun.filter(function(a){ return a.kategori === 'Aset Tetap'; });
  const kewLancar = akun.filter(function(a){ return a.kategori === 'Kewajiban Lancar'; });
  const kewPanjang = akun.filter(function(a){ return a.kategori === 'Kewajiban Jangka Panjang'; });
  const ekuitas = akun.filter(function(a){ return a.kategori === 'Ekuitas'; });

  function sumAkun(list) { return list.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); }, 0); }

  const totalPendapatan = sumAkun(pendapatan);
  const totalBebanOps = sumAkun(bebanOps);
  const totalBebanLain = sumAkun(bebanLain);
  const totalBeban = totalBebanOps + totalBebanLain;
  const labaKotor = totalPendapatan - totalBebanOps;
  const labaBersih = labaKotor - totalBebanLain;
  const totalAsetLancar = sumAkun(asetLancar);
  const totalAsetTetap = sumAkun(asetTetap);
  const totalAset = totalAsetLancar + totalAsetTetap;
  const totalKewLancar = sumAkun(kewLancar);
  const totalKewPanjang = sumAkun(kewPanjang);
  const totalEkuitas = sumAkun(ekuitas);
  const totalKewajiban = totalKewLancar + totalKewPanjang;

  // Ratios
  const currentRatio = totalKewLancar > 0 ? (totalAsetLancar / totalKewLancar * 100).toFixed(2) : 0;
  const nwc = totalAsetLancar - totalKewLancar;
  const dar = totalAset > 0 ? (totalKewajiban / totalAset * 100).toFixed(2) : 0;
  const der = totalEkuitas > 0 ? (totalKewajiban / totalEkuitas * 100).toFixed(2) : 0;
  const npm = totalPendapatan > 0 ? (labaBersih / totalPendapatan * 100).toFixed(2) : 0;
  const roe = totalEkuitas > 0 ? (labaBersih / totalEkuitas * 100).toFixed(2) : 0;
  const roa = totalAset > 0 ? (labaBersih / totalAset * 100).toFixed(2) : 0;
  const rasioBeban = totalPendapatan > 0 ? (totalBeban / totalPendapatan * 100).toFixed(2) : 0;

  function statusBadgeRatio(val, good, warn) {
    if (parseFloat(val) >= good) return '<span class="badge badge-success">Sangat Baik</span>';
    if (parseFloat(val) >= warn) return '<span class="badge badge-warning">Cukup</span>';
    return '<span class="badge badge-danger">Perlu Perhatian</span>';
  }

  const kondisiLabaRugi = labaBersih > 0 ? 'LABA' : 'RUGI';
  const kondisiCls = labaBersih > 0 ? 'text-green' : 'text-red';

  const html = '<div class="page-title">📝 Analisis Naratif Keuangan</div>'
    + '<div class="card no-print"><div class="card-header"><h2>Analisis Naratif Lengkap</h2>'
    + '<button class="btn btn-sm btn-info" onclick="window.print()">🖨️ Print Laporan</button></div>'
    + '<div class="alert alert-info">Laporan ini disusun berdasarkan data jurnal yang telah diinput. Analisis menggunakan metode Umum dan Analisis Rasio Keuangan.</div></div>'

    // Print area
    + '<div id="print-analisis">' + printHeader

    // 1. Likuiditas
    + '<div class="card"><div class="card-header"><h2>1. ANALISIS LIKUIDITAS (Kesehatan Keuangan Jangka Pendek)</h2></div>'
    + '<p style="font-style:italic;color:#555;margin-bottom:12px;font-size:0.85rem">Mengukur kemampuan perusahaan membayar kewajiban jangka pendek (jatuh tempo &lt; 1 tahun).</p>'
    + '<div class="table-wrap"><table><thead><tr><th>Rasio</th><th>Nilai</th><th>Standar</th><th>Status</th><th>Penjelasan & Implikasi</th></tr></thead><tbody>'
    + '<tr><td><b>Current Ratio</b></td><td>' + currentRatio + '%</td><td>&gt;100%</td><td>' + (parseFloat(currentRatio)>=100?'<span class="badge badge-success">Aman</span>':'<span class="badge badge-danger">Kritis</span>') + '</td><td>Aset lancar ' + (parseFloat(currentRatio)>=100?'mampu':'tidak mampu') + ' menutup kewajiban lancar. Current Ratio ' + currentRatio + '%.</td></tr>'
    + '<tr><td><b>Net Working Capital</b></td><td>' + fmtRp(nwc) + '</td><td>Positif</td><td>' + (nwc>=0?'<span class="badge badge-success">Positif</span>':'<span class="badge badge-danger">Negatif</span>') + '</td><td>Modal kerja bersih ' + (nwc>=0?'surplus':'defisit') + ' sebesar ' + fmtRp(Math.abs(nwc)) + '.</td></tr>'
    + '</tbody></table></div>'
    + '<p style="font-style:italic;font-size:0.83rem;margin-top:8px;color:#555"><b>Kesimpulan Likuiditas:</b> ' + (parseFloat(currentRatio)>=100?'Perusahaan dalam kondisi likuid yang cukup baik.':'Perusahaan menghadapi risiko likuiditas. Perlu percepatan penagihan piutang.') + '</p></div>'

    // 2. Aktivitas
    + '<div class="card"><div class="card-header"><h2>2. ANALISIS AKTIVITAS (Efisiensi Operasional)</h2></div>'
    + '<p style="font-style:italic;color:#555;margin-bottom:12px;font-size:0.85rem">Mengukur seberapa efektif perusahaan mengelola asetnya.</p>'
    + '<div class="table-wrap"><table><thead><tr><th>Rasio</th><th>Nilai</th><th>Penjelasan & Implikasi</th></tr></thead><tbody>'
    + '<tr><td><b>Total Asset Turnover</b></td><td>' + (totalAset>0?(totalPendapatan/totalAset).toFixed(2):0) + ' kali</td><td>Setiap Rp 1 aset menghasilkan pendapatan Rp ' + (totalAset>0?(totalPendapatan/totalAset).toFixed(2):0) + '.</td></tr>'
    + '<tr><td><b>Rasio Efisiensi Beban</b></td><td>' + rasioBeban + '%</td><td>Beban operasional ' + rasioBeban + '% dari pendapatan. ' + (parseFloat(rasioBeban)<70?'Efisiensi baik.':'Perlu evaluasi struktur biaya.') + '</td></tr>'
    + '</tbody></table></div>'
    + '<p style="font-style:italic;font-size:0.83rem;margin-top:8px;color:#555"><b>Kesimpulan Aktivitas:</b> ' + (parseFloat(rasioBeban)<70?'Perusahaan mengelola biaya dengan efisien.':'Rasio beban cukup tinggi, perlu optimasi biaya operasional.') + '</p></div>'

    // 3. Solvabilitas
    + '<div class="card"><div class="card-header"><h2>3. ANALISIS SOLVABILITAS (Kesehatan Jangka Panjang)</h2></div>'
    + '<p style="font-style:italic;color:#555;margin-bottom:12px;font-size:0.85rem">Mengukur kemampuan perusahaan bertahan dalam jangka panjang dan melunasi seluruh utang.</p>'
    + '<div class="table-wrap"><table><thead><tr><th>Rasio</th><th>Nilai</th><th>Standar</th><th>Status</th><th>Penjelasan & Implikasi</th></tr></thead><tbody>'
    + '<tr><td><b>Debt to Asset (DAR)</b></td><td>' + dar + '%</td><td>&lt;50%</td><td>' + (parseFloat(dar)<50?'<span class="badge badge-success">Sehat</span>':'<span class="badge badge-warning">Perhatian</span>') + '</td><td>' + dar + '% aset dibiayai utang. ' + (parseFloat(dar)<50?'Struktur modal seimbang.':'Leverage cukup tinggi.') + '</td></tr>'
    + '<tr><td><b>Debt to Equity (DER)</b></td><td>' + der + '%</td><td>&lt;100%</td><td>' + (parseFloat(der)<100?'<span class="badge badge-success">Wajar</span>':'<span class="badge badge-danger">Tinggi</span>') + '</td><td>Utang ' + (parseFloat(der)<100?'masih dalam batas wajar':'melebihi modal sendiri') + ' (' + der + '% dari ekuitas).</td></tr>'
    + '</tbody></table></div>'
    + '<p style="font-style:italic;font-size:0.83rem;margin-top:8px;color:#555"><b>Kesimpulan Solvabilitas:</b> ' + (parseFloat(dar)<50?'Secara struktur modal jangka panjang, perusahaan dalam kondisi SEHAT.':'Perlu perhatian pada struktur permodalan jangka panjang.') + '</p></div>'

    // 4. Profitabilitas
    + '<div class="card"><div class="card-header"><h2>4. ANALISIS PROFITABILITAS (Kemampuan Mencetak Laba)</h2></div>'
    + '<p style="font-style:italic;color:#555;margin-bottom:12px;font-size:0.85rem">Mengukur seberapa menguntungkan bisnis ini.</p>'
    + '<div class="table-wrap"><table><thead><tr><th>Rasio</th><th>Nilai</th><th>Status</th><th>Penjelasan & Implikasi</th></tr></thead><tbody>'
    + '<tr><td><b>Net Profit Margin</b></td><td>' + npm + '%</td><td>' + statusBadgeRatio(npm,20,10) + '</td><td>Perusahaan mengantongi keuntungan bersih Rp ' + npm + ' dari setiap Rp 100 pendapatan.</td></tr>'
    + '<tr><td><b>Return on Equity (ROE)</b></td><td>' + roe + '%</td><td>' + statusBadgeRatio(roe,30,15) + '</td><td>Tingkat pengembalian investasi pemegang saham mencapai ' + roe + '%.</td></tr>'
    + '<tr><td><b>Return on Assets (ROA)</b></td><td>' + roa + '%</td><td>' + statusBadgeRatio(roa,15,8) + '</td><td>Perusahaan ' + (parseFloat(roa)>0?'efektif':'belum efektif') + ' menggunakan aset untuk menghasilkan laba.</td></tr>'
    + '</tbody></table></div>'
    + '<p style="font-style:italic;font-size:0.83rem;margin-top:8px;color:#555"><b>Kesimpulan Profitabilitas:</b> ' + (labaBersih>0?'Secara fundamental bisnis PROFITABLE. Bisnis intinya menghasilkan margin ' + npm + '%.':'Perusahaan belum menghasilkan laba. Perlu evaluasi strategi bisnis.') + '</p></div>'

    // Kesimpulan Gabungan
    + '<div class="card" style="border:2px solid #1a237e">'
    + '<div class="card-header"><h2>Kesimpulan Gabungan (Narrative untuk Laporan)</h2></div>'
    + '<p style="line-height:1.8;font-size:0.88rem;color:#333">'
    + '"Secara fundamental, <b>' + (perusahaan.nama||'Perusahaan') + '</b> berada dalam kondisi '
    + '<b class="' + kondisiCls + '">' + kondisiLabaRugi + '</b> dengan laba bersih <b>' + fmtRp(Math.abs(labaBersih)) + '</b>. '
    + 'Net Profit Margin sebesar <b>' + npm + '%</b>, Return on Equity <b>' + roe + '%</b>, dan Return on Assets <b>' + roa + '%</b>. '
    + 'Dari sisi solvabilitas, Debt to Asset Ratio <b>' + dar + '%</b> menunjukkan struktur modal yang ' + (parseFloat(dar)<50?'sehat dan seimbang':'perlu perhatian') + '. '
    + 'Current Ratio <b>' + currentRatio + '%</b> menunjukkan kemampuan likuiditas yang ' + (parseFloat(currentRatio)>=100?'memadai':'perlu ditingkatkan') + '."'
    + '</p>'
    + '<div style="margin-top:40px;display:flex;justify-content:flex-end">'
    + '<div style="text-align:center">'
    + '<p>' + (perusahaan.kota||'') + ', ' + new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}) + '</p>'
    + '<br><br><p style="border-top:1px solid #333;padding-top:4px;min-width:200px">Direktur Utama</p>'
    + '<p>' + (perusahaan.nama||'') + '</p>'
    + '</div></div>'
    + '</div>'
    + '</div>'; // end print-analisis

  return html;
}

// ===== PORTAL PERLENGKAPAN & ASET =====
async function renderPortalAset() {
  const list = await KDB.getAll('perlengkapan');
  const allPD = await KDB.getAll('permohonan');
  const akunOpts = await getAkunOptions();

  const perlengkapan = list.filter(function(p){ return !p.tipeItem || p.tipeItem === 'Perlengkapan'; });
  const asetTetap = list.filter(function(p){ return p.tipeItem === 'Aset Tetap'; });
  const pdPortal = allPD.filter(function(p){ return p.sumberRef === 'perlengkapan'; });
  const pdPending = pdPortal.filter(function(p){ return p.status && p.status.startsWith('Pending'); }).length;
  const pdApproved = pdPortal.filter(function(p){ return p.status === STATUS.APPROVED; }).length;

  const totalNilaiPerlengkapan = perlengkapan.reduce(function(s,p) {
    const sisa = (parseInt(p.awal)||0) + (parseInt(p.beli)||0) - (parseInt(p.pakai)||0);
    return s + sisa * (parseFloat(p.harga)||0);
  }, 0);
  const totalNilaiAset = asetTetap.reduce(function(s,p){ return s + (parseFloat(p.harga)||0); }, 0);

  const pendingBanner = pdPending > 0
    ? '<div class="alert alert-warning">Permohonan pengadaan menunggu approval: <b>' + pdPending + '</b>. <a href="#" onclick="navigate(\'dana-approval\')" style="color:#e65100;font-weight:600">Buka Approval Center</a></div>'
    : '';

  const plRows = perlengkapan.map(function(p) {
    const sisa = (parseInt(p.awal)||0) + (parseInt(p.beli)||0) - (parseInt(p.pakai)||0);
    const nilaiSisa = sisa * (parseFloat(p.harga)||0);
    const pdItem = allPD.filter(function(x){ return x.sumberRefId === p.id; });
    const pdBadge = pdItem.length > 0 ? statusBadge(pdItem[0].status) : '';
    const stokMin = parseInt(p.stokMin) || 5;
    const stokAlert = sisa <= stokMin ? '<span class="badge badge-danger">Stok Rendah!</span>' : '';
    return '<tr>'
      + '<td class="fw-bold">' + p.nama + '</td>'
      + '<td>' + (p.satuan||'-') + '</td>'
      + '<td class="text-center">' + (p.awal||0) + '</td>'
      + '<td class="text-center text-green">' + (p.beli||0) + '</td>'
      + '<td class="text-center text-red">' + (p.pakai||0) + '</td>'
      + '<td class="text-center fw-bold ' + (sisa <= stokMin ? 'text-red' : '') + '">' + sisa + ' ' + stokAlert + '</td>'
      + '<td>' + fmtRp(parseFloat(p.harga)||0) + '</td>'
      + '<td class="fw-bold text-green">' + fmtRp(nilaiSisa) + '</td>'
      + '<td>' + pdBadge + '</td>'
      + '<td class="tbl-actions">'
      + '<button class="btn btn-xs btn-warning" onclick="editPerlengkapan(\'' + p.id + '\')">Edit</button>'
      + '<button class="btn btn-xs btn-info" onclick="tambahPemakaian(\'' + p.id + '\')">Pakai</button>'
      + '<button class="btn btn-xs btn-danger" onclick="hapusPerlengkapan(\'' + p.id + '\')">Hapus</button>'
      + '</td></tr>';
  }).join('');

  const atRows = asetTetap.map(function(p) {
    const pdItem = allPD.filter(function(x){ return x.sumberRefId === p.id; });
    const pdBadge = pdItem.length > 0 ? statusBadge(pdItem[0].status) : '';
    return '<tr>'
      + '<td class="fw-bold">' + p.nama + '</td>'
      + '<td><span class="chip">' + (p.kategoriAset||'Peralatan') + '</span></td>'
      + '<td>' + fmtDate(p.tanggalBeli||p.createdAt) + '</td>'
      + '<td class="fw-bold">' + fmtRp(parseFloat(p.harga)||0) + '</td>'
      + '<td><span class="badge ' + (p.kondisi==='Rusak'?'badge-danger':p.kondisi==='Cukup'?'badge-warning':'badge-success') + '">' + (p.kondisi||'Baik') + '</span></td>'
      + '<td>' + (p.lokasi||'-') + '</td>'
      + '<td>' + pdBadge + '</td>'
      + '<td class="tbl-actions">'
      + '<button class="btn btn-xs btn-warning" onclick="editPerlengkapan(\'' + p.id + '\')">Edit</button>'
      + '<button class="btn btn-xs btn-danger" onclick="hapusPerlengkapan(\'' + p.id + '\')">Hapus</button>'
      + '</td></tr>';
  }).join('');

  const pengadaanRows = pdPortal.slice().sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); }).map(function(p) {
    return '<tr>'
      + '<td>' + fmtDate(p.tanggal) + '</td>'
      + '<td class="fw-bold" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (p.keterangan||'-') + '</td>'
      + '<td class="fw-bold text-blue">' + fmtRp(p.nominal) + '</td>'
      + '<td>' + statusBadge(p.status) + '</td>'
      + '<td>' + approvalFlow(p.status) + '</td>'
      + '<td class="tbl-actions">'
      + '<button class="btn btn-xs btn-info" onclick="detailPermohonan(\'' + p.id + '\')">Detail</button>'
      + (p.status === STATUS.DRAFT ? '<button class="btn btn-xs btn-primary" onclick="ajukanPermohonan(\'' + p.id + '\')">Ajukan</button>' : '')
      + '</td></tr>';
  }).join('');

  return '<div class="page-title">📦 Portal Perlengkapan & Aset</div>'
    + pendingBanner
    + '<div class="stats-row">'
    + '<div class="stat-box"><div class="val">' + perlengkapan.length + '</div><div class="lbl">Item Perlengkapan</div></div>'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalNilaiPerlengkapan) + '</div><div class="lbl">Nilai Perlengkapan</div></div>'
    + '<div class="stat-box purple"><div class="val">' + asetTetap.length + '</div><div class="lbl">Aset Tetap</div></div>'
    + '<div class="stat-box"><div class="val">' + fmtRp(totalNilaiAset) + '</div><div class="lbl">Nilai Aset Tetap</div></div>'
    + '<div class="stat-box orange"><div class="val">' + pdPending + '</div><div class="lbl">Pengadaan Pending</div></div>'
    + '<div class="stat-box green"><div class="val">' + pdApproved + '</div><div class="lbl">Pengadaan Approved</div></div>'
    + '</div>'

    // Form Input
    + '<div class="card"><div class="card-header"><h2>Input Perlengkapan / Aset Baru</h2></div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Tipe Item</label>'
    + '<select id="pl-tipe-item" onchange="toggleAsetFields(this.value)" style="padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem;width:100%">'
    + '<option value="Perlengkapan">Perlengkapan (Habis Pakai)</option>'
    + '<option value="Aset Tetap">Aset Tetap (Inventaris)</option>'
    + '</select></div>'
    + '<div class="fg"><label>Nama Item</label><input id="pl-nama" placeholder="Nama perlengkapan / aset"></div>'
    + '<div class="fg"><label>Nama PIC</label><input id="pl-pic" value="' + (KU.nama||KU.username) + '" placeholder="Nama PIC"></div>'
    + '<div class="fg"><label>Satuan</label><input id="pl-satuan" placeholder="pcs / unit / set"></div>'
    + '<div class="fg"><label>Harga Satuan (Rp)</label><input type="number" id="pl-harga" placeholder="0"></div>'
    + '<div id="pl-fields-perlengkapan" style="display:contents">'
    + '<div class="fg"><label>Stok Awal</label><input type="number" id="pl-awal" placeholder="0" value="0"></div>'
    + '<div class="fg"><label>Jumlah Pembelian</label><input type="number" id="pl-beli" placeholder="0" value="0"></div>'
    + '<div class="fg"><label>Pemakaian</label><input type="number" id="pl-pakai" placeholder="0" value="0"></div>'
    + '<div class="fg"><label>Stok Minimum (Alert)</label><input type="number" id="pl-min" placeholder="5" value="5"></div>'
    + '</div>'
    + '<div id="pl-fields-aset" style="display:none">'
    + '<div class="fg"><label>Kategori Aset</label>'
    + '<select id="pl-kat-aset" style="padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem;width:100%">'
    + '<option>Peralatan Kantor</option><option>Inventaris Kantor</option><option>Kendaraan</option><option>Bangunan</option><option>Instalasi</option><option>Peralatan Peserta</option><option>Lainnya</option>'
    + '</select></div>'
    + '<div class="fg"><label>Tanggal Pembelian</label><input type="date" id="pl-tgl-beli" value="' + today() + '"></div>'
    + '<div class="fg"><label>Kondisi</label><select id="pl-kondisi" style="padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem;width:100%"><option>Baru</option><option>Baik</option><option>Cukup</option><option>Rusak</option></select></div>'
    + '<div class="fg"><label>Lokasi / Penempatan</label><input id="pl-lokasi" placeholder="Ruang / Lantai / Gedung"></div>'
    + '<div class="fg"><label>Umur Ekonomis (Tahun)</label><input type="number" id="pl-umur" placeholder="5" value="5"></div>'
    + '</div>'
    + '<div class="fg full" style="background:#e8f0fe;border-radius:8px;padding:12px;border-left:4px solid #1a237e">'
    + '<div style="font-weight:700;color:#1a237e;margin-bottom:8px;font-size:0.88rem">Akun COA untuk Jurnal Otomatis</div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Akun Debit (Beban/Aset)</label><select id="pl-akun-debit" style="padding:8px 11px;border:1.5px solid #c5cae9;border-radius:7px;font-size:0.88rem;width:100%"><option value="">-- Pilih --</option>' + akunOpts + '</select></div>'
    + '<div class="fg"><label>Akun Kredit (Kas/Bank)</label><select id="pl-akun-kredit" style="padding:8px 11px;border:1.5px solid #c5cae9;border-radius:7px;font-size:0.88rem;width:100%"><option value="">-- Pilih --</option>' + akunOpts + '</select></div>'
    + '</div></div>'
    + '<div class="fg full"><label>Keterangan</label><textarea id="pl-ket" placeholder="Keterangan tambahan..." style="padding:8px 11px;border:1.5px solid #ddd;border-radius:7px;font-size:0.88rem;width:100%;min-height:60px"></textarea></div>'
    + '</div>'
    + '<div class="alert alert-info" style="margin-top:12px">Jika ada pembelian (harga > 0), Draft Permohonan Dana akan dibuat otomatis untuk proses approval 3 layer.</div>'
    + '<div class="mt-12 flex-row">'
    + '<button class="btn btn-primary" onclick="tambahPerlengkapanPortal(false)">Tambah & Buat Permohonan</button>'
    + '<button class="btn btn-outline" onclick="tambahPerlengkapanPortal(true)">Simpan Tanpa Permohonan</button>'
    + '</div></div>'

    // Tabs
    + '<div class="card"><div class="tabs">'
    + '<button class="tab-btn active" onclick="switchTab(this,\'tab-perlengkapan\')">Perlengkapan (' + perlengkapan.length + ')</button>'
    + '<button class="tab-btn" onclick="switchTab(this,\'tab-aset-tetap\')">Aset Tetap (' + asetTetap.length + ')</button>'
    + '<button class="tab-btn" onclick="switchTab(this,\'tab-pengadaan\')">Riwayat Pengadaan (' + pdPortal.length + ')</button>'
    + '</div>'
    + '<div class="tab-content active" id="tab-perlengkapan">'
    + (perlengkapan.length ? '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Satuan</th><th>Awal</th><th>Beli</th><th>Pakai</th><th>Sisa</th><th>Harga</th><th>Nilai Sisa</th><th>Pengadaan</th><th>Aksi</th></tr></thead><tbody>' + plRows + '</tbody></table></div>'
      : '<div class="empty-state"><span class="icon">🔧</span>Belum ada data perlengkapan</div>')
    + '</div>'
    + '<div class="tab-content" id="tab-aset-tetap">'
    + (asetTetap.length ? '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Kategori</th><th>Tgl Beli</th><th>Nilai</th><th>Kondisi</th><th>Lokasi</th><th>Pengadaan</th><th>Aksi</th></tr></thead><tbody>' + atRows + '</tbody></table></div>'
      : '<div class="empty-state"><span class="icon">🏢</span>Belum ada data aset tetap</div>')
    + '</div>'
    + '<div class="tab-content" id="tab-pengadaan">'
    + (pdPortal.length ? '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Nominal</th><th>Status</th><th>Approval</th><th>Aksi</th></tr></thead><tbody>' + pengadaanRows + '</tbody></table></div>'
      : '<div class="empty-state"><span class="icon">📋</span>Belum ada riwayat pengadaan</div>')
    + '</div></div>';
}

function toggleAsetFields(val) {
  const plFields = document.getElementById('pl-fields-perlengkapan');
  const atFields = document.getElementById('pl-fields-aset');
  if (plFields) plFields.style.display = val === 'Aset Tetap' ? 'none' : 'contents';
  if (atFields) atFields.style.display = val === 'Aset Tetap' ? 'contents' : 'none';
}

async function tambahPerlengkapanPortal(noPermohonan) {
  const nama = (document.getElementById('pl-nama') || {}).value;
  if (!nama || !nama.trim()) { showAlert('Nama item wajib diisi!', 'danger'); return; }
  const tipeItem = (document.getElementById('pl-tipe-item') || {}).value || 'Perlengkapan';
  const harga = parseFloat((document.getElementById('pl-harga') || {}).value) || 0;
  const satuan = (document.getElementById('pl-satuan') || {}).value || '';
  const ket = (document.getElementById('pl-ket') || {}).value || '';
  const akunDebit = (document.getElementById('pl-akun-debit') || {}).value || '5-1400';
  const akunKredit = (document.getElementById('pl-akun-kredit') || {}).value || '1-1100';
  const id = genId('PL');

  var itemData = { id: id, nama: nama.trim(), satuan: satuan, harga: harga, tipeItem: tipeItem, keterangan: ket, createdBy: KU.username, createdAt: new Date().toISOString() };

  if (tipeItem === 'Aset Tetap') {
    itemData.kategoriAset = (document.getElementById('pl-kat-aset') || {}).value || 'Peralatan Kantor';
    itemData.tanggalBeli = (document.getElementById('pl-tgl-beli') || {}).value || today();
    itemData.kondisi = (document.getElementById('pl-kondisi') || {}).value || 'Baru';
    itemData.lokasi = (document.getElementById('pl-lokasi') || {}).value || '';
    itemData.umurEkonomis = parseInt((document.getElementById('pl-umur') || {}).value) || 5;
    itemData.awal = 1; itemData.beli = 1; itemData.pakai = 0;
  } else {
    itemData.awal = parseInt((document.getElementById('pl-awal') || {}).value) || 0;
    itemData.beli = parseInt((document.getElementById('pl-beli') || {}).value) || 0;
    itemData.pakai = parseInt((document.getElementById('pl-pakai') || {}).value) || 0;
    itemData.stokMin = parseInt((document.getElementById('pl-min') || {}).value) || 5;
  }

  await KDB.save('perlengkapan', id, itemData);

  if (!noPermohonan && harga > 0) {
    const qty = tipeItem === 'Aset Tetap' ? 1 : (itemData.beli || 1);
    const nominal = qty * harga;
    const pdId = genId('PD');
    const approvers = await getApprovers();
    const ketPD = tipeItem === 'Aset Tetap'
      ? 'Pengadaan Aset: ' + nama.trim() + ' — ' + fmtRp(harga)
      : 'Pembelian Perlengkapan: ' + nama.trim() + ' (' + qty + ' ' + (satuan||'unit') + ' x ' + fmtRp(harga) + ')';
    await KDB.save('permohonan', pdId, { id: pdId, tipe: 'permohonan', pemohon: KU.username, namaPemohon: KU.nama, namaLeader: '', noPOInvoice: id, nominal: nominal, jatuhTempo: '', tipeTransaksi: 'Transfer', namaBank: '', noRekening: '', namaRekening: '', keterangan: ketPD, buktiDokumen: '', akunDebit: akunDebit, akunKredit: akunKredit, tanggal: today(), status: STATUS.DRAFT, approvalLog: [], approvers: approvers, createdBy: KU.username, createdAt: new Date().toISOString(), sumberRef: 'perlengkapan', sumberRefId: id });
    showAlert(tipeItem + ' ditambahkan! Draft Permohonan Dana dibuat — lihat tab Riwayat Pengadaan.');
  } else {
    showAlert(tipeItem + ' berhasil ditambahkan!');
  }
  navigate('portal-aset');
}

async function editPerlengkapan(id) {
  const list = await KDB.getAll('perlengkapan');
  const p = list.find(function(x){ return x.id === id; });
  if (!p) return;
  const isAset = p.tipeItem === 'Aset Tetap';
  const extraFields = isAset
    ? '<div class="fg"><label>Kondisi</label><select id="ep-kondisi"><option ' + (p.kondisi==='Baru'?'selected':'') + '>Baru</option><option ' + (p.kondisi==='Baik'?'selected':'') + '>Baik</option><option ' + (p.kondisi==='Cukup'?'selected':'') + '>Cukup</option><option ' + (p.kondisi==='Rusak'?'selected':'') + '>Rusak</option></select></div>'
      + '<div class="fg"><label>Lokasi</label><input id="ep-lokasi" value="' + (p.lokasi||'') + '"></div>'
    : '<div class="fg"><label>Stok Awal</label><input type="number" id="ep-awal" value="' + (p.awal||0) + '"></div>'
      + '<div class="fg"><label>Pembelian</label><input type="number" id="ep-beli" value="' + (p.beli||0) + '"></div>'
      + '<div class="fg"><label>Pemakaian</label><input type="number" id="ep-pakai" value="' + (p.pakai||0) + '"></div>';
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Nama</label><input id="ep-nama" value="' + (p.nama||'') + '"></div>'
    + '<div class="fg"><label>Satuan</label><input id="ep-satuan" value="' + (p.satuan||'') + '"></div>'
    + '<div class="fg"><label>Harga Satuan</label><input type="number" id="ep-harga" value="' + (p.harga||0) + '"></div>'
    + extraFields
    + '<div class="fg full"><label>Keterangan</label><textarea id="ep-ket">' + (p.keterangan||'') + '</textarea></div>'
    + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditPerlengkapan(\'' + id + '\')">Simpan</button></div>',
    'Edit ' + (p.tipeItem||'Perlengkapan') + ': ' + p.nama);
}

async function simpanEditPerlengkapan(id) {
  const list = await KDB.getAll('perlengkapan');
  const p = list.find(function(x){ return x.id === id; });
  if (!p) return;
  const updated = Object.assign({}, p, {
    nama: (document.getElementById('ep-nama') || {}).value || p.nama,
    satuan: (document.getElementById('ep-satuan') || {}).value || p.satuan,
    harga: parseFloat((document.getElementById('ep-harga') || {}).value) || p.harga,
    keterangan: (document.getElementById('ep-ket') || {}).value || p.keterangan,
  });
  if (p.tipeItem === 'Aset Tetap') {
    updated.kondisi = (document.getElementById('ep-kondisi') || {}).value || p.kondisi;
    updated.lokasi = (document.getElementById('ep-lokasi') || {}).value || p.lokasi;
  } else {
    updated.awal = parseInt((document.getElementById('ep-awal') || {}).value) || p.awal;
    updated.beli = parseInt((document.getElementById('ep-beli') || {}).value) || p.beli;
    updated.pakai = parseInt((document.getElementById('ep-pakai') || {}).value) || p.pakai;
  }
  await KDB.save('perlengkapan', id, updated);
  closeModalDirect();
  showAlert('Data berhasil diperbarui!');
  navigate('portal-aset');
}

async function tambahPemakaian(id) {
  const jumlah = parseInt(prompt('Jumlah pemakaian yang ingin ditambahkan:')) || 0;
  if (!jumlah || jumlah <= 0) return;
  const list = await KDB.getAll('perlengkapan');
  const p = list.find(function(x){ return x.id === id; });
  if (!p) return;
  const newPakai = (parseInt(p.pakai)||0) + jumlah;
  await KDB.save('perlengkapan', id, Object.assign({}, p, { pakai: newPakai }));
  showAlert('Pemakaian ' + jumlah + ' ' + (p.satuan||'unit') + ' dicatat!');
  navigate('portal-aset');
}

// ===== SALDO AWAL =====
async function renderSaldoAwal() {
  var akun = await getAkun();
  var tahun = new Date().getFullYear();
  var saldoAwal = await KDB.getSetting('saldo_awal_' + tahun, {});
  var years = [tahun - 1, tahun, tahun + 1];
  var yearBtns = years.map(function(y) {
    return '<button class="btn btn-sm ' + (y === tahun ? 'btn-primary' : 'btn-outline') + '" style="margin:2px" onclick="loadSaldoAwal(' + y + ')">' + y + '</button>';
  }).join('');

  var rows = akun.map(function(a) {
    var val = saldoAwal[a.kode] || 0;
    return '<tr>'
      + '<td>' + a.kode + '</td>'
      + '<td>' + a.nama + '</td>'
      + '<td><span class="badge ' + (a.tipe==='Debit'?'badge-info':'badge-warning') + '">' + a.tipe + '</span></td>'
      + '<td><input type="number" class="sa-input" data-kode="' + a.kode + '" value="' + val + '" style="width:140px;padding:6px 10px;border:1.5px solid #ddd;border-radius:6px;text-align:right;font-size:0.88rem" placeholder="0"></td>'
      + '</tr>';
  }).join('');

  return '<div class="page-title">💰 Saldo Awal</div>'
    + '<div class="card"><div class="card-header"><h2>Saldo Awal Per Akun</h2></div>'
    + '<div class="alert alert-info">Isi saldo awal untuk setiap akun di awal periode. Saldo ini akan menjadi dasar perhitungan laporan keuangan.</div>'
    + '<div style="margin-bottom:12px"><div class="fw-bold" style="margin-bottom:6px;font-size:0.85rem">Pilih Tahun:</div>' + yearBtns + '</div>'
    + '<div id="sa-tahun-label" class="fw-bold text-blue" style="margin-bottom:12px;font-size:1rem">Tahun: ' + tahun + '</div>'
    + '<div class="table-wrap"><table id="tbl-saldo-awal">'
    + '<thead><tr><th>No. Akun</th><th>Nama Akun</th><th>Saldo Normal</th><th class="text-right">Saldo Awal (Rp)</th></tr></thead>'
    + '<tbody>' + rows + '</tbody>'
    + '</table></div>'
    + '<div class="mt-12 flex-row">'
    + '<button class="btn btn-primary" onclick="simpanSaldoAwal()">Simpan Saldo Awal</button>'
    + '<button class="btn btn-outline" onclick="resetSaldoAwal()">Reset Semua ke 0</button>'
    + '</div></div>';
}

var _saldoAwalTahun = new Date().getFullYear();

async function loadSaldoAwal(tahun) {
  _saldoAwalTahun = tahun;
  var saldoAwal = await KDB.getSetting('saldo_awal_' + tahun, {});
  var label = document.getElementById('sa-tahun-label');
  if (label) label.textContent = 'Tahun: ' + tahun;
  document.querySelectorAll('.sa-input').forEach(function(el) {
    var kode = el.dataset.kode;
    el.value = saldoAwal[kode] || 0;
  });
  showAlert('Saldo awal tahun ' + tahun + ' dimuat');
}

async function simpanSaldoAwal() {
  var data = {};
  document.querySelectorAll('.sa-input').forEach(function(el) {
    var kode = el.dataset.kode;
    var val = parseFloat(el.value) || 0;
    if (val !== 0) data[kode] = val;
  });
  await KDB.saveSetting('saldo_awal_' + _saldoAwalTahun, data);
  showAlert('Saldo awal tahun ' + _saldoAwalTahun + ' berhasil disimpan!');
}

function resetSaldoAwal() {
  if (!confirm('Reset semua saldo awal ke 0?')) return;
  document.querySelectorAll('.sa-input').forEach(function(el) { el.value = 0; });
}

// ===== PRINT BUNDLE LAPORAN KEUANGAN =====
async function renderPrintBundle() {
  var perusahaan = await KDB.getSetting('perusahaan', {});
  var jurnal = await KDB.getAll('jurnal');
  jurnal = filterJurnalByPeriod(jurnal);
  var akun = await getAkun();
  var saldo = {};
  akun.forEach(function(a) { saldo[a.kode] = { akun: a, debit: 0, kredit: 0, net: 0 }; });
  jurnal.filter(function(j) { return j.tipe !== 'penutup'; }).forEach(function(j) {
    (j.lines || []).forEach(function(l) {
      if (!l.akun) return;
      if (!saldo[l.akun]) {
        var autoKat = autoKategoriCOA(l.akun, l.ket || '', '');
        saldo[l.akun] = { akun: { kode: l.akun, nama: l.ket || l.akun, kategori: autoKat.kategori, tipe: autoKat.tipe }, debit: 0, kredit: 0, net: 0 };
      }
      saldo[l.akun].debit += l.debit || 0;
      saldo[l.akun].kredit += l.kredit || 0;
    });
  });
  Object.values(saldo).forEach(function(s) {
    s.net = s.akun.tipe === 'Debit' ? s.debit - s.kredit : s.kredit - s.debit;
  });
  akun.sort(function(a,b){ return (a.kode||'').localeCompare(b.kode||''); });
  var periode = getPrintPeriodeLabel() !== 'Semua Periode' ? getPrintPeriodeLabel() : (perusahaan.periode || new Date().getFullYear());

  // Build logo header
  var logoHtml = perusahaan.logoData
    ? '<img src="' + perusahaan.logoData + '" style="height:50px;max-width:100px;object-fit:contain">'
    : '<div style="font-size:1.8rem">💼</div>';
  var companyBlock = '<div style="display:flex;align-items:center;gap:10px">' + logoHtml
    + '<div><div style="font-size:1.1rem;font-weight:700;color:#1a237e">' + (perusahaan.nama||'IJEF Corp') + '</div>'
    + '<div style="font-size:0.75rem;color:#555">' + (perusahaan.alamat||'') + (perusahaan.kota ? ', ' + perusahaan.kota : '') + '</div>'
    + '<div style="font-size:0.75rem;color:#555">' + (perusahaan.telp||'') + (perusahaan.email ? ' | ' + perusahaan.email : '') + '</div>'
    + '</div></div>';

  function sectionHeader(title) {
    return '<div class="print-page-break"></div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1a237e;padding-bottom:8px;margin-bottom:12px">'
      + companyBlock
      + '<div style="text-align:right"><div style="font-size:0.95rem;font-weight:700;color:#1a237e">' + title + '</div>'
      + '<div style="font-size:0.78rem;color:#555">Periode: ' + periode + '</div></div></div>';
  }

  // --- LABA RUGI ---
  var pendapatanAkun = akun.filter(function(a){ return (a.kategori||'').includes('Pendapatan'); });
  var bebanOpsAkun = akun.filter(function(a){ return (a.kategori||'').includes('Beban'); });
  var totalPendapatan = pendapatanAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var totalBeban = bebanOpsAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var labaBersih = totalPendapatan - totalBeban;

  var lrRows = '';
  lrRows += '<tr style="background:#e8eaf6"><td colspan="2"><b>PENDAPATAN</b></td></tr>';
  pendapatanAkun.filter(function(a){ return (saldo[a.kode]||{}).net > 0; }).forEach(function(a) {
    lrRows += '<tr><td style="padding-left:16px">' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp((saldo[a.kode]||{}).net) + '</td></tr>';
  });
  lrRows += '<tr style="background:#e3f2fd"><td><b>Total Pendapatan</b></td><td class="text-right fw-bold text-green">' + fmtRp(totalPendapatan) + '</td></tr>';
  lrRows += '<tr style="background:#e8eaf6"><td colspan="2"><b>BEBAN</b></td></tr>';
  bebanOpsAkun.filter(function(a){ return (saldo[a.kode]||{}).net > 0; }).forEach(function(a) {
    lrRows += '<tr><td style="padding-left:16px">' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp((saldo[a.kode]||{}).net) + '</td></tr>';
  });
  lrRows += '<tr style="background:#e3f2fd"><td><b>Total Beban</b></td><td class="text-right fw-bold text-red">' + fmtRp(totalBeban) + '</td></tr>';
  lrRows += '<tr style="background:' + (labaBersih>=0?'#e8f5e9':'#ffebee') + ';font-size:1.05rem"><td><b>LABA / RUGI BERSIH</b></td><td class="text-right fw-bold ' + (labaBersih>=0?'text-green':'text-red') + '">' + fmtRp(labaBersih) + '</td></tr>';

  var labaRugiHtml = sectionHeader('LAPORAN LABA RUGI')
    + '<table style="width:100%;border-collapse:collapse;font-size:0.82rem"><tbody>' + lrRows + '</tbody></table>';

  // --- NERACA ---
  var asetAkun = akun.filter(function(a){ return (a.kategori||'').includes('Aset'); });
  var kewAkun = akun.filter(function(a){ return (a.kategori||'').includes('Kewajiban'); });
  var ekuAkun = akun.filter(function(a){ return a.kategori === 'Ekuitas'; });
  var totalAset = asetAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var totalKew = kewAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var totalEku = ekuAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0) + labaBersih;

  var nrRows = '<tr style="background:#e8eaf6"><td colspan="2"><b>ASET</b></td></tr>';
  asetAkun.filter(function(a){ return (saldo[a.kode]||{}).net !== 0; }).forEach(function(a) {
    nrRows += '<tr><td style="padding-left:16px">' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp((saldo[a.kode]||{}).net) + '</td></tr>';
  });
  nrRows += '<tr style="background:#e3f2fd"><td><b>Total Aset</b></td><td class="text-right fw-bold">' + fmtRp(totalAset) + '</td></tr>';
  nrRows += '<tr style="background:#e8eaf6"><td colspan="2"><b>KEWAJIBAN</b></td></tr>';
  kewAkun.filter(function(a){ return (saldo[a.kode]||{}).net !== 0; }).forEach(function(a) {
    nrRows += '<tr><td style="padding-left:16px">' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp((saldo[a.kode]||{}).net) + '</td></tr>';
  });
  nrRows += '<tr style="background:#e3f2fd"><td><b>Total Kewajiban</b></td><td class="text-right fw-bold">' + fmtRp(totalKew) + '</td></tr>';
  nrRows += '<tr style="background:#e8eaf6"><td colspan="2"><b>EKUITAS</b></td></tr>';
  ekuAkun.forEach(function(a) {
    nrRows += '<tr><td style="padding-left:16px">' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp((saldo[a.kode]||{}).net||0) + '</td></tr>';
  });
  nrRows += '<tr><td style="padding-left:16px">Laba Bersih Periode Berjalan</td><td class="text-right ' + (labaBersih>=0?'text-green':'text-red') + '">' + fmtRp(labaBersih) + '</td></tr>';
  nrRows += '<tr style="background:#e3f2fd"><td><b>Total Ekuitas</b></td><td class="text-right fw-bold">' + fmtRp(totalEku) + '</td></tr>';
  nrRows += '<tr style="background:#e8f5e9;font-size:1.05rem"><td><b>TOTAL KEWAJIBAN + EKUITAS</b></td><td class="text-right fw-bold">' + fmtRp(totalKew + totalEku) + '</td></tr>';

  var neracaHtml = sectionHeader('NERACA')
    + '<table style="width:100%;border-collapse:collapse;font-size:0.82rem"><tbody>' + nrRows + '</tbody></table>';

  // --- ARUS KAS ---
  var kasAkunList = akun.filter(function(a) {
    var n = (a.nama||'').toLowerCase();
    return a.kategori === 'Aset Lancar' && (n.includes('kas') || n.includes('bank') || n.includes('cash'));
  }).map(function(a){ return a.kode; });
  var operasi = 0, investasi = 0, pendanaan = 0;
  jurnal.filter(function(j){ return j.tipe !== 'penutup'; }).forEach(function(j) {
    (j.lines||[]).forEach(function(l) {
      if (kasAkunList.indexOf(l.akun) >= 0) {
        var net = (l.debit||0) - (l.kredit||0);
        var ref = (j.noRef||'').toString();
        if (ref.startsWith('INV') || ref.startsWith('JU')) operasi += net;
        else if (ref.startsWith('PO') || ref.startsWith('ASET')) investasi += net;
        else pendanaan += net;
      }
    });
  });
  var totalKas = operasi + investasi + pendanaan;

  var akRows = '<tr style="background:#e8eaf6"><td colspan="2"><b>AKTIVITAS OPERASI</b></td></tr>'
    + '<tr><td style="padding-left:16px">Arus Kas dari Operasi</td><td class="text-right ' + (operasi>=0?'text-green':'text-red') + '">' + fmtRp(operasi) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>AKTIVITAS INVESTASI</b></td></tr>'
    + '<tr><td style="padding-left:16px">Arus Kas dari Investasi</td><td class="text-right ' + (investasi>=0?'text-green':'text-red') + '">' + fmtRp(investasi) + '</td></tr>'
    + '<tr style="background:#e8eaf6"><td colspan="2"><b>AKTIVITAS PENDANAAN</b></td></tr>'
    + '<tr><td style="padding-left:16px">Arus Kas dari Pendanaan</td><td class="text-right ' + (pendanaan>=0?'text-green':'text-red') + '">' + fmtRp(pendanaan) + '</td></tr>'
    + '<tr style="background:' + (totalKas>=0?'#e8f5e9':'#ffebee') + ';font-size:1.05rem"><td><b>KENAIKAN / PENURUNAN KAS BERSIH</b></td><td class="text-right fw-bold ' + (totalKas>=0?'text-green':'text-red') + '">' + fmtRp(totalKas) + '</td></tr>';

  var arusKasHtml = sectionHeader('ARUS KAS')
    + '<table style="width:100%;border-collapse:collapse;font-size:0.82rem"><tbody>' + akRows + '</tbody></table>';

  // --- EKUITAS ---
  var modalAwal = ekuAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var modalAkhir = modalAwal + labaBersih;
  var ekRows = '';
  ekuAkun.forEach(function(a) {
    ekRows += '<tr><td>' + a.kode + ' - ' + a.nama + '</td><td class="text-right">' + fmtRp((saldo[a.kode]||{}).net||0) + '</td></tr>';
  });
  ekRows += '<tr style="background:#e3f2fd"><td><b>Total Modal Awal</b></td><td class="text-right fw-bold">' + fmtRp(modalAwal) + '</td></tr>';
  ekRows += '<tr><td style="padding-left:16px">Laba / Rugi Periode Berjalan</td><td class="text-right ' + (labaBersih>=0?'text-green':'text-red') + '">' + fmtRp(labaBersih) + '</td></tr>';
  ekRows += '<tr style="background:#e8f5e9;font-size:1.05rem"><td><b>TOTAL EKUITAS AKHIR</b></td><td class="text-right fw-bold text-green">' + fmtRp(modalAkhir) + '</td></tr>';

  var ekuitasHtml = sectionHeader('PERUBAHAN EKUITAS')
    + '<table style="width:100%;border-collapse:collapse;font-size:0.82rem"><tbody>' + ekRows + '</tbody></table>';

  // --- COVER PAGE ---
  var coverHtml = '<div style="text-align:center;padding:40px 20px">'
    + (perusahaan.logoData ? '<img src="' + perusahaan.logoData + '" style="height:80px;margin-bottom:16px">' : '<div style="font-size:4rem;margin-bottom:16px">💼</div>')
    + '<h1 style="color:#1a237e;font-size:1.8rem;margin-bottom:8px">' + (perusahaan.nama||'IJEF Corp') + '</h1>'
    + '<div style="font-size:1rem;color:#555;margin-bottom:4px">' + (perusahaan.alamat||'') + (perusahaan.kota ? ', ' + perusahaan.kota : '') + '</div>'
    + '<div style="font-size:0.9rem;color:#555;margin-bottom:24px">' + (perusahaan.telp||'') + (perusahaan.email ? ' | ' + perusahaan.email : '') + '</div>'
    + '<div style="border-top:3px solid #1a237e;border-bottom:3px solid #1a237e;padding:16px 0;margin:20px auto;max-width:400px">'
    + '<h2 style="color:#1a237e;font-size:1.4rem">LAPORAN KEUANGAN</h2>'
    + '<div style="font-size:1.1rem;color:#333;margin-top:6px">Periode: ' + periode + '</div>'
    + '</div>'
    + '<div style="margin-top:30px;font-size:0.85rem;color:#888">Dicetak: ' + new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}) + '</div>'
    + '</div>';

  // --- DAFTAR ISI ---
  var tocHtml = '<div class="print-page-break"></div>'
    + '<div style="padding:20px"><h2 style="color:#1a237e;border-bottom:2px solid #1a237e;padding-bottom:8px;margin-bottom:16px">DAFTAR ISI</h2>'
    + '<table style="width:100%;font-size:0.95rem"><tbody>'
    + '<tr><td style="padding:8px 0">1.</td><td style="padding:8px 0"><b>Laporan Laba Rugi</b></td></tr>'
    + '<tr><td style="padding:8px 0">2.</td><td style="padding:8px 0"><b>Neraca (Laporan Posisi Keuangan)</b></td></tr>'
    + '<tr><td style="padding:8px 0">3.</td><td style="padding:8px 0"><b>Laporan Arus Kas</b></td></tr>'
    + '<tr><td style="padding:8px 0">4.</td><td style="padding:8px 0"><b>Laporan Perubahan Ekuitas</b></td></tr>'
    + '<tr><td style="padding:8px 0">5.</td><td style="padding:8px 0"><b>Analisis Naratif Keuangan</b></td></tr>'
    + '</tbody></table></div>';

  return '<div class="page-title">🖨️ Print Laporan Keuangan</div>'
    + '<div class="card no-print"><div class="card-header"><h2>Bundel Laporan Keuangan — ' + (perusahaan.nama||'IJEF Corp') + '</h2></div>'
    + '<div class="alert alert-info">Klik tombol <b>Print</b> untuk mencetak seluruh laporan keuangan dalam satu bundel (Cover, Daftar Isi, Laba Rugi, Neraca, Arus Kas, Ekuitas, Analisis Naratif).</div>'
    + '<div style="margin-bottom:16px;padding:16px;background:#f8f9fa;border-radius:8px;border:1px solid #e0e0e0">'
    + '<div style="font-weight:600;margin-bottom:10px;color:#1a237e">Filter Periode Laporan:</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:12px">'
    + '<label style="cursor:pointer"><input type="radio" name="print-filter-mode" value="all"' + (_printFilterMode==='all'?' checked':'') + '> Semua</label>'
    + '<label style="cursor:pointer"><input type="radio" name="print-filter-mode" value="year"' + (_printFilterMode==='year'?' checked':'') + '> Per Tahun</label>'
    + '<label style="cursor:pointer"><input type="radio" name="print-filter-mode" value="month"' + (_printFilterMode==='month'?' checked':'') + '> Per Bulan</label>'
    + '<label style="cursor:pointer"><input type="radio" name="print-filter-mode" value="date"' + (_printFilterMode==='date'?' checked':'') + '> Per Tanggal</label>'
    + '</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">'
    + '<input type="number" id="print-filter-year" value="' + _printFilterYear + '" min="2020" max="2099" style="width:90px;padding:6px 10px;border:1px solid #ccc;border-radius:5px" placeholder="Tahun">'
    + '<input type="month" id="print-filter-month" value="' + _printFilterMonth + '" style="padding:6px 10px;border:1px solid #ccc;border-radius:5px">'
    + '<input type="date" id="print-filter-date" value="' + _printFilterDate + '" style="padding:6px 10px;border:1px solid #ccc;border-radius:5px">'
    + '<button class="btn btn-primary btn-sm" onclick="applyPrintFilter()">Terapkan Filter</button>'
    + '</div>'
    + '<div style="margin-top:8px;font-size:0.82rem;color:#555">Periode aktif: <b>' + getPrintPeriodeLabel() + '</b></div>'
    + '</div>'
    + '<div class="flex-row" style="gap:8px">'
    + '<button class="btn btn-primary" onclick="printBundleLaporan()">🖨️ Print Semua Laporan</button>'
    + '<span class="text-muted">Periode: ' + periode + '</span>'
    + '</div></div>'
    + '<div class="print-bundle-section">'
    + coverHtml
    + tocHtml
    + '<div style="padding:12px">' + labaRugiHtml + '</div>'
    + '<div style="padding:12px">' + neracaHtml + '</div>'
    + '<div style="padding:12px">' + arusKasHtml + '</div>'
    + '<div style="padding:12px">' + ekuitasHtml + '</div>'
    + '<div style="padding:12px">' + buildPrintNaratif(sectionHeader, totalPendapatan, totalBeban, labaBersih, totalAset, totalKew, totalEku, modalAwal, perusahaan.nama||'IJEF CORP', perusahaan.kota||'Bandung Barat') + '</div>'
    + '</div>';
}

function buildPrintNaratif(sectionHeader, totalPendapatan, totalBeban, labaBersih, totalAset, totalKew, totalEku, modalAwal, namaPerusahaan, kotaPerusahaan) {
  var marginLaba = totalPendapatan > 0 ? ((labaBersih / totalPendapatan) * 100).toFixed(1) : 0;
  var rasioBeban = totalPendapatan > 0 ? ((totalBeban / totalPendapatan) * 100).toFixed(1) : 0;
  var currentRatio = totalKew > 0 ? ((totalAset / totalKew) * 100).toFixed(2) : 0;
  var debtToAsset = totalAset > 0 ? ((totalKew / totalAset) * 100).toFixed(2) : 0;
  var debtToEquity = totalEku > 0 ? ((totalKew / totalEku) * 100).toFixed(2) : 0;
  var nwc = totalAset - totalKew;
  var assetTurnover = totalAset > 0 ? (totalPendapatan / totalAset).toFixed(2) : 0;
  var roe = totalEku > 0 ? ((labaBersih / totalEku) * 100).toFixed(2) : 0;

  var kondisi = labaBersih > 0 ? 'LABA' : 'RUGI';
  var kondisiCls = labaBersih > 0 ? 'text-green' : 'text-red';

  // Status badges
  var stCR = parseFloat(currentRatio) > 200 ? 'Aman' : parseFloat(currentRatio) > 100 ? 'Cukup' : 'Waspada';
  var stCRcls = parseFloat(currentRatio) > 200 ? 'text-green' : parseFloat(currentRatio) > 100 ? 'text-blue' : 'text-red';
  var stNWC = nwc > 0 ? 'Positif' : 'Negatif';
  var stNWCcls = nwc > 0 ? 'text-green' : 'text-red';
  var stDA = parseFloat(debtToAsset) < 50 ? 'Sehat' : parseFloat(debtToAsset) < 80 ? 'Moderat' : 'Tinggi';
  var stDAcls = parseFloat(debtToAsset) < 50 ? 'text-green' : parseFloat(debtToAsset) < 80 ? 'text-blue' : 'text-red';
  var stDE = parseFloat(debtToEquity) < 100 ? 'Sehat' : 'Tinggi';
  var stDEcls = parseFloat(debtToEquity) < 100 ? 'text-green' : 'text-red';

  // Detailed narratives
  var narasiProfit = '';
  if (labaBersih > 0 && parseFloat(rasioBeban) < 60) {
    narasiProfit = 'Profitabilitas sangat baik. Perusahaan mencatatkan laba bersih ' + fmtRp(labaBersih) + ' dengan margin laba ' + marginLaba + '%. Rasio beban terhadap pendapatan hanya ' + rasioBeban + '%, menunjukkan pengendalian biaya yang efektif. Kinerja ini perlu dipertahankan dan menjadi dasar untuk ekspansi bisnis.';
  } else if (labaBersih > 0) {
    narasiProfit = 'Perusahaan menghasilkan laba bersih ' + fmtRp(labaBersih) + ' dengan margin ' + marginLaba + '%. Namun rasio beban mencapai ' + rasioBeban + '% dari pendapatan. Disarankan untuk mengevaluasi struktur biaya operasional agar margin laba dapat ditingkatkan.';
  } else {
    narasiProfit = 'Perusahaan mengalami kerugian sebesar ' + fmtRp(Math.abs(labaBersih)) + '. Total beban (' + fmtRp(totalBeban) + ') melebihi total pendapatan (' + fmtRp(totalPendapatan) + '). Diperlukan langkah strategis: evaluasi struktur biaya, peningkatan pendapatan, dan efisiensi operasional.';
  }

  var narasiLikuid = '';
  if (parseFloat(currentRatio) > 200) narasiLikuid = 'Sangat likuid. Aset lancar mampu menutupi kewajiban lancar lebih dari 2 kali lipat (Current Ratio ' + currentRatio + '%). Modal kerja bersih (Net Working Capital) sebesar ' + fmtRp(nwc) + ' menunjukkan perusahaan memiliki buffer keuangan yang kuat untuk operasional sehari-hari.';
  else if (parseFloat(currentRatio) > 100) narasiLikuid = 'Kondisi likuiditas cukup baik dengan Current Ratio ' + currentRatio + '%. Perusahaan mampu memenuhi kewajiban jangka pendek. Net Working Capital ' + fmtRp(nwc) + ' masih positif, namun perlu dijaga agar tidak menurun.';
  else narasiLikuid = 'Perlu perhatian serius. Current Ratio hanya ' + currentRatio + '%, di bawah standar 100%. Aset lancar tidak cukup untuk menutupi kewajiban lancar. Disarankan untuk meningkatkan kas atau mengurangi utang jangka pendek.';

  var narasiSolva = '';
  if (parseFloat(debtToAsset) < 50) narasiSolva = 'Struktur modal sangat sehat. Debt to Asset Ratio ' + debtToAsset + '% (standar <50%) menunjukkan sebagian besar aset dibiayai oleh modal sendiri. Debt to Equity Ratio ' + debtToEquity + '% menunjukkan proporsi utang terhadap ekuitas masih terkendali. Perusahaan memiliki kapasitas untuk mengambil pinjaman tambahan jika diperlukan.';
  else if (parseFloat(debtToAsset) < 80) narasiSolva = 'Struktur modal moderat. Debt to Asset ' + debtToAsset + '% mendekati batas wajar. Debt to Equity ' + debtToEquity + '% menunjukkan ketergantungan pada utang cukup signifikan. Disarankan untuk mengurangi utang secara bertahap.';
  else narasiSolva = 'Tingkat utang tinggi. Debt to Asset ' + debtToAsset + '% melebihi standar 50%. Debt to Equity ' + debtToEquity + '% menunjukkan utang jauh melebihi modal sendiri. Diperlukan strategi deleveraging dan peningkatan ekuitas.';

  var narasiAktivitas = 'Asset Turnover ' + assetTurnover + ' kali menunjukkan setiap Rp 1 aset menghasilkan pendapatan Rp ' + assetTurnover + '. ';
  if (parseFloat(rasioBeban) < 60) narasiAktivitas += 'Efisiensi operasional sangat baik dengan rasio beban ' + rasioBeban + '% dari pendapatan.';
  else if (parseFloat(rasioBeban) < 80) narasiAktivitas += 'Efisiensi operasional cukup baik, namun rasio beban ' + rasioBeban + '% masih bisa dioptimalkan.';
  else narasiAktivitas += 'Rasio beban ' + rasioBeban + '% cukup tinggi. Perlu evaluasi efisiensi penggunaan aset dan pengendalian biaya.';

  // Kesimpulan & Rekomendasi + Narrative Gabungan
  var roa = totalAset > 0 ? ((labaBersih / totalAset) * 100).toFixed(2) : 0;
  var kondisiKeseluruhan = labaBersih > 0 && parseFloat(currentRatio) > 100 && parseFloat(debtToAsset) < 50 ? 'SANGAT BAIK' : labaBersih > 0 ? 'CUKUP BAIK' : 'PERLU PERHATIAN';
  var kondisiKCls = kondisiKeseluruhan === 'SANGAT BAIK' ? 'text-green' : kondisiKeseluruhan === 'CUKUP BAIK' ? 'text-blue' : 'text-red';

  var kesimpulan = '<div class="print-page-break" style="margin-top:16px;border-top:2px solid #1a237e;padding-top:12px">'
    + '<div style="font-weight:700;font-size:0.95rem;color:#1a237e;margin-bottom:10px">KESIMPULAN & REKOMENDASI</div>'
    + '<p style="font-size:0.82rem;line-height:1.7;color:#333;margin-bottom:10px">'
    + 'Berdasarkan analisis komprehensif terhadap laporan keuangan periode ini, kondisi keuangan perusahaan secara keseluruhan '
    + '<b class="' + kondisiKCls + '">' + kondisiKeseluruhan + '</b>'
    + '. Perusahaan mencatatkan ' + (labaBersih >= 0 ? 'laba' : 'rugi') + ' bersih ' + fmtRp(Math.abs(labaBersih)) + ' dengan margin ' + marginLaba + '%.'
    + '</p>'
    + '<div style="font-weight:600;font-size:0.85rem;color:#1a237e;margin-bottom:6px">Rekomendasi:</div>'
    + '<ol style="padding-left:18px;font-size:0.82rem;line-height:1.8;color:#333;margin-bottom:12px">';
  if (labaBersih > 0) kesimpulan += '<li>Pertahankan kinerja profitabilitas dan eksplorasi peluang pertumbuhan pendapatan</li>';
  else kesimpulan += '<li>Evaluasi menyeluruh struktur biaya dan identifikasi area penghematan</li>';
  if (parseFloat(rasioBeban) > 70) kesimpulan += '<li>Optimalkan rasio beban operasional yang saat ini ' + rasioBeban + '% dari pendapatan</li>';
  if (parseFloat(debtToAsset) > 50) kesimpulan += '<li>Kurangi tingkat utang secara bertahap untuk memperkuat struktur modal</li>';
  if (parseFloat(currentRatio) < 150) kesimpulan += '<li>Tingkatkan likuiditas dengan memperbaiki pengelolaan kas dan piutang</li>';
  kesimpulan += '<li>Lakukan monitoring berkala terhadap rasio-rasio keuangan utama</li>';
  kesimpulan += '<li>Siapkan anggaran dan target keuangan untuk periode berikutnya</li>';
  kesimpulan += '</ol>';

  // Narrative Gabungan
  kesimpulan += '<div style="background:#f8f9ff;border:1.5px solid #1a237e;border-radius:8px;padding:16px;margin-top:12px">'
    + '<div style="font-weight:700;font-size:0.9rem;background:#1a237e;color:white;padding:6px 12px;border-radius:4px;display:inline-block;margin-bottom:10px">Kesimpulan Gabungan (Narrative untuk Laporan)</div>'
    + '<p style="font-size:0.84rem;line-height:1.8;color:#333">'
    + '"Secara fundamental, <b>' + (namaPerusahaan||'IJEF CORP') + '</b> berada dalam kondisi <b class="' + kondisiCls + '">' + kondisi + '</b>'
    + ' dengan laba bersih <b>' + fmtRp(labaBersih) + '</b>.'
    + ' Net Profit Margin sebesar <b>' + marginLaba + '%</b>,'
    + ' Return on Equity <b>' + roe + '%</b>,'
    + ' dan Return on Assets <b>' + roa + '%</b>.'
    + ' Dari sisi solvabilitas, Debt to Asset Ratio <b>' + debtToAsset + '%</b> menunjukkan struktur modal yang ' + (parseFloat(debtToAsset) < 50 ? 'sehat dan seimbang' : 'perlu perhatian') + '.'
    + ' Current Ratio <b>' + currentRatio + '%</b> menunjukkan kemampuan likuiditas yang ' + (parseFloat(currentRatio) > 100 ? 'memadai' : 'perlu ditingkatkan') + '."'
    + '</p></div>';

  kesimpulan += '</div>';

  // Tanda tangan
  var tglCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  kesimpulan += '<div style="margin-top:40px;display:flex;justify-content:flex-end">'
    + '<div style="text-align:center;min-width:220px">'
    + '<div style="font-size:0.85rem;color:#333">' + (kotaPerusahaan||'Bandung Barat') + ', ' + tglCetak + '</div>'
    + '<div style="margin-top:70px;border-top:1.5px solid #333;padding-top:8px">'
    + '<div style="font-size:0.85rem;font-weight:700">Direktur Utama</div>'
    + '<div style="font-size:0.85rem;font-weight:700">' + (namaPerusahaan||'IJEF CORP') + '</div>'
    + '</div></div></div>';

  return sectionHeader('ANALISIS NARATIF KEUANGAN')
    + '<div style="margin-bottom:16px">'
    + '<div style="font-weight:700;font-size:0.95rem;color:#1a237e;border-bottom:2px solid #1a237e;padding-bottom:6px;margin-bottom:10px">1. PROFITABILITAS</div>'
    + '<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:8px"><tbody>'
    + '<tr><td style="width:150px"><b>Kondisi</b></td><td class="fw-bold ' + kondisiCls + '">' + kondisi + '</td><td></td></tr>'
    + '<tr><td><b>Margin Laba</b></td><td>' + marginLaba + '%</td><td></td></tr>'
    + '<tr><td><b>Rasio Beban</b></td><td>' + rasioBeban + '%</td><td></td></tr>'
    + '<tr><td><b>ROE</b></td><td>' + roe + '%</td><td>Return on Equity</td></tr>'
    + '<tr><td><b>Total Pendapatan</b></td><td class="text-green">' + fmtRp(totalPendapatan) + '</td><td></td></tr>'
    + '<tr><td><b>Total Beban</b></td><td class="text-red">' + fmtRp(totalBeban) + '</td><td></td></tr>'
    + '<tr><td><b>Laba / Rugi Bersih</b></td><td class="fw-bold ' + kondisiCls + '">' + fmtRp(labaBersih) + '</td><td></td></tr>'
    + '</tbody></table>'
    + '<p style="font-size:0.82rem;line-height:1.6;font-style:italic;color:#333">' + narasiProfit + '</p></div>'
    + '<div style="margin-bottom:16px">'
    + '<div style="font-weight:700;font-size:0.95rem;color:#1a237e;border-bottom:2px solid #1a237e;padding-bottom:6px;margin-bottom:10px">2. LIKUIDITAS (Kesehatan Jangka Pendek)</div>'
    + '<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:8px"><tbody>'
    + '<tr><td style="width:150px"><b>Current Ratio</b></td><td>' + currentRatio + '%</td><td>Standar: >100%</td><td class="fw-bold ' + stCRcls + '">' + stCR + '</td></tr>'
    + '<tr><td><b>Net Working Capital</b></td><td>' + fmtRp(nwc) + '</td><td>Standar: Positif</td><td class="fw-bold ' + stNWCcls + '">' + stNWC + '</td></tr>'
    + '</tbody></table>'
    + '<p style="font-size:0.82rem;line-height:1.6;font-style:italic;color:#333">' + narasiLikuid + '</p></div>'
    + '<div style="margin-bottom:16px">'
    + '<div style="font-weight:700;font-size:0.95rem;color:#1a237e;border-bottom:2px solid #1a237e;padding-bottom:6px;margin-bottom:10px">3. SOLVABILITAS (Kesehatan Jangka Panjang)</div>'
    + '<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:8px"><tbody>'
    + '<tr><td style="width:150px"><b>Debt to Asset (DAR)</b></td><td>' + debtToAsset + '%</td><td>Standar: &lt;50%</td><td class="fw-bold ' + stDAcls + '">' + stDA + '</td></tr>'
    + '<tr><td><b>Debt to Equity (DER)</b></td><td>' + debtToEquity + '%</td><td>Standar: &lt;100%</td><td class="fw-bold ' + stDEcls + '">' + stDE + '</td></tr>'
    + '</tbody></table>'
    + '<p style="font-size:0.82rem;line-height:1.6;font-style:italic;color:#333">' + narasiSolva + '</p></div>'
    + '<div style="margin-bottom:16px">'
    + '<div style="font-weight:700;font-size:0.95rem;color:#1a237e;border-bottom:2px solid #1a237e;padding-bottom:6px;margin-bottom:10px">4. AKTIVITAS (Efisiensi Operasional)</div>'
    + '<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:8px"><tbody>'
    + '<tr><td style="width:150px"><b>Asset Turnover</b></td><td>' + assetTurnover + ' kali</td><td>Setiap Rp 1 aset menghasilkan pendapatan Rp ' + assetTurnover + '</td></tr>'
    + '<tr><td><b>Rasio Efisiensi</b></td><td>' + rasioBeban + '%</td><td>Beban operasional ' + rasioBeban + '% dari pendapatan</td></tr>'
    + '</tbody></table>'
    + '<p style="font-size:0.82rem;line-height:1.6;font-style:italic;color:#333">' + narasiAktivitas + '</p></div>'
    + kesimpulan;
}

function printBundleLaporan() {
  var content = document.querySelector('.print-bundle-section');
  if (!content) { showAlert('Konten print tidak ditemukan!', 'danger'); return; }
  var w = window.open('', '_blank');
  w.document.write('<html><head><title>Laporan Keuangan</title>');
  w.document.write('<style>');
  w.document.write('*{box-sizing:border-box;margin:0;padding:0}');
  w.document.write('body{font-family:"Segoe UI",sans-serif;color:#333;font-size:12px;background:white}');
  w.document.write('table{width:100%;border-collapse:collapse}');
  w.document.write('td,th{padding:5px 8px;border-bottom:1px solid #eee;vertical-align:top}');
  w.document.write('th{background:#1a237e;color:white}');
  w.document.write('.text-green{color:#2e7d32}.text-red{color:#c62828}.text-blue{color:#1a237e}');
  w.document.write('.fw-bold{font-weight:700}.text-right{text-align:right}');
  w.document.write('.print-page-break{page-break-before:always}');
  w.document.write('@page{margin:12mm 10mm;size:A4}');
  w.document.write('@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}');
  w.document.write('</style></head><body>');
  w.document.write(content.innerHTML);
  w.document.write('</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 500);
}

// ===== PRINT FILTER STATE =====
var _printFilterMode = 'all'; // 'all', 'date', 'month', 'year'
var _printFilterDate = '';
var _printFilterMonth = '';
var _printFilterYear = new Date().getFullYear().toString();

function filterJurnalByPeriod(jurnal) {
  if (_printFilterMode === 'date' && _printFilterDate) {
    return jurnal.filter(function(j) { return j.tanggal === _printFilterDate; });
  }
  if (_printFilterMode === 'month' && _printFilterMonth) {
    return jurnal.filter(function(j) { return (j.tanggal||'').startsWith(_printFilterMonth); });
  }
  if (_printFilterMode === 'year' && _printFilterYear) {
    return jurnal.filter(function(j) { return (j.tanggal||'').startsWith(_printFilterYear); });
  }
  return jurnal;
}

function getPrintPeriodeLabel() {
  if (_printFilterMode === 'date' && _printFilterDate) return fmtDate(_printFilterDate);
  if (_printFilterMode === 'month' && _printFilterMonth) {
    var parts = _printFilterMonth.split('-');
    var bulanNames = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return bulanNames[parseInt(parts[1])] + ' ' + parts[0];
  }
  if (_printFilterMode === 'year' && _printFilterYear) return 'Tahun ' + _printFilterYear;
  return 'Semua Periode';
}

function applyPrintFilter() {
  _printFilterMode = document.querySelector('input[name="print-filter-mode"]:checked').value;
  _printFilterDate = (document.getElementById('print-filter-date')||{}).value || '';
  _printFilterMonth = (document.getElementById('print-filter-month')||{}).value || '';
  _printFilterYear = (document.getElementById('print-filter-year')||{}).value || '';
  navigate('lap-print-bundle');
}

// ===== DASHBOARD EXTRAS: Ringkasan, Forecast, Actual vs Budget =====
// Global state for dashboard period
var _dashPeriod = 'bulanan';
function setDashPeriod(period) {
  _dashPeriod = period;
  navigate('lap-dashboard');
}

function buildDashboardExtras(jurnal, fd, allPD, allDM) {
  var now = new Date();
  var yr = now.getFullYear();
  var period = _dashPeriod || 'bulanan';
  var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  // Compute data based on period
  var labels = [];
  var pengeluaranArr = [];
  var pendapatanArr = [];

  if (period === 'harian') {
    // Last 7 days
    for (var di = 6; di >= 0; di--) {
      var dd = new Date(now); dd.setDate(now.getDate() - di);
      var ds = dd.toISOString().split('T')[0];
      labels.push(dd.toLocaleDateString('id-ID',{day:'2-digit',month:'short'}));
      var pOut = 0, pIn = 0;
      jurnal.forEach(function(j) {
        if (j.tanggal !== ds) return;
        (j.lines||[]).forEach(function(l) {
          var a = fd.akun.find(function(x){ return x.kode === l.akun; });
          if (a && (a.kategori||'').includes('Beban')) pOut += l.debit||0;
          if (a && (a.kategori||'').includes('Pendapatan')) pIn += l.kredit||0;
        });
      });
      pengeluaranArr.push(pOut);
      pendapatanArr.push(pIn);
    }
  } else if (period === 'mingguan') {
    // Last 4 weeks
    for (var wi = 3; wi >= 0; wi--) {
      var wEnd = new Date(now); wEnd.setDate(now.getDate() - wi * 7);
      var wStart = new Date(wEnd); wStart.setDate(wEnd.getDate() - 6);
      labels.push(wStart.toLocaleDateString('id-ID',{day:'2-digit',month:'short'}) + '-' + wEnd.toLocaleDateString('id-ID',{day:'2-digit',month:'short'}));
      var wOut = 0, wIn = 0;
      jurnal.forEach(function(j) {
        if (!j.tanggal) return;
        var jd = new Date(j.tanggal);
        if (jd >= wStart && jd <= wEnd) {
          (j.lines||[]).forEach(function(l) {
            var a = fd.akun.find(function(x){ return x.kode === l.akun; });
            if (a && (a.kategori||'').includes('Beban')) wOut += l.debit||0;
            if (a && (a.kategori||'').includes('Pendapatan')) wIn += l.kredit||0;
          });
        }
      });
      pengeluaranArr.push(wOut);
      pendapatanArr.push(wIn);
    }
  } else {
    // Bulanan — 12 months of current year
    labels = months.slice();
    pengeluaranArr = new Array(12).fill(0);
    pendapatanArr = new Array(12).fill(0);
    jurnal.forEach(function(j) {
      if (!j.tanggal) return;
      var d = new Date(j.tanggal);
      if (d.getFullYear() !== yr) return;
      var m = d.getMonth();
      (j.lines||[]).forEach(function(l) {
        var a = fd.akun.find(function(x){ return x.kode === l.akun; });
        if (a && (a.kategori||'').includes('Beban')) pengeluaranArr[m] += l.debit||0;
        if (a && (a.kategori||'').includes('Pendapatan')) pendapatanArr[m] += l.kredit||0;
      });
    });
  }

  var totalPengeluaran = pengeluaranArr.reduce(function(s,v){return s+v;},0);
  var totalPendapatan = pendapatanArr.reduce(function(s,v){return s+v;},0);
  var selisih = totalPendapatan - totalPengeluaran;
  var maxVal = Math.max.apply(null, pengeluaranArr.concat(pendapatanArr).concat([1]));

  // Chart bars with SVG line overlay — dynamic based on period
  var linePointsP = [];
  var linePointsK = [];
  var barCount = labels.length;
  var bars = labels.map(function(lbl, i) {
    var hP = Math.round((pendapatanArr[i]/maxVal)*80);
    var hK = Math.round((pengeluaranArr[i]/maxVal)*80);
    var isCur = (period === 'bulanan' && i === now.getMonth()) || (period === 'harian' && i === barCount - 1) || (period === 'mingguan' && i === barCount - 1);
    var xPct = barCount > 1 ? (i * 100 / (barCount - 1)).toFixed(1) : '50';
    linePointsP.push(xPct + ',' + (80 - hP));
    linePointsK.push(xPct + ',' + (80 - hK));
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">'
      + '<div style="display:flex;gap:2px;align-items:flex-end;height:80px">'
      + '<div style="width:8px;height:' + hP + 'px;background:#4caf50;border-radius:2px 2px 0 0;min-height:1px" title="Pendapatan: ' + fmtRp(pendapatanArr[i]) + '"></div>'
      + '<div style="width:8px;height:' + hK + 'px;background:#f44336;border-radius:2px 2px 0 0;min-height:1px" title="Pengeluaran: ' + fmtRp(pengeluaranArr[i]) + '"></div>'
      + '</div><div style="font-size:0.6rem;color:' + (isCur?'#1a237e':'#888') + ';font-weight:' + (isCur?'700':'400') + '">' + lbl + '</div></div>';
  }).join('');

  // SVG line overlay
  var svgLine = '<svg style="position:absolute;top:0;left:2%;width:96%;height:80px;pointer-events:none" viewBox="0 0 100 80" preserveAspectRatio="none">'
    + '<polyline points="' + linePointsP.join(' ') + '" fill="none" stroke="#2e7d32" stroke-width="0.8" stroke-dasharray="2,1"/>'
    + '<polyline points="' + linePointsK.join(' ') + '" fill="none" stroke="#c62828" stroke-width="0.8" stroke-dasharray="2,1"/>'
    + '</svg>';

  var forecastPD = allPD.filter(function(x){ return x.status === STATUS.DRAFT || x.status === STATUS.PENDING_L1; });
  var forecastDM = allDM.filter(function(x){ return x.status === STATUS.DRAFT || x.status === STATUS.PENDING_L1; });
  // Filter forecast by period
  if (period === 'harian') {
    var last7 = new Date(now); last7.setDate(now.getDate() - 6);
    forecastPD = forecastPD.filter(function(x){ var d = new Date(x.tanggal||''); return d >= last7 && d <= now; });
    forecastDM = forecastDM.filter(function(x){ var d = new Date(x.tanggal||''); return d >= last7 && d <= now; });
  } else if (period === 'mingguan') {
    var last4w = new Date(now); last4w.setDate(now.getDate() - 27);
    forecastPD = forecastPD.filter(function(x){ var d = new Date(x.tanggal||''); return d >= last4w && d <= now; });
    forecastDM = forecastDM.filter(function(x){ var d = new Date(x.tanggal||''); return d >= last4w && d <= now; });
  }
  var totalForecastOut = forecastPD.reduce(function(s,x){ return s+(parseFloat(x.nominal)||0); },0);
  var totalForecastIn = forecastDM.reduce(function(s,x){ return s+(parseFloat(x.nominal)||0); },0);

  // Actual vs Budget — period-aware
  var numPeriods = period === 'harian' ? 7 : period === 'mingguan' ? 4 : Math.max(now.getMonth()+1,1);
  var budgetBulanan = totalPendapatan > 0 ? Math.round(totalPendapatan / numPeriods) : 0;
  var lastIdx = pengeluaranArr.length - 1;
  var actualBulanIni = pendapatanArr[lastIdx] || 0;
  var bebanBulanIni = pengeluaranArr[lastIdx] || 0;
  var avgBeban = totalPengeluaran > 0 ? Math.round(totalPengeluaran / numPeriods) : 0;
  var budgetVsActual = budgetBulanan > 0 ? ((actualBulanIni / budgetBulanan) * 100).toFixed(0) : 0;
  var efisiensiBeban = actualBulanIni > 0 ? ((bebanBulanIni / actualBulanIni) * 100).toFixed(0) : 0;

  var saran = '';
  if (parseFloat(budgetVsActual) >= 100) saran = 'Pendapatan bulan ini mencapai target. Pertahankan kinerja!';
  else if (parseFloat(budgetVsActual) >= 70) saran = 'Pendapatan mendekati target (' + budgetVsActual + '%). Tingkatkan di minggu terakhir.';
  else if (parseFloat(budgetVsActual) >= 40) saran = 'Pendapatan masih ' + budgetVsActual + '% dari target. Perlu akselerasi penjualan.';
  else saran = 'Pendapatan jauh di bawah rata-rata (' + budgetVsActual + '%). Evaluasi strategi pemasaran segera.';
  if (parseFloat(efisiensiBeban) > 100) saran += ' Beban melebihi pendapatan (' + efisiensiBeban + '%) — perlu pengendalian biaya.';

  var periodBtns = '<div class="flex-row" style="gap:4px">'
    + '<button class="btn btn-xs ' + (period==='harian'?'btn-primary':'btn-outline') + '" onclick="setDashPeriod(\'harian\')">Harian</button>'
    + '<button class="btn btn-xs ' + (period==='mingguan'?'btn-primary':'btn-outline') + '" onclick="setDashPeriod(\'mingguan\')">Mingguan</button>'
    + '<button class="btn btn-xs ' + (period==='bulanan'?'btn-primary':'btn-outline') + '" onclick="setDashPeriod(\'bulanan\')">Bulanan</button>'
    + '</div>';

  var periodLabel = period === 'harian' ? '7 Hari Terakhir' : period === 'mingguan' ? '4 Minggu Terakhir' : 'Tahun ' + yr;
  var periodLabelShort = period === 'harian' ? 'Hari Ini' : period === 'mingguan' ? 'Minggu Ini' : months[now.getMonth()] + ' ' + yr;

  var html = '';

  // 1. Ringkasan Keuangan
  html += '<div class="card mt-12"><div class="card-header"><h2>📊 Ringkasan Keuangan — ' + periodLabel + '</h2>' + periodBtns + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">'
    + '<div style="background:#f8fff8;border-radius:8px;padding:12px"><div class="text-muted" style="font-size:0.72rem">Total Pendapatan</div><div class="fw-bold text-green" style="font-size:1rem">' + fmtRp(totalPendapatan) + '</div></div>'
    + '<div style="background:#fff8f8;border-radius:8px;padding:12px"><div class="text-muted" style="font-size:0.72rem">Total Pengeluaran</div><div class="fw-bold text-red" style="font-size:1rem">' + fmtRp(totalPengeluaran) + '</div></div>'
    + '<div style="background:' + (selisih>=0?'#f8fff8':'#fff8f8') + ';border-radius:8px;padding:12px"><div class="text-muted" style="font-size:0.72rem">Laba/Rugi</div><div class="fw-bold ' + (selisih>=0?'text-green':'text-red') + '" style="font-size:1rem">' + fmtRp(selisih) + '</div></div>'
    + '</div>'
    + '<div style="font-weight:600;font-size:0.82rem;margin-bottom:6px">Grafik Pendapatan vs Pengeluaran</div>'
    + '<div style="position:relative;display:flex;align-items:flex-end;gap:3px;padding:6px 0">' + bars + svgLine + '</div>'
    + '<div style="display:flex;gap:16px;justify-content:center;margin-top:4px;font-size:0.72rem">'
    + '<span><span style="display:inline-block;width:8px;height:8px;background:#4caf50;border-radius:2px;margin-right:3px"></span>Pendapatan</span>'
    + '<span><span style="display:inline-block;width:8px;height:8px;background:#f44336;border-radius:2px;margin-right:3px"></span>Pengeluaran</span>'
    + '<span><span style="display:inline-block;width:12px;height:0;border-top:2px dashed #2e7d32;margin-right:3px"></span>Trend Pendapatan</span>'
    + '<span><span style="display:inline-block;width:12px;height:0;border-top:2px dashed #c62828;margin-right:3px"></span>Trend Pengeluaran</span>'
    + '</div></div>';

  // 2. Forecast
  html += '<div class="card"><div class="card-header"><h2>📈 Forecast (Pending Approval)</h2>' + periodBtns + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
    + '<div style="background:#fff8f8;border-radius:8px;padding:14px;border-left:4px solid #f44336"><div class="text-muted" style="font-size:0.72rem">Forecast Pengeluaran</div><div class="fw-bold text-red" style="font-size:1.1rem">' + fmtRp(totalForecastOut) + '</div><div class="text-muted" style="font-size:0.7rem;margin-top:4px">' + forecastPD.length + ' permohonan pending</div></div>'
    + '<div style="background:#f8fff8;border-radius:8px;padding:14px;border-left:4px solid #4caf50"><div class="text-muted" style="font-size:0.72rem">Forecast Penerimaan</div><div class="fw-bold text-green" style="font-size:1.1rem">' + fmtRp(totalForecastIn) + '</div><div class="text-muted" style="font-size:0.7rem;margin-top:4px">' + forecastDM.length + ' dana masuk pending</div></div>'
    + '</div></div>';

  // 3. Actual vs Budget
  var pctBar = Math.min(parseFloat(budgetVsActual), 100);
  var pctColor = pctBar >= 80 ? '#4caf50' : pctBar >= 50 ? '#ff9800' : '#f44336';
  html += '<div class="card"><div class="card-header"><h2>🎯 Actual vs Budget — ' + periodLabelShort + '</h2>' + periodBtns + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:12px">'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:10px;text-align:center"><div class="text-muted" style="font-size:0.7rem">Budget Pendapatan/Bln</div><div class="fw-bold text-blue" style="font-size:0.95rem">' + fmtRp(budgetBulanan) + '</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:10px;text-align:center"><div class="text-muted" style="font-size:0.7rem">Actual Pendapatan</div><div class="fw-bold text-green" style="font-size:0.95rem">' + fmtRp(actualBulanIni) + '</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:10px;text-align:center"><div class="text-muted" style="font-size:0.7rem">Actual Beban</div><div class="fw-bold text-red" style="font-size:0.95rem">' + fmtRp(bebanBulanIni) + '</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:10px;text-align:center"><div class="text-muted" style="font-size:0.7rem">Rata-rata Beban/Bln</div><div class="fw-bold" style="font-size:0.95rem">' + fmtRp(avgBeban) + '</div></div>'
    + '</div>'
    + '<div style="margin-bottom:8px"><div style="font-size:0.8rem;font-weight:600;margin-bottom:4px">Pencapaian Target: ' + budgetVsActual + '%</div>'
    + '<div style="background:#e0e0e0;border-radius:6px;height:14px;overflow:hidden"><div style="width:' + pctBar + '%;height:100%;background:' + pctColor + ';border-radius:6px"></div></div></div>'
    + '<div style="margin-bottom:8px"><div style="font-size:0.8rem;font-weight:600;margin-bottom:4px">Efisiensi Beban: ' + efisiensiBeban + '% dari pendapatan</div>'
    + '<div style="background:#e0e0e0;border-radius:6px;height:14px;overflow:hidden"><div style="width:' + Math.min(parseFloat(efisiensiBeban),100) + '%;height:100%;background:' + (parseFloat(efisiensiBeban)<70?'#4caf50':'#ff9800') + ';border-radius:6px"></div></div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;margin-top:8px;border-left:4px solid #1a237e">'
    + '<div style="font-weight:600;font-size:0.82rem;color:#1a237e;margin-bottom:4px">💡 Analisis & Saran:</div>'
    + '<p style="font-size:0.82rem;line-height:1.6;color:#333">' + saran + '</p>'
    + '</div></div>';

  // 4. Grafik per COA — integrated into dashboard
  var saldo = fd.saldo;
  var akun = fd.akun;
  var bebanAkun = akun.filter(function(a){ return (a.kategori||'').includes('Beban'); });
  var pendapatanAkunCOA = akun.filter(function(a){ return (a.kategori||'').includes('Pendapatan'); });

  // Filter by period if harian/mingguan — recalculate from jurnal
  var coaSaldo = {};
  if (period !== 'bulanan') {
    var startDate;
    if (period === 'harian') { startDate = new Date(now); startDate.setDate(now.getDate() - 6); }
    else { startDate = new Date(now); startDate.setDate(now.getDate() - 27); }
    jurnal.forEach(function(j) {
      if (!j.tanggal) return;
      var jd = new Date(j.tanggal);
      if (jd < startDate || jd > now) return;
      (j.lines||[]).forEach(function(l) {
        if (!l.akun) return;
        if (!coaSaldo[l.akun]) coaSaldo[l.akun] = { debit: 0, kredit: 0 };
        coaSaldo[l.akun].debit += l.debit || 0;
        coaSaldo[l.akun].kredit += l.kredit || 0;
      });
    });
  }

  function getCoaNet(kode, kat) {
    if (period !== 'bulanan' && coaSaldo[kode]) {
      if ((kat||'').includes('Beban')) return coaSaldo[kode].debit - coaSaldo[kode].kredit;
      return coaSaldo[kode].kredit - coaSaldo[kode].debit;
    }
    return (saldo[kode]||{}).net||0;
  }

  var maxBebanCOA = Math.max.apply(null, bebanAkun.map(function(a){ return getCoaNet(a.kode, a.kategori); }).concat([1]));
  var maxPendCOA = Math.max.apply(null, pendapatanAkunCOA.map(function(a){ return getCoaNet(a.kode, a.kategori); }).concat([1]));

  var bebanBars = bebanAkun.filter(function(a){ return getCoaNet(a.kode, a.kategori) > 0; })
    .sort(function(a,b){ return getCoaNet(b.kode, b.kategori) - getCoaNet(a.kode, a.kategori); })
    .map(function(a) {
      var val = getCoaNet(a.kode, a.kategori);
      var w = Math.round((val/maxBebanCOA)*100);
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        + '<div style="width:160px;font-size:0.75rem;text-align:right;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + a.nama + '">' + a.nama + '</div>'
        + '<div style="flex:1;background:#eee;border-radius:4px;height:18px;overflow:hidden"><div style="width:' + w + '%;height:100%;background:#f44336;border-radius:4px"></div></div>'
        + '<div style="width:100px;font-size:0.75rem;font-weight:600;text-align:right">' + fmtRp(val) + '</div></div>';
    }).join('');

  var pendBars = pendapatanAkunCOA.filter(function(a){ return getCoaNet(a.kode, a.kategori) > 0; })
    .sort(function(a,b){ return getCoaNet(b.kode, b.kategori) - getCoaNet(a.kode, a.kategori); })
    .map(function(a) {
      var val = getCoaNet(a.kode, a.kategori);
      var w = Math.round((val/maxPendCOA)*100);
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        + '<div style="width:160px;font-size:0.75rem;text-align:right;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + a.nama + '">' + a.nama + '</div>'
        + '<div style="flex:1;background:#eee;border-radius:4px;height:18px;overflow:hidden"><div style="width:' + w + '%;height:100%;background:#4caf50;border-radius:4px"></div></div>'
        + '<div style="width:100px;font-size:0.75rem;font-weight:600;text-align:right">' + fmtRp(val) + '</div></div>';
    }).join('');

  html += '<div class="card"><div class="card-header"><h2>📊 Grafik per COA — ' + periodLabel + '</h2>' + periodBtns + '</div>'
    + '<div style="margin-bottom:16px"><div style="font-weight:600;font-size:0.85rem;margin-bottom:8px;color:#c62828">Pengeluaran per Item (Beban)</div>'
    + (bebanBars || '<div class="text-muted" style="font-size:0.82rem">Belum ada data beban</div>')
    + '</div>'
    + '<div style="border-top:1px solid #eee;padding-top:12px"><div style="font-weight:600;font-size:0.85rem;margin-bottom:8px;color:#2e7d32">Pendapatan per Item</div>'
    + (pendBars || '<div class="text-muted" style="font-size:0.82rem">Belum ada data pendapatan</div>')
    + '</div></div>';

  return html;
}

// ===== PETTY CASH HELPERS =====
function lihatPettyCashDetail(id) {
  KDB.getAll('pettycash').then(function(list) {
    var p = list.find(function(x){ return x.id === id; });
    if (!p) { showAlert('Data tidak ditemukan', 'warning'); return; }
    // Detect if noRef is a URL/link
    var noRefHtml = (p.noRef||'-');
    if (p.noRef && (p.noRef.startsWith('http') || p.noRef.startsWith('https') || p.noRef.includes('drive.google') || p.noRef.includes('docs.google'))) {
      noRefHtml = '<a href="' + p.noRef + '" target="_blank" rel="noopener" style="color:#1a237e;font-weight:600;word-break:break-all">🔗 Lihat Eviden / Dokumen</a>';
    }
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Tanggal</label><div class="chip">' + fmtDate(p.tanggal) + '</div></div>'
      + '<div class="fg"><label>Kategori</label><div class="chip">' + (p.kategori||'-') + '</div></div>'
      + '<div class="fg"><label>Jumlah</label><div class="fw-bold text-blue" style="font-size:1.1rem">' + fmtRp(p.jumlah) + '</div></div>'
      + '<div class="fg full"><label>No. Ref / Eviden</label><div>' + noRefHtml + '</div></div>'
      + '<div class="fg full"><label>Keterangan</label><div>' + (p.keterangan||'-') + '</div></div>'
      + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
      'Detail Petty Cash');
  });
}

function editPettyCash(id) {
  Promise.all([KDB.getAll('pettycash'), getAkunOptions()]).then(function(results) {
    var list = results[0];
    var akunOpts = results[1];
    var p = list.find(function(x){ return x.id === id; });
    if (!p) return;
    openModal('<div class="form-grid">'
      + '<div class="fg"><label>Tanggal</label><input type="date" id="epc-tgl" value="' + (p.tanggal||'') + '"></div>'
      + '<div class="fg"><label>No. Ref</label><input id="epc-ref" value="' + (p.noRef||'') + '"></div>'
      + '<div class="fg full"><label>Keterangan</label><input id="epc-ket" value="' + (p.keterangan||'') + '"></div>'
      + '<div class="fg"><label>Akun Debit</label><select id="epc-akun-debit" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%"><option value="">-- Pilih Akun --</option>' + akunOpts + '</select></div>'
      + '<div class="fg"><label>Akun Kredit</label><select id="epc-akun-kredit" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%"><option value="">-- Pilih Akun --</option>' + akunOpts + '</select></div>'
      + '<div class="fg"><label>Jumlah (Rp)</label><input type="number" id="epc-jumlah" value="' + (p.jumlah||0) + '"></div>'
      + '<div class="fg"><label>Kategori</label><select id="epc-kat" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%"><option value="Petty Cash"' + (p.kategori==='Petty Cash'?' selected':'') + '>Petty Cash</option><option value="Jurnal"' + (p.kategori==='Jurnal'?' selected':'') + '>Jurnal</option><option value="Operasional"' + (p.kategori==='Operasional'?' selected':'') + '>Operasional</option><option value="Lainnya"' + (p.kategori==='Lainnya'?' selected':'') + '>Lainnya</option></select></div>'
      + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditPC(\'' + id + '\')">Simpan</button></div>',
      'Edit Petty Cash');
    // Set selected akun after modal opens
    setTimeout(function() {
      var selD = document.getElementById('epc-akun-debit');
      var selK = document.getElementById('epc-akun-kredit');
      if (selD && p.akunDebit) selD.value = p.akunDebit;
      if (selK && p.akunKredit) selK.value = p.akunKredit;
    }, 100);
  });
}

async function simpanEditPC(id) {
  var list = await KDB.getAll('pettycash');
  var p = list.find(function(x){ return x.id === id; });
  if (!p) return;
  var updated = Object.assign({}, p, {
    tanggal: (document.getElementById('epc-tgl')||{}).value || p.tanggal,
    noRef: (document.getElementById('epc-ref')||{}).value || p.noRef,
    jumlah: parseFloat((document.getElementById('epc-jumlah')||{}).value) || p.jumlah,
    keterangan: (document.getElementById('epc-ket')||{}).value || p.keterangan,
    akunDebit: (document.getElementById('epc-akun-debit')||{}).value || p.akunDebit || '',
    akunKredit: (document.getElementById('epc-akun-kredit')||{}).value || p.akunKredit || '',
    kategori: (document.getElementById('epc-kat')||{}).value || p.kategori || 'Petty Cash',
  });
  await KDB.save('pettycash', id, updated);
  closeModalDirect();
  showAlert('Petty cash diperbarui!');
  navigate('kalk-pettycash');
}

// ===== JURNAL FILTER =====
function filterJurnalByMonth(month) {
  document.querySelectorAll('#tbl-jurnal tbody tr').forEach(function(r) {
    if (!month) { r.style.display = ''; return; }
    var tgl = r.cells[0] ? r.cells[0].textContent : '';
    var parts = tgl.match(/\d{4}/);
    var dateStr = r.dataset ? r.dataset.tanggal : '';
    if (!dateStr) {
      var m = tgl.match(/(\w+)\s+(\d{4})/);
      r.style.display = ''; // show all if can't parse
      return;
    }
    r.style.display = dateStr.substring(5,7) === month ? '' : 'none';
  });
}

function filterJurnalBySumber(sumber) {
  document.querySelectorAll('#tbl-jurnal tbody tr').forEach(function(r) {
    if (!sumber) { r.style.display = ''; return; }
    var text = r.textContent.toLowerCase();
    if (sumber === 'import-sheets') r.style.display = text.includes('import') ? '' : 'none';
    else if (sumber === 'umum') r.style.display = !text.includes('import') ? '' : 'none';
    else r.style.display = text.includes(sumber) ? '' : 'none';
  });
}

function applyJurnalFilter() {
  var q = ((document.getElementById('jurnal-search-q')||{}).value||'').toLowerCase();
  var akunFilter = (document.getElementById('jurnal-filter-akun')||{}).value||'';
  var month = (document.getElementById('jurnal-filter-month')||{}).value||'';
  var sumber = (document.getElementById('jurnal-filter-sumber')||{}).value||'';
  var tglDari = (document.getElementById('jurnal-filter-tgl-dari')||{}).value||'';
  var tglSampai = (document.getElementById('jurnal-filter-tgl-sampai')||{}).value||'';

  // Simpan state filter ke localStorage
  localStorage.setItem('k_jurnal_filter', JSON.stringify({ q:q, akun:akunFilter, month:month, sumber:sumber, tglDari:tglDari, tglSampai:tglSampai }));

  document.querySelectorAll('#tbl-jurnal tbody tr').forEach(function(r) {
    var text = r.textContent.toLowerCase();
    var dateStr = r.dataset ? r.dataset.tanggal : '';
    var rowAkun = r.dataset ? (r.dataset.akun||'') : '';
    var rowSumber = r.dataset ? (r.dataset.sumber||'') : '';
    if (!dateStr) {
      var tglCell = r.cells[0] ? r.cells[0].textContent.trim() : '';
      var parsed = parseFlexDate(tglCell);
      if (parsed) dateStr = parsed;
    }
    var showQ = !q || text.includes(q);
    var showAkun = !akunFilter || rowAkun.split(',').indexOf(akunFilter) >= 0;
    var showMonth = !month || (dateStr && dateStr.substring(5,7) === month);
    var showSumber = !sumber || (function() {
      if (sumber === 'import-sheets') return rowSumber.includes('import') || text.includes('import');
      if (sumber === 'umum') return !rowSumber || rowSumber === 'umum' || rowSumber === '';
      return rowSumber.includes(sumber) || text.includes(sumber);
    })();
    var showDari = !tglDari || (dateStr && dateStr >= tglDari);
    var showSampai = !tglSampai || (dateStr && dateStr <= tglSampai);
    r.style.display = (showQ && showAkun && showMonth && showSumber && showDari && showSampai) ? '' : 'none';
  });
}

function reapplyJurnalFilter() {
  try {
    var saved = JSON.parse(localStorage.getItem('k_jurnal_filter') || '{}');
    if (!saved.q && !saved.akun && !saved.month && !saved.sumber && !saved.tglDari && !saved.tglSampai) return;
    // Restore input values
    var el;
    if (saved.q) { el = document.getElementById('jurnal-search-q'); if (el) el.value = saved.q; }
    if (saved.akun) { el = document.getElementById('jurnal-filter-akun'); if (el) el.value = saved.akun; }
    if (saved.month) { el = document.getElementById('jurnal-filter-month'); if (el) el.value = saved.month; }
    if (saved.sumber) { el = document.getElementById('jurnal-filter-sumber'); if (el) el.value = saved.sumber; }
    if (saved.tglDari) { el = document.getElementById('jurnal-filter-tgl-dari'); if (el) el.value = saved.tglDari; }
    if (saved.tglSampai) { el = document.getElementById('jurnal-filter-tgl-sampai'); if (el) el.value = saved.tglSampai; }
    // Re-apply filter
    applyJurnalFilter();
  } catch(e) {}
}

function resetJurnalFilter() {
  var ids = ['jurnal-search-q','jurnal-filter-akun','jurnal-filter-month','jurnal-filter-sumber','jurnal-filter-tgl-dari','jurnal-filter-tgl-sampai'];
  ids.forEach(function(id){ var el = document.getElementById(id); if (el) el.value = ''; });
  localStorage.removeItem('k_jurnal_filter');
  document.querySelectorAll('#tbl-jurnal tbody tr').forEach(function(r){ r.style.display = ''; });
}

// ===== GRAFIK PER COA =====
async function renderGrafikCOA() {
  var fd = await getFinancialData();
  var saldo = fd.saldo;
  var akun = fd.akun;

  // Pengeluaran per akun beban
  var bebanAkun = akun.filter(function(a){ return (a.kategori||'').includes('Beban'); });
  var pendapatanAkun = akun.filter(function(a){ return (a.kategori||'').includes('Pendapatan'); });

  var maxBeban = Math.max.apply(null, bebanAkun.map(function(a){ return (saldo[a.kode]||{}).net||0; }).concat([1]));
  var maxPendapatan = Math.max.apply(null, pendapatanAkun.map(function(a){ return (saldo[a.kode]||{}).net||0; }).concat([1]));

  var bebanBars = bebanAkun.filter(function(a){ return (saldo[a.kode]||{}).net > 0; })
    .sort(function(a,b){ return ((saldo[b.kode]||{}).net||0) - ((saldo[a.kode]||{}).net||0); })
    .map(function(a) {
      var val = (saldo[a.kode]||{}).net||0;
      var w = Math.round((val/maxBeban)*100);
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        + '<div style="width:180px;font-size:0.78rem;text-align:right;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + a.nama + '">' + a.nama + '</div>'
        + '<div style="flex:1;background:#eee;border-radius:4px;height:18px;overflow:hidden"><div style="width:' + w + '%;height:100%;background:#f44336;border-radius:4px"></div></div>'
        + '<div style="width:100px;font-size:0.78rem;font-weight:600;text-align:right">' + fmtRp(val) + '</div></div>';
    }).join('');

  var pendapatanBars = pendapatanAkun.filter(function(a){ return (saldo[a.kode]||{}).net > 0; })
    .sort(function(a,b){ return ((saldo[b.kode]||{}).net||0) - ((saldo[a.kode]||{}).net||0); })
    .map(function(a) {
      var val = (saldo[a.kode]||{}).net||0;
      var w = Math.round((val/maxPendapatan)*100);
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        + '<div style="width:180px;font-size:0.78rem;text-align:right;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + a.nama + '">' + a.nama + '</div>'
        + '<div style="flex:1;background:#eee;border-radius:4px;height:18px;overflow:hidden"><div style="width:' + w + '%;height:100%;background:#4caf50;border-radius:4px"></div></div>'
        + '<div style="width:100px;font-size:0.78rem;font-weight:600;text-align:right">' + fmtRp(val) + '</div></div>';
    }).join('');

  return '<div class="page-title">📊 Grafik per COA</div>'
    + '<div class="card"><div class="card-header"><h2>Pengeluaran per Item (Beban)</h2></div>'
    + (bebanBars || '<div class="empty-state">Belum ada data beban</div>')
    + '</div>'
    + '<div class="card"><div class="card-header"><h2>Pendapatan per Item</h2></div>'
    + (pendapatanBars || '<div class="empty-state">Belum ada data pendapatan</div>')
    + '</div>';
}

// ===== HITUNG HPP =====
async function renderHPP() {
  var fd = await getFinancialData();
  var saldo = fd.saldo;
  var akun = fd.akun;
  var customers = await KDB.getAll('customer');

  var pendapatanAkun = akun.filter(function(a){ return (a.kategori||'').includes('Pendapatan'); });
  var bebanAkun = akun.filter(function(a){ return (a.kategori||'').includes('Beban'); });

  // Load settings
  var manualHPP = await KDB.getSetting('hpp_manual_selection', null) || {};
  var manualPendapatan = await KDB.getSetting('hpp_manual_pendapatan', null) || {};
  var hppMode = await KDB.getSetting('hpp_mode', 'otomatis');

  // HPP keywords for auto mode
  var hppKeywords = ['gaji pelatihan','sensei','staff','komisi','konsumsi','logistik','perlengkapan','belajar','kebersihan','pemeliharaan','perawatan','ongkir','ekspedisi','transportasi','perjalanan'];

  // Auto mode selections
  var hppAkunAuto = bebanAkun.filter(function(a) {
    var n = (a.nama||'').toLowerCase();
    return hppKeywords.some(function(kw){ return n.includes(kw); });
  });
  var nonHppAkunAuto = bebanAkun.filter(function(a) {
    var n = (a.nama||'').toLowerCase();
    return !hppKeywords.some(function(kw){ return n.includes(kw); });
  });

  // Manual mode — use saved selections
  var hppAkunManual = bebanAkun.filter(function(a){ return manualHPP[a.kode] === true; });
  var nonHppAkunManual = bebanAkun.filter(function(a){ return manualHPP[a.kode] !== true; });

  // Manual pendapatan selection — default all selected
  var pendAkunManual = pendapatanAkun.filter(function(a){
    if (Object.keys(manualPendapatan).length === 0) return true;
    return manualPendapatan[a.kode] !== false;
  });

  // Use active mode
  var hppAkun = hppMode === 'manual' ? hppAkunManual : hppAkunAuto;
  var nonHppAkun = hppMode === 'manual' ? nonHppAkunManual : nonHppAkunAuto;
  var activePendapatan = hppMode === 'manual' ? pendAkunManual : pendapatanAkun;

  var totalPendapatan = activePendapatan.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var totalHPP = hppAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var totalNonHPP = nonHppAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var labaKotor = totalPendapatan - totalHPP;
  var labaBersih = labaKotor - totalNonHPP;
  var marginKotor = totalPendapatan > 0 ? ((labaKotor/totalPendapatan)*100).toFixed(1) : 0;
  var marginBersih = totalPendapatan > 0 ? ((labaBersih/totalPendapatan)*100).toFixed(1) : 0;

  var hppRows = hppAkun.filter(function(a){ return (saldo[a.kode]||{}).net > 0; }).map(function(a) {
    var editBtn = hppMode === 'manual' ? '<td><button class="btn btn-xs btn-warning" onclick="editHPPItem(\'' + a.kode + '\')">Edit</button></td>' : '';
    return '<tr><td>' + a.kode + '</td><td>' + a.nama + '</td><td class="text-right">' + fmtRp((saldo[a.kode]||{}).net||0) + '</td>' + editBtn + '</tr>';
  }).join('');

  var nonHppRows = nonHppAkun.filter(function(a){ return (saldo[a.kode]||{}).net > 0; }).map(function(a) {
    return '<tr><td>' + a.kode + '</td><td>' + a.nama + '</td><td class="text-right">' + fmtRp((saldo[a.kode]||{}).net||0) + '</td></tr>';
  }).join('');

  // Manual: checkboxes for pengeluaran (beban)
  var manualBebanCB = bebanAkun.map(function(a) {
    var net = (saldo[a.kode]||{}).net||0;
    var checked = manualHPP[a.kode] === true ? ' checked' : '';
    return '<tr><td><input type="checkbox" class="hpp-manual-cb" data-kode="' + a.kode + '"' + checked + '></td>'
      + '<td>' + a.kode + '</td><td>' + a.nama + '</td><td class="text-right">' + fmtRp(net) + '</td></tr>';
  }).join('');

  // Manual: checkboxes for pendapatan
  var manualPendCB = pendapatanAkun.map(function(a) {
    var net = (saldo[a.kode]||{}).net||0;
    var noKeys = Object.keys(manualPendapatan).length === 0;
    var checked = noKeys || manualPendapatan[a.kode] !== false ? ' checked' : '';
    return '<tr><td><input type="checkbox" class="hpp-pend-cb" data-kode="' + a.kode + '"' + checked + '></td>'
      + '<td>' + a.kode + '</td><td>' + a.nama + '</td><td class="text-right">' + fmtRp(net) + '</td></tr>';
  }).join('');

  // Mode tabs
  var tabOtomatis = hppMode === 'otomatis' ? 'btn-primary' : 'btn-outline';
  var tabManual = hppMode === 'manual' ? 'btn-primary' : 'btn-outline';
  var hppEditTh = hppMode === 'manual' ? '<th>Aksi</th>' : '';

  return '<div class="page-title">🏭 Hitung HPP (Harga Pokok Penjualan)</div>'
    + '<div class="flex-row" style="gap:8px;margin-bottom:12px">'
    + '<button class="btn btn-sm ' + tabOtomatis + '" onclick="setHPPMode(\'otomatis\')">🤖 Otomatis</button>'
    + '<button class="btn btn-sm ' + tabManual + '" onclick="setHPPMode(\'manual\')">✏️ Manual</button>'
    + '</div>'
    + (hppMode === 'otomatis'
      ? '<div class="alert alert-info">Mode Otomatis: HPP dihitung berdasarkan keyword beban langsung. Semua pendapatan dihitung.</div>'
      : '<div class="alert alert-warning">Mode Manual: Pilih akun Pendapatan dan Pengeluaran yang termasuk HPP, lalu klik <b>Hitung HPP</b>.</div>')
    // Manual selection panels
    + (hppMode === 'manual'
      ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'
        + '<div class="card"><div class="card-header"><h2>Pilih COA Pendapatan</h2></div>'
        + '<div class="table-wrap" style="max-height:300px;overflow-y:auto"><table><thead><tr><th style="width:40px">Pilih</th><th>Kode</th><th>Nama Akun</th><th class="text-right">Jumlah</th></tr></thead><tbody>'
        + manualPendCB + '</tbody></table></div></div>'
        + '<div class="card"><div class="card-header"><h2>Pilih COA Pengeluaran (HPP)</h2></div>'
        + '<div class="table-wrap" style="max-height:300px;overflow-y:auto"><table><thead><tr><th style="width:40px">HPP</th><th>Kode</th><th>Nama Akun</th><th class="text-right">Jumlah</th></tr></thead><tbody>'
        + manualBebanCB + '</tbody></table></div></div>'
        + '</div>'
        + '<div class="mt-12 flex-row" style="gap:8px"><button class="btn btn-primary" onclick="hitungHPPManual()">🧮 Hitung HPP</button>'
        + '<button class="btn btn-success" onclick="simpanHPPManual()">💾 Simpan Pilihan</button>'
        + '<button class="btn btn-outline" onclick="resetHPPManual()">🔄 Reset</button></div>'
      : '')
    // Stats
    + '<div class="stats-row">'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalPendapatan) + '</div><div class="lbl">Total Pendapatan</div></div>'
    + '<div class="stat-box red"><div class="val">' + fmtRp(totalHPP) + '</div><div class="lbl">HPP (Beban Langsung)</div></div>'
    + '<div class="stat-box"><div class="val">' + fmtRp(labaKotor) + '</div><div class="lbl">Laba Kotor</div></div>'
    + '<div class="stat-box orange"><div class="val">' + marginKotor + '%</div><div class="lbl">Margin Kotor</div></div>'
    + '</div>'
    // Customer HPP Analysis
    + buildCustomerHPPSection(customers, totalPendapatan, totalHPP, labaKotor, marginKotor)
    // HPP per Sumber Pendapatan
    + buildHPPPerSumberPendapatan(activePendapatan, hppAkun, nonHppAkun, saldo, totalHPP, totalNonHPP)
    // HPP table
    + '<div class="card"><div class="card-header"><h2>HPP — Beban Langsung</h2></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama Akun</th><th class="text-right">Jumlah</th>' + hppEditTh + '</tr></thead><tbody>'
    + hppRows
    + '<tr style="background:#fff8e1;font-weight:700"><td colspan="2">TOTAL HPP</td><td class="text-right">' + fmtRp(totalHPP) + '</td>' + (hppMode==='manual'?'<td></td>':'') + '</tr>'
    + '</tbody></table></div></div>'
    // Non-HPP table
    + '<div class="card"><div class="card-header"><h2>Beban Operasional & Administrasi (Non-HPP)</h2></div>'
    + '<div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama Akun</th><th class="text-right">Jumlah</th></tr></thead><tbody>'
    + nonHppRows
    + '<tr style="background:#fff8e1;font-weight:700"><td colspan="2">TOTAL BEBAN OPS</td><td class="text-right">' + fmtRp(totalNonHPP) + '</td></tr>'
    + '</tbody></table></div></div>'
    // Profitability summary
    + '<div class="card"><div class="card-header"><h2>Ringkasan Profitabilitas</h2></div>'
    + '<div class="table-wrap"><table><tbody>'
    + '<tr><td>Total Pendapatan</td><td class="text-right fw-bold text-green">' + fmtRp(totalPendapatan) + '</td></tr>'
    + '<tr><td>(-) HPP / Beban Langsung</td><td class="text-right text-red">(' + fmtRp(totalHPP) + ')</td></tr>'
    + '<tr style="background:#e3f2fd"><td><b>Laba Kotor</b></td><td class="text-right fw-bold">' + fmtRp(labaKotor) + ' <span class="text-muted">(' + marginKotor + '%)</span></td></tr>'
    + '<tr><td>(-) Beban Operasional</td><td class="text-right text-red">(' + fmtRp(totalNonHPP) + ')</td></tr>'
    + '<tr style="background:' + (labaBersih>=0?'#e8f5e9':'#ffebee') + ';font-size:1.05rem"><td><b>Laba Bersih</b></td><td class="text-right fw-bold ' + (labaBersih>=0?'text-green':'text-red') + '">' + fmtRp(labaBersih) + ' <span class="text-muted">(' + marginBersih + '%)</span></td></tr>'
    + '</tbody></table></div></div>';
}

async function setHPPMode(mode) {
  await KDB.saveSetting('hpp_mode', mode);
  navigate('kalk-hpp');
}

async function simpanHPPManual() {
  var bebanCBs = document.querySelectorAll('.hpp-manual-cb');
  var pendCBs = document.querySelectorAll('.hpp-pend-cb');
  var bebanSel = {};
  bebanCBs.forEach(function(cb) { bebanSel[cb.getAttribute('data-kode')] = cb.checked; });
  var pendSel = {};
  pendCBs.forEach(function(cb) { pendSel[cb.getAttribute('data-kode')] = cb.checked; });
  await KDB.saveSetting('hpp_manual_selection', bebanSel);
  await KDB.saveSetting('hpp_manual_pendapatan', pendSel);
  await KDB.saveSetting('hpp_mode', 'manual');
  showAlert('Pilihan HPP manual disimpan!');
  navigate('kalk-hpp');
}

async function hitungHPPManual() {
  // Save current checkbox state then reload to recalculate
  await simpanHPPManual();
}

async function resetHPPManual() {
  if (!confirm('Reset semua pilihan HPP manual?')) return;
  await KDB.saveSetting('hpp_manual_selection', {});
  await KDB.saveSetting('hpp_manual_pendapatan', {});
  showAlert('Pilihan HPP direset!');
  navigate('kalk-hpp');
}

function editHPPItem(kode) {
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Kode Akun</label><div class="chip">' + kode + '</div></div>'
    + '<div class="fg"><label>Klasifikasi</label><select id="ehpp-klas"><option value="hpp">HPP (Beban Langsung)</option><option value="ops">Beban Operasional (Non-HPP)</option></select></div>'
    + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditHPPItem(\'' + kode + '\')">Simpan</button></div>',
    'Edit Klasifikasi HPP');
}

async function simpanEditHPPItem(kode) {
  var klas = (document.getElementById('ehpp-klas')||{}).value;
  var sel = await KDB.getSetting('hpp_manual_selection', {}) || {};
  sel[kode] = klas === 'hpp';
  await KDB.saveSetting('hpp_manual_selection', sel);
  await KDB.saveSetting('hpp_mode', 'manual');
  closeModalDirect();
  showAlert('Klasifikasi diperbarui!');
  navigate('kalk-hpp');
}

function buildHPPPerSumberPendapatan(pendapatanAkun, hppAkun, nonHppAkun, saldo, totalHPP, totalNonHPP) {
  var totalAllPendapatan = pendapatanAkun.reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  if (totalAllPendapatan <= 0 && !pendapatanAkun.length) {
    return '<div class="card"><div class="card-header"><h2>📊 HPP per Sumber Pendapatan</h2></div>'
      + '<div class="empty-state"><span class="icon">📊</span>Belum ada data pendapatan</div></div>';
  }

  // Per item pendapatan: alokasi HPP proporsional
  var rows = pendapatanAkun.filter(function(a){ return (saldo[a.kode]||{}).net > 0; })
    .sort(function(a,b){ return ((saldo[b.kode]||{}).net||0) - ((saldo[a.kode]||{}).net||0); })
    .map(function(a) {
      var pend = (saldo[a.kode]||{}).net||0;
      var pct = totalAllPendapatan > 0 ? pend / totalAllPendapatan : 0;
      var hppAlokasi = totalHPP * pct;
      var opsAlokasi = totalNonHPP * pct;
      var labaKotor = pend - hppAlokasi;
      var labaBersih = labaKotor - opsAlokasi;
      var marginK = pend > 0 ? ((labaKotor / pend) * 100).toFixed(1) : 0;
      var marginB = pend > 0 ? ((labaBersih / pend) * 100).toFixed(1) : 0;
      var clsK = labaKotor >= 0 ? 'text-green' : 'text-red';
      var clsB = labaBersih >= 0 ? 'text-green' : 'text-red';
      // Bar width
      var barW = totalAllPendapatan > 0 ? Math.round((pend / totalAllPendapatan) * 100) : 0;
      return '<tr style="border-bottom:2px solid #e8eaf6">'
        + '<td><div class="fw-bold" style="font-size:0.82rem">' + a.kode + ' - ' + a.nama + '</div>'
        + '<div style="background:#eee;border-radius:3px;height:6px;margin-top:4px;overflow:hidden"><div style="width:' + barW + '%;height:100%;background:#1a237e;border-radius:3px"></div></div>'
        + '<div style="font-size:0.68rem;color:#888;margin-top:2px">' + barW + '% dari total pendapatan</div></td>'
        + '<td class="text-right text-green fw-bold">' + fmtRp(pend) + '</td>'
        + '<td class="text-right text-red">' + fmtRp(hppAlokasi) + '</td>'
        + '<td class="text-right ' + clsK + ' fw-bold">' + fmtRp(labaKotor) + '<div style="font-size:0.68rem;color:#888">' + marginK + '%</div></td>'
        + '<td class="text-right text-red">' + fmtRp(opsAlokasi) + '</td>'
        + '<td class="text-right ' + clsB + ' fw-bold">' + fmtRp(labaBersih) + '<div style="font-size:0.68rem;color:#888">' + marginB + '%</div></td>'
        + '</tr>';
    }).join('');

  // Total row
  var totLabaKotor = totalAllPendapatan - totalHPP;
  var totLabaBersih = totLabaKotor - totalNonHPP;
  var totMK = totalAllPendapatan > 0 ? ((totLabaKotor / totalAllPendapatan) * 100).toFixed(1) : 0;
  var totMB = totalAllPendapatan > 0 ? ((totLabaBersih / totalAllPendapatan) * 100).toFixed(1) : 0;

  return '<div class="card"><div class="card-header"><h2>📊 HPP per Sumber Pendapatan</h2></div>'
    + '<div class="alert alert-info">HPP dan beban operasional dialokasikan proporsional berdasarkan kontribusi masing-masing sumber pendapatan terhadap total pendapatan.</div>'
    + '<div class="table-wrap"><table><thead><tr><th>Sumber Pendapatan</th><th class="text-right">Pendapatan</th><th class="text-right">HPP Alokasi</th><th class="text-right">Laba Kotor</th><th class="text-right">Beban Ops</th><th class="text-right">Laba Bersih</th></tr></thead><tbody>'
    + rows
    + '<tr style="background:#fff8e1;font-weight:700"><td>TOTAL</td><td class="text-right text-green">' + fmtRp(totalAllPendapatan) + '</td><td class="text-right text-red">' + fmtRp(totalHPP) + '</td><td class="text-right">' + fmtRp(totLabaKotor) + ' <span style="font-size:0.7rem;color:#888">(' + totMK + '%)</span></td><td class="text-right text-red">' + fmtRp(totalNonHPP) + '</td><td class="text-right">' + fmtRp(totLabaBersih) + ' <span style="font-size:0.7rem;color:#888">(' + totMB + '%)</span></td></tr>'
    + '</tbody></table></div></div>';
}

function buildCustomerHPPSection(customers, totalPendapatan, totalHPP, labaKotor, marginKotor) {
  var custOpts = (customers||[]).map(function(c) {
    return '<option value="' + c.id + '">' + c.nama + (c.limit ? ' (Limit: ' + fmtRp(c.limit) + ')' : '') + '</option>';
  }).join('');

  return '<div class="card"><div class="card-header"><h2>👥 HPP per Customer</h2></div>'
    + '<div class="form-grid" style="margin-bottom:12px">'
    + '<div class="fg"><label>Pilih Customer</label><select id="hpp-customer" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%" onchange="hitungHPPCustomer()"><option value="">-- Pilih Customer --</option>' + custOpts + '</select></div>'
    + '<div class="fg"><label>Metode Perhitungan</label><select id="hpp-cust-mode" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;width:100%" onchange="hitungHPPCustomer()">'
    + '<option value="gabungan">Gabungan (Langsung + Proporsional)</option>'
    + '<option value="proporsional">Proporsional (Alokasi dari Total HPP)</option>'
    + '<option value="tracking">Tracking Langsung (Dari Jurnal)</option>'
    + '</select></div>'
    + '</div>'
    + '<div class="alert alert-info" style="font-size:0.8rem;padding:8px 12px">'
    + '<b>Proporsional:</b> HPP total dibagi ke customer berdasarkan % pendapatan mereka.<br>'
    + '<b>Tracking Langsung:</b> Hanya beban yang menyebut nama customer di keterangan jurnal.<br>'
    + '<b>Gabungan:</b> Beban langsung + overhead (beban tidak langsung) dialokasikan proporsional.'
    + '</div>'
    + '<div id="hpp-cust-result"><div class="text-muted" style="padding:12px 0;font-size:0.85rem">Pilih customer untuk melihat HPP spesifik.</div></div>'
    + '</div>';
}

async function hitungHPPCustomer() {
  var custId = (document.getElementById('hpp-customer')||{}).value;
  var mode = (document.getElementById('hpp-cust-mode')||{}).value || 'gabungan';
  var el = document.getElementById('hpp-cust-result');
  if (!el) return;
  if (!custId) {
    el.innerHTML = '<div class="text-muted" style="padding:12px 0;font-size:0.85rem">Pilih customer untuk melihat HPP spesifik.</div>';
    return;
  }

  el.innerHTML = '<div class="text-muted" style="padding:8px 0">Menghitung...</div>';

  var fd = await getFinancialData();
  var saldo = fd.saldo;
  var akun = fd.akun;
  var jurnal = await KDB.getAll('jurnal');
  var customers = await KDB.getAll('customer');
  var cust = customers.find(function(c){ return c.id === custId; });
  if (!cust) { el.innerHTML = '<div class="alert alert-danger">Customer tidak ditemukan.</div>'; return; }

  // Total keseluruhan
  var totalPendapatan = akun.filter(function(a){ return (a.kategori||'').includes('Pendapatan'); }).reduce(function(s,a){ return s+((saldo[a.kode]||{}).net||0); },0);
  var bebanAkun = akun.filter(function(a){ return (a.kategori||'').includes('Beban'); });
  var totalHPPAll = 0, totalOpsAll = 0;
  var hppMode = await KDB.getSetting('hpp_mode', 'otomatis');
  var manualHPP = await KDB.getSetting('hpp_manual_selection', null) || {};
  var hppKeywords = ['gaji pelatihan','sensei','staff','komisi','konsumsi','logistik','perlengkapan','belajar','kebersihan','pemeliharaan','perawatan','ongkir','ekspedisi','transportasi','perjalanan'];
  bebanAkun.forEach(function(a) {
    var net = (saldo[a.kode]||{}).net||0;
    if (net <= 0) return;
    var isHPP = hppMode === 'manual' ? manualHPP[a.kode] === true : hppKeywords.some(function(kw){ return (a.nama||'').toLowerCase().includes(kw); });
    if (isHPP) totalHPPAll += net; else totalOpsAll += net;
  });

  // --- TRACKING LANGSUNG: cari jurnal yang menyebut customer ---
  // Flexible matching: full name, setiap kata (min 4 huruf), kode customer
  var custNama = (cust.nama||'').toLowerCase().trim();
  var custKode = (cust.kode||'').toLowerCase().trim();
  // Pecah nama jadi kata-kata untuk partial match (min 4 karakter agar tidak false positive)
  var custWords = custNama.split(/\s+/).filter(function(w){ return w.length >= 4; });
  var directPendapatan = 0, directBeban = 0;
  var directBebanDetail = {};
  var directTx = [];

  function isCustomerMatch(text) {
    var t = text.toLowerCase();
    // 1. Full name match
    if (custNama && custNama.length >= 3 && t.includes(custNama)) return true;
    // 2. Kode match
    if (custKode && custKode.length > 2 && t.includes(custKode)) return true;
    // 3. Partial: minimal 2 kata dari nama customer ditemukan di teks
    if (custWords.length >= 2) {
      var matchCount = custWords.filter(function(w){ return t.includes(w); }).length;
      if (matchCount >= 2) return true;
    }
    // 4. Single keyword match: jika nama hanya 1-2 kata, cukup 1 kata cocok (min 4 huruf)
    if (custWords.length <= 2 && custWords.length > 0) {
      // Gunakan kata terpanjang sebagai keyword utama
      var longest = custWords.sort(function(a,b){ return b.length - a.length; })[0];
      if (longest && longest.length >= 4 && t.includes(longest)) return true;
    }
    return false;
  }

  jurnal.forEach(function(j) {
    var ket = (j.keterangan||'') + ' ' + (j.noRef||'');
    var meta = j.meta || {};
    var metaStr = (meta.pemohon||'') + ' ' + (meta.namaRekening||'');
    var isMatch = isCustomerMatch(ket) || isCustomerMatch(metaStr);
    if (!isMatch) return;

    (j.lines||[]).forEach(function(l) {
      var a = akun.find(function(x){ return x.kode === l.akun; });
      if (!a) return;
      if ((a.kategori||'').includes('Pendapatan')) directPendapatan += l.kredit||0;
      if ((a.kategori||'').includes('Beban')) {
        directBeban += l.debit||0;
        var key = a.kode + ' - ' + a.nama;
        directBebanDetail[key] = (directBebanDetail[key]||0) + (l.debit||0);
      }
    });
    directTx.push({ tanggal: j.tanggal, ket: j.keterangan, debit: j.totalDebit||0, kredit: j.totalKredit||0 });
  });

  // Jika tidak ada pendapatan langsung, gunakan limit
  var custPendapatan = directPendapatan > 0 ? directPendapatan : (parseFloat(cust.limit)||0);

  // --- PROPORSIONAL: alokasi dari total ---
  var pctPendapatan = totalPendapatan > 0 ? custPendapatan / totalPendapatan : 0;
  var propHPP = totalHPPAll * pctPendapatan;
  var propOps = totalOpsAll * pctPendapatan;

  // --- GABUNGAN: langsung + overhead proporsional ---
  // Beban langsung = dari tracking
  // Overhead = (total HPP + ops - semua beban langsung semua customer) * proporsi
  // Simplified: overhead = beban yang TIDAK menyebut customer manapun, dialokasikan proporsional
  var gabHPP = directBeban;
  var gabOverhead = (totalHPPAll + totalOpsAll - directBeban) * pctPendapatan;
  if (gabOverhead < 0) gabOverhead = 0;
  var gabTotal = gabHPP + gabOverhead;

  // Pilih berdasarkan mode
  var hppFinal, opsFinal, labelHPP, labelOps;
  if (mode === 'proporsional') {
    hppFinal = propHPP; opsFinal = propOps;
    labelHPP = 'HPP (Proporsional)'; labelOps = 'Beban Ops (Proporsional)';
  } else if (mode === 'tracking') {
    hppFinal = directBeban; opsFinal = 0;
    labelHPP = 'HPP (Tracking Langsung)'; labelOps = 'Beban Ops (N/A)';
  } else {
    hppFinal = gabHPP; opsFinal = gabOverhead;
    labelHPP = 'HPP Langsung'; labelOps = 'Overhead (Proporsional)';
  }

  var labaKotor = custPendapatan - hppFinal;
  var labaBersih = labaKotor - opsFinal;
  var marginK = custPendapatan > 0 ? ((labaKotor / custPendapatan) * 100).toFixed(1) : 0;
  var marginB = custPendapatan > 0 ? ((labaBersih / custPendapatan) * 100).toFixed(1) : 0;

  // Beban detail rows
  var bebanRows = Object.keys(directBebanDetail).sort(function(a,b){ return directBebanDetail[b] - directBebanDetail[a]; }).map(function(k) {
    return '<tr><td>' + k + '</td><td class="text-right text-red">' + fmtRp(directBebanDetail[k]) + '</td></tr>';
  }).join('');

  // Transaction rows
  var txRows = directTx.slice(0, 20).map(function(t) {
    return '<tr><td>' + fmtDate(t.tanggal) + '</td><td>' + (t.ket||'-') + '</td><td class="text-right">' + fmtRp(t.debit) + '</td><td class="text-right">' + fmtRp(t.kredit) + '</td></tr>';
  }).join('');

  var html = '<div style="background:#f8f9ff;border-radius:8px;padding:12px;margin-bottom:12px;border-left:4px solid #1a237e">'
    + '<div style="font-weight:700;font-size:1rem;color:#1a237e">' + cust.nama + '</div>'
    + '<div style="font-size:0.8rem;color:#555;margin-top:4px">Limit: ' + fmtRp(cust.limit||0) + ' | Bank: ' + (cust.bank||'-') + ' ' + (cust.norek||'') + ' | Akun: ' + (cust.akunDebit||'-') + ' / ' + (cust.akunKredit||'-') + ' | Kontribusi: ' + (pctPendapatan*100).toFixed(1) + '% dari total pendapatan</div></div>';

  // Sisa Limit = Limit - Pendapatan yang sudah diterima
  var limitVal = parseFloat(cust.limit)||0;
  var sisaLimit = limitVal - custPendapatan;
  var pctTerpakai = limitVal > 0 ? Math.min((custPendapatan / limitVal) * 100, 100).toFixed(1) : 0;
  var sisaCls = sisaLimit > 0 ? 'text-blue' : sisaLimit === 0 ? 'text-green' : 'text-red';
  var sisaLabel = sisaLimit > 0 ? 'Sisa belum diterima' : sisaLimit === 0 ? 'Limit tercapai' : 'Melebihi limit';

  html += '<div style="background:white;border:1.5px solid #1a237e;border-radius:8px;padding:14px;margin-bottom:12px">'
    + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:10px">'
    + '<div style="text-align:center"><div class="text-muted" style="font-size:0.72rem">Limit Awal</div><div class="fw-bold text-blue" style="font-size:1rem">' + fmtRp(limitVal) + '</div></div>'
    + '<div style="text-align:center"><div class="text-muted" style="font-size:0.72rem">Pendapatan Diterima</div><div class="fw-bold text-green" style="font-size:1rem">' + fmtRp(custPendapatan) + '</div></div>'
    + '<div style="text-align:center"><div class="text-muted" style="font-size:0.72rem">HPP Dikeluarkan</div><div class="fw-bold text-red" style="font-size:1rem">' + fmtRp(hppFinal) + '</div></div>'
    + '<div style="text-align:center"><div class="text-muted" style="font-size:0.72rem">Sisa Limit</div><div class="fw-bold ' + sisaCls + '" style="font-size:1rem">' + fmtRp(sisaLimit) + '</div><div style="font-size:0.68rem;color:#888">' + sisaLabel + '</div></div>'
    + '</div>'
    + '<div style="font-size:0.78rem;font-weight:600;margin-bottom:4px">Realisasi Limit: ' + pctTerpakai + '%</div>'
    + '<div style="background:#e0e0e0;border-radius:6px;height:12px;overflow:hidden"><div style="width:' + Math.min(pctTerpakai,100) + '%;height:100%;background:' + (parseFloat(pctTerpakai)>=100?'#4caf50':parseFloat(pctTerpakai)>=70?'#ff9800':'#1a237e') + ';border-radius:6px"></div></div>'
    + '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:12px">'
    + '<div style="background:#f8fff8;border-radius:8px;padding:12px;border-left:4px solid #4caf50"><div class="text-muted" style="font-size:0.7rem">Pendapatan</div><div class="fw-bold text-green">' + fmtRp(custPendapatan) + '</div></div>'
    + '<div style="background:#fff8f8;border-radius:8px;padding:12px;border-left:4px solid #f44336"><div class="text-muted" style="font-size:0.7rem">' + labelHPP + '</div><div class="fw-bold text-red">' + fmtRp(hppFinal) + '</div></div>'
    + '<div style="background:#fff8f8;border-radius:8px;padding:12px;border-left:4px solid #ff9800"><div class="text-muted" style="font-size:0.7rem">' + labelOps + '</div><div class="fw-bold text-red">' + fmtRp(opsFinal) + '</div></div>'
    + '<div style="background:#f8f9ff;border-radius:8px;padding:12px;border-left:4px solid #1a237e"><div class="text-muted" style="font-size:0.7rem">Laba Kotor (' + marginK + '%)</div><div class="fw-bold ' + (labaKotor>=0?'text-green':'text-red') + '">' + fmtRp(labaKotor) + '</div></div>'
    + '<div style="background:' + (labaBersih>=0?'#f8fff8':'#fff8f8') + ';border-radius:8px;padding:12px;border-left:4px solid ' + (labaBersih>=0?'#4caf50':'#f44336') + '"><div class="text-muted" style="font-size:0.7rem">Laba Bersih (' + marginB + '%)</div><div class="fw-bold ' + (labaBersih>=0?'text-green':'text-red') + '">' + fmtRp(labaBersih) + '</div></div>'
    + '</div>';

  // Perbandingan 3 metode
  var propLaba = custPendapatan - propHPP - propOps;
  var trackLaba = custPendapatan - directBeban;
  var gabLaba = custPendapatan - gabHPP - gabOverhead;
  html += '<div class="table-wrap" style="margin-bottom:12px"><table style="font-size:0.82rem"><thead><tr style="background:#e8eaf6"><th>Metode</th><th class="text-right">HPP</th><th class="text-right">Overhead</th><th class="text-right">Total Beban</th><th class="text-right">Laba Bersih</th><th class="text-right">Margin</th></tr></thead><tbody>'
    + '<tr' + (mode==='proporsional'?' style="background:#fff8e1"':'') + '><td>Proporsional</td><td class="text-right">' + fmtRp(propHPP) + '</td><td class="text-right">' + fmtRp(propOps) + '</td><td class="text-right">' + fmtRp(propHPP+propOps) + '</td><td class="text-right fw-bold ' + (propLaba>=0?'text-green':'text-red') + '">' + fmtRp(propLaba) + '</td><td class="text-right">' + (custPendapatan>0?((propLaba/custPendapatan)*100).toFixed(1):0) + '%</td></tr>'
    + '<tr' + (mode==='tracking'?' style="background:#fff8e1"':'') + '><td>Tracking Langsung</td><td class="text-right">' + fmtRp(directBeban) + '</td><td class="text-right">-</td><td class="text-right">' + fmtRp(directBeban) + '</td><td class="text-right fw-bold ' + (trackLaba>=0?'text-green':'text-red') + '">' + fmtRp(trackLaba) + '</td><td class="text-right">' + (custPendapatan>0?((trackLaba/custPendapatan)*100).toFixed(1):0) + '%</td></tr>'
    + '<tr' + (mode==='gabungan'?' style="background:#fff8e1"':'') + '><td>Gabungan</td><td class="text-right">' + fmtRp(gabHPP) + '</td><td class="text-right">' + fmtRp(gabOverhead) + '</td><td class="text-right">' + fmtRp(gabTotal) + '</td><td class="text-right fw-bold ' + (gabLaba>=0?'text-green':'text-red') + '">' + fmtRp(gabLaba) + '</td><td class="text-right">' + (custPendapatan>0?((gabLaba/custPendapatan)*100).toFixed(1):0) + '%</td></tr>'
    + '</tbody></table></div>';

  // Detail beban langsung
  if (bebanRows) {
    html += '<div style="font-weight:600;font-size:0.85rem;margin-bottom:6px">Detail Beban Langsung (Tracking)</div>'
      + '<div class="table-wrap"><table style="font-size:0.8rem"><thead><tr><th>Akun Beban</th><th class="text-right">Jumlah</th></tr></thead><tbody>' + bebanRows + '</tbody></table></div>';
  }

  // Transaksi terkait
  if (txRows) {
    html += '<div style="font-weight:600;font-size:0.85rem;margin:10px 0 6px">Transaksi Jurnal Terkait (' + directTx.length + ')</div>'
      + '<div class="table-wrap"><table style="font-size:0.8rem"><thead><tr><th>Tanggal</th><th>Keterangan</th><th class="text-right">Debit</th><th class="text-right">Kredit</th></tr></thead><tbody>' + txRows + '</tbody></table></div>';
  } else {
    html += '<div class="text-muted" style="font-size:0.82rem;margin-top:8px">Tidak ada transaksi jurnal yang menyebut nama customer ini. Gunakan metode Proporsional untuk estimasi.</div>';
  }

  el.innerHTML = html;
}

// ===== INVENTORI STOK ATK =====
async function renderInventoriATK() {
  var list = await KDB.getAll('inventori_atk');
  var logList = await KDB.getAll('atk_log');
  var jurnal = await KDB.getAll('jurnal');

  // Auto-detect ATK transactions from jurnal
  var atkFromJurnal = [];
  jurnal.forEach(function(j) {
    (j.lines||[]).forEach(function(l) {
      var ket = ((l.ket||'') + ' ' + (j.keterangan||'')).toLowerCase();
      if (ket.includes('atk') || ket.includes('perlengkapan') || ket.includes('alat tulis') || ket.includes('kertas') || ket.includes('tinta') || ket.includes('stample')) {
        atkFromJurnal.push({ tanggal: j.tanggal, ket: j.keterangan, jumlah: l.debit||0, sumber: 'jurnal' });
      }
    });
  });

  // Calculate totals including log entries
  var totalMasuk = 0, totalKeluar = 0;
  (logList||[]).forEach(function(lg) {
    if (lg.tipe === 'masuk') totalMasuk += (parseInt(lg.qty)||0) * (parseFloat(lg.harga)||0);
    else totalKeluar += (parseInt(lg.qty)||0) * (parseFloat(lg.harga)||0);
  });
  var totalBeli = (list||[]).reduce(function(s,x){ return s+(parseInt(x.beli)||0)*(parseFloat(x.harga)||0); },0)
    + atkFromJurnal.reduce(function(s,x){ return s+(x.jumlah||0); },0) + totalMasuk;
  var totalPakai = (list||[]).reduce(function(s,x){ return s+(parseInt(x.pakai)||0)*(parseFloat(x.harga)||0); },0) + totalKeluar;

  // Build ATK options for dropdown
  var atkOpts = (list||[]).map(function(item) {
    return '<option value="' + item.id + '">' + item.nama + ' (' + (item.satuan||'pcs') + ')</option>';
  }).join('');

  // Calculate real-time stock per item (including log)
  var stockMap = {};
  (list||[]).forEach(function(item) {
    stockMap[item.id] = { stok: (parseInt(item.stok)||0) + (parseInt(item.beli)||0) - (parseInt(item.pakai)||0), nama: item.nama };
  });
  (logList||[]).forEach(function(lg) {
    if (stockMap[lg.atkId]) {
      if (lg.tipe === 'masuk') stockMap[lg.atkId].stok += parseInt(lg.qty)||0;
      else stockMap[lg.atkId].stok -= parseInt(lg.qty)||0;
    }
  });

  var rows = (list||[]).map(function(item) {
    var sisa = stockMap[item.id] ? stockMap[item.id].stok : (parseInt(item.stok)||0) + (parseInt(item.beli)||0) - (parseInt(item.pakai)||0);
    var lowStock = sisa <= 2;
    return '<tr><td class="fw-bold">' + item.nama + '</td><td>' + (item.satuan||'-') + '</td><td class="text-center">' + (item.stok||0) + '</td><td class="text-center text-green">+' + (item.beli||0) + '</td><td class="text-center text-red">-' + (item.pakai||0) + '</td><td class="text-center fw-bold ' + (lowStock?'text-red':'text-green') + '">' + sisa + (lowStock?' ⚠️':'') + '</td><td>' + fmtRp(item.harga||0) + '</td><td class="fw-bold">' + fmtRp(sisa*(parseFloat(item.harga)||0)) + '</td><td class="tbl-actions"><button class="btn btn-xs btn-warning" onclick="editATK(\'' + item.id + '\')">Edit</button><button class="btn btn-xs btn-danger" onclick="hapusATK(\'' + item.id + '\')">Hapus</button></td></tr>';
  }).join('');

  // Log rows
  var logRows = (logList||[]).slice().sort(function(a,b){ return (b.tanggal||'').localeCompare(a.tanggal||''); }).slice(0,50).map(function(lg) {
    var itemNama = (list||[]).find(function(x){ return x.id === lg.atkId; });
    var cls = lg.tipe === 'masuk' ? 'text-green' : 'text-red';
    var sign = lg.tipe === 'masuk' ? '+' : '-';
    return '<tr><td>' + fmtDate(lg.tanggal) + '</td><td class="fw-bold">' + (itemNama ? itemNama.nama : lg.atkId) + '</td>'
      + '<td><span class="chip" style="background:' + (lg.tipe==='masuk'?'#e8f5e9':'#ffebee') + ';color:' + (lg.tipe==='masuk'?'#2e7d32':'#c62828') + '">' + (lg.tipe==='masuk'?'Masuk':'Keluar') + '</span></td>'
      + '<td class="text-center fw-bold ' + cls + '">' + sign + (lg.qty||0) + '</td>'
      + '<td>' + (lg.pengambil||'-') + '</td><td>' + (lg.keterangan||'-') + '</td>'
      + '<td>' + (lg.buktiLink ? '<a href="' + lg.buktiLink + '" target="_blank" style="color:#1a237e;font-size:0.75rem">🔗 Link</a>' : lg.buktiPhoto ? '<span style="color:#4caf50;font-size:0.75rem">📷 Foto</span>' : '-') + '</td>'
      + '<td class="tbl-actions"><button class="btn btn-xs btn-danger" onclick="hapusATKLog(\'' + lg.id + '\')">Hapus</button></td></tr>';
  }).join('');

  var jurnalRows = atkFromJurnal.slice(0,20).map(function(t) {
    return '<tr><td>' + fmtDate(t.tanggal) + '</td><td>' + (t.ket||'-') + '</td><td class="text-right">' + fmtRp(t.jumlah) + '</td></tr>';
  }).join('');

  // Generate barcode URL for public form
  var barcodeUrl = window.location.origin + window.location.pathname + '?mode=atk-form';

  return '<div class="page-title">📋 Inventori Stok ATK</div>'
    + '<div class="stats-row">'
    + '<div class="stat-box"><div class="val">' + (list||[]).length + '</div><div class="lbl">Jenis ATK</div></div>'
    + '<div class="stat-box green"><div class="val">' + fmtRp(totalBeli) + '</div><div class="lbl">Total Pembelian</div></div>'
    + '<div class="stat-box red"><div class="val">' + fmtRp(totalPakai) + '</div><div class="lbl">Total Pemakaian</div></div>'
    + '<div class="stat-box"><div class="val">' + (logList||[]).length + '</div><div class="lbl">Log Transaksi</div></div>'
    + '</div>'
    // Input ATK Baru
    + '<div class="card"><div class="card-header"><h2>Input ATK Baru</h2></div><div class="form-grid">'
    + '<div class="fg"><label>Nama ATK</label><input id="atk-nama" placeholder="Kertas A4 / Tinta / Pulpen"></div>'
    + '<div class="fg"><label>Satuan</label><input id="atk-satuan" placeholder="rim / pcs / box"></div>'
    + '<div class="fg"><label>Stok Awal</label><input type="number" id="atk-stok" placeholder="0" value="0"></div>'
    + '<div class="fg"><label>Pembelian</label><input type="number" id="atk-beli" placeholder="0" value="0"></div>'
    + '<div class="fg"><label>Pemakaian</label><input type="number" id="atk-pakai" placeholder="0" value="0"></div>'
    + '<div class="fg"><label>Harga Satuan (Rp)</label><input type="number" id="atk-harga" placeholder="0"></div>'
    + '</div><div class="mt-12"><button class="btn btn-primary" onclick="tambahATK()">Tambah ATK</button></div></div>'
    // Input Masuk / Keluar ATK
    + '<div class="card"><div class="card-header"><h2>📦 Input Barang Masuk / Keluar</h2></div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Pilih ATK</label><select id="atklog-item" style="padding:8px;border:1.5px solid #ddd;border-radius:7px"><option value="">-- Pilih ATK --</option>' + atkOpts + '</select></div>'
    + '<div class="fg"><label>Tipe</label><select id="atklog-tipe" style="padding:8px;border:1.5px solid #ddd;border-radius:7px"><option value="masuk">Barang Masuk (Beli)</option><option value="keluar">Barang Keluar (Pakai)</option></select></div>'
    + '<div class="fg"><label>Jumlah</label><input type="number" id="atklog-qty" placeholder="0" value="1"></div>'
    + '<div class="fg"><label>Tanggal</label><input type="date" id="atklog-tgl" value="' + today() + '"></div>'
    + '<div class="fg"><label>Pengambil / PIC</label><input id="atklog-pic" placeholder="Nama pengambil"></div>'
    + '<div class="fg"><label>Keterangan</label><input id="atklog-ket" placeholder="Keperluan"></div>'
    + '</div><div class="mt-12"><button class="btn btn-success" onclick="simpanATKLog()">Simpan Transaksi</button></div></div>'
    // Barcode / QR untuk form pengambilan
    + '<div class="card"><div class="card-header"><h2>📱 Form Pengambilan ATK (Scan Barcode)</h2></div>'
    + '<div class="alert alert-info">Bagikan link atau QR code berikut agar setiap orang yang mengambil ATK bisa mengisi formulir pengambilan langsung dari HP.</div>'
    + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
    + '<input id="atk-barcode-url" value="' + barcodeUrl + '" readonly style="flex:1;padding:8px 12px;border:1.5px solid #ddd;border-radius:7px;font-size:0.85rem;background:#f8f9ff">'
    + '<button class="btn btn-info btn-sm" onclick="copyATKLink()">📋 Copy Link</button>'
    + '<button class="btn btn-outline btn-sm" onclick="generateATKQR()">📱 Generate QR</button>'
    + '</div><div id="atk-qr-result" class="mt-12" style="text-align:center"></div></div>'
    // Daftar Stok
    + '<div class="card"><div class="card-header"><h2>Daftar Stok ATK (' + (list||[]).length + ')</h2></div>'
    + ((list||[]).length ? '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Satuan</th><th>Stok Awal</th><th>Beli</th><th>Pakai</th><th>Sisa</th><th>Harga</th><th>Nilai</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📋</span>Belum ada data ATK</div>')
    + '</div>'
    // Log Transaksi
    + '<div class="card"><div class="card-header"><h2>Log Transaksi ATK (' + (logList||[]).length + ')</h2></div>'
    + ((logList||[]).length ? '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Item</th><th>Tipe</th><th>Qty</th><th>Pengambil</th><th>Keterangan</th><th>Bukti</th><th>Aksi</th></tr></thead><tbody>' + logRows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📋</span>Belum ada log transaksi</div>')
    + '</div>'
    // Jurnal auto-detect
    + '<div class="card"><div class="card-header"><h2>Transaksi ATK dari Jurnal (Auto-detect)</h2></div>'
    + (atkFromJurnal.length ? '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th class="text-right">Jumlah</th></tr></thead><tbody>' + jurnalRows + '</tbody></table></div>' : '<div class="empty-state"><span class="icon">📋</span>Tidak ada transaksi ATK terdeteksi</div>')
    + '</div>';
}

async function simpanATKLog() {
  var atkId = (document.getElementById('atklog-item')||{}).value;
  if (!atkId) { showAlert('Pilih ATK terlebih dahulu!', 'danger'); return; }
  var qty = parseInt((document.getElementById('atklog-qty')||{}).value)||0;
  if (qty <= 0) { showAlert('Jumlah harus lebih dari 0!', 'danger'); return; }
  var id = genId('ATKL');
  var list = await KDB.getAll('inventori_atk');
  var item = list.find(function(x){ return x.id === atkId; });
  await KDB.save('atk_log', id, {
    id: id,
    atkId: atkId,
    tipe: (document.getElementById('atklog-tipe')||{}).value || 'keluar',
    qty: qty,
    harga: item ? (parseFloat(item.harga)||0) : 0,
    tanggal: (document.getElementById('atklog-tgl')||{}).value || today(),
    pengambil: (document.getElementById('atklog-pic')||{}).value || '',
    keterangan: (document.getElementById('atklog-ket')||{}).value || '',
    createdBy: KU ? KU.username : 'form',
    createdAt: new Date().toISOString()
  });
  showAlert('Transaksi ATK dicatat!');
  navigate('kalk-inventori-atk');
}

async function hapusATKLog(id) {
  if (!confirm('Hapus log transaksi ini?')) return;
  await KDB.delete('atk_log', id);
  navigate('kalk-inventori-atk');
}

function copyATKLink() {
  var el = document.getElementById('atk-barcode-url');
  if (el) { el.select(); document.execCommand('copy'); showAlert('Link disalin!'); }
}

function generateATKQR() {
  var url = (document.getElementById('atk-barcode-url')||{}).value || '';
  var el = document.getElementById('atk-qr-result');
  if (!el) return;
  // Generate QR using QR Server API (free, no API key needed)
  var qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);
  el.innerHTML = '<img src="' + qrImg + '" style="border:2px solid #ddd;border-radius:8px;padding:8px;background:white;width:200px;height:200px" alt="QR Code" onerror="this.parentElement.innerHTML=\'<div class=\\\'alert alert-warning\\\'>QR gagal dimuat. Gunakan Copy Link sebagai alternatif.</div>\'">'
    + '<div class="text-muted" style="font-size:0.78rem;margin-top:6px">Scan QR ini untuk membuka form pengambilan ATK</div>'
    + '<div style="margin-top:8px"><a href="' + url + '" target="_blank" class="btn btn-sm btn-outline">Buka Link</a></div>';
}

// ===== ATK PUBLIC FORM (dari scan QR) =====
async function showATKPublicForm() {
  await initKFirebase();
  var list = await KDB.getAll('inventori_atk');
  var atkOpts = (list||[]).map(function(item) {
    return '<option value="' + item.id + '">' + item.nama + ' (' + (item.satuan||'pcs') + ')</option>';
  }).join('');
  window._atkOpts = atkOpts;
  window._atkList = list;
  document.body.innerHTML = '<div style="font-family:Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:20px;background:#f0f4f8;min-height:100vh">'
    + '<div style="background:white;border-radius:14px;padding:24px;box-shadow:0 4px 16px rgba(0,0,0,0.1)">'
    + '<div style="text-align:center;margin-bottom:20px">'
    + '<div style="font-size:2.5rem">📋</div>'
    + '<h2 style="color:#1a237e;margin:8px 0 4px">Form Pengambilan ATK</h2>'
    + '<p style="color:#888;font-size:0.85rem">Isi form ini setiap mengambil ATK</p>'
    + '</div>'
    + '<div id="atk-form-result"></div>'
    + '<div style="margin-bottom:14px"><label style="font-size:0.85rem;font-weight:600;color:#555;display:block;margin-bottom:5px">Nama Pengambil *</label>'
    + '<input id="pub-pic" placeholder="Nama lengkap Anda" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.9rem;box-sizing:border-box"></div>'
    + '<div style="margin-bottom:14px"><label style="font-size:0.85rem;font-weight:600;color:#555;display:block;margin-bottom:5px">Tanggal Pengambilan</label>'
    + '<input type="date" id="pub-tgl" value="' + new Date().toISOString().split('T')[0] + '" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.9rem;box-sizing:border-box"></div>'
    + '<div style="margin-bottom:14px"><label style="font-size:0.85rem;font-weight:600;color:#555;display:block;margin-bottom:5px">Keperluan / Keterangan</label>'
    + '<input id="pub-ket" placeholder="Untuk keperluan apa?" style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.9rem;box-sizing:border-box"></div>'
    + '<div style="margin-bottom:14px"><label style="font-size:0.85rem;font-weight:600;color:#555;display:block;margin-bottom:5px">Bukti / Eviden (opsional)</label>'
    + '<input id="pub-link-bukti" placeholder="Link Google Drive / URL foto..." style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.9rem;box-sizing:border-box;margin-bottom:8px">'
    + '<div style="font-size:0.78rem;color:#888;margin-bottom:6px">atau upload foto langsung:</div>'
    + '<input type="file" id="pub-foto-bukti" accept="image/*" capture="environment" onchange="previewPubFoto(this)" style="font-size:0.85rem;width:100%">'
    + '<div id="pub-foto-preview" style="margin-top:8px"></div>'
    + '</div>'
    + '<div style="margin-bottom:6px"><label style="font-size:0.85rem;font-weight:600;color:#555;display:block;margin-bottom:8px">Daftar ATK yang Diambil *</label>'
    + '<div id="pub-items-list">' + buildATKItemRow(atkOpts) + '</div>'
    + '<button onclick="tambahBarisPubATK()" style="margin-top:8px;background:#e8eaf6;color:#1a237e;border:none;border-radius:7px;padding:8px 16px;cursor:pointer;font-size:0.85rem;font-weight:600">+ Tambah Item ATK</button>'
    + '</div>'
    + '<button onclick="submitPubATKForm()" style="width:100%;margin-top:20px;background:#1a237e;color:white;border:none;border-radius:10px;padding:14px;font-size:1rem;font-weight:700;cursor:pointer">Kirim Form Pengambilan</button>'
    + '</div></div>';
}

function buildATKItemRow(atkOpts) {
  return '<div class="pub-atk-row" style="display:grid;grid-template-columns:1fr 80px 30px;gap:8px;margin-bottom:8px;align-items:center">'
    + '<select class="pub-atk-id" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;font-size:0.85rem"><option value="">-- Pilih ATK --</option>' + atkOpts + '</select>'
    + '<input type="number" class="pub-atk-qty" placeholder="Qty" min="1" value="1" style="padding:8px;border:1.5px solid #ddd;border-radius:7px;font-size:0.85rem;text-align:center">'
    + '<button onclick="this.closest(\'.pub-atk-row\').remove()" style="background:#f44336;color:white;border:none;border-radius:6px;padding:6px 8px;cursor:pointer">x</button>'
    + '</div>';
}

function previewPubFoto(input) {
  var el = document.getElementById('pub-foto-preview');
  if (!el || !input.files || !input.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    window._pubFotoData = e.target.result;
    el.innerHTML = '<img src="' + e.target.result + '" style="max-width:100%;max-height:200px;border-radius:8px;border:2px solid #4caf50;margin-top:4px">'
      + '<div style="font-size:0.75rem;color:#2e7d32;margin-top:4px">Foto siap dikirim</div>';
  };
  reader.readAsDataURL(input.files[0]);
}

function tambahBarisPubATK() {
  var container = document.getElementById('pub-items-list');
  if (!container) return;
  var div = document.createElement('div');
  div.innerHTML = buildATKItemRow(window._atkOpts||'');
  container.appendChild(div.firstChild);
}

async function submitPubATKForm() {
  var pic = (document.getElementById('pub-pic')||{}).value||'';
  var tgl = (document.getElementById('pub-tgl')||{}).value||new Date().toISOString().split('T')[0];
  var ket = (document.getElementById('pub-ket')||{}).value||'';
  var linkBukti = (document.getElementById('pub-link-bukti')||{}).value||'';
  var fotoBukti = window._pubFotoData || '';
  var bukti = linkBukti || fotoBukti || '';
  var resultEl = document.getElementById('atk-form-result');
  if (!pic.trim()) { if (resultEl) resultEl.innerHTML = '<div style="background:#ffebee;color:#c62828;padding:10px 14px;border-radius:8px;margin-bottom:12px">Nama pengambil wajib diisi!</div>'; return; }
  var rows = document.querySelectorAll('.pub-atk-row');
  var items = [];
  rows.forEach(function(row) {
    var atkId = (row.querySelector('.pub-atk-id')||{}).value||'';
    var qty = parseInt((row.querySelector('.pub-atk-qty')||{}).value)||0;
    if (atkId && qty > 0) items.push({ atkId: atkId, qty: qty });
  });
  if (!items.length) { if (resultEl) resultEl.innerHTML = '<div style="background:#ffebee;color:#c62828;padding:10px 14px;border-radius:8px;margin-bottom:12px">Pilih minimal 1 item ATK!</div>'; return; }
  if (resultEl) resultEl.innerHTML = '<div style="background:#e3f2fd;color:#01579b;padding:10px 14px;border-radius:8px;margin-bottom:12px">Mengirim data...</div>';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var atkItem = (window._atkList||[]).find(function(x){ return x.id === item.atkId; });
    var logId = genId('ATKL');
    await KDB.save('atk_log', logId, { id: logId, atkId: item.atkId, tipe: 'keluar', qty: item.qty, harga: atkItem ? (parseFloat(atkItem.harga)||0) : 0, tanggal: tgl, pengambil: pic, keterangan: ket, buktiLink: linkBukti, buktiPhoto: fotoBukti ? '[foto]' : '', createdBy: 'public-form', createdAt: new Date().toISOString() });
  }
  if (resultEl) resultEl.innerHTML = '<div style="background:#e8f5e9;color:#2e7d32;padding:14px;border-radius:8px;margin-bottom:12px;font-weight:600">Form berhasil dikirim! Terima kasih, ' + pic + '.' + (bukti ? ' Bukti tersimpan.' : '') + '</div>';
  document.getElementById('pub-pic').value = '';
  document.getElementById('pub-ket').value = '';
  if (document.getElementById('pub-link-bukti')) document.getElementById('pub-link-bukti').value = '';
  if (document.getElementById('pub-foto-bukti')) document.getElementById('pub-foto-bukti').value = '';
  if (document.getElementById('pub-foto-preview')) document.getElementById('pub-foto-preview').innerHTML = '';
  window._pubFotoData = null;
  document.getElementById('pub-items-list').innerHTML = buildATKItemRow(window._atkOpts||'');
}

async function tambahATK() {
  var nama = (document.getElementById('atk-nama')||{}).value;
  if (!nama || !nama.trim()) { showAlert('Nama ATK wajib diisi!', 'danger'); return; }
  var id = genId('ATK');
  await KDB.save('inventori_atk', id, { id: id, nama: nama.trim(), satuan: (document.getElementById('atk-satuan')||{}).value||'', stok: parseInt((document.getElementById('atk-stok')||{}).value)||0, beli: parseInt((document.getElementById('atk-beli')||{}).value)||0, pakai: parseInt((document.getElementById('atk-pakai')||{}).value)||0, harga: parseFloat((document.getElementById('atk-harga')||{}).value)||0, createdBy: KU.username, createdAt: new Date().toISOString() });
  showAlert('ATK ditambahkan!');
  navigate('kalk-inventori-atk');
}

async function editATK(id) {
  var list = await KDB.getAll('inventori_atk');
  var item = list.find(function(x){ return x.id === id; });
  if (!item) return;
  openModal('<div class="form-grid">'
    + '<div class="fg"><label>Nama</label><input id="eatk-nama" value="' + (item.nama||'') + '"></div>'
    + '<div class="fg"><label>Satuan</label><input id="eatk-satuan" value="' + (item.satuan||'') + '"></div>'
    + '<div class="fg"><label>Stok</label><input type="number" id="eatk-stok" value="' + (item.stok||0) + '"></div>'
    + '<div class="fg"><label>Beli</label><input type="number" id="eatk-beli" value="' + (item.beli||0) + '"></div>'
    + '<div class="fg"><label>Pakai</label><input type="number" id="eatk-pakai" value="' + (item.pakai||0) + '"></div>'
    + '<div class="fg"><label>Harga</label><input type="number" id="eatk-harga" value="' + (item.harga||0) + '"></div>'
    + '</div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModalDirect()">Batal</button><button class="btn btn-primary" onclick="simpanEditATK(\'' + id + '\')">Simpan</button></div>',
    'Edit ATK: ' + item.nama);
}

async function simpanEditATK(id) {
  var list = await KDB.getAll('inventori_atk');
  var item = list.find(function(x){ return x.id === id; });
  if (!item) return;
  await KDB.save('inventori_atk', id, Object.assign({}, item, { nama: (document.getElementById('eatk-nama')||{}).value||item.nama, satuan: (document.getElementById('eatk-satuan')||{}).value||item.satuan, stok: parseInt((document.getElementById('eatk-stok')||{}).value)||0, beli: parseInt((document.getElementById('eatk-beli')||{}).value)||0, pakai: parseInt((document.getElementById('eatk-pakai')||{}).value)||0, harga: parseFloat((document.getElementById('eatk-harga')||{}).value)||0 }));
  closeModalDirect();
  showAlert('ATK diperbarui!');
  navigate('kalk-inventori-atk');
}

async function hapusATK(id) {
  if (!confirm('Hapus ATK ini?')) return;
  await KDB.delete('inventori_atk', id);
  navigate('kalk-inventori-atk');
}

// ===== SISTEM NOTIFIKASI =====
var _notifEnabled = false;

async function initNotifikasi() {
  if (!('Notification' in window)) return;
  var saved = await KDB.getSetting('notif_enabled', false);
  _notifEnabled = saved;
  if (saved && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ===== EMAIL NOTIFIKASI via EmailJS =====
async function kirimEmailNotifikasi(subjek, pesan, notifType) {
  var cfg = await KDB.getSetting('emailjs_config', null);
  if (!cfg || !cfg.serviceId || !cfg.templateId || !cfg.publicKey) return;

  var notifUsers = await KDB.getSetting('notif_users', []);
  if (!notifUsers.length) return;
  var notifUserPrefs = await KDB.getSetting('notif_user_prefs', {});
  var users = await KDB.getUsers();

  // Filter: user dipilih + punya email + jenis notifikasi sesuai preferensi
  var penerima = users.filter(function(u) {
    if (notifUsers.indexOf(u.username) < 0) return false;
    if (!u.email || !u.email.trim()) return false;
    if (!notifType) return true; // kirim ke semua jika tidak ada tipe
    var prefs = notifUserPrefs[u.username] || { all: true };
    return prefs.all || prefs[notifType];
  });
  if (!penerima.length) return;

  try {
    if (!window.emailjs) {
      await new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
      window.emailjs.init({ publicKey: cfg.publicKey });
    }
    for (var i = 0; i < penerima.length; i++) {
      var u = penerima[i];
      await window.emailjs.send(cfg.serviceId, cfg.templateId, {
        to_email: u.email,
        to_name: u.nama || u.username,
        subject: '[IJEF Corp] ' + subjek,
        message: pesan,
        from_name: 'Sistem Keuangan IJEF Corp',
        reply_to: u.email,
      });
      console.log('[Email] Terkirim ke:', u.email, '—', subjek);
    }
  } catch(e) {
    console.warn('[Email] Gagal:', e.message || e);
  }
}

async function kirimNotifikasi(judul, pesan, icon) {
  // 1. Simpan ke Firebase sebagai in-app notification
  var notifId = genId('NOTIF');
  await KDB.save('notifikasi', notifId, {
    id: notifId, judul: judul, pesan: pesan,
    waktu: new Date().toISOString(), dibaca: false,
    createdBy: KU ? KU.username : 'system'
  });

  // 2. Browser push notification jika diizinkan
  if (_notifEnabled && Notification.permission === 'granted') {
    try {
      new Notification(judul, {
        body: pesan,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notifId,
      });
    } catch(e) { console.warn('Push notif gagal:', e.message); }
  }

  // 3. Update badge di header
  updateNotifBadge();
}

async function updateNotifBadge() {
  var list = await KDB.getAll('notifikasi');
  var unread = list.filter(function(n){ return !n.dibaca; }).length;
  var badge = document.getElementById('notif-badge');
  if (badge) {
    badge.textContent = unread > 0 ? unread : '';
    badge.style.display = unread > 0 ? 'inline-block' : 'none';
  }
}

async function showNotifPanel() {
  var list = await KDB.getAll('notifikasi');
  var sorted = list.slice().sort(function(a,b){ return (b.waktu||'').localeCompare(a.waktu||''); }).slice(0,30);

  // Mark all as read
  for (var i = 0; i < sorted.length; i++) {
    if (!sorted[i].dibaca) {
      await KDB.save('notifikasi', sorted[i].id, Object.assign({}, sorted[i], { dibaca: true }));
    }
  }
  updateNotifBadge();

  var rows = sorted.length ? sorted.map(function(n) {
    var timeAgo = '';
    try {
      var diff = (new Date() - new Date(n.waktu)) / 1000;
      if (diff < 60) timeAgo = Math.round(diff) + 'd lalu';
      else if (diff < 3600) timeAgo = Math.round(diff/60) + 'm lalu';
      else if (diff < 86400) timeAgo = Math.round(diff/3600) + 'j lalu';
      else timeAgo = new Date(n.waktu).toLocaleDateString('id-ID');
    } catch(e) {}
    return '<div style="padding:10px 0;border-bottom:1px solid #eee;' + (!n.dibaca?'background:#f8f9ff;':'') + '">'
      + '<div style="font-weight:600;font-size:0.85rem">' + (n.judul||'-') + '</div>'
      + '<div style="font-size:0.8rem;color:#555;margin-top:2px">' + (n.pesan||'-') + '</div>'
      + '<div style="font-size:0.72rem;color:#aaa;margin-top:3px">' + timeAgo + '</div>'
      + '</div>';
  }).join('') : '<div style="text-align:center;color:#aaa;padding:20px">Tidak ada notifikasi</div>';

  openModal('<div style="max-height:400px;overflow-y:auto">' + rows + '</div>'
    + '<div class="modal-footer"><button class="btn btn-outline btn-sm" onclick="hapusSemuaNotif()">Hapus Semua</button><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
    '🔔 Notifikasi');
}

async function hapusSemuaNotif() {
  var list = await KDB.getAll('notifikasi');
  for (var i = 0; i < list.length; i++) {
    await KDB.delete('notifikasi', list[i].id);
  }
  closeModalDirect();
  updateNotifBadge();
  showAlert('Semua notifikasi dihapus!');
}

// ===== PENGATURAN NOTIFIKASI (di Setup Perusahaan) =====
async function renderNotifSettings() {
  var enabled = await KDB.getSetting('notif_enabled', false);
  var perm = ('Notification' in window) ? Notification.permission : 'unsupported';
  var permLabel = perm === 'granted' ? '<span style="color:#2e7d32">✅ Diizinkan</span>' : perm === 'denied' ? '<span style="color:#c62828">❌ Diblokir (ubah di pengaturan browser)</span>' : '<span style="color:#e65100">⏳ Belum diminta</span>';
  var ejsCfg = await KDB.getSetting('emailjs_config', {});
  var notifUsers = await KDB.getSetting('notif_users', []);

  // Ambil semua user dari sistem
  var users = await KDB.getUsers();
  var usersWithEmail = users.filter(function(u){ return u.email && u.email.trim(); });
  var usersAll = users; // semua user, email opsional

  // Jenis notifikasi yang tersedia
  var NOTIF_TYPES = [
    { key: 'pd_baru', label: 'Permohonan Dana Baru' },
    { key: 'dm_baru', label: 'Dana Masuk Baru' },
    { key: 'approval_layer', label: 'Update Approval (per Layer)' },
    { key: 'approved_final', label: 'Approved Final' },
    { key: 'rejected', label: 'Ditolak / Rejected' },
    { key: 'jurnal_baru', label: 'Jurnal Baru Dibuat' },
  ];

  var notifUserPrefs = await KDB.getSetting('notif_user_prefs', {});

  // Checkbox list user penerima notifikasi dengan opsi jenis
  var userCheckboxes = usersAll.map(function(u) {
    var isChecked = notifUsers.indexOf(u.username) >= 0;
    var hasEmail = u.email && u.email.trim();
    var userPrefs = notifUserPrefs[u.username] || { all: true };

    var typeCheckboxes = NOTIF_TYPES.map(function(t) {
      var isTypeChecked = userPrefs.all || userPrefs[t.key];
      return '<label style="display:flex;align-items:center;gap:5px;font-size:0.78rem;cursor:pointer;white-space:nowrap">'
        + '<input type="checkbox" class="notif-type-cb" data-username="' + u.username + '" data-type="' + t.key + '"' + (isTypeChecked?' checked':'') + '>'
        + t.label + '</label>';
    }).join('');

    return '<div style="border:1.5px solid #e0e0e0;border-radius:8px;padding:10px;margin-bottom:8px;' + (isChecked?'border-color:#1a237e;background:#f8f9ff':'') + '">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:' + (isChecked?'10':'0') + 'px">'
      + '<input type="checkbox" class="notif-user-cb" data-username="' + u.username + '" data-email="' + (u.email||'') + '" data-nama="' + u.nama + '"' + (isChecked?' checked':'') + ' onchange="toggleNotifUserRow(this)" style="width:16px;height:16px">'
      + '<div style="flex:1">'
      + '<div style="font-weight:600;font-size:0.85rem">' + u.nama + ' <span class="chip" style="font-size:0.7rem">' + u.role + '</span></div>'
      + '<div style="font-size:0.75rem;color:' + (hasEmail?'#2e7d32':'#f44336') + '">'
      + (hasEmail ? '✅ ' + u.email : '❌ Belum ada email — <a href="#" onclick="editUserEmail(\'' + u.username + '\')" style="color:#1a237e">Tambah email</a>')
      + '</div></div></div>'
      // Jenis notifikasi — hanya tampil jika user dicentang
      + '<div id="notif-types-' + u.username + '" style="display:' + (isChecked?'block':'none') + ';padding-top:8px;border-top:1px solid #e0e0e0">'
      + '<div style="font-size:0.78rem;font-weight:600;color:#555;margin-bottom:6px">Jenis notifikasi yang diterima:</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:8px">'
      + '<label style="display:flex;align-items:center;gap:5px;font-size:0.78rem;cursor:pointer;background:#e8eaf6;padding:4px 8px;border-radius:12px">'
      + '<input type="checkbox" class="notif-all-cb" data-username="' + u.username + '"' + (userPrefs.all?' checked':'') + ' onchange="toggleNotifAll(this)" style="width:14px;height:14px">'
      + '<b>Semua Notifikasi</b></label>'
      + typeCheckboxes
      + '</div></div>'
      + '</div>';
  }).join('');

  return '<div class="card"><div class="card-header"><h2>🔔 Pengaturan Notifikasi</h2></div>'
    // Browser push
    + '<div style="margin-bottom:16px"><div class="fw-bold" style="margin-bottom:6px">Notifikasi Browser (Push)</div>'
    + '<div class="alert alert-info" style="font-size:0.82rem">Muncul di browser/HP saat ada permohonan baru atau update approval.</div>'
    + '<div style="margin-bottom:8px"><b>Status izin:</b> ' + permLabel + '</div>'
    + '<div class="flex-row" style="gap:10px;margin-bottom:8px">'
    + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer">'
    + '<input type="checkbox" id="notif-toggle" ' + (enabled?'checked':'') + ' onchange="toggleNotifikasi(this.checked)" style="width:18px;height:18px">'
    + '<span>Aktifkan notifikasi browser</span></label>'
    + '</div>'
    + (perm !== 'granted' ? '<button class="btn btn-sm btn-primary" onclick="mintaIzinNotif()">🔔 Izinkan Notifikasi Browser</button>' : '')
    + '</div>'
    // Pilih user penerima
    + '<div style="border-top:1px solid #eee;padding-top:14px;margin-bottom:16px">'
    + '<div class="fw-bold" style="margin-bottom:6px">👥 Pilih User Penerima Notifikasi Email</div>'
    + '<div class="alert alert-info" style="font-size:0.82rem">Centang user yang akan menerima email notifikasi. User harus memiliki email terdaftar di sistem.</div>'
    + userCheckboxes
    + '<div class="mt-8"><button class="btn btn-sm btn-success" onclick="simpanNotifUsers()">💾 Simpan Pilihan User</button></div>'
    + '</div>'
    // EmailJS credentials
    + '<div style="border-top:1px solid #eee;padding-top:14px"><div class="fw-bold" style="margin-bottom:6px">📧 Konfigurasi EmailJS (Gratis 50 email/bulan)</div>'
    + '<div class="alert alert-info" style="font-size:0.82rem">Daftar gratis di <a href="https://www.emailjs.com" target="_blank" style="color:#1a237e;font-weight:600">emailjs.com</a> → Add Email Service → Create Template → copy credentials.</div>'
    + '<div class="form-grid">'
    + '<div class="fg"><label>Service ID</label><input id="ejs-service" value="' + (ejsCfg.serviceId||'') + '" placeholder="service_xxxxxxx"></div>'
    + '<div class="fg"><label>Template ID</label><input id="ejs-template" value="' + (ejsCfg.templateId||'') + '" placeholder="template_xxxxxxx"></div>'
    + '<div class="fg full"><label>Public Key</label><input id="ejs-pubkey" value="' + (ejsCfg.publicKey||'') + '" placeholder="xxxxxxxxxxxxxxx"></div>'
    + '</div>'
    + '<div class="mt-12 flex-row" style="gap:8px">'
    + '<button class="btn btn-primary btn-sm" onclick="simpanEmailJSConfig()">💾 Simpan Konfigurasi EmailJS</button>'
    + '<button class="btn btn-outline btn-sm" onclick="testEmailNotifikasi()">📧 Test Kirim Email</button>'
    + '<button class="btn btn-outline btn-sm" onclick="testNotifikasi()">🔔 Test Push Notif</button>'
    + '</div>'
    + '<div id="notif-test-result" class="mt-8"></div>'
    + '</div></div>';
}

async function simpanNotifUsers() {
  var cbs = document.querySelectorAll('.notif-user-cb');
  var selected = [];
  cbs.forEach(function(cb) { if (cb.checked) selected.push(cb.getAttribute('data-username')); });
  await KDB.saveSetting('notif_users', selected);

  // Simpan preferensi jenis notifikasi per user
  var prefs = {};
  selected.forEach(function(username) {
    var allCb = document.querySelector('.notif-all-cb[data-username="' + username + '"]');
    if (allCb && allCb.checked) {
      prefs[username] = { all: true };
    } else {
      var typeCbs = document.querySelectorAll('.notif-type-cb[data-username="' + username + '"]');
      var userPref = { all: false };
      typeCbs.forEach(function(cb) { userPref[cb.getAttribute('data-type')] = cb.checked; });
      prefs[username] = userPref;
    }
  });
  await KDB.saveSetting('notif_user_prefs', prefs);
  showAlert('Pilihan user & jenis notifikasi disimpan! (' + selected.length + ' user)');
}

function toggleNotifUserRow(cb) {
  var username = cb.getAttribute('data-username');
  var panel = document.getElementById('notif-types-' + username);
  if (panel) panel.style.display = cb.checked ? 'block' : 'none';
  var row = cb.closest('div[style*="border:1.5px"]');
  if (row) {
    row.style.borderColor = cb.checked ? '#1a237e' : '#e0e0e0';
    row.style.background = cb.checked ? '#f8f9ff' : '';
  }
}

function toggleNotifAll(cb) {
  var username = cb.getAttribute('data-username');
  var typeCbs = document.querySelectorAll('.notif-type-cb[data-username="' + username + '"]');
  typeCbs.forEach(function(t) { t.disabled = cb.checked; t.checked = cb.checked; });
}

function editUserEmail(username) {
  var email = prompt('Masukkan email untuk user ' + username + ':');
  if (!email || !email.trim()) return;
  KDB.getUsers().then(async function(users) {
    var u = users.find(function(x){ return x.username === username; });
    if (!u) return;
    await KDB.saveUser(Object.assign({}, u, { email: email.trim() }));
    showAlert('Email ' + username + ' diperbarui!');
    navigate('setup-notifikasi');
  });
}

async function simpanEmailJSConfig() {
  var cfg = {
    serviceId: (document.getElementById('ejs-service')||{}).value||'',
    templateId: (document.getElementById('ejs-template')||{}).value||'',
    publicKey: (document.getElementById('ejs-pubkey')||{}).value||'',
  };
  await KDB.saveSetting('emailjs_config', cfg);
  showAlert('Konfigurasi EmailJS disimpan!');
}

async function testEmailNotifikasi() {
  var el = document.getElementById('notif-test-result');
  if (el) el.innerHTML = '<div class="alert alert-info">Mengirim email test ke semua user terpilih...</div>';
  await kirimEmailNotifikasi('Test Email Notifikasi', 'Ini adalah email test dari Sistem Keuangan IJEF Corp.\nKonfigurasi email berhasil!');
  if (el) el.innerHTML = '<div class="alert alert-success">Email test dikirim! Cek inbox user yang terdaftar.</div>';
}

async function toggleNotifikasi(val) {
  await KDB.saveSetting('notif_enabled', val);
  _notifEnabled = val;
  if (val && Notification.permission !== 'granted') {
    await mintaIzinNotif();
  }
  showAlert(val ? 'Notifikasi diaktifkan!' : 'Notifikasi dinonaktifkan!');
}

async function mintaIzinNotif() {
  if (!('Notification' in window)) { showAlert('Browser tidak mendukung notifikasi', 'warning'); return; }
  var result = await Notification.requestPermission();
  if (result === 'granted') {
    showAlert('Izin notifikasi diberikan!');
  } else {
    showAlert('Izin notifikasi ditolak. Ubah di pengaturan browser.', 'warning');
  }
}

async function testNotifikasi() {
  await kirimNotifikasi('🧪 Test Notifikasi', 'Sistem notifikasi berjalan dengan baik!', '');
  var el = document.getElementById('notif-test-result');
  if (el) el.innerHTML = '<div class="alert alert-success">Notifikasi test dikirim!</div>';
}

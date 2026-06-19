// ===== FIREBASE - SISTEM KEUANGAN =====
// Reuses same Firebase project: test-kesehatan-ijef-corp-7c278

const KFB_CONFIG = {
  apiKey: "AIzaSyAWlNi_iBOWxZBD6E20aHOSrRpPsirDdOM",
  authDomain: "test-kesehatan-ijef-corp-7c278.firebaseapp.com",
  projectId: "test-kesehatan-ijef-corp-7c278",
  storageBucket: "test-kesehatan-ijef-corp-7c278.firebasestorage.app",
  messagingSenderId: "48180557823",
  appId: "1:48180557823:web:47ea8db8126737dbc0d9ca"
};

let kfbReady = false;
let kdb = null;
let kfs = null;

async function initKFirebase() {
  try {
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const fm = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    // Use separate app name to avoid conflict with health app
    const apps = getApps();
    const existing = apps.find(a => a.name === 'keuangan');
    const app = existing || initializeApp(KFB_CONFIG, 'keuangan');
    kdb = fm.getFirestore(app);
    kfs = { doc: fm.doc, setDoc: fm.setDoc, getDoc: fm.getDoc, collection: fm.collection,
            getDocs: fm.getDocs, deleteDoc: fm.deleteDoc, query: fm.query,
            where: fm.where, orderBy: fm.orderBy, addDoc: fm.addDoc, updateDoc: fm.updateDoc };
    kfbReady = true;
    console.log('[KFirebase] ✅ Connected');
    return true;
  } catch(e) {
    console.error('[KFirebase] ❌', e.message);
    return false;
  }
}

// ===== KDB - Keuangan Database Layer =====
const KDB = {

  // ---- USERS ----
  async saveUser(u) {
    _klset('ku_' + u.username, u);
    const list = _klget('kusers', []);
    const i = list.findIndex(x => x.username === u.username);
    if (i >= 0) list[i] = u; else list.push(u);
    _klset('kusers', list);
    if (kfbReady) {
      try { await kfs.setDoc(kfs.doc(kdb, 'k_users', u.username), u); } catch(e) { console.warn(e); }
    }
  },

  async getUsers() {
    if (kfbReady) {
      try {
        const snap = await kfs.getDocs(kfs.collection(kdb, 'k_users'));
        const users = snap.docs.map(d => d.data());
        if (users.length > 0) { _klset('kusers', users); return users; }
      } catch(e) { console.warn(e); }
    }
    return _klget('kusers', []);
  },

  async deleteUser(username) {
    const list = _klget('kusers', []).filter(u => u.username !== username);
    _klset('kusers', list);
    localStorage.removeItem('ku_' + username);
    if (kfbReady) {
      try { await kfs.deleteDoc(kfs.doc(kdb, 'k_users', username)); } catch(e) { console.warn(e); }
    }
  },

  // ---- GENERIC COLLECTION ----
  _recentSaves: {},

  async save(col, id, data) {
    data.id = id;
    _klset('k_' + col + '_' + id, data);
    // Also update the _all list cache to keep it in sync
    const all = _klget('k_' + col + '_all', []);
    const idx = all.findIndex(x => x.id === id || x._id === id);
    if (idx >= 0) { all[idx] = data; } else { all.push(data); }
    _klset('k_' + col + '_all', all);
    // Track dirty item to protect against Firebase read lag
    _klset('k_' + col + '_dirty_' + id, Date.now());
    if (!this._recentSaves[col]) this._recentSaves[col] = {};
    this._recentSaves[col][id] = Date.now();
    if (kfbReady) {
      try {
        await kfs.setDoc(kfs.doc(kdb, 'k_' + col, id), data);
        // Clear dirty flag after successful Firebase write
        localStorage.removeItem('k_' + col + '_dirty_' + id);
        if (this._recentSaves[col]) delete this._recentSaves[col][id];
      } catch(e) { console.warn(e); }
    }
  },

  async get(col, id) {
    // Check dirty flag - if item was recently saved locally, return local version
    var dirtyTime = _klget('k_' + col + '_dirty_' + id, 0);
    if (dirtyTime && (Date.now() - dirtyTime) < 10000) {
      var localItem = _klget('k_' + col + '_' + id, null);
      if (localItem) return localItem;
    }
    if (kfbReady) {
      try {
        const snap = await kfs.getDoc(kfs.doc(kdb, 'k_' + col, id));
        if (snap.exists()) { _klset('k_' + col + '_' + id, snap.data()); return snap.data(); }
      } catch(e) { console.warn(e); }
    }
    return _klget('k_' + col + '_' + id, null);
  },

  async getAll(col) {
    if (kfbReady) {
      try {
        const snap = await kfs.getDocs(kfs.collection(kdb, 'k_' + col));
        var items = snap.docs.map(d => d.data());
        // Merge locally-dirty items that Firebase may not have synced yet
        var now = Date.now();
        // Collect dirty IDs from in-memory tracking
        var dirtyIdSet = {};
        if (this._recentSaves[col]) {
          Object.keys(this._recentSaves[col]).forEach(function(id) { dirtyIdSet[id] = true; });
        }
        // Also scan localStorage for dirty keys to handle page reload scenario
        var dirtyPrefix = 'k_' + col + '_dirty_';
        for (var i = 0; i < localStorage.length; i++) {
          var lsKey = localStorage.key(i);
          if (lsKey && lsKey.indexOf(dirtyPrefix) === 0) {
            var dirtyId = lsKey.substring(dirtyPrefix.length);
            dirtyIdSet[dirtyId] = true;
          }
        }
        Object.keys(dirtyIdSet).forEach(function(dirtyId) {
          var dirtyTime = _klget('k_' + col + '_dirty_' + dirtyId, 0);
          if (dirtyTime && (now - dirtyTime) < 10000) {
            // Use local version for recently-saved items (within 10 seconds)
            var localItem = _klget('k_' + col + '_' + dirtyId, null);
            if (localItem) {
              var idx = items.findIndex(function(x) { return x.id === dirtyId || x._id === dirtyId; });
              if (idx >= 0) { items[idx] = localItem; } else { items.push(localItem); }
            }
          } else {
            // Dirty flag is old, clear it
            localStorage.removeItem('k_' + col + '_dirty_' + dirtyId);
            if (KDB._recentSaves[col]) delete KDB._recentSaves[col][dirtyId];
          }
        });
        _klset('k_' + col + '_all', items);
        return items;
      } catch(e) { console.warn(e); }
    }
    return _klget('k_' + col + '_all', []);
  },

  async delete(col, id) {
    // Remove from local list cache
    const all = _klget('k_' + col + '_all', []).filter(x => x.id !== id && x._id !== id);
    _klset('k_' + col + '_all', all);
    localStorage.removeItem('k_' + col + '_' + id);
    if (kfbReady) {
      try { await kfs.deleteDoc(kfs.doc(kdb, 'k_' + col, id)); } catch(e) { console.warn(e); }
    }
  },

  // ---- SETTINGS ----
  async saveSetting(key, val) {
    _klset('ksetting_' + key, val);
    if (kfbReady) {
      try { await kfs.setDoc(kfs.doc(kdb, 'k_settings', key), { value: val, key }); } catch(e) { console.warn(e); }
    }
  },

  async getSetting(key, def) {
    if (kfbReady) {
      try {
        const snap = await kfs.getDoc(kfs.doc(kdb, 'k_settings', key));
        if (snap.exists()) { const v = snap.data().value; _klset('ksetting_' + key, v); return v; }
      } catch(e) { console.warn(e); }
    }
    return _klget('ksetting_' + key, def);
  },
};

function _klget(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch(e) { return def; }
}
function _klset(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

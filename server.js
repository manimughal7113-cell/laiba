// ============================================================
// CSI Estimation - License Server
// Ye chhota server extension ke keys manage karta hai:
//   - Admin: naya key generate karna, list dekhna, revoke/activate karna
//   - Extension: apni saved key validate karna
// ============================================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'data.json');

// ZAROORI: Deploy karte waqt ye teen environment variables apna khud ka
// data set karein - warna default values use hongi (unsafe).
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@csiestimation.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-this-admin-secret-token';

// ---- Admin: email + password se login (extension ka Admin tab isay call karta hai) ----
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({ ok: true, token: ADMIN_SECRET });
  }
  return res.status(401).json({ ok: false, error: 'Email ya password ghalat hai.' });
});

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ keys: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function generateKey() {
  const part = () => crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CSI-${part()}-${part()}-${part()}`;
}

// ---- Admin: generate a new key ----
app.post('/api/admin/keys', requireAdmin, (req, res) => {
  const db = loadDb();
  const label = (req.body && req.body.label) || '';
  const key = generateKey();
  const entry = {
    key,
    label,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastCheckAt: null
  };
  db.keys.push(entry);
  saveDb(db);
  res.json({ ok: true, key: entry });
});

// ---- Admin: list all keys/users ----
app.get('/api/admin/keys', requireAdmin, (req, res) => {
  const db = loadDb();
  res.json({
    ok: true,
    keys: db.keys,
    totalUsers: db.keys.filter(k => k.status === 'active').length
  });
});

// ---- Admin: revoke a key (user ka access hata dena) ----
app.post('/api/admin/keys/revoke', requireAdmin, (req, res) => {
  const db = loadDb();
  const { key } = req.body || {};
  const entry = db.keys.find(k => k.key === key);
  if (!entry) return res.status(404).json({ error: 'Key not found' });
  entry.status = 'revoked';
  saveDb(db);
  res.json({ ok: true });
});

// ---- Admin: reactivate a key ----
app.post('/api/admin/keys/activate', requireAdmin, (req, res) => {
  const db = loadDb();
  const { key } = req.body || {};
  const entry = db.keys.find(k => k.key === key);
  if (!entry) return res.status(404).json({ error: 'Key not found' });
  entry.status = 'active';
  saveDb(db);
  res.json({ ok: true });
});

// ---- Public: extension apni key validate karta hai ----
app.post('/api/validate', (req, res) => {
  const db = loadDb();
  const { key } = req.body || {};
  const entry = db.keys.find(k => k.key === key);
  if (!entry || entry.status !== 'active') {
    return res.json({ valid: false });
  }
  entry.lastCheckAt = new Date().toISOString();
  saveDb(db);
  res.json({ valid: true });
});

app.get('/', (req, res) => {
  res.send('CSI License Server is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`License server running on port ${PORT}`));

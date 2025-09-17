// src/lib/patient.js
// Local-storage "backend" for demo purposes

const LS = {
  records: (addr) => `patient:records:${addr}`,
  requests: (addr) => `patient:doctorRequests:${addr}`,
  perms:   (addr) => `patient:perms:${addr}`, // approved doctors (may include expiresAt)
  logs:    (addr) => `patient:audit:${addr}`,
};

export function nowISO() { return new Date().toISOString(); }

function read(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* ---------------- Records ---------------- */
export function loadRecords(addr) {
  return read(LS.records(addr), []);
}
export function saveRecord(addr, rec) {
  const all = loadRecords(addr);
  // prevent duplicate by id
  if (!all.find(r => r.id === rec.id)) all.unshift(rec);
  write(LS.records(addr), all);
}

/* ---------------- Requests ---------------- */
export function loadDoctorRequests(addr) {
  return read(LS.requests(addr), []);
}
export function addDoctorRequest(patientAddr, doctorAddr, note = '') {
  const all = loadDoctorRequests(patientAddr);
  const item = { id: crypto.randomUUID(), doctor: doctorAddr, note, ts: Date.now() };
  all.unshift(item);
  write(LS.requests(patientAddr), all);
  return item;
}
export function removeDoctorRequest(patientAddr, id) {
  const all = loadDoctorRequests(patientAddr).filter(x => x.id !== id);
  write(LS.requests(patientAddr), all);
}

/* ---------------- Approvals (Perms) ---------------- */
export function loadPerms(addr) {
  return read(LS.perms(addr), []); // [{ doctor, since, expiresAt? }]
}
function savePerms(addr, arr) {
  write(LS.perms(addr), arr);
}

/**
 * Approve a doctor with optional expiry.
 * @param {string} patientAddr
 * @param {string} doctorAddr
 * @param {{ durationMs?: number, expiresAt?: number }} [opts]
 */
export function approveDoctor(patientAddr, doctorAddr, opts = {}) {
  const now = Date.now();
  const expiresAt = Number.isFinite(opts.expiresAt)
    ? opts.expiresAt
    : (opts.durationMs ? now + opts.durationMs : null);

  const list = loadPerms(patientAddr);
  const i = list.findIndex(p => p.doctor.toLowerCase() === doctorAddr.toLowerCase());

  const entry = { doctor: doctorAddr, since: now };
  if (expiresAt) entry.expiresAt = expiresAt;

  if (i >= 0) list[i] = entry; else list.unshift(entry);
  savePerms(patientAddr, list);
}

export function revokeDoctor(patientAddr, doctorAddr) {
  const next = loadPerms(patientAddr).filter(
    x => x.doctor.toLowerCase() !== doctorAddr.toLowerCase()
  );
  savePerms(patientAddr, next);
}

/** Remove any expired approvals. Returns the number removed. */
export function removeExpiredPerms(patientAddr) {
  const now = Date.now();
  const before = loadPerms(patientAddr);
  const after = before.filter(p => !p.expiresAt || p.expiresAt > now);
  if (after.length !== before.length) savePerms(patientAddr, after);
  return before.length - after.length;
}

/* ---------------- Audit ---------------- */
export function loadAudit(addr) {
  return read(LS.logs(addr), []);
}
export function addAudit(addr, action, meta = {}) {
  const all = loadAudit(addr);
  all.unshift({ id: crypto.randomUUID(), action, meta, at: nowISO() });
  write(LS.logs(addr), all);
}

/* ---------------- Demo Seeder ---------------- */
export function seedDoctorRequestForDemo(patientAddr) {
  const have = loadDoctorRequests(patientAddr);
  if (have.length === 0) {
    addDoctorRequest(
      patientAddr,
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      'Requesting access to your ECG report.'
    );
  }
}

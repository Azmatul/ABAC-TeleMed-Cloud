// Local helpers for the Doctor panel (demo/localStorage only)

import {
  loadPerms as _loadPermsForPatient,
  loadRecords as _loadRecordsForPatient,
  addDoctorRequest,
  addAudit,
} from './patient';

// Storage for doctor's own local notes (e.g., prescriptions)
const LSK = {
  rxForPair: (doctor, patient) => `doctor:rx:${doctor.toLowerCase()}:${patient.toLowerCase()}`
};

function read(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/** Request access: create a request entry in the patient's inbox */
export function requestAccess(patientAddr, doctorAddr, note='') {
  if (!patientAddr || !doctorAddr) throw new Error('Missing addresses');
  return addDoctorRequest(patientAddr, doctorAddr, note);
}

/** Scan all patients' approval lists to find who approved this doctor (demo only). */
export function listApprovedPatientsForDoctor(doctorAddr) {
  if (!doctorAddr) return [];
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith('patient:perms:')) continue;
    const patient = k.split(':').pop();
    const perms = read(k, []);
    const ok = perms.find(
      (p) => p.doctor && p.doctor.toLowerCase() === doctorAddr.toLowerCase()
    );
    if (ok) {
      out.push({ patient, since: ok.since });
    }
  }
  // sort by most recent approval first
  out.sort((a,b) => (b.since||0) - (a.since||0));
  return out;
}

/** Load a patient's records (read-only view for doctor) */
export function loadPatientRecords(patientAddr) {
  return _loadRecordsForPatient(patientAddr || '');
}

/** Prescriptions — stored per (doctor, patient) and mirrored to patient's audit */
export function loadPrescriptions(doctorAddr, patientAddr) {
  if (!doctorAddr || !patientAddr) return [];
  return read(LSK.rxForPair(doctorAddr, patientAddr), []);
}
export function savePrescription(doctorAddr, patientAddr, rx) {
  if (!doctorAddr || !patientAddr) throw new Error('Missing addresses');
  const key = LSK.rxForPair(doctorAddr, patientAddr);
  const all = read(key, []);
  const item = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    ...rx,                // { drug, dose, instructions }
    doctor: doctorAddr,
    patient: patientAddr,
  };
  all.unshift(item);
  write(key, all);
  // also push into patient audit so they can see it
  addAudit(patientAddr, 'PRESCRIPTION', {
    doctor: doctorAddr,
    drug: rx.drug,
    dose: rx.dose,
  });
  return item;
}


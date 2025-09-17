// src/pages/DoctorDashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import ShareAddress from '../components/ShareAddress';
import { makeClients } from '../lib/contract';
import {
  requestAccess,
  listApprovedPatientsForDoctor,
  loadPatientRecords,
  loadPrescriptions,
  savePrescription,
} from '../lib/doctor';

function useCurrentAddress() {
  const { walletClient } = useMemo(() => makeClients(), []);
  const [addr, setAddr] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        if (walletClient) {
          const addrs = await walletClient.getAddresses();
          setAddr(addrs?.[0] || null);
        } else if (window.ethereum) {
          const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAddr(accs?.[0] || null);
        }
      } catch {}
    })();
  }, [walletClient]);
  return addr;
}

function MenuItem({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-xl mb-1 transition ${active ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
    >
      {label}
    </button>
  );
}

export default function DoctorDashboard() {
  const doctor = useCurrentAddress();

  const [tab, setTab] = useState('request'); // 'request' | 'approved' | 'records' | 'rx'
  const [approved, setApproved] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  const [reqPatient, setReqPatient] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [busyReq, setBusyReq] = useState(false);

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [rxList, setRxList] = useState([]);
  const [rxPatient, setRxPatient] = useState('');
  const [rx, setRx] = useState({ drug: '', dose: '', instructions: '' });
  const [busyRx, setBusyRx] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!doctor) return;
    const list = listApprovedPatientsForDoctor(doctor);
    setApproved(list);
    if (list.length && !selectedPatient) setSelectedPatient(list[0].patient);
  }, [doctor]);

  useEffect(() => {
    if (!selectedPatient) { setRecords([]); return; }
    setRecordsLoading(true);
    setTimeout(() => {
      setRecords(loadPatientRecords(selectedPatient));
      setRecordsLoading(false);
    }, 0);
  }, [selectedPatient]);

  useEffect(() => {
    if (!doctor || !rxPatient) { setRxList([]); return; }
    setRxList(loadPrescriptions(doctor, rxPatient));
  }, [doctor, rxPatient]);

  async function submitRequest() {
    if (!doctor) { alert('Connect wallet first'); return; }
    if (!reqPatient) { alert('Enter patient address'); return; }
    setBusyReq(true);
    try {
      requestAccess(reqPatient, doctor, reqNote);
      alert('Request sent to patient.');
      setReqNote(''); setReqPatient('');
    } catch (e) { console.error(e); alert('Failed to send request.'); }
    finally { setBusyReq(false); }
  }

  function viewRecordsFor(p) { setSelectedPatient(p); setTab('records'); }

  function copyAskShare(rec) {
    const txt = `Hi, please share decryption info for record "${rec.name}" (id:${rec.id}).`;
    navigator.clipboard.writeText(txt).then(() => alert('Request text copied.')).catch(()=>alert('Copy failed'));
  }

  function downloadEncrypted(rec) {
    const blob = new Blob([Uint8Array.from(atob(rec.cipherB64), c => c.charCodeAt(0))], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${rec.name}.enc`; a.click();
    URL.revokeObjectURL(url);
  }

  async function submitRx() {
    if (!doctor) { alert('Connect wallet first'); return; }
    if (!rxPatient) { alert('Select a patient'); return; }
    if (!rx.drug || !rx.dose) { alert('Drug and dose are required'); return; }
    setBusyRx(true);
    try {
      savePrescription(doctor, rxPatient, rx);
      setRxList(loadPrescriptions(doctor, rxPatient));
      setRx({ drug:'', dose:'', instructions:'' });
      alert('Prescription saved (patient sees it in audit).');
    } catch (e) {
      console.error(e);
      alert('Failed to save prescription.');
    } finally { setBusyRx(false); }
  }

  const counts = { approved: approved.length, records: records.length, rx: rxList.length };

  const SectionRequest = (
    <Card title="Request Patient Access">
      <div className="grid gap-3">
        <input value={reqPatient} onChange={e=>setReqPatient(e.target.value)} placeholder="Patient address (0x...)" className="w-full border rounded-xl p-2 font-mono" />
        <textarea value={reqNote} onChange={e=>setReqNote(e.target.value)} placeholder="Note (optional)" className="w-full border rounded-xl p-2" rows={3} />
        <div><button className="btn btn-primary" onClick={submitRequest} disabled={busyReq}>{busyReq ? 'Sending…' : 'Send Request'}</button></div>
        <div className="text-xs text-slate-500">This adds a request to the patient’s inbox (local-storage demo).</div>
      </div>
    </Card>
  );

  const SectionApproved = (
    <Card title="Approved Patients">
      {approved.length === 0 ? (
        <div className="text-slate-500 text-sm">No patients have approved you yet.</div>
      ) : (
        <div className="space-y-2">
          {approved.map(p => (
            <div key={p.patient} className="flex items-center justify-between border rounded-xl p-3">
              <div>
                <div className="font-mono text-sm">{p.patient}</div>
                <div className="text-xs text-slate-500">since {new Date(p.since).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={() => viewRecordsFor(p.patient)}>View Records</button>
                <button className="btn btn-outline" onClick={() => { setRxPatient(p.patient); setTab('rx'); }}>Prescribe</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const SectionRecords = (
    <Card title="Patient Records">
      {!selectedPatient ? (
        <div className="text-slate-500 text-sm">Select a patient from “Approved” to view records.</div>
      ) : recordsLoading ? (
        <div className="text-slate-500 text-sm">Loading…</div>
      ) : records.length === 0 ? (
        <div className="text-slate-500 text-sm">No records found for this patient.</div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 -mb-1">Patient: <span className="font-mono">{selectedPatient}</span></div>
          {records.map(rec => (
            <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-xl p-3 gap-2">
              <div className="text-sm">
                <div className="font-medium">{rec.name}</div>
                <div className="text-xs text-slate-500">
                  id: <span className="font-mono">{rec.id.slice(0,10)}…</span> • {(rec.size/1024).toFixed(1)} KB • {new Date(rec.createdAt).toLocaleString()} • encrypted
                </div>
                {rec.metaNote && <div className="text-xs mt-1">{rec.metaNote}</div>}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={() => copyAskShare(rec)}>Ask Share</button>
                <button className="btn btn-outline" onClick={() => downloadEncrypted(rec)}>Download .enc</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const SectionRx = (
    <Card title="Prescriptions">
      <div className="grid gap-3">
        <select value={rxPatient} onChange={e=>setRxPatient(e.target.value)} className="w-full border rounded-xl p-2">
          <option value="">Select patient…</option>
          {approved.map(p => <option key={p.patient} value={p.patient}>{p.patient}</option>)}
        </select>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={rx.drug} onChange={e=>setRx(prev=>({ ...prev, drug: e.target.value }))} placeholder="Drug (e.g., Amoxicillin)" className="w-full border rounded-xl p-2" />
          <input value={rx.dose} onChange={e=>setRx(prev=>({ ...prev, dose: e.target.value }))} placeholder="Dose (e.g., 500mg bid)" className="w-full border rounded-xl p-2" />
        </div>
        <textarea value={rx.instructions} onChange={e=>setRx(prev=>({ ...prev, instructions: e.target.value }))} placeholder="Instructions (optional)" className="w-full border rounded-xl p-2" rows={3} />
        <div><button className="btn btn-primary" onClick={submitRx} disabled={busyRx}>{busyRx ? 'Saving…' : 'Add Prescription'}</button></div>

        <div className="mt-2">
          {rxPatient ? (
            <>
              <div className="text-xs text-slate-500 mb-2">Previous prescriptions for <span className="font-mono">{rxPatient}</span></div>
              {rxList.length === 0 ? (
                <div className="text-slate-500 text-sm">None yet.</div>
              ) : (
                <div className="space-y-2">
                  {rxList.map(item => (
                    <div key={item.id} className="border rounded-xl p-3">
                      <div className="text-xs text-slate-500">{new Date(item.at).toLocaleString()}</div>
                      <div className="text-sm"><b>{item.drug}</b> — {item.dose}</div>
                      {item.instructions && <div className="text-sm">{item.instructions}</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-500 text-sm">Choose a patient to see prescriptions.</div>
          )}
        </div>
      </div>
    </Card>
  );

  const pane = { request: SectionRequest, approved: SectionApproved, records: SectionRecords, rx: SectionRx }[tab];

  return (
    <div className="w-full">
      <div className="grid items-start gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="card h-max sticky top-20 p-0 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-center">
            <span className="font-semibold">Doctor</span>
          </div>
          <nav className="p-2">
            <MenuItem active={tab==='request'}  onClick={()=>setTab('request')}  label="Request Access" />
            <MenuItem active={tab==='approved'} onClick={()=>setTab('approved')} label={`Approved (${counts.approved})`} />
            <MenuItem active={tab==='records'}  onClick={()=>setTab('records')}  label={`Records (${counts.records})`} />
            <MenuItem active={tab==='rx'}       onClick={()=>setTab('rx')}       label={`Prescriptions (${counts.rx})`} />
          </nav>
        </aside>

        <section className="space-y-6 w-full h-full">{pane}</section>

        <ShareAddress open={shareOpen} onClose={() => setShareOpen(false)} value={doctor || ''} title="Share Doctor Address" />
      </div>
    </div>
  );
}

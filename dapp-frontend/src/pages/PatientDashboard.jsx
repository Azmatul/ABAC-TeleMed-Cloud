// src/pages/PatientDashboard.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/Card';
import {
  loadRecords, saveRecord,
  loadDoctorRequests, removeDoctorRequest,
  approveDoctor, revokeDoctor, loadPerms,
  loadAudit, addAudit, seedDoctorRequestForDemo,
  removeExpiredPerms
} from '../lib/patient';
import { encryptFile, decryptToBlob } from '../lib/crypto';
import { makeClients } from '../lib/contract';

function useCurrentAddress() {
  const { walletClient } = useMemo(() => makeClients(), []);
  const [addr, setAddr] = useState(null);
  useEffect(() => {
    (async () => {
      if (walletClient) {
        const addrs = await walletClient.getAddresses();
        setAddr(addrs?.[0] || null);
      } else if (window.ethereum) {
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddr(accs?.[0] || null);
      }
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

// show "45m", "3h", "2d"
function fmtRemaining(ms) {
  if (ms <= 0) return 'expired';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function PatientDashboard() {
  const address = useCurrentAddress();

  const [records, setRecords] = useState([]);
  const [requests, setRequests] = useState([]);
  const [perms, setPerms] = useState([]);
  const [audit, setAudit] = useState([]);
  const [busy, setBusy] = useState(false);

  const fileRef = useRef(null);
  const [pwd, setPwd] = useState('');
  const [note, setNote] = useState('');

  // timed approval settings
  const DEFAULT_APPROVAL_MS = 24 * 60 * 60 * 1000; // 24h
  const [tab, setTab] = useState('upload');
  const counts = { records: records.length, requests: requests.length, approved: perms.length, audit: audit.length };

  // Tick to refresh countdown display
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!address) return;

    // Initial loads
    setRecords(loadRecords(address));
    setRequests(loadDoctorRequests(address));
    setPerms(loadPerms(address));
    setAudit(loadAudit(address));

    // Demo seed
    seedDoctorRequestForDemo(address);
    setRequests(loadDoctorRequests(address));

    // Sweep expired immediately and on an interval
    removeExpiredPerms(address);
    setPerms(loadPerms(address));

    const sweepId = setInterval(() => {
      const removed = removeExpiredPerms(address);
      if (removed > 0) setPerms(loadPerms(address));
    }, 30 * 1000); // every 30s

    // Update countdown labels every 1s
    const tickId = setInterval(() => setTick(t => t + 1), 1000);

    return () => { clearInterval(sweepId); clearInterval(tickId); };
  }, [address]);

  async function onUpload() {
    const file = fileRef.current?.files?.[0];
    if (!address) { alert('Connect wallet first'); return; }
    if (!file) { alert('Choose a file'); return; }
    setBusy(true);
    try {
      const enc = await encryptFile(file, pwd || null);
      const rec = {
        id: enc.id, name: enc.name, type: enc.type, size: enc.size,
        ivB64: enc.ivB64, cipherB64: enc.cipherB64,
        keyOrigin: enc.keyOrigin, saltB64: enc.saltB64,
        createdAt: Date.now(), metaNote: note || '',
      };
      saveRecord(address, rec);
      addAudit(address, 'UPLOAD', { id: rec.id, name: rec.name, bytes: rec.size, origin: rec.keyOrigin });
      setRecords(loadRecords(address));
      setAudit(loadAudit(address));
      fileRef.current.value = ''; setNote('');
      alert('Encrypted & saved locally (demo).');
      setTab('records');
    } catch (e) { console.error(e); alert('Failed to encrypt/upload.'); }
    finally { setBusy(false); }
  }

  async function onView(rec) {
    const pass = rec.keyOrigin === 'pwd' ? (prompt('Enter encryption password…') || '') : '';
    try {
      const blob = await decryptToBlob(rec, pass || null);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      addAudit(address, 'VIEW', { id: rec.id, name: rec.name });
      setAudit(loadAudit(address));
    } catch (e) { console.error(e); alert('Decrypt failed — wrong password/wallet or corrupted data.'); }
  }

  function onDownload(rec) {
    const blob = new Blob([Uint8Array.from(atob(rec.cipherB64), c => c.charCodeAt(0))], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${rec.name}.enc`; a.click();
    URL.revokeObjectURL(url);
  }

  function copyShare(rec) {
    const payload = JSON.stringify({ id: rec.id, saltB64: rec.saltB64, keyOrigin: rec.keyOrigin, name: rec.name, type: rec.type });
    navigator.clipboard.writeText(payload);
    addAudit(address, 'COPY_SHARE', { id: rec.id });
    setAudit(loadAudit(address));
    alert('Copied share payload to clipboard.');
  }

  function approve(req) {
    // Approve with an expiry (24h here; change as you wish)
    approveDoctor(address, req.doctor, { durationMs: DEFAULT_APPROVAL_MS });
    removeDoctorRequest(address, req.id);
    addAudit(address, 'APPROVE_DOCTOR', { doctor: req.doctor, durationMs: DEFAULT_APPROVAL_MS });
    setPerms(loadPerms(address));
    setRequests(loadDoctorRequests(address));
  }
  function reject(req) {
    removeDoctorRequest(address, req.id);
    addAudit(address, 'REJECT_DOCTOR', { doctor: req.doctor });
    setRequests(loadDoctorRequests(address));
  }
  function unshare(p) {
    revokeDoctor(address, p.doctor);
    addAudit(address, 'REVOKE_DOCTOR', { doctor: p.doctor });
    setPerms(loadPerms(address));
  }

  const SectionUpload = (
    <Card title="Upload Encrypted Record">
      <div className="grid gap-3">
        <input ref={fileRef} type="file" className="w-full border rounded-xl p-2" />
        <input value={pwd} onChange={e=>setPwd(e.target.value)} type="password" placeholder="Password (optional — uses wallet if empty)" className="w-full border rounded-xl p-2" />
        <input value={note} onChange={e=>setNote(e.target.value)} type="text" placeholder="Optional note (e.g., 'ECG report May 2025')" className="w-full border rounded-xl p-2" />
        <div className="text-xs text-slate-500">AES-GCM encrypted locally. Demo stores in browser.</div>
        <div><button disabled={busy} onClick={onUpload} className="btn btn-primary">{busy ? 'Encrypting…' : 'Encrypt & Save'}</button></div>
      </div>
    </Card>
  );

  const SectionRecords = (
    <Card title="My Records">
      {records.length === 0 ? (
        <div className="text-slate-500 text-sm">No records yet.</div>
      ) : (
        <div className="space-y-3">
          {records.map(rec => (
            <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-xl p-3 gap-2">
              <div className="text-sm">
                <div className="font-medium">{rec.name}</div>
                <div className="text-xs text-slate-500">
                  id: <span className="font-mono">{rec.id.slice(0,10)}…</span> • {(rec.size/1024).toFixed(1)} KB • {new Date(rec.createdAt).toLocaleString()}
                </div>
                {rec.metaNote && <div className="text-xs mt-1">{rec.metaNote}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onView(rec)} className="btn btn-outline">View</button>
                <button onClick={() => onDownload(rec)} className="btn btn-outline">Download .enc</button>
                <button onClick={() => copyShare(rec)} className="btn btn-outline">Copy Share</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const SectionRequests = (
    <Card title="Doctor Access Requests">
      {requests.length === 0 ? (
        <div className="text-slate-500 text-sm">No pending requests.</div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="flex items-center justify-between border rounded-xl p-3">
              <div className="text-sm">
                <div className="font-mono">{req.doctor}</div>
                {req.note && <div className="text-xs mt-1">{req.note}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(req)} className="btn btn-primary">Approve 24h</button>
                <button onClick={() => reject(req)} className="btn btn-outline">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const SectionApproved = (
    <Card title="Approved Doctors">
      {perms.length === 0 ? (
        <div className="text-slate-500 text-sm">No approved doctors.</div>
      ) : (
        <div className="space-y-3">
          {perms.map(p => {
            const remaining = p.expiresAt ? p.expiresAt - Date.now() : null;
            return (
              <div key={p.doctor} className="flex items-center justify-between border rounded-xl p-3">
                <div className="text-sm">
                  <div className="font-mono">{p.doctor}</div>
                  <div className="text-xs text-slate-500">
                    since {new Date(p.since).toLocaleString()}
                    {p.expiresAt && <> • expires in {fmtRemaining(remaining)}</>}
                  </div>
                </div>
                <button onClick={() => unshare(p)} className="btn btn-outline">Revoke</button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );

  const SectionAudit = (
    <Card title="Audit Log">
      {audit.length === 0 ? (
        <div className="text-slate-500 text-sm">No activity yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {audit.map(a => (
                <tr key={a.id} className="border-t">
                  <td className="py-2 whitespace-nowrap">{new Date(a.at).toLocaleString()}</td>
                  <td className="py-2 font-medium">{a.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );

  const pane = { upload: SectionUpload, records: SectionRecords, requests: SectionRequests, approved: SectionApproved, audit: SectionAudit }[tab];

  return (
    <div className="w-full">
      <div className="grid items-start gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="card h-max sticky top-20 p-0 overflow-hidden">
          <div className="p-4 border-b font-semibold">Patient</div>
          <nav className="p-2">
            <MenuItem active={tab==='upload'}   onClick={()=>setTab('upload')}   label="Upload" />
            <MenuItem active={tab==='records'}  onClick={()=>setTab('records')}  label={`Records (${counts.records})`} />
            <MenuItem active={tab==='requests'} onClick={()=>setTab('requests')} label={`Requests (${counts.requests})`} />
            <MenuItem active={tab==='approved'} onClick={()=>setTab('approved')} label={`Approved (${counts.approved})`} />
            <MenuItem active={tab==='audit'}    onClick={()=>setTab('audit')}    label={`Audit (${counts.audit})`} />
          </nav>
        </aside>

        {/* Right content */}
        <section className="space-y-6 w-full h-full">{pane}</section>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import ShareAddress from '../components/ShareAddress';
import { listRequests, removeRequest } from '../lib/registry';
import { makeClients, getAbacContract, getRoleName, grantRoleByName, ensureCorrectChain, CHAIN_NAME } from '../lib/contract';

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

export default function AdminPanel() {
  const address = useCurrentAddress();
  const { publicClient, walletClient } = useMemo(() => makeClients(), []);

  const [tab, setTab] = useState('pending'); // 'pending' | 'users' | 'contract'
  const [busy, setBusy] = useState('');
  const [items, setItems] = useState([]);

  const [shareOpen, setShareOpen] = useState(false);

  const [queryAddr, setQueryAddr] = useState('');
  const [queryRole, setQueryRole] = useState('');
  const [grantAddr, setGrantAddr] = useState('');
  const [grantRole, setGrantRole] = useState('PATIENT');

  useEffect(() => { setItems(listRequests()); }, []);

  async function refreshRole(addr) {
    const c = getAbacContract(null, walletClient, publicClient);
    const rn = await getRoleName(c, addr);
    setQueryRole(rn);
  }

  async function approve(item) {
    if (!walletClient) { alert('Connect MetaMask as Admin'); return; }
    try {
      setBusy(item.id);
      const [account] = await walletClient.getAddresses();
      if (!account) throw new Error('No account');

      await ensureCorrectChain(walletClient);
      const c = getAbacContract(null, walletClient, publicClient);
      await grantRoleByName(c, item.role, item.address, { account });

      removeRequest(item.id);
      setItems(listRequests());
      alert('Approved & granted on-chain.');
    } catch (e) {
      console.error(e);
      alert('Grant failed. Check network & admin wallet.');
    } finally {
      setBusy('');
    }
  }

  function reject(item) {
    removeRequest(item.id);
    setItems(listRequests());
  }

  async function handleQuery() {
    if (!queryAddr) { alert('Enter address'); return; }
    try { await refreshRole(queryAddr); } catch (e) { console.error(e); alert('Failed to read role'); }
  }

  async function handleGrant() {
    if (!walletClient) { alert('Connect MetaMask as Admin'); return; }
    if (!grantAddr) { alert('Enter address'); return; }
    try {
      setBusy('grant');
      const [account] = await walletClient.getAddresses();
      await ensureCorrectChain(walletClient);
      const c = getAbacContract(null, walletClient, publicClient);
      await grantRoleByName(c, grantRole, grantAddr, { account });
      alert(`Granted ${grantRole} to ${grantAddr}`);
      if (grantAddr === queryAddr) await refreshRole(grantAddr);
    } catch (e) { console.error(e); alert('Grant failed'); }
    finally { setBusy(''); }
  }

  const SectionPending = (
    <Card title="Pending Registrations">
      {items.length === 0 ? (
        <div className="text-slate-500 text-sm">No pending requests.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between border rounded-xl p-3">
              <div>
                <div className="font-mono text-sm">{it.address}</div>
                <div className="text-xs text-slate-500">{it.role} • {new Date(it.ts).toLocaleString()}</div>
                {it.meta?.note && <div className="text-xs mt-1">{it.meta.note}</div>}
              </div>
              <div className="flex gap-2">
                <button disabled={busy === it.id} onClick={() => approve(it)} className="btn btn-primary">
                  {busy === it.id ? 'Approving…' : 'Approve'}
                </button>
                <button onClick={() => reject(it)} className="btn btn-outline">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const SectionUsers = (
    <div className="grid gap-6">
      <Card title="Lookup Role">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <input value={queryAddr} onChange={e=>setQueryAddr(e.target.value)} placeholder="0x… address" className="w-full border rounded-xl p-2 font-mono" />
          <button className="btn btn-outline" onClick={handleQuery}>Check</button>
        </div>
        {queryRole && <div className="text-sm text-slate-700 mt-3">Role: <b>{queryRole}</b></div>}
      </Card>

      <Card title="Grant Role">
        <div className="grid md:grid-cols-[1.5fr_1fr_auto] gap-3">
          <input value={grantAddr} onChange={e=>setGrantAddr(e.target.value)} placeholder="0x… address" className="w-full border rounded-xl p-2 font-mono" />
          <select value={grantRole} onChange={e=>setGrantRole(e.target.value)} className="w-full border rounded-xl p-2">
            <option value="ADMIN">ADMIN</option>
            <option value="DOCTOR">DOCTOR</option>
            <option value="PATIENT">PATIENT</option>
          </select>
          <button className="btn btn-primary" onClick={handleGrant} disabled={busy==='grant'}>
            {busy==='grant' ? 'Granting…' : 'Grant'}
          </button>
        </div>
      </Card>
    </div>
  );

  const SectionContract = (
    <Card title="Network & Admin Tools">
      <div className="grid gap-3">
        <div className="text-sm">
          <div>Network: <b className="uppercase">{CHAIN_NAME}</b></div>
          <div>Your address: <span className="font-mono">{address || 'Not connected'}</span></div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setShareOpen(true)}>Share My Address</button>
        </div>
        <div className="text-xs text-slate-500">“Share My Address” opens a QR + copy dialog so others can add you or contact you.</div>
      </div>

      <ShareAddress open={shareOpen} onClose={() => setShareOpen(false)} title="Share Admin Address" value={address || ''} />
    </Card>
  );

  const pane = { pending: SectionPending, users: SectionUsers, contract: SectionContract }[tab];

  return (
    <div className="w-full">
      <div className="grid items-start gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="card h-max sticky top-20 p-0 overflow-hidden">
          <div className="p-4 border-b font-semibold">Admin</div>
          <nav className="p-2">
            <MenuItem active={tab==='pending'}  onClick={()=>setTab('pending')}  label="Pending" />
            <MenuItem active={tab==='users'}    onClick={()=>setTab('users')}    label="Users & Roles" />
            <MenuItem active={tab==='contract'} onClick={()=>setTab('contract')} label="Network Tools" />
          </nav>
        </aside>

        {/* Right content matches compact look */}
        <section className="space-y-6 w-full h-full">{pane}</section>
      </div>
    </div>
  );
}

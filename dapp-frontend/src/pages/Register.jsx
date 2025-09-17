import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { makeClients, getAbacContract, getRoleName, ensureCorrectChain } from '../lib/contract';
import { addRequest } from '../lib/registry';

export default function Register() {
  const nav = useNavigate();
  const { publicClient, walletClient } = makeClients();
  const [address, setAddress] = useState(null);
  const [role, setRole] = useState('NONE');
  const [note, setNote] = useState('');

  async function connect() {
    if (!window.ethereum) { alert('MetaMask not found'); return; }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accs = await window.ethereum.request({ method: 'eth_accounts' });
    const a0 = accs?.[0]; if (!a0) return;
    setAddress(a0);
    try {
      await ensureCorrectChain(walletClient);
      const c = getAbacContract(null, walletClient, publicClient);
      const rn = await getRoleName(c, a0);
      setRole(rn);
    } catch {}
  }

  useEffect(() => { connect(); }, []);

  function request(role) {
    if (!address) { alert('Connect MetaMask first'); return; }
    addRequest(address, role, { note });
    alert(`Requested ${role}. Admin approval pending.`);
    nav('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Card title="Register">
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              Connected wallet: {address ? address : 'Not connected'}
            </div>

            {!address && (
              <button onClick={connect} className="btn btn-primary">Connect MetaMask</button>
            )}

            <textarea
              value={note}
              onChange={e=>setNote(e.target.value)}
              placeholder="Reason / specialization (optional)"
              className="w-full p-3 border rounded-xl"
            />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => request('PATIENT')} className="btn btn-outline">Register as Patient</button>
              <button onClick={() => request('DOCTOR')} className="btn btn-outline">Register as Doctor</button>
            </div>
            <div className="text-xs text-slate-500">
              Your request is stored locally for demo. Admin can approve it on-chain later.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

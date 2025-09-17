import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { makeClients, getAbacContract, getRoleName, ensureCorrectChain } from '../lib/contract';

export default function Login() {
  const nav = useNavigate();
  const [address, setAddress] = useState(null);
  const [role, setRole] = useState('NONE');
  const { publicClient, walletClient } = makeClients();

  async function connect() {
    if (!window.ethereum) { alert('MetaMask not found'); return; }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const a0 = accounts?.[0]; if (!a0) return;
    setAddress(a0);
    try {
      await ensureCorrectChain(walletClient);
      const c = getAbacContract(null, walletClient, publicClient);
      const rn = await getRoleName(c, a0);
      setRole(rn);
      if (['ADMIN','DOCTOR','PATIENT'].includes(rn)) nav('/dashboard');
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card title="Welcome to Telemedicine ABAC">
          <p className="text-slate-600 mb-4">
            Sign in with MetaMask. If you are new, register as a <b>Doctor</b> or <b>Patient</b> and wait for admin approval.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={connect} className="btn btn-primary">{address ? 'Connected' : 'Connect MetaMask'}</button>

            {address && role === 'NONE' && (
              <button onClick={() => nav('/register')} className="btn btn-outline">
                Register as Doctor or Patient
              </button>
            )}

            {['ADMIN','DOCTOR','PATIENT'].includes(role) && (
              <button onClick={() => nav('/dashboard')} className="btn btn-outline">Go to Dashboard</button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

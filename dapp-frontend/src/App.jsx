import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { makeClients, getAbacContract, getRoleName, ensureCorrectChain } from './lib/contract';
import Card from './components/Card';

export default function App() {
  const [address, setAddress] = useState(null);
  const [roleName, setRoleName] = useState('NONE');
  const { publicClient, walletClient } = useMemo(() => makeClients(), []);
  const nav = useNavigate();

  useEffect(() => {
    async function init() {
      if (!window.ethereum) return;
      try { await ensureCorrectChain(walletClient); } catch {}
      try {
        const accs = await window.ethereum.request({ method: 'eth_accounts' });
        const a0 = accs?.[0];
        setAddress(a0 || null);
        if (a0) {
          const c = getAbacContract(null, walletClient, publicClient);
          const rn = await getRoleName(c, a0);
          setRoleName(rn);
        }
      } catch {}
    }
    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => window.location.reload());
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  async function connectInline() {
    if (!window.ethereum) { alert('MetaMask not found'); return; }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar address={address} roleName={roleName} />

      {/* Body uses the same centered shell: 95% on mobile, 70% on md+ */}
      <div className="w-full flex justify-center px-4 lg:px-8 py-6">
        <div className="w-[95%] md:w-[70%] max-w-5xl">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <>
                  {roleName === 'PATIENT' && <PatientDashboard />}
                  {roleName === 'DOCTOR'  && <DoctorDashboard />}
                  {roleName === 'ADMIN'   && <AdminPanel />}

                  {roleName === 'NONE' && (
                    <Card title="No Role Yet">
                      <div className="text-slate-600 mb-3">
                        {address ? 'You are connected but not registered.' : 'You are not connected.'}
                      </div>
                      <div className="flex gap-2">
                        {!address && (
                          <button onClick={connectInline} className="btn btn-primary">
                            Connect MetaMask
                          </button>
                        )}
                        {address && (
                          <button onClick={() => nav('/register')} className="btn btn-outline">
                            Register as Doctor or Patient
                          </button>
                        )}
                      </div>
                    </Card>
                  )}
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

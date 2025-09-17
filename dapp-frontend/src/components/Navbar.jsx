import { useMemo, useState } from 'react';
import { CHAIN_NAME } from '../lib/contract';
import ShareAddress from './ShareAddress.jsx';

export default function Navbar({ address, roleName }) {
  const [open, setOpen] = useState(false);

  async function connectNow() {
    if (!window.ethereum) { alert('MetaMask not found'); return; }
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.location.reload();
    } catch (e) { console.error(e); alert('Failed to connect MetaMask.'); }
  }

  // (optional) kept for future use
  useMemo(() => {
    if (!address) return null;
    return {
      kind: 'telemed-identity',
      address,
      role: roleName || 'NONE',
      chain: CHAIN_NAME,
      ts: new Date().toISOString(),
    };
  }, [address, roleName]);

  return (
    <>
      {/* Full-width sticky holder that centers the compact bar */}
      <div className="sticky top-0 z-40 w-full backdrop-blur bg-transparent flex justify-center py-2">
        {/* Compact bar: 95% on mobile, 70% on md+ */}
        <div className="w-[95%] md:w-[70%] max-w-5xl bg-white border rounded-xl shadow px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="font-semibold">Telemedicine ABAC</div>

          <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-3">
            <span>Net: <b className="uppercase">{CHAIN_NAME}</b></span>
            <span>Role: <b>{roleName || 'NONE'}</b></span>

            {address ? (
              <>
                <span className="text-slate-500 font-mono hidden sm:inline">
                  {address.slice(0,6)}…{address.slice(-4)}
                </span>
                <button className="btn btn-outline" onClick={() => setOpen(true)}>Share</button>
              </>
            ) : (
              <button onClick={connectNow} className="btn btn-primary">Connect MetaMask</button>
            )}
          </div>
        </div>
      </div>

      <ShareAddress
        open={open}
        onClose={() => setOpen(false)}
        title="Share Connected Identity"
        value={address || ''}
      />
    </>
  );
}

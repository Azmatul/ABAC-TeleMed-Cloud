import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function ShareAddress({ open, onClose, title = 'Share', value = '' }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!open || !value) return;
    const payload = typeof value === 'object' ? JSON.stringify(value) : `ethereum:${value}`;
    QRCode.toDataURL(payload, { margin: 1, width: 220 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [open, value]);

  function copy() {
    const txt = typeof value === 'object' ? JSON.stringify(value) : value;
    if (!txt) return;
    navigator.clipboard.writeText(txt)
      .then(() => alert('Copied'))
      .catch(() => alert('Copy failed'));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">{title}</div>
          <button className="px-2 py-1 rounded-xl hover:bg-slate-100" onClick={onClose}>✕</button>
        </div>

        <div className="text-xs text-slate-500 mb-3">Scan or copy to share your address.</div>

        {qrDataUrl ? (
          <div className="flex items-center justify-center mb-3">
            <img src={qrDataUrl} alt="QR" className="rounded-xl border p-2 bg-white" />
          </div>
        ) : (
          <div className="text-center text-slate-500 text-sm mb-3">Generating QR…</div>
        )}

        {/* Address + copy icon (no extra deps) */}
        <div className="flex items-center border rounded-xl px-3 py-2 mb-3 bg-slate-50">
          <span className="font-mono text-xs break-all flex-1">
            {typeof value === 'object' ? value.address : value || '0x…'}
          </span>
          <button onClick={copy} className="ml-2 text-slate-500 hover:text-slate-800" aria-label="Copy">
            {/* inline SVG copy icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

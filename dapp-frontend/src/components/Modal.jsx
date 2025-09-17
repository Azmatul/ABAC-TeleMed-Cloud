export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button className="px-3 py-1 rounded-xl hover:bg-slate-100" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="p-4 border-t">{footer}</div>}
      </div>
    </div>
  );
}

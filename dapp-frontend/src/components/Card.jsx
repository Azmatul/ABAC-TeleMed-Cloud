// Full-width, no max width cap, grows with its container.
export default function Card({ title, children, actions, className = "" }) {
  return (
    <div className={`card w-full max-w-none h-full ${className}`}>
      {title && <div className="text-lg font-semibold mb-3">{title}</div>}
      <div>{children}</div>
      {actions && <div className="mt-4 flex gap-2">{actions}</div>}
    </div>
  );
}

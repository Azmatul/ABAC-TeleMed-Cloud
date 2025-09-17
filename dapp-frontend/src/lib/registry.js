// Simple localStorage pending queue (swap for backend later)
const KEY = 'pending_registrations_v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));
export const listRequests = () => load().sort((a,b)=>b.ts-a.ts);
export function addRequest(address, role, meta={}){
  const all = load();
  if (!all.find(r=>r.address.toLowerCase()===address.toLowerCase() && r.role===role)) {
    all.push({ id: Date.now().toString(), address, role, meta, ts: Date.now() });
    save(all);
  }
  return all;
}
export function removeRequest(id){ const all = load().filter(r=>r.id!==id); save(all); return all; }

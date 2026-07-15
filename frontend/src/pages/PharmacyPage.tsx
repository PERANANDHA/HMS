import { useState } from 'react';
import { Pill, Search, Plus, CheckCircle, Package, X, RefreshCw } from 'lucide-react';

interface Prescription {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  items: string[];
  status: 'Pending' | 'Dispensed';
  amount: number;
}

interface Drug {
  name: string;
  qty: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  price: number;
}

const INITIAL_RX: Prescription[] = [
  { id: 'RX001', patient: 'Jayakumar Balan', doctor: 'Dr. Vijayakumar', date: '2026-07-07', items: ['Pantoprazole 40mg × 10', 'Domperidone 10mg × 10'], status: 'Pending', amount: 280 },
  { id: 'RX002', patient: 'Janaki Raman', doctor: 'Dr. Subhashini Selvam', date: '2026-07-07', items: ['Sucralfate 1gm × 20'], status: 'Dispensed', amount: 320 },
  { id: 'RX003', patient: 'Abirami Sundaram', doctor: 'Dr. Ganesan Raman', date: '2026-07-07', items: ['Paracetamol 500mg × 30', 'Vitamin C 500mg × 30'], status: 'Pending', amount: 150 },
  { id: 'RX004', patient: 'Karthikeyan Murugan', doctor: 'Dr. Vijayakumar', date: '2026-07-08', items: ['Metformin 500mg × 60', 'Glimepiride 2mg × 30'], status: 'Pending', amount: 420 },
  { id: 'RX005', patient: 'Muthuselvi Krishnan', doctor: 'Dr. Subhashini Selvam', date: '2026-07-08', items: ['Atorvastatin 10mg × 30'], status: 'Dispensed', amount: 190 },
];

const INITIAL_STOCK: Drug[] = [
  { name: 'Pantoprazole 40mg', qty: 120, status: 'In Stock', price: 12 },
  { name: 'Domperidone 10mg', qty: 80, status: 'In Stock', price: 8 },
  { name: 'Sucralfate 1gm', qty: 60, status: 'In Stock', price: 15 },
  { name: 'Paracetamol 500mg', qty: 15, status: 'Low Stock', price: 3 },
  { name: 'Syringe 5ml', qty: 0, status: 'Out of Stock', price: 6 },
  { name: 'Metformin 500mg', qty: 200, status: 'In Stock', price: 4 },
  { name: 'Atorvastatin 10mg', qty: 8, status: 'Low Stock', price: 18 },
];

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_RX);
  const [stock, setStock] = useState<Drug[]>(INITIAL_STOCK);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showNew, setShowNew] = useState(false);
  const [dispensedMsg, setDispensedMsg] = useState('');
  const [newForm, setNewForm] = useState({ patient: '', doctor: '', items: 'Paracetamol 500mg × 10', amount: '' });

  const filtered = prescriptions.filter(p =>
    (filter === 'All' || p.status === filter) &&
    p.patient.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = { Pending: '#fbbf24', Dispensed: '#34d399' };

  function handleDispense(id: string) {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status: 'Dispensed' } : p));
    setDispensedMsg('Prescription dispensed successfully!');
    setTimeout(() => setDispensedMsg(''), 2500);
  }

  function handleRestock(name: string) {
    setStock(prev => prev.map(d =>
      d.name === name
        ? { ...d, qty: d.qty + 50, status: 'In Stock' }
        : d
    ));
  }

  function handleNewRx() {
    if (!newForm.patient || !newForm.items) return;
    const newRx: Prescription = {
      id: `RX${String(prescriptions.length + 1).padStart(3, '0')}`,
      patient: newForm.patient,
      doctor: newForm.doctor || 'Dr. Vijayakumar',
      date: new Date().toISOString().slice(0, 10),
      items: newForm.items.split('\n').filter(Boolean),
      status: 'Pending',
      amount: parseInt(newForm.amount) || 0,
    };
    setPrescriptions(prev => [newRx, ...prev]);
    setShowNew(false);
    setNewForm({ patient: '', doctor: '', items: 'Paracetamol 500mg × 10', amount: '' });
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy</h1>
          <p className="page-subtitle">Prescription dispensing and drug management</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Prescription
        </button>
      </div>

      {dispensedMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm text-green-400" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <CheckCircle size={16} /> {dispensedMsg}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: prescriptions.filter(p => p.status === 'Pending').length, color: '#fbbf24', icon: Pill },
          { label: 'Dispensed Today', value: prescriptions.filter(p => p.status === 'Dispensed').length, color: '#34d399', icon: CheckCircle },
          { label: 'Low/Out of Stock', value: stock.filter(s => s.status !== 'In Stock').length, color: '#f87171', icon: Package },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <Icon size={20} style={{ color: s.color }} className="mb-3" />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescriptions */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Prescriptions</h2>
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(56,189,248,0.05)' }}>
              {['All', 'Pending', 'Dispensed'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className="px-2 py-1 rounded text-xs font-medium transition-all"
                  style={filter === f ? { background: '#0ea5e9', color: 'white' } : { color: '#64748b' }}>{f}</button>
              ))}
            </div>
          </div>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search patient..." className="input-dark pl-8 py-2 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filtered.map(p => {
              const color = statusColor[p.status] ?? '#94a3b8';
              return (
                <div key={p.id} className="p-3 rounded-xl" style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.08)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{p.patient}</p>
                      <p className="text-xs text-slate-500">{p.doctor} · {p.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-sky-400">₹{p.amount}</span>
                      <span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{p.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 space-y-0.5 mb-2">
                    {p.items.map((item, i) => <div key={i}>• {item}</div>)}
                  </div>
                  {p.status === 'Pending' && (
                    <button className="btn-primary text-xs px-3 py-1.5 w-full justify-center" onClick={() => handleDispense(p.id)}>
                      <CheckCircle size={12} /> Dispense Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drug Stock */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Drug Inventory</h2>
          <div className="space-y-2">
            {stock.map((s, i) => {
              const color = s.status === 'In Stock' ? '#34d399' : s.status === 'Low Stock' ? '#fbbf24' : '#f87171';
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.06)' }}>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{s.name}</p>
                    <p className="text-xs text-slate-500">Qty: {s.qty} · ₹{s.price}/unit</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{s.status}</span>
                    {s.status !== 'In Stock' && (
                      <button className="btn-secondary text-xs px-2 py-1 flex items-center gap-1" onClick={() => handleRestock(s.name)}>
                        <RefreshCw size={10} /> Restock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Prescription Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">New Prescription</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="label-dark">Patient Name *</label>
                <input className="input-dark" placeholder="e.g. Ramesh Babu" value={newForm.patient} onChange={e => setNewForm(f => ({ ...f, patient: e.target.value }))} />
              </div>
              <div>
                <label className="label-dark">Prescribing Doctor</label>
                <input className="input-dark" placeholder="e.g. Dr. Vijayakumar" value={newForm.doctor} onChange={e => setNewForm(f => ({ ...f, doctor: e.target.value }))} />
              </div>
              <div>
                <label className="label-dark">Medicines (one per line)</label>
                <textarea className="input-dark min-h-[80px] resize-none" value={newForm.items} onChange={e => setNewForm(f => ({ ...f, items: e.target.value }))} />
              </div>
              <div>
                <label className="label-dark">Total Amount (₹)</label>
                <input className="input-dark" placeholder="e.g. 350" value={newForm.amount} onChange={e => setNewForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setShowNew(false)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleNewRx}>
                  <Plus size={16} /> Add Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

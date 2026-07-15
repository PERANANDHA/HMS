import { useState } from 'react';
import { CreditCard, Search, Plus, Download, X, CheckCircle } from 'lucide-react';
import { printInvoice } from '../utils/downloadUtils';

interface Invoice {
  id: string;
  patient: string;
  date: string;
  amount: number;
  paid: number;
  balance: number;
  status: 'Paid' | 'Pending' | 'Partial';
  items: string[];
}

const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV0001', patient: 'Jayakumar Balan', date: '2026-07-01', amount: 5100, paid: 5100, balance: 0, status: 'Paid', items: ['Consultation Fee: ₹500', 'ECG: ₹800', 'Lab Test (CBC): ₹600', 'Pharmacy: ₹1200', 'Room Charges: ₹2000'] },
  { id: 'INV0002', patient: 'Janaki Raman', date: '2026-07-03', amount: 3200, paid: 0, balance: 3200, status: 'Pending', items: ['Consultation Fee: ₹500', 'MRI Scan: ₹2700'] },
  { id: 'INV0003', patient: 'Abirami Sundaram', date: '2026-07-05', amount: 800, paid: 400, balance: 400, status: 'Partial', items: ['Consultation Fee: ₹500', 'Lab Test: ₹300'] },
  { id: 'INV0004', patient: 'Ganesan Raman', date: '2026-07-06', amount: 1500, paid: 1500, balance: 0, status: 'Paid', items: ['OPD Consultation: ₹500', 'Pharmacy: ₹1000'] },
  { id: 'INV0005', patient: 'Muthuselvi Krishnan', date: '2026-07-07', amount: 2800, paid: 1400, balance: 1400, status: 'Partial', items: ['Consultation Fee: ₹500', 'Blood Test: ₹400', 'Ultrasound: ₹1900'] },
];

const statusColor: Record<string, string> = { Paid: '#34d399', Pending: '#f87171', Partial: '#fbbf24' };

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // New invoice form state
  const [newPatient, setNewPatient] = useState('');
  const [newItems, setNewItems] = useState('Consultation Fee: ₹500');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  const tabs = ['All', 'Paid', 'Pending', 'Partial'];
  const filtered = invoices.filter(i =>
    (filter === 'All' || i.status === filter) &&
    i.patient.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = invoices.reduce((s, i) => s + i.paid, 0);
  const totalPending = invoices.reduce((s, i) => s + i.balance, 0);

  function handleCollectPayment() {
    if (!selected) return;
    setInvoices(prev => prev.map(inv =>
      inv.id === selected.id
        ? { ...inv, paid: inv.amount, balance: 0, status: 'Paid' }
        : inv
    ));
    setSelected(prev => prev ? { ...prev, paid: prev.amount, balance: 0, status: 'Paid' } : null);
    setPaySuccess(true);
    setTimeout(() => setPaySuccess(false), 2500);
  }

  function handleNewInvoice() {
    if (!newPatient.trim() || !newItems.trim()) return;
    const itemList = newItems.split('\n').filter(Boolean);
    const totalAmt = itemList.reduce((sum, item) => {
      const match = item.match(/₹([\d,]+)/);
      return sum + (match ? parseInt(match[1].replace(/,/g, ''), 10) : 0);
    }, 0);
    const newInv: Invoice = {
      id: `INV${String(invoices.length + 1).padStart(4, '0')}`,
      patient: newPatient,
      date: newDate,
      amount: totalAmt,
      paid: 0,
      balance: totalAmt,
      status: 'Pending',
      items: itemList,
    };
    setInvoices(prev => [newInv, ...prev]);
    setShowNewModal(false);
    setNewPatient('');
    setNewItems('Consultation Fee: ₹500');
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing &amp; Invoices</h1>
          <p className="page-subtitle">Manage patient billing and payments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewModal(true)}>
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#34d399' },
          { label: 'Pending Amount', value: `₹${totalPending.toLocaleString('en-IN')}`, color: '#f87171' },
          { label: 'Total Invoices', value: invoices.length, color: '#0ea5e9' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <CreditCard size={20} style={{ color: s.color }} className="mb-3" />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by patient..." className="input-dark pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: 'rgba(56,189,248,0.05)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={filter === t ? { background: '#0ea5e9', color: 'white' } : { color: '#64748b' }}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="dark-table">
            <thead>
              <tr>
                <th>Invoice ID</th><th>Patient</th><th>Date</th>
                <th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const color = statusColor[inv.status] ?? '#94a3b8';
                return (
                  <tr key={inv.id}>
                    <td className="font-mono text-sky-400">{inv.id}</td>
                    <td className="font-medium text-slate-200">{inv.patient}</td>
                    <td className="text-slate-400">{inv.date}</td>
                    <td className="font-semibold text-slate-200">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="text-green-400">₹{inv.paid.toLocaleString('en-IN')}</td>
                    <td className="text-red-400">₹{inv.balance.toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{inv.status}</span>
                    </td>
                    <td className="flex items-center gap-1">
                      <button onClick={() => setSelected(inv)} className="btn-secondary text-xs px-2 py-1">View</button>
                      <button onClick={() => printInvoice(inv)} className="btn-secondary text-xs px-2 py-1" title="Download PDF">
                        <Download size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Invoice {selected.id}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => printInvoice(selected)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <Download size={13} /> Download PDF
                </button>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {paySuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm text-green-400" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <CheckCircle size={16} /> Payment collected successfully!
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-slate-500 text-xs mb-1">Patient</p><p className="text-slate-200 font-semibold">{selected.patient}</p></div>
                <div><p className="text-slate-500 text-xs mb-1">Date</p><p className="text-slate-200">{selected.date}</p></div>
              </div>
              <div>
                <p className="label-dark mb-2">Items</p>
                <div className="space-y-1">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: '1px solid rgba(56,189,248,0.06)' }}>
                      <span className="text-slate-300">{item.split(':')[0]}</span>
                      <span className="text-slate-200 font-medium">{item.split(':')[1]?.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Total</span><span className="text-white font-bold">₹{selected.amount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Paid</span><span className="text-green-400 font-semibold">₹{selected.paid.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Balance</span><span className="text-red-400 font-semibold">₹{selected.balance.toLocaleString('en-IN')}</span></div>
              </div>
              {selected.balance > 0 && (
                <button className="btn-primary w-full justify-center" onClick={handleCollectPayment}>
                  <CheckCircle size={16} /> Collect Full Payment (₹{selected.balance.toLocaleString('en-IN')})
                </button>
              )}
              {selected.balance === 0 && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg text-sm text-green-400" style={{ background: 'rgba(52,211,153,0.08)' }}>
                  <CheckCircle size={16} /> Invoice fully paid
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Create New Invoice</h2>
              <button onClick={() => setShowNewModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label-dark">Patient Name</label>
                <input className="input-dark" placeholder="e.g. Karthikeyan Murugan" value={newPatient} onChange={e => setNewPatient(e.target.value)} />
              </div>
              <div>
                <label className="label-dark">Date</label>
                <input type="date" className="input-dark" value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <div>
                <label className="label-dark">Items (one per line, format: Description: ₹Amount)</label>
                <textarea className="input-dark min-h-[100px] resize-none" value={newItems} onChange={e => setNewItems(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleNewInvoice}>
                  <Plus size={16} /> Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

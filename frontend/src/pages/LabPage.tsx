import { useState } from 'react';
import { FlaskConical, Plus, Clock, CheckCircle, AlertCircle, X, Upload, Download } from 'lucide-react';
import { downloadCSV } from '../utils/downloadUtils';

interface TestOrder {
  id: string;
  patient: string;
  test: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  result: string | null;
  fee: number;
}

const INITIAL_ORDERS: TestOrder[] = [
  { id: 'T001', patient: 'Jayakumar Balan', test: 'CBC (Complete Blood Count)', date: '2026-07-07', status: 'Pending', result: null, fee: 350 },
  { id: 'T002', patient: 'Janaki Raman', test: 'Thyroid Profile (T3/T4/TSH)', date: '2026-07-07', status: 'In Progress', result: null, fee: 850 },
  { id: 'T003', patient: 'Abirami Sundaram', test: 'LFT (Liver Function Test)', date: '2026-07-07', status: 'Completed', result: 'Normal', fee: 650 },
  { id: 'T004', patient: 'Subhashini Selvam', test: 'RBS (Random Blood Sugar)', date: '2026-07-07', status: 'Pending', result: null, fee: 150 },
  { id: 'T005', patient: 'Ganesan Raman', test: 'Urine Routine', date: '2026-07-07', status: 'Completed', result: 'Normal', fee: 200 },
  { id: 'T006', patient: 'Malathi Balan', test: 'X-Ray Chest (PA View)', date: '2026-07-06', status: 'Completed', result: 'Normal', fee: 500 },
  { id: 'T007', patient: 'Karthikeyan Murugan', test: 'ECG (12 Lead)', date: '2026-07-08', status: 'Pending', result: null, fee: 300 },
];

const statusColor: Record<string, string> = {
  Pending: '#fbbf24', 'In Progress': '#0ea5e9', Completed: '#34d399',
};

export default function LabPage() {
  const [orders, setOrders] = useState<TestOrder[]>(INITIAL_ORDERS);
  const [filter, setFilter] = useState('All');
  const [showNew, setShowNew] = useState(false);
  const [resultModal, setResultModal] = useState<TestOrder | null>(null);
  const [viewModal, setViewModal] = useState<TestOrder | null>(null);
  const [resultText, setResultText] = useState('Normal');
  const [newForm, setNewForm] = useState({ patient: '', test: '', fee: '' });

  const tabs = ['All', 'Pending', 'In Progress', 'Completed'];
  const filtered = orders.filter(t => filter === 'All' || t.status === filter);

  function handleStart(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'In Progress' } : o));
  }

  function handleUploadResult() {
    if (!resultModal) return;
    setOrders(prev => prev.map(o =>
      o.id === resultModal.id ? { ...o, status: 'Completed', result: resultText } : o
    ));
    setResultModal(null);
  }

  function handleNewOrder() {
    if (!newForm.patient || !newForm.test) return;
    const newOrder: TestOrder = {
      id: `T${String(orders.length + 1).padStart(3, '0')}`,
      patient: newForm.patient,
      test: newForm.test,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      result: null,
      fee: parseInt(newForm.fee) || 0,
    };
    setOrders(prev => [newOrder, ...prev]);
    setShowNew(false);
    setNewForm({ patient: '', test: '', fee: '' });
  }

  function handleExport() {
    downloadCSV('lab_orders.csv',
      ['Test ID', 'Patient', 'Test Name', 'Date', 'Status', 'Result', 'Fee (₹)'],
      orders.map(o => [o.id, o.patient, o.test, o.date, o.status, o.result ?? '—', o.fee])
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laboratory</h1>
          <p className="page-subtitle">Manage test orders and results</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-1.5" onClick={handleExport}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={16} /> New Test Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: FlaskConical, color: '#facc15' },
          { label: 'Pending', value: orders.filter(t => t.status === 'Pending').length, icon: Clock, color: '#fbbf24' },
          { label: 'In Progress', value: orders.filter(t => t.status === 'In Progress').length, icon: AlertCircle, color: '#0ea5e9' },
          { label: 'Completed', value: orders.filter(t => t.status === 'Completed').length, icon: CheckCircle, color: '#34d399' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}15` }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Test Orders</h2>
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(56,189,248,0.05)' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setFilter(t)} className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={filter === t ? { background: '#0ea5e9', color: 'white' } : { color: '#64748b' }}>{t}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="dark-table">
            <thead>
              <tr><th>Test ID</th><th>Patient</th><th>Test Name</th><th>Date</th><th>Fee</th><th>Status</th><th>Result</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const color = statusColor[t.status] ?? '#94a3b8';
                return (
                  <tr key={t.id}>
                    <td className="font-mono text-sky-400">{t.id}</td>
                    <td className="font-medium text-slate-200">{t.patient}</td>
                    <td className="text-slate-300">{t.test}</td>
                    <td className="text-slate-400">{t.date}</td>
                    <td className="text-slate-300">₹{t.fee}</td>
                    <td><span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{t.status}</span></td>
                    <td>{t.result ? <span className="badge badge-green">{t.result}</span> : <span className="text-slate-600">—</span>}</td>
                    <td>
                      {t.status === 'Pending' && (
                        <button className="btn-secondary text-xs px-2 py-1 mr-1" onClick={() => handleStart(t.id)}>Start</button>
                      )}
                      {t.status === 'In Progress' && (
                        <button className="btn-primary text-xs px-2 py-1 flex items-center gap-1" onClick={() => { setResultModal(t); setResultText('Normal'); }}>
                          <Upload size={11} /> Upload Result
                        </button>
                      )}
                      {t.status === 'Completed' && (
                        <button className="btn-secondary text-xs px-2 py-1" onClick={() => setViewModal(t)}>View</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Result Modal */}
      {resultModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setResultModal(null); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Upload Test Result</h2>
              <button onClick={() => setResultModal(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
                <p className="text-sm font-semibold text-slate-200">{resultModal.patient}</p>
                <p className="text-xs text-slate-500 mt-1">{resultModal.test}</p>
              </div>
              <div>
                <label className="label-dark">Result Summary</label>
                <select className="input-dark" value={resultText} onChange={e => setResultText(e.target.value)}>
                  {['Normal', 'Abnormal - Mild', 'Abnormal - Moderate', 'Abnormal - Severe', 'Borderline', 'Inconclusive'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label-dark">Additional Notes</label>
                <textarea className="input-dark min-h-[80px] resize-none" placeholder="Enter detailed findings..." />
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setResultModal(null)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleUploadResult}>
                  <CheckCircle size={15} /> Confirm Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Result Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewModal(null); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Test Report</h2>
              <button onClick={() => setViewModal(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Test ID', value: viewModal.id },
                { label: 'Patient', value: viewModal.patient },
                { label: 'Test', value: viewModal.test },
                { label: 'Date', value: viewModal.date },
                { label: 'Result', value: viewModal.result ?? '—' },
                { label: 'Fee', value: `₹${viewModal.fee}` },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-sm py-2" style={{ borderBottom: '1px solid rgba(56,189,248,0.06)' }}>
                  <span className="text-slate-500">{f.label}</span>
                  <span className="text-slate-200 font-medium">{f.value}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-4 p-3 rounded-lg" style={{ background: 'rgba(52,211,153,0.08)' }}>
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-green-400 font-medium">Test completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Test Order Modal */}
      {showNew && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">New Test Order</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="label-dark">Patient Name *</label>
                <input className="input-dark" placeholder="e.g. Karthikeyan Murugan" value={newForm.patient} onChange={e => setNewForm(f => ({ ...f, patient: e.target.value }))} />
              </div>
              <div>
                <label className="label-dark">Test Name *</label>
                <select className="input-dark" value={newForm.test} onChange={e => setNewForm(f => ({ ...f, test: e.target.value }))}>
                  <option value="">Select a test...</option>
                  {['CBC (Complete Blood Count)', 'Thyroid Profile (T3/T4/TSH)', 'LFT (Liver Function Test)',
                    'RBS (Random Blood Sugar)', 'Urine Routine', 'X-Ray Chest (PA View)', 'ECG (12 Lead)',
                    'HbA1c', 'Lipid Profile', 'Serum Creatinine', 'Dengue NS1 Antigen'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label-dark">Fee (₹)</label>
                <input className="input-dark" placeholder="e.g. 350" value={newForm.fee} onChange={e => setNewForm(f => ({ ...f, fee: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setShowNew(false)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleNewOrder}>
                  <Plus size={16} /> Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

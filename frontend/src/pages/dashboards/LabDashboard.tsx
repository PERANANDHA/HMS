import { useState } from 'react';
import { FlaskConical, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TEST_ORDERS = [
  { id: 'T001', patient: 'Jayakumar Balan', test: 'CBC (Complete Blood Count)', date: '2026-07-07', status: 'Pending' },
  { id: 'T002', patient: 'Janaki Raman', test: 'Thyroid Profile', date: '2026-07-07', status: 'In Progress' },
  { id: 'T003', patient: 'Abirami Sundaram', test: 'LFT (Liver Function)', date: '2026-07-07', status: 'Completed' },
  { id: 'T004', patient: 'Subhashini Selvam', test: 'RBS (Random Blood Sugar)', date: '2026-07-07', status: 'Pending' },
  { id: 'T005', patient: 'Ganesan Raman', test: 'Urine Routine', date: '2026-07-07', status: 'Completed' },
];

export default function LabDashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('All');

  const tabs = ['All', 'Pending', 'In Progress', 'Completed'];
  const filtered = TEST_ORDERS.filter(t => filter === 'All' || t.status === filter);

  const statusColor: Record<string, string> = {
    Pending: '#fbbf24', 'In Progress': '#0ea5e9', Completed: '#34d399',
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">Laboratory Station</h1>
        <p className="page-subtitle">Welcome, {user?.name} · Process test orders and record results</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: TEST_ORDERS.length, icon: FlaskConical, color: '#facc15' },
          { label: 'Pending', value: TEST_ORDERS.filter(t=>t.status==='Pending').length, icon: Clock, color: '#fbbf24' },
          { label: 'In Progress', value: TEST_ORDERS.filter(t=>t.status==='In Progress').length, icon: AlertCircle, color: '#0ea5e9' },
          { label: 'Completed Today', value: TEST_ORDERS.filter(t=>t.status==='Completed').length, icon: CheckCircle, color: '#34d399' },
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

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab Test Volume by Type Donut Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Test Volume by Type</h2>
            <span className="text-xs text-slate-500">Today's Distribution</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                {/* CBC: 40% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="40 100" strokeDashoffset="0" />
                {/* LFT: 30% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#a78bfa" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-40" />
                {/* Lipid: 20% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fb923c" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-70" />
                {/* Thyroid: 10% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#facc15" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-90" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">Tests</span>
                <span className="text-base font-bold text-white leading-none">150</span>
              </div>
            </div>
            {/* Legend Grid */}
            <div className="grid grid-cols-1 gap-2 text-xs w-full">
              {[
                { label: 'CBC (Blood)', pct: '40%', color: '#0ea5e9', count: 60 },
                { label: 'LFT (Liver)', pct: '30%', color: '#a78bfa', count: 45 },
                { label: 'Lipid (Cholesterol)', pct: '20%', color: '#fb923c', count: 30 },
                { label: 'Thyroid', pct: '10%', color: '#facc15', count: 15 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-slate-300 font-medium">{item.label}</span>
                  </div>
                  <span className="text-slate-500">{item.count} ({item.pct})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Turnaround Time (TAT) Analytics Bar Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Average Turnaround Time (TAT)</h2>
            <span className="text-xs text-sky-400">Target: &lt; 4 Hours</span>
          </div>
          <div className="relative pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
              {/* Gridlines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.06)" />

              {/* Y Axis Labels */}
              <text x="15" y="24" className="text-[10px] fill-slate-500 font-medium">4h</text>
              <text x="15" y="94" className="text-[10px] fill-slate-500 font-medium">2h</text>
              <text x="15" y="164" className="text-[10px] fill-slate-500 font-medium">0h</text>

              {/* Categories & Vertical Bars */}
              {[
                { type: 'CBC', hrs: 1.5 },
                { type: 'LFT', hrs: 2.0 },
                { type: 'Lipid', hrs: 2.5 },
                { type: 'Thyroid', hrs: 3.0 }
              ].map((t, idx) => {
                const xBase = 75 + idx * 100;
                const height = t.hrs * 40; // 40px per hour
                return (
                  <g key={t.type}>
                    {/* TAT Bar (Green: #34d399) */}
                    <rect x={xBase} y={160 - height} width="24" height={height} fill="#34d399" rx="2" className="transition-all duration-500 hover:opacity-85" />
                    {/* Hours Text value on top of bar */}
                    <text x={xBase + 12} y={150 - height} textAnchor="middle" className="text-[10px] fill-emerald-400 font-bold">{t.hrs} hrs</text>
                    {/* X axis label */}
                    <text x={xBase + 12} y="180" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">{t.type}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Test Orders</h2>
          <button className="btn-primary text-xs px-3 py-1.5">
            <Plus size={14} /> New Order
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: 'rgba(56,189,248,0.05)' }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all"
              style={filter === t
                ? { background: '#0ea5e9', color: 'white' }
                : { color: '#64748b' }
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="dark-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Test</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-sky-400">{t.id}</td>
                  <td className="font-medium text-slate-200">{t.patient}</td>
                  <td className="text-slate-300">{t.test}</td>
                  <td className="text-slate-400">{t.date}</td>
                  <td>
                    <span className="badge" style={{ background: `${statusColor[t.status]}15`, color: statusColor[t.status], border: `1px solid ${statusColor[t.status]}30` }}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {t.status !== 'Completed' && (
                      <button className="btn-secondary text-xs px-2 py-1">
                        {t.status === 'Pending' ? 'Start' : 'Complete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

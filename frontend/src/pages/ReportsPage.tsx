import { TrendingUp, Users, Calendar, CreditCard, Download } from 'lucide-react';
import { downloadCSV } from '../utils/downloadUtils';


const DEPT_REVENUE = [
  { dept: 'Cardiology', patients: 145, revenue: 87000, growth: '+12%' },
  { dept: 'Neurology', patients: 98, revenue: 62000, growth: '+8%' },
  { dept: 'General Surgery', patients: 76, revenue: 95000, growth: '+18%' },
  { dept: 'Pediatrics', patients: 120, revenue: 45000, growth: '+5%' },
];

const MONTHLY = [
  { month: 'Feb', value: 185000 },
  { month: 'Mar', value: 220000 },
  { month: 'Apr', value: 198000 },
  { month: 'May', value: 245000 },
  { month: 'Jun', value: 230000 },
  { month: 'Jul', value: 260000 },
];

const max = Math.max(...MONTHLY.map(m => m.value));

export default function ReportsPage() {
  function handleExport() {
    downloadCSV('hospital_report_july2026.csv',
      ['Department', 'Patients', 'Revenue (₹)', 'Growth'],
      DEPT_REVENUE.map(d => [d.dept, d.patients, d.revenue, d.growth])
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Hospital performance overview — July 2026</p>
        </div>
        <button className="btn-primary" onClick={handleExport}><Download size={16} /> Export Report</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients (Month)', value: '439', delta: '+14%', icon: Users, color: '#0ea5e9' },
          { label: 'Appointments', value: '612', delta: '+9%', icon: Calendar, color: '#34d399' },
          { label: 'Revenue', value: '₹2.6L', delta: '+18%', icon: CreditCard, color: '#fb923c' },
          { label: 'Avg. Stay (Days)', value: '2.8', delta: '-0.3', icon: TrendingUp, color: '#a78bfa' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: s.color }}>{s.delta}</span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-5">Monthly Revenue Trend</h2>
          <div className="flex items-end gap-2 h-40">
            {MONTHLY.map(m => {
              const pct = (m.value / max) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-sky-400 font-semibold">₹{(m.value/1000).toFixed(0)}K</span>
                  <div className="w-full rounded-t-lg relative" style={{ height: `${pct}%`, minHeight: 8, background: 'linear-gradient(180deg,#0ea5e9,#0284c7)' }}>
                    <div className="absolute inset-0 rounded-t-lg" style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.15),transparent)' }} />
                  </div>
                  <span className="text-xs text-slate-500">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Performance */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Department Performance</h2>
          <div className="space-y-3">
            {DEPT_REVENUE.map((d, i) => {
              const colors = ['#0ea5e9', '#34d399', '#a78bfa', '#fb923c'];
              const color = colors[i % colors.length];
              const pct = Math.round((d.patients / 150) * 100);
              return (
                <div key={d.dept}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{d.dept}</span>
                    <div className="flex gap-3">
                      <span className="text-slate-500">{d.patients} pts</span>
                      <span style={{ color }}>{d.growth}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(56,189,248,0.08)' }}>
                    <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 grid grid-cols-2 gap-4" style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}>
            {DEPT_REVENUE.map((d, i) => {
              const colors = ['#0ea5e9', '#34d399', '#a78bfa', '#fb923c'];
              return (
                <div key={d.dept}>
                  <p className="text-xs text-slate-500">{d.dept}</p>
                  <p className="font-bold text-sm" style={{ color: colors[i % colors.length] }}>₹{d.revenue.toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* OPD vs IPD */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-white mb-4">OPD vs IPD Breakdown (This Month)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(56,189,248,0.1)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0ea5e9" strokeWidth="3"
                  strokeDasharray="65 100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-sky-400">65%</span>
                <span className="text-xs text-slate-500">OPD</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 mt-2">OPD Patients: 285</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(56,189,248,0.1)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#a78bfa" strokeWidth="3"
                  strokeDasharray="35 100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-purple-400">35%</span>
                <span className="text-xs text-slate-500">IPD</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 mt-2">IPD Patients: 154</p>
          </div>
          <div className="space-y-3 flex flex-col justify-center">
            {[
              { label: 'Pharmacy Sales', value: '₹98,400', color: '#fb923c' },
              { label: 'Lab Revenue', value: '₹34,200', color: '#facc15' },
              { label: 'Radiology', value: '₹28,600', color: '#34d399' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-slate-400">{r.label}</span>
                </div>
                <span className="font-semibold" style={{ color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Calendar, Stethoscope, CreditCard, TrendingUp, Activity,
  ArrowUpRight, RefreshCw,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: number;
  status: string;
  reason?: string;
  appointmentDate?: string;
  patient?: { firstName?: string; lastName?: string };
  doctor?: { firstName?: string; lastName?: string };
}

interface BillingStats {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
}

interface Tooltip { x: number; y: number; label: string; value: string; visible: boolean; }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<unknown[]>([]);
  const [doctors, setDoctors] = useState<unknown[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tooltip, setTooltip] = useState<Tooltip>({ x: 0, y: 0, label: '', value: '', visible: false });
  const svgRef = useRef<SVGSVGElement>(null);

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [p, d, a, b] = await Promise.all([
        axiosInstance.get('/patients'),
        axiosInstance.get('/doctors'),
        axiosInstance.get('/appointments'),
        axiosInstance.get('/billing/stats').catch(() => ({ data: null })),
      ]);
      setPatients(p.data);
      setDoctors(d.data);
      setAppointments(a.data);
      if (b.data) setBillingStats(b.data);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Build weekly chart data from real appointments grouped by day-of-week
  const weeklyData = DAYS.map((day, dayIdx) => {
    const dayApts = appointments.filter(a => {
      if (!a.appointmentDate) return false;
      return new Date(a.appointmentDate).getDay() === dayIdx;
    });
    return {
      day,
      scheduled: dayApts.filter(a => a.status === 'SCHEDULED').length,
      completed: dayApts.filter(a => a.status === 'COMPLETED').length,
      cancelled: dayApts.filter(a => a.status === 'CANCELLED').length,
      total: dayApts.length,
    };
  });

  const maxWeeklyVal = Math.max(...weeklyData.map(d => d.total), 5);

  const todayApts = appointments.filter(a => a.status === 'SCHEDULED').length;
  const completedApts = appointments.filter(a => a.status === 'COMPLETED').length;
  const totalRevenue = billingStats?.totalRevenue ?? 0;
  const paidRevenue = billingStats?.paidRevenue ?? 0;
  const pendingRevenue = billingStats?.pendingRevenue ?? 0;

  // Donut chart: appointment status breakdown
  const totalApts = appointments.length;
  const scheduledPct = totalApts ? Math.round((todayApts / totalApts) * 100) : 0;
  const completedPct = totalApts ? Math.round((completedApts / totalApts) * 100) : 0;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;
  const cancelledPct = totalApts ? Math.round((cancelledCount / totalApts) * 100) : 0;

  const stats = [
    { label: 'Total Patients', value: loading ? '—' : patients.length, icon: Users, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', delta: `${patients.length} registered` },
    { label: "Today's Appointments", value: loading ? '—' : todayApts, icon: Calendar, color: '#34d399', bg: 'rgba(52,211,153,0.1)', delta: `${completedApts} completed` },
    { label: 'Active Doctors', value: loading ? '—' : doctors.length, icon: Stethoscope, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', delta: 'All departments' },
    { label: "Total Revenue", value: loading ? '—' : formatINR(totalRevenue), icon: CreditCard, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', delta: billingStats ? `${formatINR(paidRevenue)} paid` : 'Loading...' },
  ];

  const quickActions = [
    { label: 'New Appointment', icon: Calendar, color: '#0ea5e9', path: '/appointments' },
    { label: 'Add Patient', icon: Users, color: '#34d399', path: '/patients' },
    { label: 'View Billing', icon: CreditCard, color: '#fb923c', path: '/billing' },
    { label: 'Reports', icon: TrendingUp, color: '#a78bfa', path: '/reports' },
  ];

  // SVG tooltip handler
  const handleBarHover = (e: React.MouseEvent<SVGRectElement>, label: string, value: string) => {
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    setTooltip({
      x: rect.left - svgRect.left + rect.width / 2,
      y: rect.top - svgRect.top - 10,
      label,
      value,
      visible: true,
    });
  };

  const chartH = 160; // chart floor y coordinate
  const chartTop = 20; // chart top y coordinate
  const chartRange = chartH - chartTop;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening at MediCare Hospital today</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-sky-400 transition-all hover:bg-sky-500/10"
            style={{ border: '1px solid rgba(14,165,233,0.2)' }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="badge badge-green hidden sm:flex">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card group cursor-default">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: s.bg, border: `1px solid ${s.color}30` }}
                >
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <ArrowUpRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs font-medium text-slate-400">{s.label}</p>
              <p className="text-xs mt-1" style={{ color: s.color }}>{s.delta}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: `${a.color}0d`, border: `1px solid ${a.color}25` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}20` }}>
                  <Icon size={20} style={{ color: a.color }} />
                </div>
                <span className="text-xs font-semibold text-slate-300">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Bar Chart (REAL DATA) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Weekly Appointments</h2>
            <span className="text-xs text-slate-500">By Day</span>
          </div>
          <div className="relative pt-2">
            <svg
              ref={svgRef}
              viewBox="0 0 500 210"
              className="w-full h-auto overflow-visible"
            >
              {/* Gridlines */}
              {[0, 1, 2, 3].map(i => (
                <line
                  key={i}
                  x1="40" y1={chartTop + (chartRange / 3) * i}
                  x2="480" y2={chartTop + (chartRange / 3) * i}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray={i === 3 ? undefined : '3 3'}
                />
              ))}
              {/* Y labels */}
              {[0, 1, 2, 3].map(i => (
                <text key={i} x="10" y={chartH - (chartRange / 3) * i + 4} className="text-[10px] fill-slate-500 font-medium">
                  {Math.round((maxWeeklyVal / 3) * i)}
                </text>
              ))}

              {weeklyData.map((d, idx) => {
                const xBase = 55 + idx * 60;
                const barW = 14;
                const sH = maxWeeklyVal > 0 ? (d.scheduled / maxWeeklyVal) * chartRange : 0;
                const cH = maxWeeklyVal > 0 ? (d.completed / maxWeeklyVal) * chartRange : 0;
                const xnH = maxWeeklyVal > 0 ? (d.cancelled / maxWeeklyVal) * chartRange : 0;
                return (
                  <g key={d.day}>
                    {/* Scheduled bar */}
                    <rect
                      x={xBase} y={chartH - sH} width={barW} height={Math.max(sH, 1)}
                      fill="#0ea5e9" rx="2"
                      className="cursor-pointer transition-opacity hover:opacity-75"
                      onMouseMove={e => handleBarHover(e, `${d.day} Scheduled`, String(d.scheduled))}
                      onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                    >
                      <title>{d.day} Scheduled: {d.scheduled}</title>
                    </rect>
                    {/* Completed bar */}
                    <rect
                      x={xBase + barW + 2} y={chartH - cH} width={barW} height={Math.max(cH, 1)}
                      fill="#34d399" rx="2"
                      className="cursor-pointer transition-opacity hover:opacity-75"
                      onMouseMove={e => handleBarHover(e, `${d.day} Completed`, String(d.completed))}
                      onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                    >
                      <title>{d.day} Completed: {d.completed}</title>
                    </rect>
                    {/* Cancelled bar */}
                    <rect
                      x={xBase + (barW + 2) * 2} y={chartH - xnH} width={barW} height={Math.max(xnH, 1)}
                      fill="#f87171" rx="2"
                      className="cursor-pointer transition-opacity hover:opacity-75"
                      onMouseMove={e => handleBarHover(e, `${d.day} Cancelled`, String(d.cancelled))}
                      onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                    >
                      <title>{d.day} Cancelled: {d.cancelled}</title>
                    </rect>
                    {/* X label */}
                    <text x={xBase + barW + 7} y="185" textAnchor="middle" className="text-[10px] fill-slate-500">{d.day}</text>
                    {/* Total label above bars */}
                    {d.total > 0 && (
                      <text x={xBase + barW + 7} y={chartH - Math.max(sH, cH, xnH) - 5} textAnchor="middle" className="text-[9px] fill-slate-400">
                        {d.total}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* SVG Tooltip */}
              {tooltip.visible && (
                <g>
                  <rect
                    x={tooltip.x - 40} y={tooltip.y - 28}
                    width="80" height="24" rx="4"
                    fill="#1e3a6e" stroke="rgba(14,165,233,0.4)" strokeWidth="1"
                  />
                  <text x={tooltip.x} y={tooltip.y - 19} textAnchor="middle" className="fill-white text-[9px] font-semibold">
                    {tooltip.label}
                  </text>
                  <text x={tooltip.x} y={tooltip.y - 9} textAnchor="middle" className="fill-sky-300 text-[10px] font-bold">
                    {tooltip.value}
                  </text>
                </g>
              )}
            </svg>
          </div>
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5 text-xs">
            {[['#0ea5e9','Scheduled'],['#34d399','Completed'],['#f87171','Cancelled']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                <span className="text-slate-400">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Status Donut (REAL DATA) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Appointment Status</h2>
            <span className="text-xs text-sky-400">All Time</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                {/* Scheduled (blue) */}
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="#0ea5e9" strokeWidth="4"
                  strokeDasharray={`${scheduledPct} ${100 - scheduledPct}`}
                  strokeDashoffset="0"
                  className="transition-all duration-700"
                >
                  <title>Scheduled: {todayApts} ({scheduledPct}%)</title>
                </circle>
                {/* Completed (green) */}
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="#34d399" strokeWidth="4"
                  strokeDasharray={`${completedPct} ${100 - completedPct}`}
                  strokeDashoffset={`${-scheduledPct}`}
                  className="transition-all duration-700"
                >
                  <title>Completed: {completedApts} ({completedPct}%)</title>
                </circle>
                {/* Cancelled (red) */}
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="#f87171" strokeWidth="4"
                  strokeDasharray={`${cancelledPct} ${100 - cancelledPct}`}
                  strokeDashoffset={`${-(scheduledPct + completedPct)}`}
                  className="transition-all duration-700"
                >
                  <title>Cancelled: {cancelledCount} ({cancelledPct}%)</title>
                </circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Total</span>
                <span className="text-lg font-bold text-white leading-none">{totalApts}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 text-xs w-full">
              {[
                { label: 'Scheduled', value: todayApts, pct: scheduledPct, color: '#0ea5e9' },
                { label: 'Completed', value: completedApts, pct: completedPct, color: '#34d399' },
                { label: 'Cancelled', value: cancelledCount, pct: cancelledPct, color: '#f87171' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
                      <span className="text-slate-300 font-medium">{item.label}</span>
                    </div>
                    <span className="text-slate-400">{item.value} ({item.pct}%)</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5">
                    <div
                      className="h-1 rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue breakdown */}
          {billingStats && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Revenue Summary</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Total', value: formatINR(totalRevenue), color: '#fb923c' },
                  { label: 'Paid', value: formatINR(paidRevenue), color: '#34d399' },
                  { label: 'Pending', value: formatINR(pendingRevenue), color: '#f87171' },
                ].map(r => (
                  <div key={r.label} className="p-2 rounded-lg" style={{ background: `${r.color}0d`, border: `1px solid ${r.color}20` }}>
                    <p className="text-sm font-bold" style={{ color: r.color }}>{r.value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments (REAL DATA) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Appointments</h2>
            <button onClick={() => navigate('/appointments')} className="text-xs text-sky-400 hover:text-sky-300">View all →</button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(56,189,248,0.05)' }} />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <Calendar size={32} className="text-slate-700" />
              <p className="text-sm text-slate-500">No appointments yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.slice(0, 6).map(apt => {
                const statusColor: Record<string, string> = {
                  SCHEDULED: '#0ea5e9', COMPLETED: '#34d399', CANCELLED: '#f87171',
                };
                const st = apt.status ?? 'SCHEDULED';
                const sc = statusColor[st] ?? '#94a3b8';
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5"
                    style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.08)' }}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {apt.patient?.firstName} {apt.patient?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                        {apt.reason ? ` · ${apt.reason}` : ''}
                        {apt.appointmentDate ? ` · ${new Date(apt.appointmentDate).toLocaleDateString('en-IN')}` : ''}
                      </p>
                    </div>
                    <span
                      className="badge text-xs px-2 py-1 flex-shrink-0"
                      style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Overview (REAL DATA) */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">System Overview</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Patients', value: patients.length, max: Math.max(patients.length + 10, 20), color: '#0ea5e9', display: String(patients.length) },
              { label: 'Scheduled Appointments', value: todayApts, max: Math.max(totalApts, 5), color: '#34d399', display: String(todayApts) },
              { label: 'Total Doctors', value: (doctors as unknown[]).length, max: Math.max((doctors as unknown[]).length + 5, 10), color: '#a78bfa', display: String((doctors as unknown[]).length) },
              { label: 'Pending Invoices', value: billingStats?.pendingInvoices ?? 0, max: Math.max(billingStats?.totalInvoices ?? 1, 1), color: '#fb923c', display: String(billingStats?.pendingInvoices ?? '—') },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-semibold" style={{ color: item.color }}>{item.display}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(56,189,248,0.08)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: item.max > 0 ? `${Math.min((item.value / item.max) * 100, 100)}%` : '0%',
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Activity size={12} className="text-sky-500 animate-pulse" />
              <span>All systems operational · Auto-refreshes every 30s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

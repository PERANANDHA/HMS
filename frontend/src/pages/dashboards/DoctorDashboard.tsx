import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Clock, CheckCircle, FileText, RefreshCw } from 'lucide-react';
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

interface TooltipState { x: number; y: number; text: string; visible: boolean; }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, text: '', visible: false });

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [a, p] = await Promise.all([
        axiosInstance.get('/appointments'),
        axiosInstance.get('/patients'),
      ]);
      setAppointments(a.data);
      setPatients(p.data);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const scheduled = appointments.filter(a => a.status === 'SCHEDULED');
  const completed = appointments.filter(a => a.status === 'COMPLETED');
  const cancelled = appointments.filter(a => a.status === 'CANCELLED');

  // Real weekly bar chart data
  const weeklyData = DAYS.map((day, dayIdx) => {
    const dayApts = appointments.filter(a => {
      if (!a.appointmentDate) return false;
      return new Date(a.appointmentDate).getDay() === dayIdx;
    });
    return {
      day,
      scheduled: dayApts.filter(a => a.status === 'SCHEDULED').length,
      completed: dayApts.filter(a => a.status === 'COMPLETED').length,
      total: dayApts.length,
    };
  });
  const maxVal = Math.max(...weeklyData.map(d => d.total), 3);

  // Appointment reason distribution from real data
  const reasonMap: Record<string, number> = {};
  appointments.forEach(a => {
    const r = a.reason?.trim() || 'General';
    reasonMap[r] = (reasonMap[r] || 0) + 1;
  });
  const reasonEntries = Object.entries(reasonMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const totalReasoned = reasonEntries.reduce((s, [, c]) => s + c, 0) || 1;
  const reasonColors = ['#0ea5e9', '#a78bfa', '#fb923c', '#34d399'];

  // Donut segments for reasons
  let offset = 0;
  const donutSegments = reasonEntries.map(([label, count], i) => {
    const pct = Math.round((count / totalReasoned) * 100);
    const seg = { label, count, pct, color: reasonColors[i], offset };
    offset += pct;
    return seg;
  });

  const chartH = 160;
  const chartTop = 20;
  const chartRange = chartH - chartTop;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Doctor's Portal</h1>
          <p className="page-subtitle">Welcome back, {user?.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-sky-500/10 transition-all"
            style={{ border: '1px solid rgba(14,165,233,0.2)' }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Queue", value: loading ? '—' : scheduled.length, icon: Clock, color: '#0ea5e9' },
          { label: 'Completed Today', value: loading ? '—' : completed.length, icon: CheckCircle, color: '#34d399' },
          { label: 'Total Patients', value: loading ? '—' : patients.length, icon: Users, color: '#a78bfa' },
          { label: 'All Appointments', value: loading ? '—' : appointments.length, icon: Calendar, color: '#fb923c' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card group cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: `${s.color}15` }}>
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
        {/* Real Weekly Bar Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Consultation Analytics</h2>
            <span className="text-xs text-slate-500">Mon - Sun</span>
          </div>
          <div className="relative pt-2">
            <svg
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
              {[0, 1, 2, 3].map(i => (
                <text key={i} x="10" y={chartH - (chartRange / 3) * i + 4} className="text-[10px] fill-slate-500">
                  {Math.round((maxVal / 3) * i)}
                </text>
              ))}

              {weeklyData.map((d, idx) => {
                const xBase = 55 + idx * 60;
                const barW = 14;
                const sH = maxVal > 0 ? (d.scheduled / maxVal) * chartRange : 0;
                const cH = maxVal > 0 ? (d.completed / maxVal) * chartRange : 0;
                return (
                  <g key={d.day}>
                    <rect
                      x={xBase} y={chartH - sH} width={barW} height={Math.max(sH, 1)}
                      fill="#0ea5e9" rx="2"
                      className="cursor-pointer transition-opacity hover:opacity-70"
                      onMouseEnter={e => {
                        const r = (e.target as SVGRectElement).getBoundingClientRect();
                        setTooltip({ x: r.x + r.width / 2, y: r.y, text: `${d.day} Scheduled: ${d.scheduled}`, visible: true });
                      }}
                      onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                    >
                      <title>{d.day} Scheduled: {d.scheduled}</title>
                    </rect>
                    <rect
                      x={xBase + barW + 3} y={chartH - cH} width={barW} height={Math.max(cH, 1)}
                      fill="#34d399" rx="2"
                      className="cursor-pointer transition-opacity hover:opacity-70"
                      onMouseEnter={e => {
                        const r = (e.target as SVGRectElement).getBoundingClientRect();
                        setTooltip({ x: r.x + r.width / 2, y: r.y, text: `${d.day} Completed: ${d.completed}`, visible: true });
                      }}
                      onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                    >
                      <title>{d.day} Completed: {d.completed}</title>
                    </rect>
                    <text x={xBase + barW + 3} y="185" textAnchor="middle" className="text-[10px] fill-slate-500">{d.day}</text>
                    {d.total > 0 && (
                      <text x={xBase + barW + 3} y={chartH - Math.max(sH, cH) - 5} textAnchor="middle" className="text-[9px] fill-slate-400">{d.total}</text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          {/* Tooltip (fixed positioned based on mouse) */}
          {tooltip.visible && (
            <div
              className="fixed z-50 pointer-events-none px-2 py-1 rounded text-xs text-white font-semibold"
              style={{ left: tooltip.x, top: tooltip.y - 32, transform: 'translateX(-50%)', background: '#1e3a6e', border: '1px solid rgba(14,165,233,0.4)' }}
            >
              {tooltip.text}
            </div>
          )}
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#0ea5e9]" /><span className="text-slate-400">Scheduled</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#34d399]" /><span className="text-slate-400">Completed</span></div>
          </div>
        </div>

        {/* Reason Distribution Donut (REAL DATA) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Appointment Reasons</h2>
            <span className="text-xs text-sky-400">All Time</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                {donutSegments.map(seg => (
                  <circle
                    key={seg.label}
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={seg.color} strokeWidth="4"
                    strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                    strokeDashoffset={`${-seg.offset}`}
                    className="transition-all duration-700"
                  >
                    <title>{seg.label}: {seg.count} ({seg.pct}%)</title>
                  </circle>
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">Total</span>
                <span className="text-base font-bold text-white leading-none">{appointments.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2.5 text-xs w-full">
              {donutSegments.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No appointments yet</p>
              ) : donutSegments.map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-slate-300 font-medium truncate max-w-[100px]">{item.label}</span>
                    </div>
                    <span className="text-slate-500">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5">
                    <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Today's Schedule</h2>
            <button onClick={() => navigate('/appointments')} className="text-xs text-sky-400 hover:text-sky-300">View all →</button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'rgba(56,189,248,0.05)' }} />)}</div>
          ) : scheduled.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <CheckCircle size={32} className="text-green-500" />
              <p className="text-sm text-slate-400">No pending appointments</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scheduled.map((apt, idx) => (
                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)' }}>
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold flex-shrink-0">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{apt.reason ?? 'Consultation'} {apt.appointmentDate ? `· ${new Date(apt.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
                  </div>
                  <button className="btn-secondary text-xs px-2 py-1">Start</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + OPD Stats */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Write Prescription', icon: FileText, color: '#0ea5e9', path: '/patients' },
              { label: 'New Appointment', icon: Calendar, color: '#34d399', path: '/appointments' },
              { label: 'Patient Records', icon: Users, color: '#a78bfa', path: '/patients' },
              { label: 'Today\'s Completed', icon: CheckCircle, color: '#fb923c', path: '/appointments' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: `${action.color}0d`, border: `1px solid ${action.color}25` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}20` }}>
                    <Icon size={20} style={{ color: action.color }} />
                  </div>
                  <span className="text-xs font-medium text-slate-300 text-center">{action.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">OPD Overview</h3>
            <div className="space-y-2">
              {[
                { label: 'Waiting', count: scheduled.length, color: '#0ea5e9' },
                { label: 'Completed', count: completed.length, color: '#34d399' },
                { label: 'Cancelled', count: cancelled.length, color: '#f87171' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-semibold tabular-nums" style={{ color: item.color }}>{loading ? '—' : item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

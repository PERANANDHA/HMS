import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Stethoscope, Plus, RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: number;
  status: string;
  appointmentDate?: string;
  patient?: { firstName?: string; lastName?: string };
  doctor?: { firstName?: string; lastName?: string };
  reason?: string;
}

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<unknown[]>([]);
  const [doctors, setDoctors] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [a, p, d] = await Promise.all([
        axiosInstance.get('/appointments'),
        axiosInstance.get('/patients'),
        axiosInstance.get('/doctors'),
      ]);
      setAppointments(a.data);
      setPatients(p.data);
      setDoctors(d.data);
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

  // Hourly distribution: group appointments by hour of day
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const hourlyData = hours.map(h => ({
    label: `${h}:00`,
    count: appointments.filter(a => {
      if (!a.appointmentDate) return false;
      return new Date(a.appointmentDate).getHours() === h;
    }).length,
  }));
  const maxHourly = Math.max(...hourlyData.map(h => h.count), 1);

  // Status donut from real data
  const total = appointments.length || 1;
  const scheduledPct = Math.round((scheduled.length / total) * 100);
  const completedPct = Math.round((completed.length / total) * 100);
  const cancelledPct = Math.round((cancelled.length / total) * 100);

  const chartH = 160;
  const chartRange = 140;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reception Desk</h1>
          <p className="page-subtitle">Welcome, {user?.name} · Manage appointments and patient registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          <button
            onClick={() => fetchAll(true)} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-sky-500/10 transition-all"
            style={{ border: '1px solid rgba(14,165,233,0.2)' }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled Today', value: loading ? '—' : scheduled.length, icon: Calendar, color: '#0ea5e9' },
          { label: 'Total Patients', value: loading ? '—' : patients.length, icon: Users, color: '#34d399' },
          { label: 'Active Doctors', value: loading ? '—' : doctors.length, icon: Stethoscope, color: '#a78bfa' },
          { label: 'Completed Today', value: loading ? '—' : completed.length, icon: Plus, color: '#fb923c' },
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
        {/* Hourly Appointment Traffic Bar Chart (REAL DATA) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Appointment Traffic by Hour</h2>
            <span className="text-xs text-slate-500">Today</span>
          </div>
          <div className="relative pt-2">
            <svg viewBox="0 0 520 210" className="w-full h-auto overflow-visible">
              {/* Gridlines */}
              {[0, 1, 2].map(i => (
                <line key={i} x1="40" y1={20 + i * 70} x2="500" y2={20 + i * 70}
                  stroke="rgba(255,255,255,0.06)" strokeDasharray={i === 2 ? undefined : '3 3'} />
              ))}
              {[0, 1, 2].map(i => (
                <text key={i} x="10" y={chartH - (chartRange / 2) * i + 4} className="text-[10px] fill-slate-500">
                  {Math.round((maxHourly / 2) * i)}
                </text>
              ))}

              {hourlyData.map((h, idx) => {
                const xBase = 50 + idx * 44;
                const barH = maxHourly > 0 ? (h.count / maxHourly) * chartRange : 0;
                const isHovered = hoveredBar === idx;
                return (
                  <g key={h.label}>
                    <rect
                      x={xBase} y={chartH - barH} width="22" height={Math.max(barH, 2)}
                      fill={isHovered ? '#38bdf8' : '#a78bfa'} rx="3"
                      className="cursor-pointer transition-all duration-200"
                      style={{ opacity: isHovered ? 1 : 0.8 }}
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <title>{h.label}: {h.count} appointments</title>
                    </rect>
                    {isHovered && barH > 0 && (
                      <text x={xBase + 11} y={chartH - barH - 6} textAnchor="middle" className="fill-white text-[10px] font-bold">
                        {h.count}
                      </text>
                    )}
                    <text x={xBase + 11} y="185" textAnchor="middle" className="text-[9px] fill-slate-500">{h.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#a78bfa]" />
              <span className="text-slate-400">Appointments per Hour (hover for count)</span>
            </div>
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
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0ea5e9" strokeWidth="4"
                  strokeDasharray={`${scheduledPct} ${100 - scheduledPct}`} strokeDashoffset="0"
                  className="transition-all duration-700">
                  <title>Scheduled: {scheduled.length} ({scheduledPct}%)</title>
                </circle>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#34d399" strokeWidth="4"
                  strokeDasharray={`${completedPct} ${100 - completedPct}`} strokeDashoffset={`${-scheduledPct}`}
                  className="transition-all duration-700">
                  <title>Completed: {completed.length} ({completedPct}%)</title>
                </circle>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f87171" strokeWidth="4"
                  strokeDasharray={`${cancelledPct} ${100 - cancelledPct}`} strokeDashoffset={`${-(scheduledPct + completedPct)}`}
                  className="transition-all duration-700">
                  <title>Cancelled: {cancelled.length} ({cancelledPct}%)</title>
                </circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Total</span>
                <span className="text-lg font-bold text-white leading-none">{appointments.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 text-xs w-full">
              {[
                { label: 'Scheduled', count: scheduled.length, pct: scheduledPct, color: '#0ea5e9' },
                { label: 'Completed', count: completed.length, pct: completedPct, color: '#34d399' },
                { label: 'Cancelled', count: cancelled.length, pct: cancelledPct, color: '#f87171' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
                      <span className="text-slate-300 font-medium">{item.label}</span>
                    </div>
                    <span className="text-slate-400">{item.count} ({item.pct}%)</span>
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
        {/* Quick Actions */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Book New Appointment', icon: Calendar, color: '#0ea5e9', path: '/appointments' },
              { label: 'Register New Patient', icon: Users, color: '#34d399', path: '/patients' },
              { label: 'View Doctor Schedules', icon: Stethoscope, color: '#a78bfa', path: '/doctors' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: `${action.color}0d`, border: `1px solid ${action.color}25` }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${action.color}20` }}>
                    <Icon size={18} style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{action.label}</span>
                  <span className="ml-auto text-slate-600">→</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* OPD Queue (REAL DATA) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">OPD Queue</h2>
            <span className="badge badge-blue">{scheduled.length} waiting</span>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'rgba(56,189,248,0.05)' }} />)}</div>
          ) : scheduled.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <Calendar size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">Queue is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scheduled.map((apt, i) => (
                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
                  style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.08)' }}>
                  <span className="text-xs font-bold text-sky-500 w-5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{apt.patient?.firstName} {apt.patient?.lastName}</p>
                    <p className="text-xs text-slate-500">Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                      {apt.appointmentDate ? ` · ${new Date(apt.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </p>
                  </div>
                  <button className="btn-secondary text-xs px-2 py-1">Check In</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

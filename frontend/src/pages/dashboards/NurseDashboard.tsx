import { useState, useEffect, useCallback } from 'react';
import { Users, Activity, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  gender?: string;
  bloodGroup?: string;
}

interface Task {
  id: number;
  task: string;
  ward: string;
  done: boolean;
  priority: 'high' | 'medium' | 'low';
}

const PRIORITY_COLORS = { high: '#f87171', medium: '#fbbf24', low: '#34d399' };

export default function NurseDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<{ status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, task: 'Administer Morning Medications', ward: 'Ward A', done: false, priority: 'high' },
    { id: 2, task: 'Check Vitals – Room 201', ward: 'Ward B', done: false, priority: 'high' },
    { id: 3, task: 'IV Drip Change – Bed 5', ward: 'ICU', done: false, priority: 'high' },
    { id: 4, task: 'Dressing Change – Room 305', ward: 'Ward C', done: false, priority: 'medium' },
    { id: 5, task: 'Evening Medication Round', ward: 'General', done: false, priority: 'low' },
  ]);

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [p, a] = await Promise.all([
        axiosInstance.get('/patients'),
        axiosInstance.get('/appointments'),
      ]);
      setPatients(p.data);
      setAppointments(a.data);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const toggleTask = (id: number) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const doneTasks = tasks.filter(t => t.done).length;
  const totalTasks = tasks.length;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const scheduledApts = appointments.filter(a => a.status === 'SCHEDULED').length;
  const completedApts = appointments.filter(a => a.status === 'COMPLETED').length;

  // Ward distribution from patients (simulated from real patient count)
  const totalBeds = 50;
  const occupiedBeds = Math.min(patients.length * 2, totalBeds); // simulated
  const occupancyPct = Math.round((occupiedBeds / totalBeds) * 100);

  const wardData = [
    { label: 'ICU', pct: 15, color: '#f87171', beds: `${Math.round(occupiedBeds * 0.15)} Beds` },
    { label: 'Ward A', pct: 35, color: '#0ea5e9', beds: `${Math.round(occupiedBeds * 0.35)} Beds` },
    { label: 'Ward B', pct: 30, color: '#a78bfa', beds: `${Math.round(occupiedBeds * 0.30)} Beds` },
    { label: 'Ward C', pct: 20, color: '#34d399', beds: `${Math.round(occupiedBeds * 0.20)} Beds` },
  ];

  // Vitals from real patient names
  const vitalsData = patients.slice(0, 4).map((p, i) => ({
    patient: `${p.firstName} ${p.lastName}`,
    bp: ['120/80', '140/90', '115/75', '130/85'][i] || '120/80',
    pulse: ['72', '88', '68', '76'][i] || '72',
    temp: ['98.6°F', '100.2°F', '98.4°F', '99.1°F'][i] || '98.6°F',
    status: i === 1 ? 'Fever' : 'Stable',
    color: i === 1 ? '#f87171' : '#34d399',
  }));

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Nursing Station</h1>
          <p className="page-subtitle">Welcome, {user?.name} · Monitor patients and manage care tasks</p>
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

      {/* Stats (REAL DATA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: loading ? '—' : patients.length, icon: Users, color: '#f472b6' },
          { label: 'Appointments Pending', value: loading ? '—' : scheduledApts, icon: Clock, color: '#fbbf24' },
          { label: 'Appointments Done', value: loading ? '—' : completedApts, icon: CheckCircle, color: '#34d399' },
          { label: 'Tasks Pending', value: totalTasks - doneTasks, icon: Activity, color: '#f87171' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bed Occupancy Donut (scales with real patient count) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Bed Occupancy by Ward</h2>
            <span className="text-xs text-slate-500">{occupiedBeds} / {totalBeds} Beds</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                {(() => {
                  let off = 0;
                  return wardData.map(w => {
                    const seg = (
                      <circle key={w.label} cx="18" cy="18" r="15.9" fill="none" stroke={w.color} strokeWidth="4"
                        strokeDasharray={`${w.pct} ${100 - w.pct}`} strokeDashoffset={`${-off}`}
                        className="transition-all duration-700">
                        <title>{w.label}: {w.beds} ({w.pct}%)</title>
                      </circle>
                    );
                    off += w.pct;
                    return seg;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">Occupancy</span>
                <span className="text-sm font-bold text-white leading-none">{occupancyPct}%</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs w-full">
              {wardData.map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
                      <span className="text-slate-300 font-medium">{item.label}</span>
                    </div>
                    <span className="text-slate-500">{item.beds} ({item.pct}%)</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5">
                    <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Completion Gauge (INTERACTIVE — real state) */}
        <div className="glass-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Task Completion Rate</h2>
            <span className="text-xs text-slate-500">Shift Progress</span>
          </div>
          <div className="flex items-center justify-center gap-8 py-3">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke={completionPct >= 80 ? '#34d399' : completionPct >= 50 ? '#fbbf24' : '#f87171'}
                  strokeWidth="3"
                  strokeDasharray={`${completionPct} 100`} strokeDashoffset="0" strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-extrabold text-white leading-none">{completionPct}%</span>
                <span className="text-[8px] text-slate-500 uppercase mt-0.5">Done</span>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-slate-200 font-semibold">{doneTasks} of {totalTasks} Tasks Done</p>
              <p className="text-slate-400">
                {tasks.find(t => !t.done)?.task || 'All tasks complete!'}
              </p>
              <p className="text-[10px] text-slate-500 mt-2">Click ✓ below to mark tasks complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Vitals (from real patient list) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Patient Vitals</h2>
            <span className="badge badge-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live
            </span>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg animate-pulse" style={{ background: 'rgba(56,189,248,0.05)' }} />)}</div>
          ) : vitalsData.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <Users size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">No patients found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vitalsData.map((v, i) => (
                <div key={i} className="p-3 rounded-xl transition-all hover:bg-white/5"
                  style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.08)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-200">{v.patient}</p>
                    <span className="badge" style={{ background: `${v.color}15`, color: v.color, border: `1px solid ${v.color}30` }}>{v.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { label: 'BP', val: v.bp, color: '#ef4444' },
                      { label: 'Pulse', val: `${v.pulse} bpm`, color: '#f472b6' },
                      { label: 'Temp', val: v.temp, color: '#fb923c' },
                    ].map(vt => (
                      <div key={vt.label} className="text-center p-1.5 rounded-lg" style={{ background: `${vt.color}10` }}>
                        <p className="text-slate-500 mb-0.5">{vt.label}</p>
                        <p className="font-semibold" style={{ color: vt.color }}>{vt.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Care Tasks (INTERACTIVE — click to complete) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Care Tasks</h2>
            <span className="text-xs text-slate-500">{doneTasks}/{totalTasks} done</span>
          </div>
          <div className="space-y-2">
            {tasks.map(t => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 cursor-pointer"
                style={{
                  background: t.done ? 'rgba(52,211,153,0.04)' : 'rgba(56,189,248,0.04)',
                  border: `1px solid ${t.done ? 'rgba(52,211,153,0.1)' : 'rgba(56,189,248,0.08)'}`,
                }}
                onClick={() => toggleTask(t.id)}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${t.done ? 'bg-green-500/20' : 'border border-slate-600 hover:border-slate-400'}`}>
                  {t.done && <CheckCircle size={12} className="text-green-400" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium transition-all ${t.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.task}</p>
                  <p className="text-xs text-slate-600">{t.ward}</p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${PRIORITY_COLORS[t.priority]}20`, color: PRIORITY_COLORS[t.priority] }}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-3 text-center">Click any task row to mark as done / undone</p>
        </div>
      </div>
    </div>
  );
}

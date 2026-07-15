import { useEffect, useState, useCallback } from 'react';
import { Calendar, FileText, CreditCard, Clock, RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: number;
  status: string;
  reason?: string;
  appointmentDate?: string;
  patient?: { firstName?: string; lastName?: string; email?: string };
  doctor?: { firstName?: string; lastName?: string };
}

interface Invoice {
  id: number;
  amount?: number;
  status?: string;
  dueDate?: string;
  description?: string;
  patient?: { id: number; email?: string };
}

export default function PatientPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [a, inv] = await Promise.all([
        axiosInstance.get('/appointments'),
        axiosInstance.get('/billing/invoices').catch(() => ({ data: [] })),
      ]);
      setAppointments(a.data);
      setInvoices(inv.data);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Filter appointments relevant to this patient user by email
  const myAppointments = appointments.filter(a =>
    a.patient?.email?.toLowerCase() === user?.email?.toLowerCase()
  );
  // Fallback: show all if no matches (patient user)
  const displayedApts = myAppointments.length > 0 ? myAppointments : appointments;

  const upcoming = displayedApts.filter(a => a.status === 'SCHEDULED');
  const completed = displayedApts.filter(a => a.status === 'COMPLETED');

  // My invoices - filter by patient email or show all
  const myInvoices = invoices.filter(inv =>
    inv.patient?.email?.toLowerCase() === user?.email?.toLowerCase()
  );
  const displayedInvoices = myInvoices.length > 0 ? myInvoices : invoices;

  const pendingInvoices = displayedInvoices.filter(i => i.status === 'PENDING');
  const paidInvoices = displayedInvoices.filter(i => i.status === 'PAID');

  const formatINR = (amt?: number) => {
    if (!amt) return '₹0';
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const statusColor: Record<string, string> = {
    PAID: '#34d399', PENDING: '#fb923c', OVERDUE: '#f87171',
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome Header */}
      <div
        className="p-6 rounded-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.08) 100%)',
          border: '1px solid rgba(14,165,233,0.15)',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm">Your health portal — appointments, records, and billing in one place</p>
          </div>
          <button
            onClick={() => fetchAll(true)} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-sky-500/10 transition-all"
            style={{ border: '1px solid rgba(14,165,233,0.2)' }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Upcoming', value: loading ? '—' : upcoming.length, color: '#0ea5e9' },
            { label: 'Completed', value: loading ? '—' : completed.length, color: '#34d399' },
            { label: 'Invoices', value: loading ? '—' : displayedInvoices.length, color: '#fb923c' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments (REAL DATA) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">My Appointments</h2>
            <button onClick={() => navigate('/appointments')} className="text-xs text-sky-400 hover:text-sky-300">Book new →</button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'rgba(56,189,248,0.05)' }} />)}</div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <Calendar size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">No upcoming appointments</p>
              <button onClick={() => navigate('/appointments')} className="btn-primary text-xs px-3 py-1.5 mt-1">Book Appointment</button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map(apt => (
                <div key={apt.id} className="p-3 rounded-xl transition-all hover:bg-white/5"
                  style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</p>
                      <p className="text-xs text-slate-500">
                        {apt.reason || 'Consultation'}
                        {apt.appointmentDate ? ` · ${new Date(apt.appointmentDate).toLocaleDateString('en-IN')} ${new Date(apt.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                      </p>
                    </div>
                    <span className="badge badge-cyan">Upcoming</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical History from completed appointments (REAL DATA) */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Medical History</h2>
          {loading ? (
            <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'rgba(56,189,248,0.05)' }} />)}</div>
          ) : completed.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <FileText size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">No past visits yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completed.map(apt => (
                <div key={apt.id} className="p-3 rounded-xl transition-all hover:bg-white/5"
                  style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</p>
                      <p className="text-xs text-slate-400">
                        {apt.reason || 'General'}
                        {apt.appointmentDate ? ` · ${new Date(apt.appointmentDate).toLocaleDateString('en-IN')}` : ''}
                      </p>
                    </div>
                    <span className="badge badge-green">Done</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing (REAL DATA) */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">My Invoices</h2>
            <button onClick={() => navigate('/billing')} className="text-xs text-sky-400 hover:text-sky-300">View all →</button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'rgba(56,189,248,0.05)' }} />)}</div>
          ) : displayedInvoices.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <CreditCard size={28} className="text-slate-700" />
              <p className="text-sm text-slate-500">No invoices found</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {displayedInvoices.slice(0, 5).map(inv => {
                  const st = inv.status || 'PENDING';
                  const sc = statusColor[st.toUpperCase()] || '#94a3b8';
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5"
                      style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.1)' }}>
                      <div>
                        <p className="text-sm font-medium text-slate-200">#{inv.id} {inv.description || 'Invoice'}</p>
                        <p className="text-xs text-slate-500">{inv.dueDate ? `Due: ${inv.dueDate}` : 'No due date'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-400">{formatINR(inv.amount)}</p>
                        <span className="badge text-xs" style={{ background: `${sc}15`, color: sc, border: `1px solid ${sc}30` }}>{st}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Summary */}
              <div className="flex gap-3 text-xs">
                <div className="flex-1 p-2 rounded-lg text-center" style={{ background: 'rgba(34,211,153,0.08)', border: '1px solid rgba(34,211,153,0.15)' }}>
                  <p className="font-bold text-green-400">{paidInvoices.length}</p>
                  <p className="text-slate-500 mt-0.5">Paid</p>
                </div>
                <div className="flex-1 p-2 rounded-lg text-center" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)' }}>
                  <p className="font-bold text-orange-400">{pendingInvoices.length}</p>
                  <p className="text-slate-500 mt-0.5">Pending</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Links */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Book Appointment', icon: Calendar, color: '#0ea5e9', path: '/appointments' },
              { label: 'My Records', icon: FileText, color: '#a78bfa', path: '/patients' },
              { label: 'View Bills', icon: CreditCard, color: '#fb923c', path: '/billing' },
              { label: 'Past Visits', icon: Clock, color: '#34d399', path: '/appointments' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: `${a.color}0d`, border: `1px solid ${a.color}25` }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${a.color}20` }}>
                    <Icon size={18} style={{ color: a.color }} />
                  </div>
                  <span className="text-xs font-medium text-slate-300 text-center">{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

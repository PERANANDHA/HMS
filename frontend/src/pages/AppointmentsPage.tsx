import { useState, useEffect } from 'react';
import { Search, Plus, Calendar, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

interface Appointment {
  id: number;
  status: string;
  reason?: string;
  appointmentDate?: string;
  patient?: { id?: number; firstName?: string; lastName?: string };
  doctor?: { id?: number; firstName?: string; lastName?: string };
}
interface Patient { id: number; firstName: string; lastName: string; }
interface Doctor  { id: number; firstName: string; lastName: string; }

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: '#0ea5e9', COMPLETED: '#34d399', CANCELLED: '#f87171',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ patientId: '', doctorId: '', reason: '', appointmentDate: '' });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('/appointments'),
      axiosInstance.get('/patients'),
      axiosInstance.get('/doctors'),
    ]).then(([a, p, d]) => {
      setAppointments(a.data);
      setPatients(p.data);
      setDoctors(d.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const tabs = ['All', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];
  const filtered = appointments.filter(a => {
    const matchSearch = (`${a.patient?.firstName} ${a.patient?.lastName} ${a.doctor?.firstName} ${a.doctor?.lastName}`).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await axiosInstance.post('/appointments', {
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        reason: form.reason,
        appointmentDate: form.appointmentDate,
        status: 'SCHEDULED',
      });
      setShowModal(false);
      setForm({ patientId: '', doctorId: '', reason: '', appointmentDate: '' });
      fetchAll();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(axiosErr.response?.data?.message ?? 'Failed to book appointment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{loading ? '...' : `${appointments.length} total · ${appointments.filter(a => a.status === 'SCHEDULED').length} scheduled`}</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormError(''); }} className="btn-primary">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by patient or doctor..." className="input-dark pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: 'rgba(56,189,248,0.05)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setStatusFilter(t)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={statusFilter === t ? { background: '#0ea5e9', color: 'white' } : { color: '#64748b' }}
            >
              {t === 'All' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading appointments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(apt => {
                  const color = STATUS_COLORS[apt.status] ?? '#94a3b8';
                  return (
                    <tr key={apt.id}>
                      <td className="font-mono text-sky-400 text-xs">#{apt.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-sky-500/15 flex items-center justify-center text-xs font-bold text-sky-400">
                            {apt.patient?.firstName?.[0] ?? '?'}
                          </div>
                          <span className="font-medium text-slate-200">{apt.patient?.firstName} {apt.patient?.lastName}</span>
                        </div>
                      </td>
                      <td className="text-slate-300">Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}</td>
                      <td className="text-slate-400">{apt.reason ?? '—'}</td>
                      <td className="text-slate-400 text-xs">{apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Book Appointment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Close dialog"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBook} className="p-5 space-y-4">
              {formError && <div className="px-4 py-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20">{formError}</div>}

              <div>
                <label htmlFor="apt-patient" className="label-dark">Patient *</label>
                <select
                  id="apt-patient"
                  required
                  className="input-dark"
                  title="Select patient"
                  value={form.patientId}
                  onChange={e => setForm({...form, patientId: e.target.value})}
                >
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="apt-doctor" className="label-dark">Doctor *</label>
                <select
                  id="apt-doctor"
                  required
                  className="input-dark"
                  title="Select doctor"
                  value={form.doctorId}
                  onChange={e => setForm({...form, doctorId: e.target.value})}
                >
                  <option value="">Select doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="apt-datetime" className="label-dark">Appointment Date &amp; Time *</label>
                <input
                  id="apt-datetime"
                  required
                  type="datetime-local"
                  className="input-dark"
                  title="Appointment date and time"
                  value={form.appointmentDate}
                  onChange={e => setForm({...form, appointmentDate: e.target.value})}
                />
              </div>

              <div>
                <label className="label-dark">Reason / Chief Complaint</label>
                <input className="input-dark" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="e.g., Routine Checkup, Chest pain..." />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Booking...</> : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

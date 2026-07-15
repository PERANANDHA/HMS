import { useState, useEffect } from 'react';
import { Search, Stethoscope, Phone, Mail, Building2, Plus, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  department?: { id: number; name: string };
}


export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', phone: '', specialization: 'Cardiologist', departmentName: 'Cardiology' });

  const fetchDoctors = () => {
    setLoading(true);
    axiosInstance.get('/doctors')
      .then(r => { setDoctors(r.data); setError(null); })
      .catch(() => setError('Failed to load doctors.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const depts = ['All', ...Array.from(new Set(doctors.map(d => d.department?.name).filter(Boolean) as string[]))];

  const filtered = doctors.filter(d => {
    const matchSearch = `${d.firstName} ${d.lastName} ${d.specialization}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || d.department?.name === deptFilter;
    return matchSearch && matchDept;
  });

  const specColors: Record<string, string> = {
    Cardiologist: '#f87171', Neurologist: '#a78bfa', Surgeon: '#60a5fa',
    Pediatrician: '#34d399', default: '#0ea5e9',
  };

  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await axiosInstance.post('/doctors', addForm);
      setShowModal(false);
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', specialization: 'Cardiologist', departmentName: 'Cardiology' });
      fetchDoctors();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add doctor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-subtitle">{loading ? '...' : `${doctors.length} doctors on staff`}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search doctors..."
            className="input-dark pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {depts.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={deptFilter === d
                ? { background: '#0ea5e9', color: 'white' }
                : { background: 'rgba(56,189,248,0.06)', color: '#64748b', border: '1px solid rgba(56,189,248,0.1)' }
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 glass-card animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Stethoscope size={32} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const color = specColors[doc.specialization] ?? specColors.default;
            return (
              <div key={doc.id} className="glass-card p-5 hover:border-sky-500/30 transition-all hover:-translate-y-1 cursor-pointer" style={{ cursor: 'pointer' }}>
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
                  >
                    {doc.firstName[0]}{doc.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">Dr. {doc.firstName} {doc.lastName}</h3>
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                    >
                      {doc.specialization}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {doc.department && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Building2 size={12} className="text-slate-600 flex-shrink-0" />
                      {doc.department.name}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail size={12} className="text-slate-600 flex-shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone size={12} className="text-slate-600 flex-shrink-0" />
                    {doc.phone}
                  </div>
                </div>

                <div className="mt-4 pt-3 flex gap-2" style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}>
                  <button className="btn-secondary flex-1 text-xs py-1.5 justify-center">View Schedule</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Add New Doctor</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddDoctor} className="p-5 space-y-4">
              {formError && <div className="px-4 py-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">First Name *</label>
                  <input required className="input-dark" value={addForm.firstName} onChange={e => setAddForm({...addForm, firstName: e.target.value})} placeholder="Ramesh" />
                </div>
                <div>
                  <label className="label-dark">Last Name *</label>
                  <input required className="input-dark" value={addForm.lastName} onChange={e => setAddForm({...addForm, lastName: e.target.value})} placeholder="Kumar" />
                </div>
              </div>

              <div>
                <label className="label-dark">Email *</label>
                <input required type="email" className="input-dark" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} placeholder="doctor@ehms.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">Phone *</label>
                  <input required className="input-dark" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} placeholder="+91 94440-12345" />
                </div>
                <div>
                  <label className="label-dark">Specialization</label>
                  <select className="input-dark" value={addForm.specialization} onChange={e => setAddForm({...addForm, specialization: e.target.value})}>
                    {['Cardiologist', 'Neurologist', 'Surgeon', 'Pediatrician', 'Orthopedist', 'Dermatologist', 'General Physician'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-dark">Department Name</label>
                <input className="input-dark" value={addForm.departmentName} onChange={e => setAddForm({...addForm, departmentName: e.target.value})} placeholder="e.g. Cardiology" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</> : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

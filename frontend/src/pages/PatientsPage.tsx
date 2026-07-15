import { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, Mail, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  address?: string;
}

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', gender: 'Male', dateOfBirth: '', bloodGroup: '', address: '' };

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPatients = () => {
    setLoading(true);
    axiosInstance.get('/patients')
      .then(r => { setPatients(r.data); setError(null); })
      .catch(() => setError('Failed to load patients. Check backend connection.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const openAdd = () => {
    setSelectedPatient(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openView = (p: Patient) => {
    setSelectedPatient(p);
    setForm({ firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, gender: p.gender, dateOfBirth: p.dateOfBirth ?? '', bloodGroup: p.bloodGroup ?? '', address: p.address ?? '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (selectedPatient) {
        await axiosInstance.put(`/patients/${selectedPatient.id}`, form);
      } else {
        await axiosInstance.post('/patients', form);
      }
      setShowModal(false);
      fetchPatients();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(axiosErr.response?.data?.message ?? 'Failed to save patient.');
    } finally {
      setSaving(false);
    }
  };

  const genderColors: Record<string, string> = { Male: '#60a5fa', Female: '#f472b6', Other: '#a78bfa' };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{loading ? '...' : `${patients.length} total patients`}</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="input-dark pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading patients...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <X size={20} className="text-red-400" />
            </div>
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchPatients} className="btn-secondary mt-3 text-xs">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <User size={32} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No patients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Gender</th>
                  <th>Blood Group</th>
                  <th>DOB</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: `${genderColors[p.gender] ?? '#94a3b8'}20`, color: genderColors[p.gender] ?? '#94a3b8' }}>
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-slate-500">ID #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-slate-300 text-xs mb-0.5">
                        <Mail size={11} className="text-slate-500" /> {p.email}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Phone size={11} className="text-slate-500" /> {p.phone}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${genderColors[p.gender] ?? '#94a3b8'}15`, color: genderColors[p.gender] ?? '#94a3b8', border: `1px solid ${genderColors[p.gender] ?? '#94a3b8'}30` }}>
                        {p.gender}
                      </span>
                    </td>
                    <td>
                      {p.bloodGroup ? (
                        <span className="badge badge-red">{p.bloodGroup}</span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="text-slate-400">{p.dateOfBirth ?? '—'}</td>
                    <td className="text-right">
                      <button onClick={() => openView(p)} className="btn-secondary text-xs px-3 py-1.5">
                        View / Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5 border-b border-sky-500/10">
              <h2 className="text-lg font-bold text-white">{selectedPatient ? 'Patient Details' : 'Add New Patient'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {formError && (
                <div className="px-4 py-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">First Name *</label>
                  <input required className="input-dark" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="John" />
                </div>
                <div>
                  <label className="label-dark">Last Name *</label>
                  <input required className="input-dark" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="label-dark">Email *</label>
                <input required type="email" className="input-dark" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john.doe@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">Phone *</label>
                  <input required className="input-dark" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="label-dark">Gender *</label>
                  <select required className="input-dark" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-dark">Date of Birth</label>
                  <input type="date" className="input-dark" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
                </div>
                <div>
                  <label className="label-dark">Blood Group</label>
                  <select className="input-dark" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})}>
                    <option value="">Select...</option>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-dark">Address</label>
                <input className="input-dark" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Main St, City" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : selectedPatient ? 'Update Patient' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

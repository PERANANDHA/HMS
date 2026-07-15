import { useState } from 'react';
import { Users, IndianRupee, UserCheck, UserMinus, Plus, X, Download, Eye } from 'lucide-react';
import { printPayslip, downloadCSV } from '../utils/downloadUtils';

interface Employee {
  id: string;
  name: string;
  dept: string;
  role: string;
  salary: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  phone: string;
  email: string;
  joined: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'E001', name: 'Dr. Vijayakumar', dept: 'Cardiology', role: 'Doctor', salary: '₹1,20,000', status: 'Active', phone: '+91 94440-12345', email: 'vijayakumar@medicare.in', joined: '2022-01-15' },
  { id: 'E002', name: 'Nurse Meenakshi', dept: 'Nursing', role: 'Nurse', salary: '₹45,000', status: 'Active', phone: '+91 98410-67890', email: 'meenakshi.n@medicare.in', joined: '2023-03-10' },
  { id: 'E003', name: 'Pharmacist Anbarasan', dept: 'Pharmacy', role: 'Pharmacist', salary: '₹55,000', status: 'Active', phone: '+91 90000-11223', email: 'anbarasan.p@medicare.in', joined: '2021-09-01' },
  { id: 'E004', name: 'Receptionist Anjali', dept: 'Reception', role: 'Receptionist', salary: '₹35,000', status: 'Active', phone: '+91 99400-55667', email: 'anjali.r@medicare.in', joined: '2024-02-20' },
  { id: 'E005', name: 'Lab Tech Selvam', dept: 'Laboratory', role: 'Lab Tech', salary: '₹42,000', status: 'Active', phone: '+91 97900-33445', email: 'selvam.l@medicare.in', joined: '2023-07-05' },
  { id: 'E006', name: 'Dr. Subhashini Selvam', dept: 'Neurology', role: 'Doctor', salary: '₹1,10,000', status: 'On Leave', phone: '+91 98840-54321', email: 'subhashini.s@medicare.in', joined: '2022-06-15' },
  { id: 'E007', name: 'Karthikeyan Murugan', dept: 'Radiology', role: 'Radiologist', salary: '₹85,000', status: 'Active', phone: '+91 94440-77889', email: 'karthikeyan.m@medicare.in', joined: '2020-11-01' },
];

const roleColors: Record<string, string> = {
  Doctor: '#34d399', Nurse: '#f472b6', Pharmacist: '#fb923c',
  Receptionist: '#60a5fa', 'Lab Tech': '#facc15', Radiologist: '#a78bfa', default: '#94a3b8',
};

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Add employee form
  const [form, setForm] = useState({ name: '', dept: '', role: 'Doctor', salary: '', phone: '', email: '' });

  const active = employees.filter(e => e.status === 'Active').length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;

  const displayed = employees.filter(e =>
    e.name.toLowerCase().includes(searchText.toLowerCase()) ||
    e.dept.toLowerCase().includes(searchText.toLowerCase()) ||
    e.role.toLowerCase().includes(searchText.toLowerCase())
  );

  function handleAddEmployee() {
    if (!form.name || !form.dept || !form.salary) return;
    const newEmp: Employee = {
      id: `E${String(employees.length + 1).padStart(3, '0')}`,
      name: form.name,
      dept: form.dept,
      role: form.role,
      salary: `₹${parseInt(form.salary.replace(/[^0-9]/g, ''), 10).toLocaleString('en-IN')}`,
      status: 'Active',
      phone: form.phone || '+91 00000-00000',
      email: form.email || `${form.name.toLowerCase().replace(/\s+/g, '.')}@medicare.in`,
      joined: new Date().toISOString().slice(0, 10),
    };
    setEmployees(prev => [...prev, newEmp]);
    setShowAdd(false);
    setForm({ name: '', dept: '', role: 'Doctor', salary: '', phone: '', email: '' });
  }

  function handleExport() {
    downloadCSV('employees.csv',
      ['ID', 'Name', 'Department', 'Role', 'Salary', 'Status', 'Phone', 'Email', 'Joined'],
      employees.map(e => [e.id, e.name, e.dept, e.role, e.salary, e.status, e.phone, e.email, e.joined])
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">HR &amp; Payroll</h1>
          <p className="page-subtitle">Manage staff, payroll, and attendance</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-1.5" onClick={handleExport}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: employees.length, icon: Users, color: '#0ea5e9' },
          { label: 'Active', value: active, icon: UserCheck, color: '#34d399' },
          { label: 'On Leave', value: onLeave, icon: UserMinus, color: '#fbbf24' },
          { label: 'Monthly Payroll', value: '₹4.1L', icon: IndianRupee, color: '#a78bfa' },
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

      {/* Search */}
      <div className="glass-card p-3">
        <input
          type="text"
          placeholder="Search by name, department, or role..."
          className="input-dark w-full"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4" style={{ borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
          <h2 className="text-base font-semibold text-white">Employee List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="dark-table">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Department</th><th>Role</th><th>Monthly Salary</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {displayed.map(emp => {
                const color = roleColors[emp.role] ?? roleColors.default;
                const stColor = emp.status === 'Active' ? '#34d399' : emp.status === 'On Leave' ? '#fbbf24' : '#f87171';
                return (
                  <tr key={emp.id}>
                    <td className="font-mono text-sky-400">{emp.id}</td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${color}20`, color }}>
                          {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <span className="font-medium text-slate-200 block">{emp.name}</span>
                          <span className="text-xs text-slate-500">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-300">{emp.dept}</td>
                    <td><span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{emp.role}</span></td>
                    <td className="font-semibold text-slate-200">{emp.salary}</td>
                    <td><span className="badge" style={{ background: `${stColor}15`, color: stColor, border: `1px solid ${stColor}30` }}>{emp.status}</span></td>
                    <td>
                      <button className="btn-secondary text-xs px-2 py-1 mr-1 inline-flex items-center gap-1" onClick={() => setSelected(emp)}>
                        <Eye size={11} /> View
                      </button>
                      <button className="btn-secondary text-xs px-2 py-1 inline-flex items-center gap-1" onClick={() => printPayslip(emp)}>
                        <Download size={11} /> Payslip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Employee Profile</h2>
              <div className="flex gap-2">
                <button onClick={() => printPayslip(selected)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <Download size={13} /> Download Payslip
                </button>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ background: `${roleColors[selected.role] ?? '#0ea5e9'}20`, color: roleColors[selected.role] ?? '#0ea5e9' }}>
                  {selected.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                  <p className="text-sm text-slate-400">{selected.role} · {selected.dept}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Employee ID', value: selected.id },
                  { label: 'Status', value: selected.status },
                  { label: 'Monthly Salary', value: selected.salary },
                  { label: 'Date Joined', value: selected.joined },
                  { label: 'Phone', value: selected.phone },
                  { label: 'Email', value: selected.email },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                    <p className="text-slate-200 font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Add New Employee</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-dark">Full Name *</label>
                  <input className="input-dark" placeholder="e.g. Dr. Ramesh Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label-dark">Department *</label>
                  <input className="input-dark" placeholder="e.g. Cardiology" value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} />
                </div>
                <div>
                  <label className="label-dark">Role</label>
                  <select className="input-dark" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {['Doctor', 'Nurse', 'Pharmacist', 'Receptionist', 'Lab Tech', 'Radiologist', 'Admin'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-dark">Monthly Salary (₹) *</label>
                  <input className="input-dark" placeholder="e.g. 75000" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                </div>
                <div>
                  <label className="label-dark">Phone</label>
                  <input className="input-dark" placeholder="+91 XXXXX-XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label-dark">Email</label>
                  <input className="input-dark" placeholder="name@medicare.in" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleAddEmployee}>
                  <Plus size={16} /> Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

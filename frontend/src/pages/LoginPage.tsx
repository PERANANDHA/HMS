import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  ShieldCheck, Stethoscope, ClipboardList, Heart,
  Pill, FlaskConical, User, ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface RoleOption {
  key: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  description: string;
  hint: string;
  color: string;
}

const ROLES: RoleOption[] = [
  {
    key: 'ROLE_ADMIN',
    label: 'Admin',
    icon: ShieldCheck,
    description: 'Full system access',
    hint: 'admin@ehms.com / admin123',
    color: '#a78bfa',
  },
  {
    key: 'ROLE_DOCTOR',
    label: 'Doctor',
    icon: Stethoscope,
    description: 'OPD consultations & prescriptions',
    hint: 'doctor@ehms.com / doctor123',
    color: '#34d399',
  },
  {
    key: 'ROLE_RECEPTIONIST',
    label: 'Receptionist',
    icon: ClipboardList,
    description: 'Appointments & registration',
    hint: 'reception@ehms.com / recept123',
    color: '#60a5fa',
  },
  {
    key: 'ROLE_NURSE',
    label: 'Nurse',
    icon: Heart,
    description: 'IPD care & vitals',
    hint: 'nurse@ehms.com / nurse123',
    color: '#f472b6',
  },
  {
    key: 'ROLE_PHARMACIST',
    label: 'Pharmacist',
    icon: Pill,
    description: 'Dispense & inventory',
    hint: 'pharmacy@ehms.com / pharma123',
    color: '#fb923c',
  },
  {
    key: 'ROLE_LAB_TECHNICIAN',
    label: 'Lab Tech',
    icon: FlaskConical,
    description: 'Test orders & results',
    hint: 'lab@ehms.com / lab123',
    color: '#facc15',
  },
  {
    key: 'ROLE_PATIENT',
    label: 'Patient',
    icon: User,
    description: 'My appointments & records',
    hint: 'patient@ehms.com / patient123',
    color: '#22d3ee',
  },
];

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setError('');
  };

  const handleRoleContinue = () => {
    if (!selectedRole) {
      setError('Please select your role to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, id, name, email: respEmail, roles } = response.data;

      // Validate that the returned role matches selected role
      if (!roles.includes(selectedRole!.key)) {
        setError(`This account does not have ${selectedRole!.label} access. Please select the correct role.`);
        setLoading(false);
        return;
      }

      login({ id, name, email: respEmail, roles }, token);
      navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const IconComp = selectedRole?.icon;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at top left, #0f2040 0%, #060b18 50%, #060b18 100%)',
      }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(14,165,233,0.05) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(139,92,246,0.05) 0%, transparent 50%)`,
        }}
      />

      <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <img 
              src="/wireframe.png" 
              alt="HMS Logo" 
              className="w-12 h-12 rounded-xl object-cover border border-sky-500/30 shadow-lg shadow-sky-500/20" 
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white leading-none">MediCare HMS</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Enterprise Hospital Management</p>
            </div>
          </div>
        </div>

        <div
          className="glass-card p-8"
          style={{ boxShadow: '0 0 60px rgba(14,165,233,0.08), 0 25px 50px rgba(0,0,0,0.4)' }}
        >
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step >= 1 ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'rgba(30,58,110,0.5)',
                  color: 'white',
                }}
              >
                1
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? 'text-sky-400' : 'text-slate-600'}`}>
                Select Role
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: step >= 2 ? '#0ea5e9' : 'rgba(56,189,248,0.15)' }} />
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step >= 2 ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : 'rgba(30,58,110,0.5)',
                  color: step >= 2 ? 'white' : '#475569',
                }}
              >
                2
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-sky-400' : 'text-slate-600'}`}>
                Sign In
              </span>
            </div>
          </div>

          {/* ───── STEP 1: Role Selection ───── */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="text-xl font-bold text-white mb-1">Who are you?</h2>
              <p className="text-slate-400 text-sm mb-6">Select your role to access the right portal</p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole?.key === role.key;
                  return (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`role-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                        style={{
                          background: isSelected
                            ? `${role.color}25`
                            : 'rgba(30,58,110,0.4)',
                          border: `1px solid ${isSelected ? role.color + '60' : 'rgba(56,189,248,0.1)'}`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <Icon size={20} style={{ color: isSelected ? role.color : '#64748b' }} />
                      </div>
                      <p
                        className="text-sm font-semibold mb-0.5"
                        style={{ color: isSelected ? '#f1f5f9' : '#94a3b8' }}
                      >
                        {role.label}
                      </p>
                      <p className="text-xs" style={{ color: isSelected ? '#7dd3fc' : '#475569' }}>
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedRole && (
                <div
                  className="mb-4 px-4 py-2.5 rounded-lg text-xs animate-slide-up"
                  style={{
                    background: 'rgba(6,182,212,0.08)',
                    border: '1px solid rgba(6,182,212,0.2)',
                    color: '#22d3ee',
                  }}
                >
                  <span className="font-semibold">Demo credentials:</span>{' '}
                  {selectedRole.hint}
                </div>
              )}

              <button type="button" onClick={handleRoleContinue} className="btn-primary w-full justify-center py-3">
                Continue as {selectedRole?.label ?? 'Selected Role'} →
              </button>
            </div>
          )}

          {/* ───── STEP 2: Credentials ───── */}
          {step === 2 && (
            <div className="animate-slide-up">
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="flex items-center gap-1.5 text-sky-400 text-sm mb-4 hover:text-sky-300 transition-colors"
              >
                <ArrowLeft size={16} /> Back to role selection
              </button>

              <div className="flex items-center gap-3 mb-6">
                {IconComp && (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${selectedRole!.color}20`,
                      border: `1px solid ${selectedRole!.color}40`,
                    }}
                  >
                    <IconComp size={22} style={{ color: selectedRole!.color }} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">Sign in as {selectedRole?.label}</h2>
                  <p className="text-slate-400 text-sm">{selectedRole?.description}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label-dark">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="input-dark"
                    placeholder={`Enter your email`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label-dark">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      className="input-dark pr-10"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div
                  className="px-3 py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)', color: '#7dd3fc' }}
                >
                  Hint: {selectedRole?.hint}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In to MediCare HMS'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 MediCare HMS · Enterprise Hospital Management System
        </p>
      </div>
    </div>
  );
}

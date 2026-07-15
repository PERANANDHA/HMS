import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: 'Administrator',
  ROLE_DOCTOR: 'Doctor',
  ROLE_RECEPTIONIST: 'Receptionist',
  ROLE_NURSE: 'Nurse',
  ROLE_PHARMACIST: 'Pharmacist',
  ROLE_LAB_TECHNICIAN: 'Lab Technician',
  ROLE_PATIENT: 'Patient',
};

const ROLE_COLORS: Record<string, string> = {
  ROLE_ADMIN:           '#a78bfa',
  ROLE_DOCTOR:          '#34d399',
  ROLE_RECEPTIONIST:    '#60a5fa',
  ROLE_NURSE:           '#f472b6',
  ROLE_PHARMACIST:      '#fb923c',
  ROLE_LAB_TECHNICIAN:  '#facc15',
  ROLE_PATIENT:         '#22d3ee',
};

export default function Header() {
  const { user, primaryRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] ?? primaryRole : '';
  const roleColor = primaryRole ? ROLE_COLORS[primaryRole] ?? '#0ea5e9' : '#0ea5e9';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="header-dark sticky top-0 z-10 flex h-14 flex-shrink-0 items-center px-4 sm:px-6 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search patients, doctors, appointments..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-sky-900" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ background: `${roleColor}30`, border: `1px solid ${roleColor}50`, color: roleColor }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-200 leading-none">{user?.name ?? 'User'}</p>
            <p className="text-xs mt-0.5" style={{ color: roleColor }}>{roleLabel}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="ml-1 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

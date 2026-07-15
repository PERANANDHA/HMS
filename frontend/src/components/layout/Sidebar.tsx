import {
  LayoutDashboard, Users, Stethoscope, Calendar, Pill,
  FlaskConical, Settings, CreditCard,
  Package, BarChart3, UserCog, Activity, ClipboardList,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Navigation items per role
const NAV_CONFIG: Record<string, { name: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }> }[]> = {
  ROLE_ADMIN: [
    { name: 'Dashboard',     href: '/',            icon: LayoutDashboard },
    { name: 'Patients',      href: '/patients',    icon: Users },
    { name: 'Doctors',       href: '/doctors',     icon: Stethoscope },
    { name: 'Appointments',  href: '/appointments',icon: Calendar },
    { name: 'Pharmacy',      href: '/pharmacy',    icon: Pill },
    { name: 'Laboratory',    href: '/lab',         icon: FlaskConical },
    { name: 'Billing',       href: '/billing',     icon: CreditCard },
    { name: 'Inventory',     href: '/inventory',   icon: Package },
    { name: 'HR & Payroll',  href: '/hr',          icon: UserCog },
    { name: 'Reports',       href: '/reports',     icon: BarChart3 },
    { name: 'Settings',      href: '/settings',    icon: Settings },
  ],
  ROLE_DOCTOR: [
    { name: 'Dashboard',     href: '/',            icon: LayoutDashboard },
    { name: 'My Appointments', href: '/appointments', icon: Calendar },
    { name: 'Patients',      href: '/patients',    icon: Users },
  ],
  ROLE_RECEPTIONIST: [
    { name: 'Dashboard',     href: '/',            icon: LayoutDashboard },
    { name: 'Appointments',  href: '/appointments',icon: Calendar },
    { name: 'Patients',      href: '/patients',    icon: Users },
    { name: 'Doctors',       href: '/doctors',     icon: Stethoscope },
    { name: 'Billing',       href: '/billing',     icon: CreditCard },
  ],
  ROLE_NURSE: [
    { name: 'Dashboard',     href: '/',            icon: LayoutDashboard },
    { name: 'Patients',      href: '/patients',    icon: Users },
    { name: 'Appointments',  href: '/appointments',icon: Calendar },
  ],
  ROLE_PHARMACIST: [
    { name: 'Dashboard',     href: '/',            icon: LayoutDashboard },
    { name: 'Pharmacy',      href: '/pharmacy',    icon: Pill },
    { name: 'Inventory',     href: '/inventory',   icon: Package },
  ],
  ROLE_LAB_TECHNICIAN: [
    { name: 'Dashboard',     href: '/',            icon: LayoutDashboard },
    { name: 'Laboratory',    href: '/lab',         icon: FlaskConical },
    { name: 'Patients',      href: '/patients',    icon: Users },
  ],
  ROLE_PATIENT: [
    { name: 'My Portal',     href: '/',            icon: LayoutDashboard },
    { name: 'Appointments',  href: '/appointments',icon: Calendar },
    { name: 'My Records',    href: '/patients',    icon: ClipboardList },
    { name: 'Billing',       href: '/billing',     icon: CreditCard },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN:           'Super Admin',
  ROLE_DOCTOR:          'Doctor Portal',
  ROLE_RECEPTIONIST:    'Receptionist',
  ROLE_NURSE:           'Nursing Portal',
  ROLE_PHARMACIST:      'Pharmacy',
  ROLE_LAB_TECHNICIAN:  'Laboratory',
  ROLE_PATIENT:         'Patient Portal',
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

export default function Sidebar() {
  const { user, primaryRole } = useAuth();
  const navItems = primaryRole ? (NAV_CONFIG[primaryRole] ?? NAV_CONFIG['ROLE_ADMIN']) : [];
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] ?? '' : '';
  const roleColor = primaryRole ? ROLE_COLORS[primaryRole] ?? '#0ea5e9' : '#0ea5e9';
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <aside className="sidebar-dark flex-shrink-0 w-60 flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(56,189,248,0.08)' }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-white leading-none block">MediCare</span>
          <span className="text-xs text-slate-500 font-medium">HMS v2.0</span>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2.5">
        <div
          className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-md"
          style={{
            color: roleColor,
            background: `${roleColor}12`,
            border: `1px solid ${roleColor}25`,
            letterSpacing: '0.1em',
          }}
        >
          {roleLabel}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href + item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? 'nav-active' : 'nav-inactive'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={isActive ? 'text-sky-400' : 'text-slate-600'}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info bottom */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: `${roleColor}20`, border: `1px solid ${roleColor}40`, color: roleColor }}
        >
          {initials}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-slate-200 truncate leading-none">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}

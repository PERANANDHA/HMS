import { Settings, Hospital, Users, Shield, ChevronRight } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    title: 'Hospital Profile',
    icon: Hospital,
    color: '#0ea5e9',
    items: [
      { label: 'Hospital Name', value: 'MediCare Hospital' },
      { label: 'Address', value: '123 Health Street, Medical City - 600001' },
      { label: 'Contact', value: '+91 44 2345 6789' },
      { label: 'Email', value: 'info@medicare-hms.com' },
    ],
  },
  {
    title: 'Department Management',
    icon: Settings,
    color: '#a78bfa',
    items: [
      { label: 'Cardiology', value: 'Active · 3 Doctors' },
      { label: 'Neurology', value: 'Active · 2 Doctors' },
      { label: 'General Surgery', value: 'Active · 2 Doctors' },
      { label: 'Pediatrics', value: 'Active · 1 Doctor' },
    ],
  },
  {
    title: 'User Management',
    icon: Users,
    color: '#34d399',
    items: [
      { label: 'Admin Users', value: '1 active' },
      { label: 'Doctors', value: '3 registered' },
      { label: 'Nurses', value: '2 registered' },
      { label: 'Receptionists', value: '1 registered' },
    ],
  },
  {
    title: 'Security & Access',
    icon: Shield,
    color: '#fb923c',
    items: [
      { label: 'Two-Factor Auth', value: 'Disabled' },
      { label: 'Session Timeout', value: '24 hours' },
      { label: 'Role Permissions', value: '7 roles configured' },
      { label: 'Audit Logs', value: 'Enabled' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Hospital configuration and system preferences</p>
      </div>

      {/* System Status */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-white mb-4">System Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Database', status: 'Connected', color: '#34d399' },
            { label: 'Backend API', status: 'Online', color: '#34d399' },
            { label: 'Redis Cache', status: 'Online', color: '#34d399' },
            { label: 'Docker', status: 'Running', color: '#34d399' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
              <div className="w-2 h-2 rounded-full mx-auto mb-2 animate-pulse" style={{ background: s.color }} />
              <p className="text-xs font-semibold text-slate-300">{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: s.color }}>{s.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SETTINGS_SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${section.color}15`, border: `1px solid ${section.color}25` }}>
                  <Icon size={18} style={{ color: section.color }} />
                </div>
                <h2 className="text-base font-semibold text-white">{section.title}</h2>
              </div>
              <div className="space-y-1">
                {section.items.map(item => (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-all hover:bg-white/5"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = `${section.color}20`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    }}
                  >
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{item.value}</span>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-5" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
        <h2 className="text-base font-semibold text-red-400 mb-3">Danger Zone</h2>
        <div className="space-y-2">
          {['Clear All Appointments', 'Reset Demo Data', 'Backup Database'].map(action => (
            <div key={action} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{action}</span>
              <button 
                className="btn-danger text-xs px-3 py-1.5"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to ${action.toLowerCase()}? This action cannot be undone.`)) {
                    window.alert(`${action} completed successfully.`);
                  }
                }}
              >
                {action.split(' ')[0]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

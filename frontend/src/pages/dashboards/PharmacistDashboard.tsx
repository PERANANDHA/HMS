import { useState, useEffect, useCallback } from 'react';
import { Pill, Package, AlertTriangle, CheckCircle, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STOCK = [
  { name: 'Pantoprazole 40mg', category: 'Medicine', qty: 10, stock: 120, status: 'In Stock' },
  { name: 'Domperidone 10mg', category: 'Medicine', qty: 10, stock: 80, status: 'In Stock' },
  { name: 'Sucralfate 1gm', category: 'Medicine', qty: 10, stock: 60, status: 'In Stock' },
  { name: 'Paracetamol 500mg', category: 'Medicine', qty: 20, stock: 30, status: 'Low Stock' },
  { name: 'Syringe 5ml', category: 'Equipment', qty: 50, stock: 0, status: 'Out of Stock' },
  { name: 'Gloves (Box)', category: 'Equipment', qty: 10, stock: 15, status: 'In Stock' },
];

const PRESCRIPTIONS = [
  { id: 'P001', patient: 'Jayakumar Balan', doctor: 'Dr. Ramesh Kumar', medicine: 'Pantoprazole 40mg', qty: 10 },
  { id: 'P002', patient: 'Janaki Raman', doctor: 'Dr. Subhashini Selvam', medicine: 'Domperidone 10mg', qty: 20 },
  { id: 'P003', patient: 'Abirami Sundaram', doctor: 'Dr. Ganesan Raman', medicine: 'Paracetamol 500mg', qty: 30 },
];

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [prescriptions, setPrescriptions] = useState(PRESCRIPTIONS);
  const [dispensedCount, setDispensedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const fetchAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    // Refresh timestamp to indicate live data pulse
    setLastUpdated(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(), 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleDispense = (id: string) => {
    setPrescriptions(prev => prev.filter(p => p.id !== id));
    setDispensedCount(c => c + 1);
  };

  const filtered = STOCK.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = STOCK.filter(s => s.status === 'Low Stock' || s.status === 'Out of Stock').length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Pharmacy Station</h1>
          <p className="page-subtitle">Welcome, {user?.name} · Manage dispensing and inventory</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Stock Items', value: STOCK.length, icon: Package, color: '#fb923c' },
          { label: 'Pending Prescriptions', value: prescriptions.length, icon: Pill, color: '#0ea5e9' },
          { label: 'Low / Out of Stock', value: lowStock, icon: AlertTriangle, color: '#f87171' },
          { label: 'Dispensed Today', value: dispensedCount, icon: CheckCircle, color: '#34d399' },
        ].map(s => {
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

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medicine Inventory Category Bar Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Stock by Category</h2>
            <span className="text-xs text-slate-500">Inventory Levels</span>
          </div>
          <div className="relative pt-2">
            <svg viewBox="0 0 500 210" className="w-full h-auto overflow-visible">
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.06)" />
              <text x="15" y="24" className="text-[10px] fill-slate-500">100</text>
              <text x="15" y="94" className="text-[10px] fill-slate-500">50</text>
              <text x="15" y="164" className="text-[10px] fill-slate-500">0</text>

              {[
                { cat: 'Antibiotics', val: 85 },
                { cat: 'Analgesics', val: 45 },
                { cat: 'Cardiac', val: 60 },
                { cat: 'Antacids', val: 90 },
                { cat: 'Equipment', val: 15 }
              ].map((c, idx) => {
                const xBase = 65 + idx * 80;
                const height = c.val * 1.4;
                const isHov = hoveredBar === idx;
                return (
                  <g key={c.cat}>
                    <rect x={xBase} y={160 - height} width="24" height={height}
                      fill={isHov ? '#fdba74' : '#fb923c'} rx="3"
                      className="cursor-pointer transition-all duration-200"
                      style={{ opacity: isHov ? 1 : 0.85 }}
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}>
                      <title>{c.cat}: {c.val} units</title>
                    </rect>
                    {isHov && (
                      <text x={xBase + 12} y={160 - height - 6} textAnchor="middle" className="fill-white text-[10px] font-bold">{c.val}</text>
                    )}
                    <text x={xBase + 12} y="182" textAnchor="middle" className="text-[9px] fill-slate-500">{c.cat}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Prescription Dispensing Velocity Line Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Dispensing Velocity</h2>
            <span className="text-xs text-slate-500">Hourly volume (Today)</span>
          </div>
          <div className="relative pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
              {/* Horizontal Gridlines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.06)" />

              {/* Y Axis Labels */}
              <text x="15" y="24" className="text-[10px] fill-slate-500 font-medium">30</text>
              <text x="15" y="94" className="text-[10px] fill-slate-500 font-medium">15</text>
              <text x="15" y="164" className="text-[10px] fill-slate-500 font-medium">0</text>

              {/* Mon - Sun Labels */}
              {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((hr, idx) => (
                <text key={hr} x={50 + idx * 70} y="180" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">{hr}</text>
              ))}

              {/* Line Path (Green: #34d399) */}
              <path
                d="M 50 137.5 L 120 92.5 L 190 47.5 L 260 115 L 330 61 L 400 124"
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_2px_8px_rgba(52,211,153,0.3)] animate-dash"
              />

              {/* Data points */}
              {[
                { x: 50, y: 137.5 }, { x: 120, y: 92.5 }, { x: 190, y: 47.5 },
                { x: 260, y: 115 }, { x: 330, y: 61 }, { x: 400, y: 124 }
              ].map((pt, i) => (
                <circle key={`pt-${i}`} cx={pt.x} cy={pt.y} r="4" fill="#34d399" stroke="#0f172a" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Prescriptions */}
        <div className="glass-card p-5">
          <h2 className="text-base font-semibold text-white mb-4">Pending Prescriptions</h2>
          <div className="space-y-2">
            {prescriptions.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <CheckCircle size={28} className="text-green-500" />
                <p className="text-sm text-slate-400">All prescriptions dispensed!</p>
              </div>
            ) : prescriptions.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)' }}>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">{p.patient}</p>
                  <p className="text-xs text-slate-500">{p.doctor} · {p.medicine} × {p.qty}</p>
                </div>
                <button onClick={() => handleDispense(p.id)} className="btn-primary text-xs px-3 py-1.5 hover:scale-105 transition-transform">Dispense</button>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Overview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Inventory</h2>
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-dark pl-7 py-1.5 text-xs w-36"
              />
            </div>
          </div>
          <div className="space-y-2">
            {filtered.map((item, i) => {
              const stColor = item.status === 'In Stock' ? '#34d399' : item.status === 'Low Stock' ? '#fbbf24' : '#f87171';
              return (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.06)' }}>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.category} · Qty: {item.stock}</p>
                  </div>
                  <span className="badge" style={{ background: `${stColor}15`, color: stColor, border: `1px solid ${stColor}30` }}>{item.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Package, Search, AlertTriangle, Plus, X, RefreshCw, Download } from 'lucide-react';
import { downloadCSV } from '../utils/downloadUtils';

interface StockItem {
  id: number;
  name: string;
  category: string;
  qty: number;
  unit: string;
  reorderAt: number;
  unitPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const INITIAL_STOCK: StockItem[] = [
  { id: 1, name: 'Pantoprazole 40mg', category: 'Medicine', qty: 120, unit: 'Tablets', reorderAt: 20, unitPrice: 12, status: 'In Stock' },
  { id: 2, name: 'Domperidone 10mg', category: 'Medicine', qty: 80, unit: 'Tablets', reorderAt: 20, unitPrice: 8, status: 'In Stock' },
  { id: 3, name: 'Paracetamol 500mg', category: 'Medicine', qty: 15, unit: 'Tablets', reorderAt: 20, unitPrice: 3, status: 'Low Stock' },
  { id: 4, name: 'Syringe 5ml', category: 'Equipment', qty: 0, unit: 'Units', reorderAt: 10, unitPrice: 6, status: 'Out of Stock' },
  { id: 5, name: 'Gloves (Box)', category: 'Equipment', qty: 15, unit: 'Boxes', reorderAt: 5, unitPrice: 180, status: 'In Stock' },
  { id: 6, name: 'Insulin 100 IU', category: 'Medicine', qty: 8, unit: 'Vials', reorderAt: 10, unitPrice: 150, status: 'Low Stock' },
  { id: 7, name: 'Bandage Roll', category: 'Supplies', qty: 42, unit: 'Rolls', reorderAt: 10, unitPrice: 25, status: 'In Stock' },
  { id: 8, name: 'IV Set', category: 'Equipment', qty: 0, unit: 'Sets', reorderAt: 5, unitPrice: 45, status: 'Out of Stock' },
  { id: 9, name: 'Metformin 500mg', category: 'Medicine', qty: 200, unit: 'Tablets', reorderAt: 30, unitPrice: 4, status: 'In Stock' },
];

const statusColor: Record<string, string> = {
  'In Stock': '#34d399', 'Low Stock': '#fbbf24', 'Out of Stock': '#f87171',
};

export default function InventoryPage() {
  const [stock, setStock] = useState<StockItem[]>(INITIAL_STOCK);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [restockItem, setRestockItem] = useState<StockItem | null>(null);
  const [restockQty, setRestockQty] = useState('50');
  const [addForm, setAddForm] = useState({ name: '', category: 'Medicine', unit: 'Tablets', qty: '', reorderAt: '', unitPrice: '' });

  const cats = ['All', 'Medicine', 'Equipment', 'Supplies'];
  const filtered = stock.filter(s =>
    (catFilter === 'All' || s.category === catFilter) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const low = stock.filter(s => s.status === 'Low Stock').length;
  const out = stock.filter(s => s.status === 'Out of Stock').length;

  function computeStatus(qty: number, reorderAt: number): StockItem['status'] {
    if (qty === 0) return 'Out of Stock';
    if (qty <= reorderAt) return 'Low Stock';
    return 'In Stock';
  }

  function handleRestock() {
    if (!restockItem) return;
    const added = parseInt(restockQty, 10) || 0;
    setStock(prev => prev.map(s => {
      if (s.id !== restockItem.id) return s;
      const newQty = s.qty + added;
      return { ...s, qty: newQty, status: computeStatus(newQty, s.reorderAt) };
    }));
    setRestockItem(null);
  }

  function handleAdd() {
    if (!addForm.name || !addForm.qty) return;
    const qty = parseInt(addForm.qty, 10) || 0;
    const reorder = parseInt(addForm.reorderAt, 10) || 10;
    const newItem: StockItem = {
      id: stock.length + 1,
      name: addForm.name,
      category: addForm.category,
      qty,
      unit: addForm.unit,
      reorderAt: reorder,
      unitPrice: parseInt(addForm.unitPrice, 10) || 0,
      status: computeStatus(qty, reorder),
    };
    setStock(prev => [...prev, newItem]);
    setShowAdd(false);
    setAddForm({ name: '', category: 'Medicine', unit: 'Tablets', qty: '', reorderAt: '', unitPrice: '' });
  }

  function handleExport() {
    downloadCSV('inventory.csv',
      ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Reorder At', 'Unit Price (₹)', 'Status'],
      stock.map(s => [s.id, s.name, s.category, s.qty, s.unit, s.reorderAt, s.unitPrice, s.status])
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage hospital stock and supplies</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-1.5" onClick={handleExport}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Items', value: stock.length, color: '#0ea5e9' },
          { label: 'Low Stock', value: low, color: '#fbbf24' },
          { label: 'Out of Stock', value: out, color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <Package size={20} style={{ color: s.color }} className="mb-3" />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            {s.value > 0 && (s.label === 'Low Stock' || s.label === 'Out of Stock') && (
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle size={11} style={{ color: s.color }} />
                <span className="text-xs" style={{ color: s.color }}>Action needed</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search items..." className="input-dark pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: 'rgba(56,189,248,0.05)' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={catFilter === c ? { background: '#0ea5e9', color: 'white' } : { color: '#64748b' }}
            >{c}</button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="dark-table">
            <thead>
              <tr>
                <th>Item Name</th><th>Category</th><th>Quantity</th>
                <th>Unit</th><th>Unit Price</th><th>Reorder At</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const color = statusColor[item.status] ?? '#94a3b8';
                return (
                  <tr key={item.id}>
                    <td className="font-medium text-slate-200">{item.name}</td>
                    <td><span className="badge badge-cyan">{item.category}</span></td>
                    <td>
                      <span className="font-bold" style={{ color: item.qty === 0 ? '#f87171' : item.qty <= item.reorderAt ? '#fbbf24' : '#34d399' }}>
                        {item.qty}
                      </span>
                    </td>
                    <td className="text-slate-400">{item.unit}</td>
                    <td className="text-slate-300">₹{item.unitPrice}</td>
                    <td className="text-slate-400">{item.reorderAt}</td>
                    <td>
                      <span className="badge" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>{item.status}</span>
                    </td>
                    <td>
                      <button className="btn-secondary text-xs px-2 py-1 flex items-center gap-1"
                        onClick={() => { setRestockItem(item); setRestockQty('50'); }}>
                        <RefreshCw size={11} /> Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setRestockItem(null); }}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Restock Item</h2>
              <button onClick={() => setRestockItem(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
                <p className="text-sm font-semibold text-slate-200">{restockItem.name}</p>
                <p className="text-xs text-slate-500 mt-1">Current stock: {restockItem.qty} {restockItem.unit}</p>
              </div>
              <div>
                <label className="label-dark">Quantity to Add</label>
                <input type="number" className="input-dark" value={restockQty} onChange={e => setRestockQty(e.target.value)} min="1" />
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setRestockItem(null)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleRestock}>
                  <RefreshCw size={15} /> Confirm Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal-box">
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
              <h2 className="text-lg font-bold text-white">Add New Item</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label-dark">Item Name *</label>
                  <input className="input-dark" placeholder="e.g. Amoxicillin 500mg" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label-dark">Category</label>
                  <select className="input-dark" value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}>
                    <option>Medicine</option><option>Equipment</option><option>Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="label-dark">Unit</label>
                  <select className="input-dark" value={addForm.unit} onChange={e => setAddForm(f => ({ ...f, unit: e.target.value }))}>
                    {['Tablets', 'Capsules', 'Vials', 'Units', 'Boxes', 'Rolls', 'Sets', 'Strips'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-dark">Initial Qty *</label>
                  <input className="input-dark" placeholder="e.g. 100" value={addForm.qty} onChange={e => setAddForm(f => ({ ...f, qty: e.target.value }))} />
                </div>
                <div>
                  <label className="label-dark">Reorder At</label>
                  <input className="input-dark" placeholder="e.g. 20" value={addForm.reorderAt} onChange={e => setAddForm(f => ({ ...f, reorderAt: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label-dark">Unit Price (₹)</label>
                  <input className="input-dark" placeholder="e.g. 15" value={addForm.unitPrice} onChange={e => setAddForm(f => ({ ...f, unitPrice: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleAdd}>
                  <Plus size={16} /> Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

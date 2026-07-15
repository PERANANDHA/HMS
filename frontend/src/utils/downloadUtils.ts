// Utility functions for downloading data as CSV or printable PDF invoices

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printInvoice(invoice: {
  id: string;
  patient: string;
  date: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
  items: string[];
}) {
  const win = window.open('', '_blank', 'width=700,height=900');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.id} - MediCare HMS</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; background: white; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 24px; }
        .hospital-name { font-size: 22px; font-weight: 800; color: #0ea5e9; }
        .hospital-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
        .invoice-title { font-size: 28px; font-weight: 700; color: #1e293b; }
        .inv-meta { font-size: 12px; color: #64748b; margin-top: 4px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 8px; font-weight: 600; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-label { font-size: 11px; color: #94a3b8; }
        .info-value { font-size: 14px; color: #1e293b; font-weight: 600; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
        td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .total-section { margin-top: 16px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .total-row { display: flex; justify-content: space-between; width: 220px; font-size: 13px; }
        .total-row.grand { font-size: 15px; font-weight: 800; color: #0ea5e9; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
        .status-Paid { background: #d1fae5; color: #065f46; }
        .status-Pending { background: #fee2e2; color: #991b1b; }
        .status-Partial { background: #fef3c7; color: #92400e; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="hospital-name">🏥 MediCare HMS</div>
          <div class="hospital-sub">Enterprise Hospital Management System</div>
          <div class="hospital-sub" style="margin-top:6px">Tamil Nadu, India · GSTIN: 33XXXXX1234X1Z5</div>
        </div>
        <div style="text-align:right">
          <div class="invoice-title">INVOICE</div>
          <div class="inv-meta">${invoice.id}</div>
          <div class="inv-meta">Date: ${invoice.date}</div>
          <span class="status-badge status-${invoice.status}">${invoice.status}</span>
        </div>
      </div>

      <div class="section">
        <div class="info-grid">
          <div>
            <div class="info-label">Bill To</div>
            <div class="info-value">${invoice.patient}</div>
          </div>
          <div>
            <div class="info-label">Invoice Number</div>
            <div class="info-value">${invoice.id}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Services & Items</div>
        <table>
          <thead>
            <tr><th>#</th><th>Description</th><th style="text-align:right">Amount</th></tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, i) => {
              const [desc, amt] = item.split(':');
              return `<tr><td>${i+1}</td><td>${desc.trim()}</td><td style="text-align:right;font-weight:600">${amt?.trim() ?? ''}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="total-section">
        <div class="total-row"><span>Total Amount</span><span>₹${invoice.amount.toLocaleString('en-IN')}</span></div>
        <div class="total-row"><span style="color:#16a34a">Amount Paid</span><span style="color:#16a34a">₹${invoice.paid.toLocaleString('en-IN')}</span></div>
        <div class="total-row grand"><span>Balance Due</span><span>₹${invoice.balance.toLocaleString('en-IN')}</span></div>
      </div>

      <div class="footer">
        Thank you for choosing MediCare HMS · This is a computer-generated invoice<br/>
        For billing enquiries call: +91 44 2345-6789
      </div>
    </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => { win.print(); }, 400);
}

export function printPayslip(employee: {
  id: string;
  name: string;
  dept: string;
  role: string;
  salary: string;
  status: string;
}) {
  const win = window.open('', '_blank', 'width=700,height=900');
  if (!win) return;
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  // Parse numeric salary
  const salNum = parseInt(employee.salary.replace(/[^0-9]/g, ''), 10) || 0;
  const basic = Math.round(salNum * 0.5);
  const hra = Math.round(salNum * 0.2);
  const da = Math.round(salNum * 0.15);
  const other = salNum - basic - hra - da;
  const pf = Math.round(salNum * 0.12);
  const tax = Math.round(salNum * 0.05);
  const net = salNum - pf - tax;

  win.document.write(`
    <!DOCTYPE html><html><head><title>Payslip - ${employee.name}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;padding:40px;background:white}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0ea5e9;padding-bottom:20px;margin-bottom:24px}
      .hospital-name{font-size:22px;font-weight:800;color:#0ea5e9}
      h2{font-size:18px;font-weight:700;margin-bottom:16px;color:#0f172a}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px}
      .info-item label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em}
      .info-item p{font-size:14px;font-weight:600;color:#1e293b;margin-top:2px}
      table{width:100%;border-collapse:collapse;margin-bottom:16px}
      th{background:#f8fafc;padding:9px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600}
      td{padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9}
      td:last-child{text-align:right;font-weight:600}
      .net{font-size:16px;font-weight:800;color:#0ea5e9;text-align:right;margin-top:8px}
      .footer{margin-top:40px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px}
    </style></head><body>
    <div class="header">
      <div>
        <div class="hospital-name">🏥 MediCare HMS</div>
        <div style="font-size:12px;color:#64748b">Payslip for ${month}</div>
      </div>
      <div style="text-align:right;font-size:13px;color:#64748b">
        <div>Employee ID: ${employee.id}</div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-item"><label>Employee Name</label><p>${employee.name}</p></div>
      <div class="info-item"><label>Department</label><p>${employee.dept}</p></div>
      <div class="info-item"><label>Designation</label><p>${employee.role}</p></div>
      <div class="info-item"><label>Status</label><p>${employee.status}</p></div>
    </div>
    <h2>Earnings</h2>
    <table>
      <thead><tr><th>Component</th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Basic Salary</td><td>₹${basic.toLocaleString('en-IN')}</td></tr>
        <tr><td>HRA (House Rent Allowance)</td><td>₹${hra.toLocaleString('en-IN')}</td></tr>
        <tr><td>DA (Dearness Allowance)</td><td>₹${da.toLocaleString('en-IN')}</td></tr>
        <tr><td>Other Allowances</td><td>₹${other.toLocaleString('en-IN')}</td></tr>
        <tr style="font-weight:700;background:#f0f9ff"><td>Gross Salary</td><td>₹${salNum.toLocaleString('en-IN')}</td></tr>
      </tbody>
    </table>
    <h2>Deductions</h2>
    <table>
      <thead><tr><th>Component</th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Provident Fund (12%)</td><td>₹${pf.toLocaleString('en-IN')}</td></tr>
        <tr><td>Professional Tax</td><td>₹${tax.toLocaleString('en-IN')}</td></tr>
        <tr style="font-weight:700;background:#fff1f2"><td>Total Deductions</td><td>₹${(pf+tax).toLocaleString('en-IN')}</td></tr>
      </tbody>
    </table>
    <div class="net">Net Pay: ₹${net.toLocaleString('en-IN')}</div>
    <div class="footer">
      This is a computer-generated payslip · MediCare HMS · Tamil Nadu, India<br/>
      For HR queries: hr@medicare-hms.in
    </div>
    </body></html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

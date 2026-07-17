import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { 
  CreditCard, Plus, CheckCircle2, ChevronRight, DollarSign, Wallet, Percent, AlertCircle, ShoppingCart, Trash2, Printer, Download, Search, Filter
} from 'lucide-react';

export const BillingModule: React.FC = () => {
  const { 
    invoices, patients, addInvoice, updateInvoice, deleteInvoice
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Invoice creator form state
  const [formPatientId, setFormPatientId] = useState('');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  
  // Dynamic line items list inside creator
  const [invoiceItems, setInvoiceItems] = useState<Array<{ description: string, quantity: number, unitPrice: number }>>([]);
  const [lineDesc, setLineDesc] = useState('');
  const [lineQty, setLineQty] = useState(1);
  const [linePrice, setLinePrice] = useState(0);

  // Process payment modal state
  const [payingInvoiceId, setPayingInvoiceId] = useState<string>('');
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'CARD' | 'INSURANCE' | 'BANK_TRANSFER'>('CARD');

  // Selected invoice detail for receipt printing mockup
  const [receiptInvoiceId, setReceiptInvoiceId] = useState<string>('');
  const activeReceipt = invoices.find(i => i.id === receiptInvoiceId);
  const receiptPatient = activeReceipt ? patients.find(p => p.id === activeReceipt.patientId) : null;

  // New filters state
  const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'PARTIALLY_PAID' | 'UNPAID'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    
    if (searchQuery) {
      const pat = patients.find(p => p.id === inv.patientId);
      const fullName = pat ? `${pat.firstName} ${pat.lastName}`.toLowerCase() : '';
      const query = searchQuery.toLowerCase();
      const matchesName = fullName.includes(query);
      const matchesId = inv.id.toLowerCase().includes(query);
      if (!matchesName && !matchesId) return false;
    }
    
    return true;
  });

  // Export current month transactions to CSV
  const handleExportCSV = () => {
    const now = new Date();
    const currentYearMonth = now.toISOString().substring(0, 7); // e.g. "2026-07"
    const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Filter by the current calendar month
    const currentMonthFiltered = filteredInvoices.filter(inv => inv.issuedAt.startsWith(currentYearMonth));
    
    if (currentMonthFiltered.length === 0) {
      alert(`No transaction records found for the current month (${currentMonthName}) matching the active filters.`);
      return;
    }
    
    const headers = ['Invoice ID', 'Patient Name', 'Phone', 'Issued Date', 'Due Date', 'Total Amount', 'Paid Amount', 'Balance Due', 'Status'];
    const rows = currentMonthFiltered.map(inv => {
      const pat = patients.find(p => p.id === inv.patientId);
      const patName = pat ? `${pat.firstName} ${pat.lastName}` : 'Unknown Patient';
      const patPhone = pat ? pat.phone : '';
      const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
      const balance = inv.totalAmount - paid;
      return [
        `"${inv.id}"`,
        `"${patName}"`,
        `"${patPhone}"`,
        `"${inv.issuedAt}"`,
        `"${inv.dueDate}"`,
        inv.totalAmount,
        paid,
        balance,
        `"${inv.status}"`
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DentProSuite_Transactions_${currentYearMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMsg(`Successfully generated and downloaded CSV report for ${currentMonthFiltered.length} transactions in ${currentMonthName}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Add line item to draft list
  const handleAddLineItem = () => {
    if (!lineDesc) {
      alert('Please enter a description for the ledger item.');
      return;
    }
    setInvoiceItems([...invoiceItems, {
      description: lineDesc,
      quantity: Number(lineQty),
      unitPrice: Number(linePrice)
    }]);
    setLineDesc('');
    setLineQty(1);
    setLinePrice(0);
  };

  // Submit invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientId) {
      alert('Please select an active patient demographics profile.');
      return;
    }
    if (invoiceItems.length === 0) {
      alert('Please add at least one line item to the invoice.');
      return;
    }

    addInvoice({
      patientId: formPatientId,
      issuedAt: new Date().toISOString().split('T')[0],
      dueDate: formDueDate,
      items: invoiceItems,
      status: 'UNPAID',
      payments: [],
      notes: formNotes
    });

    setSuccessMsg('Ledger invoice created. Statements dispatched to patient portal.');
    setIsOpen(false);
    setInvoiceItems([]);
    setFormPatientId('');
    setFormNotes('');
    
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Log transaction
  const handlePostPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === payingInvoiceId);
    if (!inv) return;

    const existingPayments = [...inv.payments];
    existingPayments.push({
      amount: Number(payAmount),
      date: new Date().toISOString().split('T')[0],
      method: payMethod
    });

    updateInvoice(inv.id, {
      payments: existingPayments
    });

    setSuccessMsg(`Transaction processed successfully. Payment of $${payAmount} recorded.`);
    setPayingInvoiceId('');
    setPayAmount(0);
    
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Totals calculations
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  
  const totalPaid = invoices.reduce((sum, i) => {
    const paid = i.payments.reduce((pSum, p) => pSum + p.amount, 0);
    return sum + paid;
  }, 0);

  const totalOutstanding = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      
      <OfflineBanner />

      {/* Success notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          {successMsg}
        </div>
      )}

      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-teal-600 font-bold text-xs uppercase tracking-wider font-mono">Ledger Ledger</span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Billing & Revenue Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Record payments, manage outstanding balances, and generate invoice reports.</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer shrink-0"
          id="billing-create-invoice-trigger"
        >
          <Plus size={14} />
          Create Invoice Statement
        </button>
      </div>

      {/* Financial KPIs row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><DollarSign size={20} /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Invoiced Volume</span>
            <p className="text-lg font-bold text-slate-900 font-mono">${totalInvoiced}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl"><Wallet size={20} /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Recovered Cash Flow</span>
            <p className="text-lg font-bold text-slate-900 font-mono">${totalPaid}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl"><AlertCircle size={20} /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Outstanding Patient Copay</span>
            <p className="text-lg font-bold text-rose-700 font-mono">${totalOutstanding}</p>
          </div>
        </div>

      </div>

      {/* Invoice Grid Ledger List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filters and CSV export toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/35">
          <div className="flex flex-col md:flex-row gap-2.5 flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={14} />
              <input
                type="text"
                placeholder="Search patient name or invoice #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Status Dropdown */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Invoice Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
              title="Export Current Month to CSV"
            >
              <Download size={13} />
              Export CSV (Current Month)
            </button>
            <span className="text-xs font-bold text-slate-400 font-mono">
              Count: {filteredInvoices.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-6">Patient</th>
                <th className="py-3 px-6 font-mono">Issued Date</th>
                <th className="py-3 px-6 font-mono">Due Date</th>
                <th className="py-3 px-6 text-right">Total Statement</th>
                <th className="py-3 px-6 text-right">Balance Due</th>
                <th className="py-3 px-6">Ledger Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions match the selected filter parameters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const pat = patients.find(p => p.id === inv.patientId);
                  const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
                  const balance = inv.totalAmount - paid;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-3.5 px-6 font-bold text-slate-900 font-mono">#{inv.id}</td>
                      <td className="py-3.5 px-6">
                        {pat ? (
                          <div>
                            <span className="font-bold text-slate-800 block">{pat.firstName} {pat.lastName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{pat.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unknown Patient</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-500">{inv.issuedAt}</td>
                      <td className="py-3.5 px-6 font-mono text-slate-500">{inv.dueDate}</td>
                      <td className="py-3.5 px-6 text-right font-bold font-mono text-slate-800">${inv.totalAmount}</td>
                      <td className="py-3.5 px-6 text-right font-bold font-mono text-rose-700">${balance}</td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2 whitespace-nowrap">
                        {balance > 0 && (
                          <button
                            onClick={() => {
                              setPayingInvoiceId(inv.id);
                              setPayAmount(balance);
                            }}
                            className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold text-[10px]"
                          >
                            Pay Copay
                          </button>
                        )}
                        <button
                          onClick={() => setReceiptInvoiceId(inv.id)}
                          className="px-2 py-1 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded font-bold text-[10px]"
                        >
                          Receipt
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to permanently delete and purge Invoice statement #${inv.id}? This action is secure-logged and cannot be undone.`)) {
                              deleteInvoice(inv.id);
                              setSuccessMsg(`Invoice #${inv.id} has been permanently deleted and purged from records.`);
                              setTimeout(() => setSuccessMsg(''), 4000);
                            }
                          }}
                          className="px-2 py-1 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded font-bold text-[10px]"
                          title="Delete Invoice Statement"
                        >
                          <Trash2 size={11} className="inline mr-0.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice creator overlay Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl z-55 flex flex-col p-6 animate-in slide-in-from-right duration-250">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Create Dental Invoice Statement</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              
              {/* Select patient */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Patient Profile</label>
                <select
                  required
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">-- Choose Patient Demographics --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.phone})</option>
                  ))}
                </select>
              </div>

              {/* Due date picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              {/* Add item rows */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Itemize Ledger Lines</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="e.g. Scaling & Root Planing tooth #12"
                      value={lineDesc}
                      onChange={(e) => setLineDesc(e.target.value)}
                      className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Quantity</label>
                    <input
                      type="number"
                      value={lineQty}
                      onChange={(e) => setLineQty(Number(e.target.value))}
                      className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      value={linePrice}
                      onChange={(e) => setLinePrice(Number(e.target.value))}
                      className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold text-center"
                    >
                      Add Line
                    </button>
                  </div>
                </div>
              </div>

              {/* Added draft items listing */}
              {invoiceItems.length > 0 && (
                <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 text-[11px]">
                  <div className="p-2 bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Draft ledger statement:</div>
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between bg-white text-slate-600 font-medium">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">{item.description}</span>
                        <span>{item.quantity} x ${item.unitPrice}</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900">${item.quantity * item.unitPrice}</span>
                    </div>
                  ))}
                  <div className="p-2 bg-slate-50 flex justify-between font-bold text-slate-900">
                    <span>Total statement:</span>
                    <span className="font-mono">${invoiceItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notes / Disclosures</label>
                <textarea
                  placeholder="e.g. Delta Dental co-pay billing notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg h-16"
                />
              </div>

              {/* Actions footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  id="billing-submit-invoice-btn"
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 shadow"
                >
                  Post Statement
                </button>
              </div>

            </form>
          </div>
        </>
      )}

      {/* Post transaction overlay Modal */}
      {payingInvoiceId && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-sm" onClick={() => setPayingInvoiceId('')} />
          <div className="fixed inset-x-4 top-16 max-w-sm mx-auto bg-white rounded-2xl shadow-2xl z-55 flex flex-col p-5 border border-slate-200 animate-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase">Process Patient Copay</h3>
              <button onClick={() => setPayingInvoiceId('')} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handlePostPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Amount ($)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
                >
                  <option value="CARD">Credit/Debit Terminal Card</option>
                  <option value="CASH">In-Clinic Cash</option>
                  <option value="INSURANCE">Insurance Carrier Payout</option>
                  <option value="BANK_TRANSFER">Direct Electronic Transfer</option>
                </select>
              </div>

              <button
                type="submit"
                id="billing-submit-payment-btn"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
              >
                Log Transaction
              </button>
            </form>
          </div>
        </>
      )}

      {/* Receipt Inspector Overlay Modal */}
      {activeReceipt && receiptPatient && (
        <>
          <div className="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-sm" onClick={() => setReceiptInvoiceId('')} />
          <div className="fixed inset-x-4 top-10 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-55 flex flex-col p-6 border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[85vh]">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">Invoice Receipt</h3>
              <button onClick={() => setReceiptInvoiceId('')} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 text-xs pr-1">
              
              {/* Receipt styling header */}
              <div className="text-center space-y-1 py-1">
                <h4 className="font-extrabold text-base text-slate-900">DENTPROSUITE CLINIC</h4>
                <p className="text-slate-400 font-medium">100 Medical Arts Suite 400 • Tel: +1 (555) 100-3000</p>
                <p className="text-[10px] text-slate-400 font-mono">Invoice Reference #{activeReceipt.id}</p>
              </div>

              {/* Patient Details metadata */}
              <div className="grid grid-cols-2 gap-y-1.5 border-t border-b border-dashed border-slate-200 py-3 text-[11px] font-medium text-slate-600">
                <span>Patient:</span>
                <span className="text-right font-bold text-slate-800">{receiptPatient.firstName} {receiptPatient.lastName}</span>
                <span>Date:</span>
                <span className="text-right font-mono text-slate-800">{activeReceipt.issuedAt}</span>
                <span>Due Date:</span>
                <span className="text-right font-mono text-slate-800">{activeReceipt.dueDate}</span>
                <span>Status:</span>
                <span className="text-right font-bold text-teal-600">{activeReceipt.status}</span>
              </div>

              {/* Itemized table rows */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Itemized ledger description:</span>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg p-2 bg-slate-50/50 space-y-1">
                  {activeReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 text-slate-600 font-medium text-[11px]">
                      <span className="font-bold text-slate-800">{item.description} ({item.quantity}x)</span>
                      <span className="font-mono font-bold text-slate-800">${item.quantity * item.unitPrice}</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-extrabold text-slate-900 text-sm">
                    <span>Statement Total:</span>
                    <span className="font-mono">${activeReceipt.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Recorded transactions list */}
              {activeReceipt.payments.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Posted Transactions Ledger:</span>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg p-2 bg-emerald-50/15 space-y-1">
                    {activeReceipt.payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-slate-600 font-medium text-[10px]">
                        <span>• {p.method} payout ({p.date})</span>
                        <span className="font-mono font-bold text-emerald-700">-${p.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 font-bold text-slate-800">
                      <span>Remaining Balance:</span>
                      <span className="font-mono text-rose-700">${activeReceipt.totalAmount - activeReceipt.payments.reduce((acc, p) => acc + p.amount, 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Receipt Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    alert('Receipt compilation dispatched to printer subsystem. Printing...');
                    setReceiptInvoiceId('');
                  }}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptInvoiceId('')}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 text-center"
                >
                  Close Receipt
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
};

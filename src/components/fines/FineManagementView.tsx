import React, { useState } from 'react';
import { 
  IndianRupee, Search, Filter, Download, Plus, 
  Receipt, ShieldAlert, CheckCircle, Clock 
} from 'lucide-react';
import { db } from '../../services/db';
import { Fine, FinePayment, PaymentMethod } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { generatePaymentReceiptPdf, exportToCsv } from '../../services/reports';

export const FineManagementView: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'fines' | 'payments'>('fines');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partially_paid' | 'paid' | 'waived'>('all');
  const [refresh, setRefresh] = useState(0);

  // Payment Recording Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  // Fine Waiver Modal
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');

  const fines = db.getFines();
  const payments = db.getPayments();

  const triggerRefresh = () => setRefresh(r => r + 1);

  const filteredFines = fines.filter(f => {
    const matchesSearch =
      (f.member?.full_name && f.member.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.member?.identifier && f.member.identifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.issue?.issue_code && f.issue.issue_code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(p => {
    return (
      p.receipt_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.member?.full_name && p.member.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.member?.identifier && p.member.identifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.payment_reference && p.payment_reference.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Open Payment modal
  const handleOpenPay = (fine: Fine) => {
    setSelectedFine(fine);
    setAmountPaid(String(fine.balance_amount));
    setPaymentMethod('cash');
    setPaymentReference(`CASH-${Date.now().toString().slice(-4)}`);
    setPaymentRemarks('');
    setIsPayModalOpen(true);
  };

  // Submit payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine) return;
    const amount = parseFloat(amountPaid);

    if (isNaN(amount) || amount <= 0) {
      error('Invalid Amount', 'Please enter a valid positive payment amount.');
      return;
    }

    try {
      const { payment, updatedFine } = db.recordFinePayment({
        fineId: selectedFine.id,
        amountPaid: amount,
        paymentMethod,
        paymentReference,
        remarks: paymentRemarks,
        user,
      });

      success(
        'Payment Recorded & Receipt Generated',
        `₹${amount.toFixed(2)} received from ${selectedFine.member?.full_name}. Receipt: ${payment.receipt_no}`
      );

      // Offer instant download of official receipt
      if (selectedFine.member) {
        generatePaymentReceiptPdf(payment, selectedFine.member, updatedFine);
      }

      setIsPayModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      error('Payment Failed', err.message);
    }
  };

  // Open Waiver modal
  const handleOpenWaiver = (fine: Fine) => {
    if (!isSuperAdmin) {
      warning('Restricted Action', 'Only Super Admin can authorize official fine waivers.');
      return;
    }
    setSelectedFine(fine);
    setWaiverReason('');
    setIsWaiverModalOpen(true);
  };

  // Submit waiver
  const handleSubmitWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine) return;

    if (!waiverReason.trim()) {
      error('Justification Required', 'A formal justification must be entered for institutional audit.');
      return;
    }

    try {
      db.waiveFine({
        fineId: selectedFine.id,
        reason: waiverReason.trim(),
        user,
      });

      success('Fine Waived', `Outstanding fine for ${selectedFine.member?.full_name} has been waived.`);
      setIsWaiverModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      error('Waiver Failed', err.message);
    }
  };

  const handleExportPaymentsCsv = () => {
    const data = payments.map(p => ({
      ReceiptNo: p.receipt_no,
      Date: p.payment_date,
      MemberID: p.member?.identifier || '',
      MemberName: p.member?.full_name || '',
      AmountPaid: p.amount_paid,
      Method: p.payment_method.toUpperCase(),
      Reference: p.payment_reference || '',
      ReceivedBy: p.receiver?.full_name || 'Staff'
    }));
    exportToCsv('ESIC_Fine_Collections_Register', data);
    success('Payments Exported', 'Fine payments register CSV downloaded.');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-teal-700" />
            Institutional Fine Ledgers & Payment Collections
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-tracked fee collection, partial settlements, official receipts, and waivers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'payments' && (
            <Button size="sm" variant="outline" onClick={handleExportPaymentsCsv} className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1" /> Export Collections CSV
            </Button>
          )}

          {/* Toggle Tabs */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
            <button
              onClick={() => setActiveTab('fines')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                activeTab === 'fines' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fines Register
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                activeTab === 'payments' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Payment Receipts ({payments.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'fines'
                ? 'Search by member name, roll/emp ID, issue code...'
                : 'Search by receipt number, reference, member...'
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
          />
        </div>

        {activeTab === 'fines' && (
          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
            >
              <option value="all">All Fine Statuses</option>
              <option value="pending">Pending Settlement</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Fully Settled</option>
              <option value="waived">Waived</option>
            </select>
          </div>
        )}
      </div>

      {/* FINES TABLE */}
      {activeTab === 'fines' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Borrower</th>
                  <th className="px-3 py-3 text-left font-semibold">Issue Ref / Book</th>
                  <th className="px-3 py-3 text-right font-semibold">Original Fine</th>
                  <th className="px-3 py-3 text-right font-semibold">Balance Due</th>
                  <th className="px-3 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredFines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No fine records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFines.map(fine => {
                    const isDue = fine.status === 'pending' || fine.status === 'partially_paid';

                    return (
                      <tr key={fine.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{fine.member?.full_name}</div>
                          <div className="font-mono text-[11px] text-slate-500 mt-0.5">{fine.member?.identifier}</div>
                        </td>

                        <td className="px-3 py-3 max-w-xs">
                          <span className="font-mono text-[11px] font-semibold text-teal-800">
                            {fine.issue?.issue_code || 'Direct Assessment'}
                          </span>
                          <div className="text-slate-600 truncate mt-0.5">
                            {fine.issue?.copy?.book?.title || 'Library Circulation Item'}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right font-medium text-slate-600">
                          ₹{fine.amount.toFixed(2)}
                        </td>

                        <td className="px-3 py-3 text-right">
                          <span
                            className={`font-bold ${
                              fine.balance_amount > 0 ? 'text-rose-600 text-sm' : 'text-emerald-700'
                            }`}
                          >
                            ₹{fine.balance_amount.toFixed(2)}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <Badge
                            variant={
                              fine.status === 'paid'
                                ? 'success'
                                : fine.status === 'waived'
                                ? 'default'
                                : fine.status === 'partially_paid'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {fine.status.toUpperCase().replace('_', ' ')}
                          </Badge>
                          {fine.waiver_reason && (
                            <span className="block text-[10px] text-slate-400 mt-0.5 italic">
                              Reason: {fine.waiver_reason}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isDue && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleOpenPay(fine)}
                                className="text-[11px] px-2.5 py-1"
                              >
                                <Receipt className="w-3 h-3 mr-1" /> Pay
                              </Button>
                            )}

                            {isDue && isSuperAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenWaiver(fine)}
                                className="text-[11px] px-2 py-1 text-slate-600 hover:text-rose-700"
                                title="Authorize fine waiver"
                              >
                                Waive
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* PAYMENTS TABLE */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Receipt Number</th>
                  <th className="px-3 py-3 text-left font-semibold">Borrower</th>
                  <th className="px-3 py-3 text-left font-semibold">Payment Details</th>
                  <th className="px-3 py-3 text-right font-semibold">Amount Paid</th>
                  <th className="px-3 py-3 text-left font-semibold">Collected By</th>
                  <th className="px-4 py-3 text-right font-semibold">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No payment receipts found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-teal-900">
                        {payment.receipt_no}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(payment.payment_date).toLocaleString()}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">{payment.member?.full_name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{payment.member?.identifier}</div>
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        <Badge variant="purple" className="capitalize">
                          {payment.payment_method}
                        </Badge>
                        <span className="block font-mono text-[11px] text-slate-500 mt-0.5">
                          Ref: {payment.payment_reference || '—'}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span className="font-bold text-emerald-700 text-sm">
                          ₹{payment.amount_paid.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-slate-600">
                        {payment.receiver?.full_name || 'Circulation Desk Staff'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            const fine = fines.find(f => f.id === payment.fine_id) || {
                              id: payment.fine_id,
                              issue_id: '',
                              member_id: payment.member_id,
                              amount: payment.amount_paid,
                              balance_amount: 0,
                              status: 'paid',
                              created_at: payment.payment_date,
                            };
                            if (payment.member) {
                              generatePaymentReceiptPdf(payment, payment.member, fine);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold hover:underline"
                        >
                          <Receipt className="w-3.5 h-3.5" /> Print Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPayModalOpen && selectedFine && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Collect Library Fine Payment"
          subtitle={`Member: ${selectedFine.member?.full_name} (${selectedFine.member?.identifier})`}
          maxWidth="md"
        >
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between">
              <span className="text-slate-600">Outstanding Balance Due:</span>
              <strong className="text-rose-600 font-bold text-sm">
                ₹{selectedFine.balance_amount.toFixed(2)}
              </strong>
            </div>

            <Input
              label="Amount to Pay (₹ INR)"
              type="number"
              step="0.01"
              max={selectedFine.balance_amount}
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              helperText={`Partial or full payment up to ₹${selectedFine.balance_amount.toFixed(2)}`}
              required
            />

            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="cash">Cash (Collected at Desk)</option>
              <option value="online">Online / UPI Gateway</option>
              <option value="cheque">Cheque</option>
              <option value="dd">Demand Draft (DD)</option>
            </Select>

            <Input
              label="Transaction / Receipt Reference"
              placeholder="e.g. CASH-1089 or UPI-UTR-987654"
              value={paymentReference}
              onChange={e => setPaymentReference(e.target.value)}
            />

            <Input
              label="Remarks / Comments"
              placeholder="e.g. Cleared before semester exams"
              value={paymentRemarks}
              onChange={e => setPaymentRemarks(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsPayModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm & Issue Official Receipt
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Fine Waiver Modal */}
      {isWaiverModalOpen && selectedFine && (
        <Modal
          isOpen={isWaiverModalOpen}
          onClose={() => setIsWaiverModalOpen(false)}
          title="Authorize Fine Waiver"
          subtitle="Super Admin Institutional Authorization"
          maxWidth="md"
        >
          <form onSubmit={handleSubmitWaiver} className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                Audit Trail Notice
              </div>
              Waiving ₹{selectedFine.balance_amount.toFixed(2)} for {selectedFine.member?.full_name}. This
              action will be permanently logged in the institutional security audit trail.
            </div>

            <Input
              label="Official Waiver Justification / Authorization Note"
              placeholder="e.g. Approved medical leave certificate produced by student; sanctioned by Principal."
              value={waiverReason}
              onChange={e => setWaiverReason(e.target.value)}
              required
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsWaiverModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Confirm Fine Waiver
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

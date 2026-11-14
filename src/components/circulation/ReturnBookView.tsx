import React, { useState } from 'react';
import { 
  BookDown, Search, AlertCircle, CheckCircle, 
  Receipt, FileText, IndianRupee, ShieldAlert 
} from 'lucide-react';
import { db } from '../../services/db';
import { BookIssue } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { INSTITUTION_INFO } from '../../services/reports';

export const ReturnBookView: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { success, error, warning } = useToast();
  const settings = db.getSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<BookIssue | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [returnDate, setReturnDate] = useState(todayStr);
  const [condition, setCondition] = useState<'good' | 'minor_wear' | 'damaged' | 'lost'>('good');
  const [conditionNotes, setConditionNotes] = useState('');
  const [waiveFine, setWaiveFine] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');
  const [remarks, setRemarks] = useState('');

  const [returnSummary, setReturnSummary] = useState<any | null>(null);

  // Search active issues
  const handleSearchIssue = () => {
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim().toLowerCase();
    const activeIssues = db.getActiveIssues();

    const found = activeIssues.find(i => 
      i.issue_code.toLowerCase() === clean ||
      i.copy?.accession_number.toLowerCase() === clean ||
      i.member?.identifier.toLowerCase() === clean
    );

    if (found) {
      setSelectedIssue(found);
      setReturnDate(todayStr);
      setCondition('good');
      setConditionNotes('');
      setWaiveFine(false);
      setWaiverReason('');
    } else {
      error('No Active Loan Found', `No active or overdue issue record matches "${searchQuery}".`);
    }
  };

  // Calculate live return calculations
  const calculateFinePreview = () => {
    if (!selectedIssue) return { overdueDays: 0, chargeableDays: 0, fineAmount: 0, extraFee: 0, totalDue: 0 };

    const retObj = new Date(returnDate);
    const dueObj = new Date(selectedIssue.due_date);
    retObj.setHours(0, 0, 0, 0);
    dueObj.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((retObj.getTime() - dueObj.getTime()) / (1000 * 60 * 60 * 24));
    const overdueDays = Math.max(0, diffDays);

    const isStaff = selectedIssue.member?.member_type === 'staff';
    const grace = isStaff ? settings.staff_grace_period_days : settings.student_grace_period_days;
    const dailyRate = isStaff ? settings.staff_daily_fine : settings.student_daily_fine;
    const maxFine = isStaff ? settings.staff_max_fine : settings.student_max_fine;

    const chargeableDays = Math.max(0, overdueDays - grace);
    let fineAmount = Math.min(chargeableDays * dailyRate, maxFine);

    let extraFee = 0;
    if (condition === 'damaged') {
      extraFee = settings.damaged_book_flat_fee;
    } else if (condition === 'lost') {
      const bookPrice = selectedIssue.copy?.book?.purchase_price || 1000;
      extraFee = Math.round(bookPrice * settings.lost_book_multiplier);
    }

    if (waiveFine) {
      fineAmount = 0;
    }

    return {
      overdueDays,
      chargeableDays,
      fineAmount,
      extraFee,
      totalDue: fineAmount + (waiveFine ? 0 : extraFee),
    };
  };

  const preview = calculateFinePreview();

  // Process Return
  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;

    if (waiveFine && !isSuperAdmin) {
      error('Unauthorized', 'Only Super Admin can authorize fine waivers.');
      return;
    }

    if (waiveFine && !waiverReason.trim()) {
      error('Waiver Reason Required', 'Please provide an official justification for the fine waiver.');
      return;
    }

    try {
      const result = db.returnBook({
        issueId: selectedIssue.id,
        returnDate,
        condition,
        conditionNotes,
        waiveFine,
        waiverReason,
        remarks,
        user,
      });

      success(
        'Return Processed Successfully',
        `Book copy ${result.receiptSummary.accessionNumber} returned by ${result.receiptSummary.memberName}.`
      );

      setReturnSummary(result.receiptSummary);
      setSelectedIssue(null);
      setSearchQuery('');
    } catch (err: any) {
      error('Return Processing Failed', err.message);
    }
  };

  // Download PDF Receipt
  const handleDownloadReturnReceipt = () => {
    if (!returnSummary) return;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(INSTITUTION_INFO.name, 105, 18, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(INSTITUTION_INFO.location, 105, 24, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('CENTRAL LIBRARY - BOOK RETURN CONFIRMATION RECEIPT', 105, 30, { align: 'center' });
    doc.line(14, 34, 196, 34);

    autoTable(doc, {
      startY: 42,
      head: [['Field', 'Circulation Transaction Details']],
      body: [
        ['Transaction Reference Code', returnSummary.issueCode],
        ['Book Title', returnSummary.bookTitle],
        ['Accession Number', returnSummary.accessionNumber],
        ['Member Roll / ID', returnSummary.memberIdentifier],
        ['Member Full Name', returnSummary.memberName],
        ['Original Borrow Date', returnSummary.issueDate],
        ['Scheduled Due Date', returnSummary.dueDate],
        ['Actual Return Date', returnSummary.returnDate],
        ['Overdue Duration', `${returnSummary.overdueDays} Days`],
        ['Condition of Book', returnSummary.condition.toUpperCase()],
        ['Total Assessed Fine / Charges', `INR ₹${(returnSummary.fineAmount || 0).toFixed(2)}`],
        ['Circulation Staff Attendant', returnSummary.handledBy]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { cellWidth: 110 }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 25;
    doc.setFontSize(9);
    doc.text('Authorized Circulation Officer Seal & Signature', 130, finalY);

    doc.save(`Return_Receipt_${returnSummary.issueCode}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookDown className="w-5 h-5 text-coral-600" />
            Circulation Desk — Return Processing & Fines
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verification of physical condition, automated policy overdue fine calculation, and receipts
          </p>
        </div>
        <Badge variant="info">Policy Compliant</Badge>
      </div>

      {/* Return Success Modal / Summary Card */}
      {returnSummary && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 shadow-xs animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-emerald-900 text-sm">Book Return Successfully Closed</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadReturnReceipt}
              className="text-xs bg-white text-emerald-900"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Download Return Receipt (PDF)
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-lg border border-emerald-200">
            <div>
              <span className="text-slate-500 block">Transaction Code:</span>
              <span className="font-mono font-bold text-slate-900">{returnSummary.issueCode}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Accession Number:</span>
              <span className="font-mono font-semibold text-coral-700">{returnSummary.accessionNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Overdue Duration:</span>
              <span className="font-bold text-slate-800">{returnSummary.overdueDays} Days</span>
            </div>
            <div>
              <span className="text-slate-500 block">Fine Levied:</span>
              <span className="font-bold text-rose-600">₹{(returnSummary.fineAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Active Issue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Step 1: Retrieve Active Circulation Record
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search by Issue Code (e.g. ISS-2024-001), Accession No (e.g. ESIC-PHYS-2023-002), or Roll No..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchIssue())}
          />
          <Button size="sm" variant="primary" onClick={handleSearchIssue} className="flex-shrink-0">
            <Search className="w-3.5 h-3.5 mr-1" /> Search
          </Button>
        </div>

        {/* Quick select from currently active/overdue issues */}
        <div className="pt-2">
          <span className="text-[11px] font-medium text-slate-500">Quick Selection from Active Loans:</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {db.getActiveIssues().slice(0, 4).map(iss => (
              <button
                key={iss.id}
                type="button"
                onClick={() => {
                  setSelectedIssue(iss);
                  setReturnDate(todayStr);
                }}
                className="text-[11px] px-2 py-1 rounded bg-slate-50 hover:bg-coral-50 border border-slate-200 text-slate-700 transition"
              >
                {iss.issue_code} ({iss.copy?.accession_number})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Return Processing Form */}
      {selectedIssue && (
        <form onSubmit={handleProcessReturn} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Step 2: Verify Copy Condition & Calculate Fines
            </h3>
            <Badge variant={selectedIssue.status === 'overdue' ? 'danger' : 'info'}>
              {selectedIssue.status.toUpperCase()}
            </Badge>
          </div>

          {/* Book and Borrower Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Book Details</span>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedIssue.copy?.book?.title}</h4>
              <p className="font-mono text-coral-700 font-semibold mt-0.5">
                Accession: {selectedIssue.copy?.accession_number}
              </p>
              <p className="text-slate-500">{selectedIssue.copy?.book?.author}</p>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400">Borrower Information</span>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedIssue.member?.full_name}</h4>
              <p className="font-mono text-slate-600">{selectedIssue.member?.identifier}</p>
              <p className="text-slate-500">{selectedIssue.member?.department?.name}</p>
              <div className="mt-2 text-slate-600 text-[11px] flex gap-3">
                <span>Borrowed: <strong>{selectedIssue.issue_date}</strong></span>
                <span>Due: <strong className="text-amber-700">{selectedIssue.due_date}</strong></span>
              </div>
            </div>
          </div>

          {/* Controls: Return Date & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Actual Return Date"
              type="date"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
              required
            />

            <Select
              label="Physical Book Condition"
              value={condition}
              onChange={e => setCondition(e.target.value as any)}
            >
              <option value="good">Good (Normal Return to Shelf)</option>
              <option value="minor_wear">Minor Wear (Normal Circulation)</option>
              <option value="damaged">Damaged (Requires Repair / Binding Fee)</option>
              <option value="lost">Lost (Levy Replacement Charge)</option>
            </Select>

            <Input
              label="Condition Notes (Optional)"
              placeholder="e.g. Broken spine, torn cover..."
              value={conditionNotes}
              onChange={e => setConditionNotes(e.target.value)}
            />
          </div>

          {/* Real-time Fine Calculation Display */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-amber-700" />
                Fine & Liability Assessment (Proposed ESIC Institutional Policy)
              </h4>
              <span className="text-[11px] text-amber-800">
                Grace Period: {selectedIssue.member?.member_type === 'staff' ? settings.staff_grace_period_days : settings.student_grace_period_days} Days
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                <span className="text-slate-500 block">Total Overdue:</span>
                <span className="font-bold text-slate-800">{preview.overdueDays} Days</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                <span className="text-slate-500 block">Chargeable Days:</span>
                <span className="font-bold text-slate-800">{preview.chargeableDays} Days</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-100">
                <span className="text-slate-500 block">Condition Charges:</span>
                <span className="font-bold text-slate-800">₹{preview.extraFee.toFixed(2)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="text-slate-500 block">Assessed Fine:</span>
                <span className="text-base font-bold text-rose-700">₹{preview.totalDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Fine Waiver Options (Super Admin Only) */}
            {preview.totalDue > 0 && (
              <div className="pt-3 border-t border-amber-200/80">
                {isSuperAdmin ? (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={waiveFine}
                        onChange={e => setWaiveFine(e.target.checked)}
                        className="rounded text-coral-500 focus:ring-coral-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Authorize Official Fine Waiver (Super Admin Privilege)
                      </span>
                    </label>
                    {waiveFine && (
                      <Input
                        placeholder="State official reason for waiver (e.g. Medical emergency certificate, approved by Dean)..."
                        value={waiverReason}
                        onChange={e => setWaiverReason(e.target.value)}
                        required
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    Fine waivers require Super Admin authorization.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setSelectedIssue(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="lg">
              <CheckCircle className="w-4 h-4 mr-2" /> Confirm Return & Close Loan
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
